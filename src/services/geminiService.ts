// Note: In production, this should be handled via a backend proxy
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'demo-key';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://generativelanguage.googleapis.com';
const MODEL_NAME = import.meta.env.VITE_MODEL_NAME || 'gemini-2.5-flash-image-preview';
const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';

// Gemini API Content 类型定义
interface GenerationContent {
  role?: string; // 支持role字段（一些代理服务需要）
  parts: Array<{
    text?: string;
    inline_data?: {
      mime_type: string;
      data: string;
    };
  }>;
}


// API配置接口
interface APIConfig {
  baseUrl: string;
  apiKey: string;
  modelName: string;
  apiToken?: string;
}

// 默认配置
const defaultConfig: APIConfig = {
  baseUrl: API_BASE_URL,
  apiKey: API_KEY,
  modelName: MODEL_NAME,
  apiToken: API_TOKEN
};

export interface GenerationRequest {
  prompt: string;
  referenceImages?: string[]; // base64 array
  temperature?: number;
  seed?: number;
}

export interface EditRequest {
  instruction: string;
  originalImage: string; // base64
  referenceImages?: string[]; // base64 array
  maskImage?: string; // base64
  temperature?: number;
  seed?: number;
}

export interface SegmentationRequest {
  image: string; // base64
  query: string; // "the object at pixel (x,y)" or "the red car"
}

export interface SegmentationResponse {
  masks: Array<{
    label: string;
    box_2d: [number, number, number, number];
    mask: string;
  }>;
}

// API请求负载类型
interface APIRequestPayload {
  contents: GenerationContent[];
  generationConfig?: {
    temperature?: number;
    candidateCount?: number;
    responseModalities?: string[]; // 支持响应模式配置
  };
}

// API响应类型
interface APIResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          data: string;
        };
      }>;
    };
  }>;
  choices?: Array<{
    message: {
      content: string;
    };
  }>;
}

export class GeminiService {
  private config: APIConfig;

