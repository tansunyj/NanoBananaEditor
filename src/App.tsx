import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cn } from './utils/cn';
import { Header } from './components/Header';
import { PromptComposer } from './components/PromptComposer';
import { ImageCanvas } from './components/ImageCanvas';
import { HistoryPanel } from './components/HistoryPanel';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAppStore } from './store/useAppStore';
import { geminiService } from './services/geminiService';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

function AppContent() {
  useKeyboardShortcuts();
  
  const { showPromptPanel, setShowPromptPanel, setShowHistory } = useAppStore();
  
  // Set mobile defaults on mount
  React.useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setShowPromptPanel(false);
        setShowHistory(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setShowPromptPanel, setShowHistory]);

  // 在开发模式下显示API配置调试信息
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🏠 Nano Banana Editor - 开发模式启动');
      console.log('🔥 当前环境变量:');
      console.log('   VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY ? '✅ 已配置' : '❌ 未配置');
      console.log('   VITE_API_TOKEN:', import.meta.env.VITE_API_TOKEN ? '✅ 已配置' : '❌ 未配置');
      console.log('   VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || '使用默认值');
      console.log('   VITE_MODEL_NAME:', import.meta.env.VITE_MODEL_NAME || '使用默认值');
      
      // 显示 GeminiService 配置状态
      geminiService.debugConfig();
      
      console.log('📝 如果你看到这些信息，说明环境变量已正确加载！');
      console.log('📝 API调用时会显示更多详细的认证信息...');
    }
  }, []);

  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <div className={cn("flex-shrink-0 transition-all duration-300", !showPromptPanel && "w-8")}>
          <PromptComposer />
        </div>
        <div className="flex-1 min-w-0">
          <ImageCanvas />
        </div>
        <div className="flex-shrink-0">
          <HistoryPanel />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;