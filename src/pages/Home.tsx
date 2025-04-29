import React, { useState, useEffect } from 'react';
import Terminal from '../components/Terminal';
import TerminalHeader from '../components/TerminalHeader';
import profileData from '../data/profile.json';
import AsciiArt from '../components/AsciiArt';

const Home: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);
  
  // Add animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Handle mobile keyboard 
  useEffect(() => {
    if (!isMobile) return;
    
    // Fix iOS height when keyboard opens
    const metaViewport = document.querySelector('meta[name=viewport]');
    if (!metaViewport) {
      // Create viewport meta if it doesn't exist
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(meta);
    } else {
      // Update existing viewport meta
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
    }
    
    // Listen for resize events to detect keyboard
    const detectKeyboard = () => {
      // On iOS the window innerHeight changes when the keyboard opens
      const heightDiff = window.outerHeight - window.innerHeight;
      const newIsKeyboardOpen = heightDiff > 150;
      
      if (newIsKeyboardOpen !== isKeyboardOpen) {
        setIsKeyboardOpen(newIsKeyboardOpen);
        if (newIsKeyboardOpen) {
          document.body.classList.add('keyboard-open');
        } else {
          document.body.classList.remove('keyboard-open');
        }
      }
    };
    
    window.addEventListener('resize', detectKeyboard);
    
    return () => {
      window.removeEventListener('resize', detectKeyboard);
      document.body.classList.remove('keyboard-open');
    };
  }, [isMobile, isKeyboardOpen]);
  
  // Custom command handlers
  const commandHandlers = {
    logo: () => {
      return <AsciiArt className="my-2" />;
    }
  };

  return (
    <div className={`h-screen w-screen bg-terminal-background overflow-hidden flex flex-col transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${isMobile ? 'touch-manipulation' : ''}`}>
      <div className="w-full h-full flex flex-col shadow-lg">
        <TerminalHeader title={`${profileData.personalInfo.name.split(' ')[0].toLowerCase()}@portfolio:~`} />
        <Terminal 
          welcomeMessage={<AsciiArt className="mb-4" />}
          prompt={`${profileData.personalInfo.name.split(' ')[0].toLowerCase()}@portfolio:~$`}
          commandHistory={commandHandlers}
        />
      </div>
    </div>
  );
};

export default Home; 