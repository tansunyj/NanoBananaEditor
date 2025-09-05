# 🍌 Nano Banana AI Image Editor 
Release Version: (v1.0)

### **⏬ Get Your 1-Click Install Copy!** 
Join the [Vibe Coding is Life Skool Community](https://www.skool.com/vibe-coding-is-life/about?ref=456537abaf37491cbcc6976f3c26af41) and get a **1-click ⚡Bolt.new installation clone**  of this app, plus access to live build sessions, exclusive project downloads, AI prompts, masterclasses, and the best vibe coding community on the web!

---

**Professional AI Image Generation & Conversational Editing Platform**

A production-ready React + TypeScript application for delightful image generation and conversational, region-aware revisions using Google's Gemini 2.5 Flash Image model. Built with modern web technologies and designed for both creators and developers.

[![Nano Banana Image Editor](https://getsmartgpt.com/nano-banana-editor.jpg)](https://nanobananaeditor.dev)

🍌 [Try the LIVE Demo](https://nanobananaeditor.dev)

## ✨ Key Features

### 🎨 **AI-Powered Creation**
- **Text-to-Image Generation** - Create stunning images from descriptive prompts
- **Live Quality Tips** - Real-time feedback to improve your prompts
- **Reference Image Support** - Use up to 2 reference images to guide generation
- **Advanced Controls** - Fine-tune creativity levels and use custom seeds

### ✏️ **Intelligent Editing**
- **Conversational Editing** - Modify images using natural language instructions
- **Region-Aware Selection** - Paint masks to target specific areas for editing
- **Style Reference Images** - Upload reference images to guide editing style
- **Non-Destructive Workflow** - All edits preserve the original image

### 🖼️ **Professional Canvas**
- **Interactive Canvas** - Zoom, pan, and navigate large images smoothly
- **Brush Tools** - Variable brush sizes for precise mask painting
- **Mobile Optimized** - Responsive design that works beautifully on all devices
- **Keyboard Shortcuts** - Efficient workflow with hotkeys

### 📚 **Project Management**
- **Generation History** - Track all your creations and edits
- **Variant Comparison** - Generate and compare multiple versions side-by-side
- **Full Undo/Redo** - Complete generation tree with branching history
- **Asset Management** - Organized storage of all generated content

### 🔒 **Enterprise Features**
- **SynthID Watermarking** - Built-in AI provenance with invisible watermarks
- **Offline Caching** - IndexedDB storage for offline asset access
- **Type Safety** - Full TypeScript implementation with strict typing
- **Performance Optimized** - React Query for efficient state management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- 一个AI图像生成API密钥（支持Google Gemini、OpenAI、Azure OpenAI等）

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd nano-banana-image-editor
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # 编辑.env文件，配置以下环境变量：
   # VITE_GEMINI_API_KEY=your_api_key_here
   # VITE_API_BASE_URL=your_api_base_url (可选)
   # VITE_MODEL_NAME=your_model_name (可选)
   ```

3. **验证配置**:
   ```bash
   npm run check-config
   ```

4. **Start development server**:
   ```bash
   npm run start    # 自动检查配置并启动
   # 或者
   npm run dev      # 直接启动（跳过配置检查）
   ```

5. **Open in browser**: Navigate to `http://localhost:5173`

## 🎯 Usage Guide

### Creating Images
1. Select **Generate** mode
2. Write a detailed prompt describing your desired image
3. Optionally upload reference images (max 2)
4. Adjust creativity settings if needed
5. Click **Generate** or press `Cmd/Ctrl + Enter`

### Editing Images
1. Switch to **Edit** mode
2. Upload an image or use a previously generated one
3. Optionally paint a mask to target specific areas
4. Describe your desired changes in natural language
5. Click **Apply Edit** to see the results

### Advanced Workflows
- Use **Select** mode to paint precise masks for targeted edits
- Compare variants in the History panel
- Download high-quality PNG outputs
- Use keyboard shortcuts for efficient navigation

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Generate/Apply Edit |
| `Shift + R` | Re-roll variants |
| `E` | Switch to Edit mode |
| `G` | Switch to Generate mode |
| `M` | Switch to Select mode |
| `H` | Toggle history panel |
| `P` | Toggle prompt panel |

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand for app state, React Query for server state  
- **Canvas**: Konva.js for interactive image display and mask overlays
- **AI Integration**: Google Generative AI SDK (Gemini 2.5 Flash Image)
- **Storage**: IndexedDB for offline asset caching
- **Build Tool**: Vite for fast development and optimized builds

### Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (Button, Input, etc.)
│   ├── PromptComposer.tsx  # Prompt input and tool selection
│   ├── ImageCanvas.tsx     # Interactive canvas with Konva
│   ├── HistoryPanel.tsx    # Generation history and variants
│   ├── Header.tsx          # App header and navigation
│   └── InfoModal.tsx       # About modal with links
├── services/           # External service integrations
│   ├── geminiService.ts    # Gemini API client
│   ├── cacheService.ts     # IndexedDB caching layer
│   └── imageProcessing.ts  # Image manipulation utilities
├── store/              # Zustand state management
│   └── useAppStore.ts      # Global application state
├── hooks/              # Custom React hooks
│   ├── useImageGeneration.ts  # Generation and editing logic
│   └── useKeyboardShortcuts.ts # Keyboard navigation
├── utils/              # Utility functions
│   ├── cn.ts              # Class name utility
│   └── imageUtils.ts      # Image processing helpers
└── types/              # TypeScript type definitions
    └── index.ts           # Core type definitions
```

## 🔧 Configuration

### 环境变量配置

必需配置：
```bash
# API密钥
VITE_GEMINI_API_KEY=your_api_key_here
```

可选配置：
```bash
# API基础地址（默认：Google Gemini）
VITE_API_BASE_URL=https://generativelanguage.googleapis.com

# 模型名称（默认：gemini-2.5-flash-image-preview）
VITE_MODEL_NAME=gemini-2.5-flash-image-preview
```

### 🎯 多API提供商支持

#### Google Gemini (默认)
```bash
VITE_API_BASE_URL=https://generativelanguage.googleapis.com
VITE_GEMINI_API_KEY=your_google_api_key
VITE_MODEL_NAME=gemini-2.5-flash-image-preview
```

#### OpenAI DALL-E
```bash
VITE_API_BASE_URL=https://api.openai.com
VITE_GEMINI_API_KEY=your_openai_api_key
VITE_MODEL_NAME=dall-e-3
```

#### Azure OpenAI
```bash
VITE_API_BASE_URL=https://your-resource.openai.azure.com
VITE_GEMINI_API_KEY=your_azure_api_key
VITE_MODEL_NAME=your_deployment_name
```

#### 自定义API提供商
```bash
VITE_API_BASE_URL=https://your-custom-api.com
VITE_GEMINI_API_KEY=your_custom_api_key
VITE_MODEL_NAME=your_custom_model
```

### 配置验证
```bash
npm run check-config  # 验证环境配置
```

### Model Configuration
- **Model**: `gemini-2.5-flash-image-preview`
- **Output Format**: 1024×1024 PNG with SynthID watermarks
- **Input Formats**: PNG, JPEG, WebP
- **Temperature Range**: 0-1 (0 = deterministic, 1 = creative)

## 🚀 Deployment

### Development
```bash
npm run dev          # Start development server
npm run start        # Check config and start
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run check-config # Verify environment configuration
```

### Production Considerations
- **API Security**: Implement backend proxy for API calls in production
- **Rate Limiting**: Add proper rate limiting and usage quotas
- **Authentication**: Consider user authentication for multi-user deployments
- **Storage**: Set up cloud storage for generated assets
- **Monitoring**: Add error tracking and analytics

## 📄 License & Copyright

**Copyright © 2025 [Mark Fulton](https://markfulton.com)**

This project is licensed under the **GNU Affero General Public License v3.0** (AGPL-3.0).

### What this means:
- ✅ **Free to use** for personal and commercial projects
- ✅ **Modify and distribute** with proper attribution
- ⚠️ **Share modifications** - Any changes must be shared under the same license
- ⚠️ **Network use** - If you run this as a web service, you must provide source code

See the [LICENSE](LICENSE) file for full details.

## 🤝 Contributing

We welcome contributions! Please:

1. **Follow the established patterns** - Keep components under 200 lines
2. **Maintain type safety** - Use TypeScript strictly with proper definitions
3. **Test thoroughly** - Ensure keyboard navigation and accessibility
4. **Document changes** - Update README and add inline comments
5. **Respect the license** - All contributions will be under AGPL-3.0

## 🔗 Links & Resources

- **Creator**: [Mark Fulton](https://markfulton.com)
- **AI Training Program**: [Reinventing.AI](https://www.reinventing.ai/)
- **Community**: [Vibe Coding is Life Skool](https://www.skool.com/vibe-coding-is-life/about?ref=456537abaf37491cbcc6976f3c26af41)
- **Google AI Studio**: [Get your API key](https://aistudio.google.com/)
- **Gemini API Docs**: [Official Documentation](https://ai.google.dev/gemini-api/docs)

## 🐛 Known Issues & Limitations

- **Client-side API calls** - Currently uses direct API calls (implement backend proxy for production)
- **Browser compatibility** - Requires modern browsers with Canvas and WebGL support
- **Rate limits** - Subject to Google AI Studio rate limits
- **Image size** - Optimized for 1024×1024 outputs (Gemini model output dimensions may vary)

## 🎯 Suggested Updates

- [ ] Backend API proxy implementation
- [ ] User authentication and project sharing
- [ ] Advanced brush tools and selection methods
- [ ] Plugin system for custom filters
- [ ] Integration with cloud storage providers

---

**Built by [Mark Fulton](https://markfulton.com)** | **Powered by Gemini 2.5 Flash Image** | **Made with Bolt.new**
