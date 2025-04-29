import React, { useState, useEffect } from 'react';
import Terminal from '../components/Terminal';
import TerminalHeader from '../components/TerminalHeader';
import profileData from '../data/profile.json';
import AsciiArt from '../components/AsciiArt';

const Home: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
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