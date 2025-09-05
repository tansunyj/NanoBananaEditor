#!/usr/bin/env node

/**
 * 环境配置验证脚本
 * 用于验证.env文件中的API配置是否正确
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 颜色输出函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

console.log(colors.bold(colors.cyan('🔍 Nano Banana Editor - 环境配置验证工具')));
console.log('='.repeat(50));

// 读取.env文件
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.log(colors.red('❌ 未找到.env文件'));
  console.log(colors.yellow('💡 请复制.env.example为.env并配置相应的环境变量'));
  process.exit(1);
}

// 解析.env文件
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

console.log(colors.bold('📋 当前环境配置:'));
console.log('-'.repeat(30));

// 验证必需的环境变量
const requiredVars = [
  {
    key: 'VITE_GEMINI_API_KEY',
    name: 'API密钥',
    required: false, // 如果有API_TOKEN则可选
    sensitive: true
  },
  {
    key: 'VITE_API_TOKEN',
    name: 'API Token',
    required: false,
    sensitive: true
  },
  {
    key: 'VITE_API_BASE_URL',
    name: 'API基础地址',
    required: false,
    default: 'https://generativelanguage.googleapis.com'
  },
  {
    key: 'VITE_MODEL_NAME',
    name: '模型名称',
    required: false,
    default: 'gemini-2.5-flash-image-preview'
  }
];

let isValid = true;
const hasApiKey = Boolean(envVars['VITE_GEMINI_API_KEY'] && envVars['VITE_GEMINI_API_KEY'] !== 'your_api_key_here' && !envVars['VITE_GEMINI_API_KEY'].includes('demo'));
const hasApiToken = Boolean(envVars['VITE_API_TOKEN'] && envVars['VITE_API_TOKEN'].trim());

requiredVars.forEach(varConfig => {
  const value = envVars[varConfig.key];
  const displayName = `${varConfig.name} (${varConfig.key})`;
  
  if (!value || (varConfig.key === 'VITE_GEMINI_API_KEY' && (value === 'your_api_key_here' || value.includes('demo')))) {
    if (varConfig.key === 'VITE_GEMINI_API_KEY' && !hasApiToken) {
      console.log(colors.red(`❌ ${displayName}: 未配置有效值`));
      console.log(colors.yellow('   💡 提示：必须配置 VITE_GEMINI_API_KEY 或 VITE_API_TOKEN 中的一个'));
      isValid = false;
    } else if (varConfig.key === 'VITE_API_TOKEN' && !hasApiKey) {
      console.log(colors.red(`❌ ${displayName}: 未配置`));
      console.log(colors.yellow('   💡 提示：必须配置 VITE_GEMINI_API_KEY 或 VITE_API_TOKEN 中的一个'));
      isValid = false;
    } else if (varConfig.required) {
      console.log(colors.red(`❌ ${displayName}: 未配置 (必需)`));
      isValid = false;
    } else {
      console.log(colors.yellow(`⚠️  ${displayName}: 使用默认值 "${varConfig.default || '未设置'}"`));
    }
  } else {
    // 隐藏敏感信息
    let displayValue = value;
    if (varConfig.sensitive && value.length > 10) {
      displayValue = `${value.substring(0, 10)}...${value.substring(value.length - 4)}`;
    }
    console.log(colors.green(`✅ ${displayName}: ${displayValue}`));
  }
});

// 检查认证配置
if (!hasApiKey && !hasApiToken) {
  console.log(colors.red('❌ 错误：必须配置 VITE_GEMINI_API_KEY 或 VITE_API_TOKEN 中的至少一个'));
  isValid = false;
} else if (hasApiKey && hasApiToken) {
  console.log(colors.cyan('ℹ️  信息：同时配置了API Key和API Token，将优先使用API Token'));
}

console.log('\n' + colors.bold('🔧 API提供商检测:'));
console.log('-'.repeat(30));

const baseUrl = envVars['VITE_API_BASE_URL'] || 'https://generativelanguage.googleapis.com';

if (baseUrl.includes('googleapis.com')) {
  console.log(colors.blue('🔵 检测到Google Gemini API配置'));
  console.log(colors.cyan('   端点格式: /v1beta/models/{model}:generateContent'));
  console.log(colors.cyan('   认证方式: x-goog-api-key header'));
} else if (baseUrl.includes('openai.com')) {
  console.log(colors.blue('🟢 检测到OpenAI API配置'));
  console.log(colors.cyan('   端点格式: /v1/chat/completions'));
  console.log(colors.cyan('   认证方式: Authorization Bearer token'));
} else if (baseUrl.includes('azure.com')) {
  console.log(colors.blue('🔵 检测到Azure OpenAI API配置'));
  console.log(colors.cyan('   端点格式: /v1/chat/completions'));
  console.log(colors.cyan('   认证方式: Authorization Bearer token'));
} else {
  console.log(colors.yellow('🟡 检测到自定义API提供商'));
  console.log(colors.cyan('   将使用OpenAI兼容格式'));
}

// 显示当前认证方式
if (hasApiToken) {
  console.log(colors.green('✅ 当前认证方式: API Token (优先级高)'));
} else if (hasApiKey) {
  console.log(colors.green('✅ 当前认证方式: API Key'));
} else {
  console.log(colors.red('❌ 未配置任何认证方式'));
}

console.log('\n' + colors.bold('💡 使用建议:'));
console.log('-'.repeat(30));

if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
  console.log(colors.yellow('⚠️  检测到本地API地址，确保本地服务正在运行'));
}

if (envVars['VITE_GEMINI_API_KEY'] && envVars['VITE_GEMINI_API_KEY'].includes('demo')) {
  console.log(colors.red('❌ 使用的是示例API密钥，请替换为真实的API密钥'));
  isValid = false;
}

console.log(colors.cyan('📚 参考文档: API_CONFIG.md'));
console.log(colors.cyan('🔍 使用示例: USAGE_EXAMPLES.md'));

console.log('\n' + '='.repeat(50));

if (isValid) {
  console.log(colors.green(colors.bold('✅ 配置验证通过！可以启动应用了')));
  console.log(colors.cyan('运行命令: npm run dev'));
} else {
  console.log(colors.red(colors.bold('❌ 配置存在问题，请检查上述错误信息')));
  process.exit(1);
}