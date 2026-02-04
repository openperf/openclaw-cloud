import { useEffect, useRef, useState } from "react";

interface ScrollingCodeBlockProps {
  title?: string;
  className?: string;
}

// 代码内容 - 展示技能定义的多个示例（Opencode/open-interpreter相关）
const codeContent = `---
name: opencode-assistant
description: Opencode 智能编程助手
author: OpenClaw
version: 1.0.0
---

# Opencode Assistant Skill

专业的 AI 编程助手，
集成 Opencode 实现代码开发自动化。

## 能力
- 代码生成与重构
- 多语言支持 (Python/JS/Go)
- 项目结构分析
- 智能代码补全

---
name: open-interpreter
description: Open Interpreter 执行器
author: OpenClaw
version: 2.0.0
---

# Open Interpreter Skill

本地代码执行与系统交互，
安全沙箱环境运行任意代码。

## 能力
- Python/Shell 代码执行
- 文件系统操作
- 系统命令调用
- 实时输出流

---
name: web-scraper
description: 智能网页抓取技能
author: OpenClaw
version: 1.5.0
---

# Web Scraper Skill

智能网页内容抓取与解析，
支持动态页面和结构化提取。

## 能力
- 网页内容抓取
- 数据结构化提取
- 自动分页处理
- JavaScript 渲染

---
name: data-analyst
description: 数据分析与可视化
author: OpenClaw
version: 2.1.0
---

# Data Analyst Skill

专业数据分析与可视化，
支持多种数据源和图表类型。

## 能力
- 数据清洗与转换
- 统计分析与建模
- 图表生成与导出
- CSV/Excel/JSON 支持`;

export function ScrollingCodeBlock({ title = "skill.md", className }: ScrollingCodeBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollSpeed = 0.5; // 像素/帧
    const contentHeight = container.scrollHeight / 2;

    const animate = (currentTime: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = currentTime;
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      if (!isPaused) {
        setScrollPosition((prev) => {
          const newPos = prev + scrollSpeed * (deltaTime / 16);
          if (newPos >= contentHeight) {
            return 0;
          }
          return newPos;
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused]);

  return (
    <div 
      className={`stripe-code-block ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 窗口标题栏 - Stripe风格 */}
      <div className="stripe-code-header">
        {/* 窗口控制按钮 */}
        <div className="flex items-center gap-2">
          <div className="stripe-code-dot stripe-code-dot-red"></div>
          <div className="stripe-code-dot stripe-code-dot-yellow"></div>
          <div className="stripe-code-dot stripe-code-dot-green"></div>
        </div>
        
        <span className="ml-3 text-xs text-gray-400 font-mono flex items-center gap-2">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          {title}
        </span>
        
        {/* 滚动状态指示器 */}
        <div className="ml-auto flex items-center gap-2">
          <span 
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wider uppercase transition-all ${
              isPaused 
                ? 'bg-amber-500/20 text-amber-400' 
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {isPaused ? 'PAUSED' : 'RUNNING'}
          </span>
        </div>
      </div>

      {/* 代码内容区域 - 带滚动动画 */}
      <div className="relative h-[320px] overflow-hidden">
        {/* 顶部渐变遮罩 */}
        <div 
          className="absolute top-0 left-0 right-0 h-12 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, #0A2540, transparent)' }}
        ></div>
        
        {/* 滚动内容 */}
        <div 
          ref={containerRef}
          className="font-mono text-sm leading-relaxed"
          style={{ transform: `translateY(-${scrollPosition}px)` }}
        >
          {/* 内容重复两次以实现无缝滚动 */}
          <pre className="p-5 whitespace-pre-wrap">
            <CodeHighlight code={codeContent} />
          </pre>
          <pre className="p-5 whitespace-pre-wrap">
            <CodeHighlight code={codeContent} />
          </pre>
        </div>

        {/* 底部渐变遮罩 */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-12 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0A2540, transparent)' }}
        ></div>

        {/* 左侧装饰线 - Stripe渐变 */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-[2px] z-10"
          style={{ 
            background: 'linear-gradient(to bottom, transparent, #635BFF, #00D4FF, #FF80B5, transparent)'
          }}
        ></div>
      </div>

      {/* 底部状态栏 - Stripe风格 */}
      <div 
        className="flex items-center justify-between px-4 py-2.5 text-[10px] border-t border-[#1A3A5C]"
      >
        <span className="flex items-center gap-2 text-[#635BFF] tracking-wider uppercase font-semibold">
          <span 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: 'linear-gradient(135deg, #635BFF, #00D4FF)' }}
          ></span>
          OpenClaw Skills
        </span>
        <span className="text-gray-500 tracking-wider">HOVER TO PAUSE · AUTO SCROLL</span>
      </div>
    </div>
  );
}

// Stripe风格代码高亮组件
function CodeHighlight({ code }: { code: string }) {
  const lines = code.split('\n');
  
  return (
    <>
      {lines.map((line, index) => {
        // YAML frontmatter
        if (line.startsWith('---')) {
          return <span key={index} className="text-[#FF80B5]">{line}{'\n'}</span>;
        }
        // YAML key-value
        if (line.match(/^[a-z]+:/)) {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':');
          return (
            <span key={index}>
              <span className="text-[#00D4FF]">{key}</span>
              <span className="text-gray-500">:</span>
              <span className="text-[#80E9FF]">{value}</span>
              {'\n'}
            </span>
          );
        }
        // Markdown headers
        if (line.startsWith('#')) {
          return <span key={index} className="text-[#FF9E2C] font-semibold">{line}{'\n'}</span>;
        }
        // List items
        if (line.startsWith('-')) {
          return (
            <span key={index}>
              <span className="text-[#635BFF]">-</span>
              <span className="text-gray-300">{line.slice(1)}</span>
              {'\n'}
            </span>
          );
        }
        // Regular text
        return <span key={index} className="text-gray-400">{line}{'\n'}</span>;
      })}
    </>
  );
}

export default ScrollingCodeBlock;