  constructor(config?: Partial<APIConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  // 设置API配置
  setConfig(config: Partial<APIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 获取当前配置
  getConfig(): APIConfig {
    return { ...this.config };
  }

  // 获取认证信息（用于调试和验证）
  getAuthInfo(): { method: string; hasToken: boolean; hasApiKey: boolean; willUseAuth: boolean } {
    const hasToken = Boolean(this.config.apiToken && this.config.apiToken.trim());
    const hasValidApiKey = Boolean(this.config.apiKey && this.config.apiKey.trim() && this.config.apiKey !== 'demo-key');
    const isGoogleGemini = this.config.baseUrl.includes('googleapis.com');
    
    let method = '无认证';
    let willUseAuth = false;
    
    if (isGoogleGemini) {
      method = 'Google x-goog-api-key';
      if (hasToken && this.config.apiToken && this.config.apiToken.includes('SAPISID')) {
        method += ' + Cookie';
      }
      willUseAuth = hasValidApiKey; // Google使用x-goog-api-key，不使用Authorization
    } else {
      if (hasToken) {
        method = 'API Token (Authorization Bearer)';
        willUseAuth = true;
      } else if (hasValidApiKey) {
        method = 'API Key (Authorization Bearer)';
        willUseAuth = true;
      }
    }
    
    return {
      method,
      hasToken,
      hasApiKey: hasValidApiKey,
      willUseAuth
    };
  }

  // 显示当前配置状态（用于调试）
  debugConfig(): void {
    const authInfo = this.getAuthInfo();
    
    console.log('🔧 GeminiService 配置状态:');
    console.log('   Base URL:', this.config.baseUrl);
    console.log('   Model Name:', this.config.modelName);
    console.log('   API Key:', this.config.apiKey ? this.config.apiKey.substring(0, 20) + '...' : '未设置');
    console.log('   API Token:', this.config.apiToken ? this.config.apiToken.substring(0, 20) + '...' : '未设置');
    console.log('   认证方式:', authInfo.method);
    console.log('   是否使用Authorization头部:', authInfo.willUseAuth ? '是' : '否');
    console.log('   环境变量检查:');
    console.log('     VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY ? import.meta.env.VITE_GEMINI_API_KEY.substring(0, 20) + '...' : '未设置');
    console.log('     VITE_API_TOKEN:', import.meta.env.VITE_API_TOKEN ? import.meta.env.VITE_API_TOKEN.substring(0, 20) + '...' : '未设置');
    console.log('     VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || '使用默认值');
    console.log('     VITE_MODEL_NAME:', import.meta.env.VITE_MODEL_NAME || '使用默认值');
  }

  // 通用API调用方法
  private async callAPI(endpoint: string, payload: APIRequestPayload): Promise<APIResponse> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    // 构建请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 智能选择认证方式
    if (this.config.baseUrl.includes('googleapis.com')) {
      // 原生Google Gemini API 使用 x-goog-api-key 认证
      headers['x-goog-api-key'] = this.config.apiKey;
      console.log('🔵 Google Gemini原生API，使用x-goog-api-key认证:', this.config.apiKey.substring(0, 20) + '...');
      
      // 如果有特殊的Cookie认证token，也添加上
      if (this.config.apiToken && this.config.apiToken.trim() && this.config.apiToken.includes('SAPISID')) {
        headers['Cookie'] = this.config.apiToken;
        console.log('🍪 同时添加Cookie认证');
      }
      // Google Gemini原生API不需要Authorization头部
    } else {
      // 其他API提供商的认证逻辑（包括Comet API等代理服务）
      const authToken = this.config.apiToken && this.config.apiToken.trim() 
        ? this.config.apiToken 
        : this.config.apiKey;
        
      if (authToken && authToken !== 'demo-key') {
        // 使用Authorization头部
        if (authToken.toLowerCase().startsWith('bearer ') || authToken.toLowerCase().startsWith('sk-')) {
          headers['Authorization'] = authToken.toLowerCase().startsWith('bearer ') ? authToken : authToken;
        } else {
          headers['Authorization'] = authToken; // 直接使用原始值
        }
        
        const tokenType = this.config.apiToken && this.config.apiToken.trim() ? 'API Token' : 'API Key';
        console.log(`🔑 使用${tokenType}认证:`, authToken.substring(0, 20) + '...');
      } else {
        console.log('⚠️  未配置有效的认证信息');
      }
    }
    
    // 调试信息：显示最终的请求头
    console.log('📡 API请求详情:');
    console.log('   URL:', url);
    
    // 构建调试信息，仅显示实际设置的头部
    const debugHeaders: Record<string, string> = {
      'Content-Type': headers['Content-Type']
    };
    
    if (headers['Authorization']) {
      debugHeaders['Authorization'] = headers['Authorization'].substring(0, 30) + '...';
    }
    
    if (headers['x-goog-api-key']) {
      debugHeaders['x-goog-api-key'] = headers['x-goog-api-key'].substring(0, 20) + '...';
    }
    
    if (headers['Cookie']) {
      debugHeaders['Cookie'] = headers['Cookie'].substring(0, 50) + '...';
    }
    
    console.log('   Headers:', debugHeaders);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ API调用失败:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      
      // 特殊处理配额限制错误
      if (response.status === 429) {
        const errorObj = JSON.parse(errorData);
        const retryInfo = errorObj.error?.details?.find((d: { '@type'?: string }) => d['@type']?.includes('RetryInfo'));
        const retryDelay = retryInfo?.retryDelay || '未知';
        
        console.log('🚫 API配额已达限制:');
        console.log('   - 这是Google Gemini免费层的正常限制');
        console.log('   - 建议等待时间:', retryDelay);
        console.log('   - 解决方案:');
        console.log('     1. 等待配额重置（通常每天重置）');
        console.log('     2. 升级到付费计划获得更高配额');
        console.log('     3. 配置其他API提供商（OpenAI等）');
        
        throw new Error(`API配额已达限制，请等待 ${retryDelay} 后重试，或考虑升级API计划`);
      }
      
      throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const result = await response.json();
    console.log('✅ API调用成功');
    return result;
  }

  async generateImage(request: GenerationRequest): Promise<string[]> {
    try {
      const contents: GenerationContent[] = [
        {
          role: "user", // 添加role字段以兼容代理服务
          parts: [{ text: request.prompt }]
        }
      ];
      
      // Add reference images if provided
      if (request.referenceImages && request.referenceImages.length > 0) {
        request.referenceImages.forEach(image => {
          contents[0].parts.push({
            inline_data: {
              mime_type: "image/png",
              data: image,
            },
          });
        });
      }
      
      const payload = {
        contents,
        generationConfig: {
          temperature: request.temperature,
          candidateCount: 1,
          responseModalities: ["TEXT", "IMAGE"] // 添加响应模式配置以兼容代理服务
        }
      };

      // 支持不同的API端点格式
      // Gemini格式：googleapis.com 和其他Gemini兼容的代理服务（如 cometapi.com）
      // OpenAI格式：只有明确是 openai.com 的才使用
      const isOpenAIAPI = this.config.baseUrl.includes('openai.com');
      const endpoint = isOpenAIAPI
        ? '/v1/chat/completions' // OpenAI格式
        : `/v1beta/models/${this.config.modelName}:generateContent`; // Gemini格式（默认）

      const response = await this.callAPI(endpoint, payload);
      const images: string[] = [];

      // 兼容不同的响应格式
      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        // Google Gemini格式
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            images.push(part.inlineData.data);
          }
        }
      } else if (response.choices && response.choices[0]) {
        // OpenAI兼容格式
        const choice = response.choices[0];
        if (choice.message && choice.message.content) {
          // 假设内容是base64图片数据
          images.push(choice.message.content);
        }
      } else {
        throw new Error('Invalid response format from API');
      }

      return images;
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image. Please try again.');
    }
  }

