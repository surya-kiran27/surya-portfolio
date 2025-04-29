import React, { useEffect, useState } from 'react';
import { profileAscii, nameAscii, mobileNameAscii } from '../data/ascii-content';
import profileData from '../data/profile.json';

// Rainbow colors with enhanced brightness
const colors = [
  'text-red-400',
  'text-orange-400',
  'text-yellow-400',
  'text-green-400',
  'text-blue-400',
  'text-indigo-400',
  'text-purple-400',
];

// Custom color sequence for name
const nameColors = [
  'text-green-400',
  'text-green-500',
  'text-blue-400',
  'text-blue-500',
  'text-cyan-400',
  'text-cyan-500',
  'text-green-400',
];

// Component that directly uses the ASCII art
const AsciiArt: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Check if on mobile using window width
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsSmallMobile(width < 375);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Animate entrance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Process the ASCII art for display
  const profileLines = profileAscii.split('\n');
  const nameLines = nameAscii.split('\n');
  const mobileNameLines = mobileNameAscii.split('\n');
  
  // Use the appropriate name ASCII based on screen size
  const displayNameLines = isMobile ? mobileNameLines : nameLines;
  
  // For very small mobile devices, show an even more compact version
  const compactDisplayLines = isSmallMobile 
    ? displayNameLines.filter((_, i) => i % 2 === 0) 
    : displayNameLines;
  
  // Determine the maximum number of lines for proper alignment (only if not on mobile)
  const maxLines = !isMobile ? Math.max(profileLines.length, nameLines.length) : 0;
  
  // Pad the shorter array with empty strings (only if not on mobile)
  if (!isMobile) {
    while (displayNameLines.length < maxLines) {
      displayNameLines.push('');
    }
    while (profileLines.length < maxLines) {
      profileLines.push('');
    }
  }
  
  return (
    <div className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}>
      <div className="flex flex-wrap text-terminal-bright-green">
        {/* Name ASCII on the left with welcome message */}
        <div className={`w-full ${isMobile ? 'w-full' : 'md:w-1/2'} pr-4 relative`}>
          <pre className={`whitespace-pre font-mono ${isSmallMobile ? 'text-xs overflow-x-auto' : ''}`}>
            {compactDisplayLines.map((line, lineIndex) => (
              <div 
                key={`name-${lineIndex}`} 
                className={`${nameColors[lineIndex % nameColors.length]} transition-all hover:text-terminal-bright-green cursor-default`}
                style={{ 
                  animation: `glow ${2 + lineIndex * 0.1}s ease-in-out infinite`,
                  animationDelay: `${lineIndex * 0.05}s`
                }}
              >
                {line}
              </div>
            ))}
          </pre>
          {/* Welcome message positioned below name ASCII */}
          <div className={`mt-2 pt-0 text-terminal-bright-yellow font-mono whitespace-pre-line ${isSmallMobile ? 'text-xs' : ''}`}>
            {isSmallMobile 
              ? profileData.welcomeMessage.split('\n').slice(0, 2).join('\n') 
              : profileData.welcomeMessage}
            <p className="text-xs text-terminal-gray mt-1">Last login: {new Date().toLocaleString()}</p>
          </div>
        </div>
        
        {/* Profile ASCII on the right - hidden on mobile */}
        {!isMobile && (
          <div className="w-full md:w-1/2">
            <pre className="whitespace-pre font-mono">
              {profileLines.map((line, lineIndex) => (
                <div 
                  key={`profile-${lineIndex}`}
                  className={`${colors[lineIndex % colors.length]} transition-all hover:text-terminal-bright-white cursor-default`}
                  style={{ 
                    animation: `fadeIn 0.5s ease-in-out`,
                    animationDelay: `${lineIndex * 0.05}s`,
                    animationFillMode: 'both'
                  }}
                >
                  {line}
                </div>
              ))}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AsciiArt; 