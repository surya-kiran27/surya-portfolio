import React, { useState, useEffect } from 'react';

type TerminalHeaderProps = {
  title?: string;
  onMaximize?: () => void;
  isMaximized?: boolean;
};

const TerminalHeader: React.FC<TerminalHeaderProps> = ({ 
  title = "portfolio@terminal",
  onMaximize,
  isMaximized = false,
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Check if on mobile using window width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle terminal controls
  const handleClose = () => {
    // Since this is a portfolio site, we'll just minimize instead of closing
    document.body.classList.add('terminal-minimized');
    // Add a small bounce animation to indicate it's minimized
    setTimeout(() => {
      document.body.classList.remove('terminal-minimized');
    }, 300);
  };

  const handleMinimize = () => {
    document.body.classList.add('terminal-minimized');
    // Add a small bounce animation
    setTimeout(() => {
      document.body.classList.remove('terminal-minimized');
    }, 300);
  };

  const handleMaximize = () => {
    if (onMaximize) {
      onMaximize();
    }
    if (!isMaximized) {
      document.body.classList.add('terminal-maximized');
    } else {
      document.body.classList.remove('terminal-maximized');
    }
  };

  return (
    <div className={`terminal-header bg-terminal-background border-b border-gray-700 px-4 py-2 ${isMobile ? 'px-3 py-1' : ''} ${isMaximized ? 'terminal-header-maximized' : ''}`}>
      <div className="terminal-controls flex gap-2">
        <div 
          className="terminal-control terminal-control-close hover:opacity-75 hover:scale-110 transition-all cursor-pointer"
          onClick={handleClose}
          title="Close"
        ></div>
        <div 
          className="terminal-control terminal-control-minimize hover:opacity-75 hover:scale-110 transition-all cursor-pointer"
          onClick={handleMinimize}
          title="Minimize"
        ></div>
        <div 
          className="terminal-control terminal-control-maximize hover:opacity-75 hover:scale-110 transition-all cursor-pointer"
          onClick={handleMaximize}
          title={isMaximized ? "Restore" : "Maximize"}
        ></div>
      </div>
      <div className={`terminal-title font-mono text-center text-terminal-bright-white flex items-center ${isMobile ? 'text-xs' : ''}`}>
        <span className="mr-2 text-terminal-bright-green">❯</span>
        {title}
        <span className="ml-1 animate-pulse">_</span>
      </div>
      <div className="flex items-center">
        <a 
          href="https://github.com/surya-kiran27/surya-portfolio" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm font-medium px-2 py-1 rounded bg-terminal-darkGray text-terminal-bright-white border border-terminal-bright-green hover:bg-terminal-green text-white flex items-center transition-all"
        >
          <svg className="w-4 h-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>
    </div>
  );
};

export default TerminalHeader; 