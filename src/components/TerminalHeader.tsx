import React from 'react';

type TerminalHeaderProps = {
  title?: string;
};

const TerminalHeader: React.FC<TerminalHeaderProps> = ({ 
  title = "portfolio@terminal" 
}) => {
  return (
    <div className="terminal-header bg-terminal-background border-b border-gray-700 px-4 py-2">
      <div className="terminal-controls flex gap-2">
        <div className="terminal-control terminal-control-close hover:opacity-75 hover:scale-110 transition-all cursor-pointer"></div>
        <div className="terminal-control terminal-control-minimize hover:opacity-75 hover:scale-110 transition-all cursor-pointer"></div>
        <div className="terminal-control terminal-control-maximize hover:opacity-75 hover:scale-110 transition-all cursor-pointer"></div>
      </div>
      <div className="terminal-title font-mono text-center text-terminal-bright-white flex items-center">
        <span className="mr-2 text-terminal-bright-green">❯</span>
        {title}
        <span className="ml-1 animate-pulse">_</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs text-terminal-gray">
          {new Date().toLocaleTimeString()}
        </div>
        <div className="text-xs text-terminal-bright-green px-2 py-0.5 rounded-full bg-terminal-darkGray border border-terminal-green">
          online
        </div>
      </div>
    </div>
  );
};

export default TerminalHeader; 