  async editImage(request: EditRequest): Promise<string[]> {
    try {
      const contents: GenerationContent[] = [
        {
          role: "user", // 添加role字段以兼容代理服务
          parts: [
            { text: this.buildEditPrompt(request) },
            {
              inline_data: {
                mime_type: "image/png",
                data: request.originalImage,
              },
            }
          ]
        }
      ];

      // Add reference images if provided
      if (request.referenceImages && request.referenceImages.length > 0) {
        request.referenceImages.forEach(image => {
          contents[0].parts.push({
            inline_data: {
              mime_type: "image/png",
              data: image,
            },
          });
        });
      }

      if (request.maskImage) {
        contents[0].parts.push({
          inline_data: {
            mime_type: "image/png",
            data: request.maskImage,
          },
        });
      }

      const payload = {
        contents,
        generationConfig: {
          temperature: request.temperature,
          candidateCount: 1,
          responseModalities: ["TEXT", "IMAGE"] // 添加响应模式配置以兼容代理服务
        }
      };

      const isOpenAIAPI = this.config.baseUrl.includes('openai.com');
      const endpoint = isOpenAIAPI
        ? '/v1/chat/completions' // OpenAI格式
        : `/v1beta/models/${this.config.modelName}:generateContent`; // Gemini格式

      const response = await this.callAPI(endpoint, payload);
      const images: string[] = [];

      // 兼容不同的响应格式
      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        // Google Gemini格式
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            images.push(part.inlineData.data);
          }
        }
      } else if (response.choices && response.choices[0]) {
        // OpenAI兼容格式
        const choice = response.choices[0];
        if (choice.message && choice.message.content) {
          images.push(choice.message.content);
        }
      } else {
        throw new Error('Invalid response format from API');
      }

      return images;
    } catch (error) {
      console.error('Error editing image:', error);
      throw new Error('Failed to edit image. Please try again.');
    }
  }

  async segmentImage(request: SegmentationRequest): Promise<SegmentationResponse> {
    try {
      const contents: GenerationContent[] = [
        {
          role: "user", // 添加role字段以兼容代理服务
          parts: [
            { text: `Analyze this image and create a segmentation mask for: ${request.query}

Return a JSON object with this exact structure:
{
  "masks": [
    {
      "label": "description of the segmented object",
      "box_2d": [x, y, width, height],
      "mask": "base64-encoded binary mask image"
    }
  ]
}

Only segment the specific object or region requested. The mask should be a binary PNG where white pixels (255) indicate the selected region and black pixels (0) indicate the background.` },
            {
              inline_data: {
                mime_type: "image/png",
                data: request.image,
              },
            }
          ]
        }
      ];

      const payload = {
        contents,
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"] // 添加响应模式配置以兼容代理服务
        }
      };

      const isOpenAIAPI = this.config.baseUrl.includes('openai.com');
      const endpoint = isOpenAIAPI
        ? '/v1/chat/completions' // OpenAI格式
        : `/v1beta/models/${this.config.modelName}:generateContent`; // Gemini格式

      const response = await this.callAPI(endpoint, payload);
      
      let responseText: string | undefined;
      
      // 兼容不同的响应格式
      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts && response.candidates[0].content.parts[0]) {
        // Google Gemini格式
        responseText = response.candidates[0].content.parts[0].text;
      } else if (response.choices && response.choices[0] && response.choices[0].message) {
        // OpenAI兼容格式
        responseText = response.choices[0].message.content;
      } else {
        throw new Error('Invalid response format from API');
      }
      
      if (!responseText) {
        throw new Error('No text content in response');
      }
      
      return JSON.parse(responseText) as SegmentationResponse;
    } catch (error) {
      console.error('Error segmenting image:', error);
      throw new Error('Failed to segment image. Please try again.');
    }
  }

  private buildEditPrompt(request: EditRequest): string {
    const maskInstruction = request.maskImage 
      ? "\n\nIMPORTANT: Apply changes ONLY where the mask image shows white pixels (value 255). Leave all other areas completely unchanged. Respect the mask boundaries precisely and maintain seamless blending at the edges."
      : "";

    return `Edit this image according to the following instruction: ${request.instruction}

Maintain the original image's lighting, perspective, and overall composition. Make the changes look natural and seamlessly integrated.${maskInstruction}

Preserve image quality and ensure the edit looks professional and realistic.`;
  }
}

// 创建默认服务实例
export const geminiService = new GeminiService();

// 导出配置接口
export type { APIConfig };