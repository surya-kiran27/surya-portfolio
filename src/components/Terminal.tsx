import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import profileData from '../data/profile.json';

// Add CSS for sudo mode and animations
const sudoStyles = `
  .sudo-mode {
    background-color: #000 !important;
    color: #0f0 !important;
    transition: all 0.5s ease;
  }
  
  .sudo-mode .terminal-container {
    background-color: rgba(0, 20, 0, 0.9) !important;
    border: 1px solid #0f0 !important;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5) !important;
  }
  
  .animate-glitch {
    animation: glitch 1s linear;
  }
  
  @keyframes glitch {
    0% { transform: translate(2px, 0) skew(0deg); }
    10% { transform: translate(-2px, 0) skew(0deg); }
    20% { transform: translate(2px, 0) skew(0deg); }
    30% { transform: translate(0, 2px) skew(-5deg); opacity: 0.8; }
    40% { transform: translate(0, -2px) skew(5deg); opacity: 1; }
    50% { transform: translate(-2px, 0) skew(0deg); }
    60% { transform: translate(2px, 0) skew(0deg); }
    70% { transform: translate(0, 2px) skew(0deg); }
    80% { transform: translate(0, -2px) skew(0deg); }
    90% { transform: translate(2px, 0) skew(0deg); }
    100% { transform: translate(0, 0) skew(0deg); }
  }
  
  .animate-matrix-rain {
    animation: matrix-rain 5s linear infinite;
  }
  
  @keyframes matrix-rain {
    0% { transform: translateY(0); opacity: 0; }
    5% { opacity: 1; }
    95% { opacity: 1; }
    100% { transform: translateY(100%); opacity: 0; }
  }
  
  .matrix-effect {
    position: relative;
  }
  
  .matrix-effect::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background: rgba(0, 10, 0, 0.6);
    z-index: 10;
  }
  
  .matrix-code {
    position: relative;
    background-color: #000;
    padding: 1rem;
    border-radius: 4px;
    min-height: 200px;
    width: 100%;
    max-width: 400px;
    overflow: hidden;
  }
  
  .matrix-code::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 200%;
    background: linear-gradient(0deg, transparent 0%, rgba(0, 255, 0, 0.2) 100%);
    animation: matrix-scan 4s linear infinite;
  }
  
  @keyframes matrix-scan {
    from { transform: translateY(-100%); }
    to { transform: translateY(100%); }
  }
  
  .hollywood-hacking > div {
    animation: typing 0.5s steps(20, end);
    overflow: hidden;
    white-space: nowrap;
    opacity: 0;
    animation-fill-mode: forwards;
  }
  
  @keyframes typing {
    from { width: 0; opacity: 0; }
    to { width: 100%; opacity: 1; }
  }
`;

type Command = {
  command: string;
  output: string | React.ReactNode;
};

type TerminalProps = {
  welcomeMessage?: string | React.ReactNode;
  prompt?: string;
  initialCommands?: Command[];
  commandHistory?: Record<string, () => string | React.ReactNode>;
};

const Terminal = ({
  welcomeMessage = profileData.welcomeMessage,
  prompt = "guest@portfolio:~$",
  initialCommands = [],
  commandHistory = {},
}: TerminalProps) => {
  const [commands, setCommands] = useState<Command[]>(initialCommands);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [commandsHistory, setCommandsHistory] = useState<string[]>([]);
  const [showTypingAnimation, setShowTypingAnimation] = useState<boolean>(true);
  const [typedCommand, setTypedCommand] = useState<string>('');
  const [isInitialCommandsShown, setIsInitialCommandsShown] = useState<boolean>(false);
  const [sudoMode, setSudoMode] = useState<boolean>(false);
  const [sudoTimeLeft, setSudoTimeLeft] = useState<number>(30);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const sudoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const matrixTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matrixIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Add sudo styles to head
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.type = 'text/css';
    styleEl.appendChild(document.createTextNode(sudoStyles));
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Countdown timer for sudo mode
  useEffect(() => {
    if (sudoMode && sudoTimeLeft > 0) {
      sudoTimerRef.current = setInterval(() => {
        setSudoTimeLeft(prev => {
          if (prev <= 1) {
            if (sudoTimerRef.current) {
              clearInterval(sudoTimerRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (sudoTimerRef.current) {
        clearInterval(sudoTimerRef.current);
      }
    };
  }, [sudoMode, sudoTimeLeft]);

  // Reset sudo mode when timer reaches 0
  useEffect(() => {
    if (sudoMode && sudoTimeLeft === 0) {
      endSudoMode();
    }
  }, [sudoTimeLeft, sudoMode]);

  // Function to end sudo mode and clean up
  const endSudoMode = () => {
    document.body.classList.remove('sudo-mode');
    document.body.classList.remove('matrix-effect');
    
    // Clean up any matrix effects
    const matrixContainer = document.querySelector('.matrix-rain-container');
    if (matrixContainer && matrixContainer.parentNode) {
      matrixContainer.parentNode.removeChild(matrixContainer);
    }
    
    // Clean up matrix keyframes
    const matrixKeyframes = document.querySelector('style[data-matrix-keyframes]');
    if (matrixKeyframes && matrixKeyframes.parentNode) {
      matrixKeyframes.parentNode.removeChild(matrixKeyframes);
    }
    
    // Reset sudo mode
    setSudoMode(false);
    setSudoTimeLeft(30);
    
    // Clear the terminal as part of session expiry
    setCommands([]);
    
    // Add a "session expired" message to the terminal
    setCommands(cmds => [...cmds, {
      command: 'system',
      output: <span className="text-terminal-bright-red">ALERT: Privileged session expired. Returning to normal user mode.</span>
    }]);
    
    // Clear any remaining timeouts and intervals
    if (matrixTimeoutRef.current) {
      clearTimeout(matrixTimeoutRef.current);
      matrixTimeoutRef.current = null;
    }
    
    if (matrixIntervalRef.current) {
      clearInterval(matrixIntervalRef.current);
      matrixIntervalRef.current = null;
    }
  };

  // Typing animation for initial help command
  useEffect(() => {
    if (!isInitialCommandsShown) {
      const initialCommand = 'help';
      let index = 0;
      
      const typingInterval = setInterval(() => {
        if (index < initialCommand.length) {
          setTypedCommand(initialCommand.substring(0, index + 1));
          index++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            setShowTypingAnimation(false);
            setIsInitialCommandsShown(true);
            executeCommand('help');
          }, 500);
        }
      }, 100);
      
      return () => clearInterval(typingInterval);
    }
  }, [isInitialCommandsShown]);

  // Default command handlers
  const defaultCommands: Record<string, () => string | React.ReactNode> = {
    help: () => {
      return (
        <div>
          <p className="text-terminal-bright-white">Available commands:</p>
          <ul className="pl-6 list-disc text-terminal-bright-white">
            <li><span className="text-terminal-bright-green">about</span> - Learn about me</li>
            <li><span className="text-terminal-bright-green">experience</span> - View my work experience</li>
            <li><span className="text-terminal-bright-green">education</span> - View my education background</li>
            <li><span className="text-terminal-bright-green">projects</span> - View my projects</li>
            <li><span className="text-terminal-bright-green">skills</span> - See my technical skills</li>
            <li><span className="text-terminal-bright-green">contact</span> - How to get in touch</li>
            <li><span className="text-terminal-bright-green">resume</span> - Download my resume</li>
            <li><span className="text-terminal-bright-green">echo</span> - Echo a message or display all profile info</li>
            <li><span className="text-terminal-bright-green">clear</span> - Clear the terminal</li>
            <li><span className="text-terminal-bright-green">help</span> - Show this help message</li>
            <li><span className="text-terminal-bright-green">sudo</span> - Elevate privileges (use with caution)</li>
          </ul>
          <div className="mt-3 text-terminal-bright-white">
            <p>Terminal navigation:</p>
            <ul className="pl-6 list-disc">
              <li><span className="text-terminal-bright-yellow">↑/↓ arrow keys</span> - Navigate through command history</li>
              <li><span className="text-terminal-bright-yellow">Tab</span> - Autocomplete commands</li>
            </ul>
          </div>
        </div>
      );
    },
    about: () => {
      return (
        <div className="text-terminal-text animate-fadeIn">
          <p className="text-terminal-bright-yellow font-bold text-center text-lg mb-3 pb-1 border-b border-terminal-yellow">{profileData.personalInfo.name}</p>
          <p className="mb-3 leading-relaxed">{profileData.about.summary}</p>
          <p className="mt-2 text-terminal-bright-white">Type <span className="text-terminal-bright-green font-semibold">experience</span>, <span className="text-terminal-bright-green font-semibold">projects</span>, or <span className="text-terminal-bright-green font-semibold">skills</span> to learn more about my professional background.</p>
        </div>
      );
    },
    experience: () => {
      return (
        <div className="space-y-4 text-terminal-text animate-fadeIn">
          <p className="text-terminal-bright-white text-lg font-bold mb-3 border-b border-terminal-green pb-1">Work Experience:</p>
          
          {profileData.experience.map((job, index) => (
            <div key={index} className="pl-4 border-l-2 border-terminal-green mb-6 transition-all hover:pl-5 hover:border-terminal-bright-green">
              <p className="font-bold text-terminal-bright-cyan">{job.role} | {job.company} - {job.location}</p>
              <p className="text-terminal-bright-green mb-2">{job.startDate} - {job.endDate}</p>
              <ul className="list-none pl-2 mt-1">
                {job.highlights.map((highlight, i) => (
                  <li key={i} className="mb-2 flex items-start">
                    <span className="text-terminal-bright-yellow mr-2 mt-1">❯</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    },
    education: () => {
      return (
        <div className="text-terminal-text animate-fadeIn">
          <p className="text-terminal-bright-white text-lg font-bold mb-3 border-b border-terminal-green pb-1">Education:</p>
          {profileData.education.map((edu, index) => (
            <div key={index} className="pl-4 border-l-2 border-terminal-green mt-2 transition-all hover:pl-5 hover:border-terminal-bright-green">
              <p className="font-bold text-terminal-bright-cyan">{edu.institution}</p>
              <p className="mb-1">{edu.degree}</p>
              <p className="text-terminal-bright-green">Graduated: {edu.graduationDate}</p>
            </div>
          ))}
        </div>
      );
    },
    projects: () => {
      return (
        <div className="space-y-4 text-terminal-text animate-fadeIn">
          <p className="text-terminal-bright-white text-lg font-bold mb-3 border-b border-terminal-green pb-1">My Projects:</p>
          
          {profileData.projects.map((project, index) => (
            <div key={index} className="pl-4 border-l-2 border-terminal-green mb-6 transition-all hover:pl-5 hover:border-terminal-bright-green">
              <div className="flex flex-wrap items-center mb-1">
                <p className="font-bold text-terminal-bright-cyan mr-3">
                  {project.name}
                </p>
                {project.status && <span className="text-xs px-2 py-1 rounded-md bg-terminal-green text-black">{project.status}</span>}
              </div>
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-terminal-bright-blue text-sm hover:underline inline-block mb-2">{project.url}</a>
              <p className="mb-2">{project.shortDescription}</p>
              {project.additionalInfo && <p className="mb-2">{project.additionalInfo}</p>}
              {project.techStack && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.techStack.map((tech, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-md bg-terminal-darkGray text-terminal-bright-magenta border border-terminal-bright-magenta">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <p className="mt-2 text-terminal-bright-white">Type <span className="text-terminal-bright-green font-semibold">project [name]</span> to learn more about a specific project.</p>
        </div>
      );
    },
    skills: () => {
      return (
        <div className="text-terminal-text animate-fadeIn">
          <p className="text-terminal-bright-white text-lg font-bold mb-3 border-b border-terminal-green pb-1">Technical Skills:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="skills-card">
              <p className="font-bold text-terminal-bright-yellow mb-2 flex items-center">
                <span className="inline-block w-3 h-3 bg-terminal-bright-yellow rounded-full mr-2"></span>
                Languages:
              </p>
              <ul className="list-none pl-6">
                {profileData.skills.languages.map((lang, index) => (
                  <li key={index} className="mb-1 flex items-center">
                    <span className="text-terminal-bright-green mr-2">❯</span>
                    {lang}
                  </li>
                ))}
              </ul>
            </div>
            <div className="skills-card">
              <p className="font-bold text-terminal-bright-yellow mb-2 flex items-center">
                <span className="inline-block w-3 h-3 bg-terminal-bright-yellow rounded-full mr-2"></span>
                Front-end:
              </p>
              <ul className="list-none pl-6">
                {profileData.skills.frontend.map((skill, index) => (
                  <li key={index} className="mb-1 flex items-center">
                    <span className="text-terminal-bright-green mr-2">❯</span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
            <div className="skills-card">
              <p className="font-bold text-terminal-bright-yellow mb-2 flex items-center">
                <span className="inline-block w-3 h-3 bg-terminal-bright-yellow rounded-full mr-2"></span>
                Back-end:
              </p>
              <ul className="list-none pl-6">
                {profileData.skills.backend.map((skill, index) => (
                  <li key={index} className="mb-1 flex items-center">
                    <span className="text-terminal-bright-green mr-2">❯</span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
            <div className="skills-card">
              <p className="font-bold text-terminal-bright-yellow mb-2 flex items-center">
                <span className="inline-block w-3 h-3 bg-terminal-bright-yellow rounded-full mr-2"></span>
                Databases:
              </p>
              <ul className="list-none pl-6">
                {profileData.skills.databases.map((db, index) => (
                  <li key={index} className="mb-1 flex items-center">
                    <span className="text-terminal-bright-green mr-2">❯</span>
                    {db}
                  </li>
                ))}
              </ul>
            </div>
            <div className="skills-card">
              <p className="font-bold text-terminal-bright-yellow mb-2 flex items-center">
                <span className="inline-block w-3 h-3 bg-terminal-bright-yellow rounded-full mr-2"></span>
                Cloud & DevOps:
              </p>
              <ul className="list-none pl-6">
                {profileData.skills.cloudDevOps.map((tool, index) => (
                  <li key={index} className="mb-1 flex items-center">
                    <span className="text-terminal-bright-green mr-2">❯</span>
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    },
    contact: () => {
      return (
        <div className="text-terminal-text animate-fadeIn">
          <p className="text-terminal-bright-white text-lg font-bold mb-3 border-b border-terminal-green pb-1">Get in touch with me:</p>
          <ul className="pl-6 list-none">
            <li className="mb-3 flex items-center">
              <span className="inline-block w-6 h-6 flex items-center justify-center bg-terminal-bright-blue rounded-full mr-3 text-black">✉</span>
              <span>Email: </span>
              <a href={`mailto:${profileData.personalInfo.email}`} className="text-terminal-bright-blue ml-2 hover:underline">
                {profileData.personalInfo.email}
              </a>
            </li>
            <li className="mb-3 flex items-center">
              <span className="inline-block w-6 h-6 flex items-center justify-center bg-terminal-bright-blue rounded-full mr-3 text-black">𝕃</span>
              <span>LinkedIn: </span>
              <a href={`https://${profileData.personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-terminal-bright-blue ml-2 hover:underline">
                {profileData.personalInfo.linkedin}
              </a>
            </li>
            <li className="mb-3 flex items-center">
              <span className="inline-block w-6 h-6 flex items-center justify-center bg-terminal-bright-blue rounded-full mr-3 text-black">G</span>
              <span>GitHub: </span>
              <a href={`https://${profileData.personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="text-terminal-bright-blue ml-2 hover:underline">
                {profileData.personalInfo.github}
              </a>
            </li>
          </ul>
        </div>
      );
    },
    resume: () => {
      return (
        <div className="text-terminal-text animate-fadeIn">
          <p className="mb-3">My resume is available for download:</p>
          <a 
            href="/resume.pdf" 
            download 
            className="inline-block px-4 py-2 text-black bg-terminal-bright-green rounded hover:bg-terminal-green transition-colors"
            onClick={(e) => {
              e.preventDefault();
              window.alert('Resume download functionality will be implemented.');
            }}
          >
            Download Resume (PDF)
          </a>
        </div>
      );
    },
    echo: () => {
      return (
        <div className="text-terminal-text animate-fadeIn space-y-8">
          {/* About section */}
          <div>
            <p className="text-terminal-bright-white text-lg font-bold mb-3 border-b border-terminal-green pb-1">About Me:</p>
            <p className="mb-3 leading-relaxed">{profileData.about.summary}</p>
          </div>
          
          {/* Experience section */}
          <div>
            <p className="text-terminal-bright-white text-lg font-bold mb-3 border-b border-terminal-green pb-1">Work Experience:</p>
            {profileData.experience.map((job, index) => (
              <div key={index} className="pl-4 border-l-2 border-terminal-green mb-6 transition-all hover:pl-5 hover:border-terminal-bright-green">
                <p className="font-bold text-terminal-bright-cyan">{job.role} | {job.company} - {job.location}</p>
                <p className="text-terminal-bright-green mb-2">{job.startDate} - {job.endDate}</p>
                <ul className="list-none pl-2 mt-1">
                  {job.highlights.map((highlight, i) => (
                    <li key={i} className="mb-2 flex items-start">
                      <span className="text-terminal-bright-yellow mr-2 mt-1">❯</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          {/* Education section */}
          <div>
            <p className="text-terminal-bright-white text-lg font-bold mb-3 border-b border-terminal-green pb-1">Education:</p>
            {profileData.education.map((edu, index) => (
              <div key={index} className="pl-4 border-l-2 border-terminal-green mt-2 transition-all hover:pl-5 hover:border-terminal-bright-green">
                <p className="font-bold text-terminal-bright-cyan">{edu.institution}</p>
                <p className="mb-1">{edu.degree}</p>
                <p className="text-terminal-bright-green">Graduated: {edu.graduationDate}</p>
              </div>
            ))}
          </div>
          
          {/* Skills section */}
          <div>
            <p className="text-terminal-bright-white text-lg font-bold mb-3 border-b border-terminal-green pb-1">Technical Skills:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="skills-card">
                <p className="font-bold text-terminal-bright-yellow mb-2 flex items-center">
                  <span className="inline-block w-3 h-3 bg-terminal-bright-yellow rounded-full mr-2"></span>
                  Languages:
                </p>
                <ul className="list-none pl-6">
                  {profileData.skills.languages.map((lang, index) => (
                    <li key={index} className="mb-1 flex items-center">
                      <span className="text-terminal-bright-green mr-2">❯</span>
                      {lang}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="skills-card">
                <p className="font-bold text-terminal-bright-yellow mb-2 flex items-center">
                  <span className="inline-block w-3 h-3 bg-terminal-bright-yellow rounded-full mr-2"></span>
                  Front-end:
                </p>
                <ul className="list-none pl-6">
                  {profileData.skills.frontend.map((skill, index) => (
                    <li key={index} className="mb-1 flex items-center">
                      <span className="text-terminal-bright-green mr-2">❯</span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="skills-card">
                <p className="font-bold text-terminal-bright-yellow mb-2 flex items-center">
                  <span className="inline-block w-3 h-3 bg-terminal-bright-yellow rounded-full mr-2"></span>
                  Back-end:
                </p>
                <ul className="list-none pl-6">
                  {profileData.skills.backend.map((skill, index) => (
                    <li key={index} className="mb-1 flex items-center">
                      <span className="text-terminal-bright-green mr-2">❯</span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="skills-card">
                <p className="font-bold text-terminal-bright-yellow mb-2 flex items-center">
                  <span className="inline-block w-3 h-3 bg-terminal-bright-yellow rounded-full mr-2"></span>
                  Databases:
                </p>
                <ul className="list-none pl-6">
                  {profileData.skills.databases.map((db, index) => (
                    <li key={index} className="mb-1 flex items-center">
                      <span className="text-terminal-bright-green mr-2">❯</span>
                      {db}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="skills-card">
                <p className="font-bold text-terminal-bright-yellow mb-2 flex items-center">
                  <span className="inline-block w-3 h-3 bg-terminal-bright-yellow rounded-full mr-2"></span>
                  Cloud & DevOps:
                </p>
                <ul className="list-none pl-6">
                  {profileData.skills.cloudDevOps.map((tool, index) => (
                    <li key={index} className="mb-1 flex items-center">
                      <span className="text-terminal-bright-green mr-2">❯</span>
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Projects section */}
          <div>
            <p className="text-terminal-bright-white text-lg font-bold mb-3 border-b border-terminal-green pb-1">Projects:</p>
            {profileData.projects.map((project, index) => (
              <div key={index} className="pl-4 border-l-2 border-terminal-green mb-6 transition-all hover:pl-5 hover:border-terminal-bright-green">
                <div className="flex flex-wrap items-center mb-1">
                  <p className="font-bold text-terminal-bright-cyan mr-3">
                    {project.name}
                  </p>
                  {project.status && <span className="text-xs px-2 py-1 rounded-md bg-terminal-green text-black">{project.status}</span>}
                </div>
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-terminal-bright-blue text-sm hover:underline inline-block mb-2">{project.url}</a>
                <p className="mb-2">{project.shortDescription}</p>
                {project.techStack && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.techStack.map((tech, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-md bg-terminal-darkGray text-terminal-bright-magenta border border-terminal-bright-magenta">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Contact section */}
          <div>
            <p className="text-terminal-bright-white text-lg font-bold mb-3 border-b border-terminal-green pb-1">Contact:</p>
            <ul className="pl-6 list-none">
              <li className="mb-3 flex items-center">
                <span className="inline-block w-6 h-6 flex items-center justify-center bg-terminal-bright-blue rounded-full mr-3 text-black">✉</span>
                <span>Email: </span>
                <a href={`mailto:${profileData.personalInfo.email}`} className="text-terminal-bright-blue ml-2 hover:underline">
                  {profileData.personalInfo.email}
                </a>
              </li>
              <li className="mb-3 flex items-center">
                <span className="inline-block w-6 h-6 flex items-center justify-center bg-terminal-bright-blue rounded-full mr-3 text-black">𝕃</span>
                <span>LinkedIn: </span>
                <a href={`https://${profileData.personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-terminal-bright-blue ml-2 hover:underline">
                  {profileData.personalInfo.linkedin}
                </a>
              </li>
              <li className="mb-3 flex items-center">
                <span className="inline-block w-6 h-6 flex items-center justify-center bg-terminal-bright-blue rounded-full mr-3 text-black">G</span>
                <span>GitHub: </span>
                <a href={`https://${profileData.personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="text-terminal-bright-blue ml-2 hover:underline">
                  {profileData.personalInfo.github}
                </a>
              </li>
            </ul>
          </div>
        </div>
      );
    },
    clear: () => {
      setTimeout(() => setCommands([]), 50);
      return '';
    },
    sudo: () => {
      // If already in sudo mode, just reset the timer without changing the state
      if (sudoMode) {
        // Clear existing timer if any
        if (sudoTimerRef.current) {
          clearInterval(sudoTimerRef.current);
          sudoTimerRef.current = null;
        }
        
        // Reset timer
        setSudoTimeLeft(30);
        
        return (
          <div className="animate-fadeIn">
            <p className="text-terminal-bright-green mb-2 font-bold text-center">
              === ACCESS ALREADY GRANTED ===
            </p>
            <p className="text-terminal-bright-green">Sudo session extended for 30 more seconds.</p>
          </div>
        );
      }
      
      // Enable sudo mode
      setSudoMode(true);
      setSudoTimeLeft(30);
      
      // Play hacker sound effect if available in the browser
      const tryPlayAudio = () => {
        try {
          const audio = new Audio('/sounds/access-granted.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Silent catch - audio may not play due to browser restrictions
          });
        } catch {
          // Silent fail for environments without Audio support
        }
      };
      
      tryPlayAudio();
      
      // Add Matrix effect to body temporarily
      document.body.classList.add('sudo-mode');
      
      return (
        <div className="animate-glitch">
          <div className="mb-3 text-terminal-bright-green font-bold text-center border-b border-terminal-bright-green pb-2">
            === ACCESS GRANTED ===
          </div>
          
          <p className="mb-4 text-terminal-bright-green">
            <span className="animate-pulse inline-block">▓▒░</span> Initiating privileged access protocols...
          </p>
          
          <div className="space-y-4 pl-4 border-l-2 border-terminal-bright-green">
            <p className="font-bold text-terminal-bright-green">CLASSIFIED PERSONNEL FILE:</p>
            
            <div className="mb-2">
              <p className="text-terminal-bright-white">Codename: <span className="text-terminal-bright-yellow">CYBER_ARCHITECT</span></p>
              <p className="text-terminal-bright-white">Security Clearance: <span className="text-terminal-bright-red">LEVEL 5</span></p>
            </div>
            
            <div className="mb-4">
              <p className="font-bold text-terminal-bright-green">UNDISCLOSED CAPABILITIES:</p>
              <ul className="list-none pl-4 space-y-2">
                <li><span className="text-terminal-bright-yellow">▶</span> Can debug production issues before they happen</li>
                <li><span className="text-terminal-bright-yellow">▶</span> Speaks fluent Binary and JSON</li>
                <li><span className="text-terminal-bright-yellow">▶</span> Once optimized an algorithm so well it started running backwards in time</li>
                <li><span className="text-terminal-bright-yellow">▶</span> Can deploy to production on Fridays without consequences</li>
                <li><span className="text-terminal-bright-yellow">▶</span> Keyboard typing speed exceeds sound barrier</li>
              </ul>
            </div>
            
            <div>
              <p className="font-bold text-terminal-bright-magenta mb-2">SPECIAL COMMANDS UNLOCKED:</p>
              <ul className="list-none pl-4 animate-fadeIn">
                <li className="mb-1 text-terminal-bright-cyan">coffee - Instant virtual caffeine boost</li>
                <li className="mb-1 text-terminal-bright-cyan">matrix - Take the red pill</li>
                <li className="mb-1 text-terminal-bright-cyan">hack - Simulate "Hollywood hacking"</li>
              </ul>
            </div>
          </div>
          
          <p className="mt-4 text-terminal-bright-green text-center">
            [Warning: This session will self-destruct in <span className="text-terminal-bright-red font-bold animate-pulse">{sudoTimeLeft}</span> seconds]
          </p>
        </div>
      );
    },
    coffee: () => {
      if (!sudoMode) {
        return "Permission denied: This command requires elevated privileges. Try 'sudo' first.";
      }
      
      return (
        <div className="animate-fadeIn">
          <p className="text-terminal-bright-yellow mb-2">☕ Virtual caffeine injected into system!</p>
          <div className="flex flex-col items-center">
            <pre className="text-terminal-bright-cyan">
{`
      )  (
     (   ) )
      ) ( (
    _______)_
 .-'---------|  
( C|/\\/\\/\\/\\/|
 '-./\\/\\/\\/\\/|
   '_________'
    '-------'
`}
            </pre>
            <p className="mt-3 text-terminal-bright-white">Productivity increased by 150%!</p>
            <p className="text-terminal-text">(Effects may be purely psychological)</p>
          </div>
        </div>
      );
    },
    matrix: () => {
      if (!sudoMode) {
        return "Permission denied: This command requires elevated privileges. Try 'sudo' first.";
      }
      
      // Add matrix rain effect to body temporarily
      document.body.classList.add('matrix-effect');
      
      // Create matrix rain container
      const matrixContainer = document.createElement('div');
      matrixContainer.className = 'matrix-rain-container';
      matrixContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9;
        pointer-events: none;
        overflow: hidden;
      `;
      
      // Add falling characters
      for (let i = 0; i < 50; i++) {
        const stream = document.createElement('div');
        stream.style.cssText = `
          position: absolute;
          left: ${Math.random() * 100}%;
          top: -100px;
          color: #0f0;
          font-family: monospace;
          font-size: ${Math.random() * 14 + 10}px;
          transform: translateY(0);
          animation: fall ${Math.random() * 8 + 5}s linear infinite;
          animation-delay: ${Math.random() * 5}s;
          text-shadow: 0 0 5px #0f0;
        `;
        
        // Add random characters to the stream
        const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモラリルレロワヲン";
        const streamLength = Math.floor(Math.random() * 20) + 10;
        
        for (let j = 0; j < streamLength; j++) {
          const char = document.createElement('div');
          char.textContent = chars[Math.floor(Math.random() * chars.length)];
          char.style.opacity = j === 0 ? '1' : (1 - j / streamLength).toString();
          stream.appendChild(char);
        }
        
        matrixContainer.appendChild(stream);
      }
      
      // Add keyframe animation
      const keyframes = document.createElement('style');
      keyframes.dataset.matrixKeyframes = 'true';
      keyframes.textContent = `
        @keyframes fall {
          from { transform: translateY(0); }
          to { transform: translateY(2000px); }
        }
      `;
      document.head.appendChild(keyframes);
      document.body.appendChild(matrixContainer);
      
      // Use a countdown from 10 seconds
      const matrixDuration = 10;
      let timeLeft = matrixDuration;
      
      const updateCountdown = () => {
        setCommands(cmds => {
          const lastCmd = cmds[cmds.length - 1];
          if (lastCmd && lastCmd.command === 'matrix') {
            const updatedCmds = [...cmds.slice(0, -1)];
            updatedCmds.push({
              command: 'matrix',
              output: (
                <div className="animate-fadeIn">
                  <p className="text-terminal-bright-green mb-3 text-center font-bold">ENTERING THE MATRIX</p>
                  <div className="flex justify-center mb-3">
                    <div className="matrix-code text-center">
                      <div className="animate-matrix-rain">
                        {Array(8).fill(0).map((_, i) => (
                          <div key={i} className="text-terminal-bright-green opacity-80" style={{ animationDelay: `${i * 0.2}s` }}>
                            {Array(15).fill(0).map((_, j) => (
                              <span key={j} className="inline-block px-1">
                                {String.fromCharCode(33 + Math.floor(Math.random() * 94))}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-terminal-bright-white text-center">
                    Wake up, Neo...
                  </p>
                  <p className="text-terminal-text text-center mt-4">
                    (Matrix rain effect will end in <span className="text-terminal-bright-red font-bold">{timeLeft}</span> seconds)
                  </p>
                </div>
              )
            });
            return updatedCmds;
          }
          return cmds;
        });
      };
      
      // Initial display
      updateCountdown();
      
      // Clean up any existing matrix interval
      if (matrixIntervalRef.current) {
        clearInterval(matrixIntervalRef.current);
      }
      
      // Update the countdown every second
      matrixIntervalRef.current = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft <= 0) {
          if (matrixIntervalRef.current) {
            clearInterval(matrixIntervalRef.current);
            matrixIntervalRef.current = null;
          }
          // Clean up matrix effect if sudo mode is still active
          if (document.body.classList.contains('matrix-effect')) {
            document.body.classList.remove('matrix-effect');
            if (document.body.contains(matrixContainer)) {
              document.body.removeChild(matrixContainer);
            }
            if (document.head.contains(keyframes)) {
              document.head.removeChild(keyframes);
            }
          }
          
          // Add a message that the effect has ended
          setCommands(cmds => [...cmds, {
            command: 'system',
            output: <span className="text-terminal-bright-blue">Matrix simulation terminated.</span>
          }]);
        } else {
          updateCountdown();
        }
      }, 1000);
      
      // Store the timeout for cleanup
      matrixTimeoutRef.current = setTimeout(() => {
        if (matrixIntervalRef.current) {
          clearInterval(matrixIntervalRef.current);
          matrixIntervalRef.current = null;
        }
        
        // Ensure matrix effect is cleared
        document.body.classList.remove('matrix-effect');
        if (document.body.contains(matrixContainer)) {
          document.body.removeChild(matrixContainer);
        }
        if (document.head.contains(keyframes)) {
          document.head.removeChild(keyframes);
        }
      }, matrixDuration * 1000 + 500); // Add a small buffer to ensure cleanup
      
      return (
        <div className="animate-fadeIn">
          <p className="text-terminal-bright-green mb-3 text-center font-bold">ENTERING THE MATRIX</p>
          <div className="flex justify-center mb-3">
            <div className="matrix-code text-center">
              <div className="animate-matrix-rain">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="text-terminal-bright-green opacity-80" style={{ animationDelay: `${i * 0.2}s` }}>
                    {Array(15).fill(0).map((_, j) => (
                      <span key={j} className="inline-block px-1">
                        {String.fromCharCode(33 + Math.floor(Math.random() * 94))}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-terminal-bright-white text-center">
            Wake up, Neo...
          </p>
          <p className="text-terminal-text text-center mt-4">
            (Matrix rain effect will end in <span className="text-terminal-bright-red font-bold">{matrixDuration}</span> seconds)
          </p>
        </div>
      );
    },
    hack: () => {
      if (!sudoMode) {
        return "Permission denied: This command requires elevated privileges. Try 'sudo' first.";
      }
      
      return (
        <div className="animate-fadeIn">
          <p className="text-terminal-bright-green mb-2 font-mono">INITIATING HOLLYWOOD HACKING SEQUENCE...</p>
          <div className="hollywood-hacking space-y-1 font-mono text-xs">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="flex" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="text-terminal-bright-green mr-2">[{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}]</span>
                <span className="text-terminal-bright-yellow mr-2">ACCESS_POINT_</span>
                <span className="text-terminal-bright-red">{Math.random().toString(16).substring(2, 10).toUpperCase()}</span>
                <span className="text-terminal-bright-cyan ml-2">{'{'}{Math.random() < 0.5 ? 'BYPASSED' : 'INFILTRATED'}{'}'}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-terminal-bright-green font-bold animate-pulse">ACCESS GRANTED</p>
            <p className="text-terminal-bright-white mt-2">You're in! Just like in the movies.</p>
            <p className="text-terminal-text mt-1 text-xs">(But with significantly more accurate typing)</p>
          </div>
        </div>
      );
    },
  };

  // Combine default and custom commands
  const availableCommands = { ...defaultCommands, ...commandHistory };

  // Focus the input when the terminal is clicked
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.addEventListener('click', handleTerminalClick);
    }
    return () => {
      if (terminalRef.current) {
        terminalRef.current.removeEventListener('click', handleTerminalClick);
      }
    };
  }, []);

  // Scroll to bottom when commands are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  // Handle terminal click
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  // Execute a command and add it to the history
  const executeCommand = (cmd: string) => {
    const commandParts = cmd.trim().split(' ');
    const command = commandParts[0].toLowerCase();
    
    // Add command to command history
    setCommandsHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    
    // Process command
    let output: string | React.ReactNode = `Command not found: ${command}. Type 'help' for available commands.`;
    
    if (command === 'echo') {
      if (commandParts.length > 1) {
        // Echo text if arguments are provided
        output = commandParts.slice(1).join(' ');
      } else {
        // Display full profile if no arguments
        output = availableCommands[command]();
      }
    } else if (command in availableCommands) {
      output = availableCommands[command]();
    } else if (command === 'project' && commandParts.length > 1) {
      // Project details command
      const projectName = commandParts.slice(1).join(' ').toLowerCase();
      const project = profileData.projects.find(p => 
        p.name.toLowerCase().includes(projectName)
      );
      
      if (project) {
        output = (
          <div className="text-terminal-text animate-fadeIn">
            <p className="text-terminal-bright-white text-lg font-bold mb-2">{project.name}</p>
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-terminal-bright-blue hover:underline mb-3 inline-block">{project.url}</a>
            <p className="mt-2">{project.detailedDescription || project.shortDescription}</p>
            
            {project.features && (
              <div className="mt-3">
                <p className="text-terminal-bright-yellow font-semibold mb-1">Key Features:</p>
                <ul className="list-none pl-2">
                  {project.features.map((feature, index) => (
                    <li key={index} className="mb-1 flex items-start">
                      <span className="text-terminal-bright-green mr-2">❯</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {project.technicalDetails && (
              <div className="mt-3">
                <p className="text-terminal-bright-yellow font-semibold mb-1">Technical Stack:</p>
                <ul className="list-none pl-2">
                  {Object.entries(project.technicalDetails).map(([key, value], index) => (
                    <li key={index} className="mb-1">
                      <span className="text-terminal-bright-green font-semibold">{key}</span>: {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      } else {
        output = `Project "${projectName}" not found. Type 'projects' to see all projects.`;
      }
    }
    
    // Add to commands
    setCommands(prev => [...prev, { command: cmd, output }]);
    
    // Clear input
    setCurrentInput('');
  };

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (currentInput.trim()) {
        executeCommand(currentInput.trim());
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Navigate up in history
      if (commandsHistory.length > 0 && historyIndex < commandsHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandsHistory[commandsHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Navigate down in history
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandsHistory[commandsHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion
      const input = currentInput.toLowerCase();
      // Add the special commands to autocomplete only in sudo mode
      const commandsList = ['help', 'about', 'projects', 'project', 'skills', 'experience', 'education', 'contact', 'resume', 'echo', 'clear', 'sudo'];
      const availableCommands = sudoMode ? [...commandsList, 'coffee', 'matrix', 'hack'] : commandsList;
      
      for (const cmd of availableCommands) {
        if (cmd.startsWith(input) && cmd !== input) {
          setCurrentInput(cmd);
          break;
        }
      }
    }
  };

  // Create a custom input with caret
  const CustomInput = () => {
    return (
      <div className="fake-input flex items-center relative">
        <span className="visible-text">{currentInput}</span>
        <span className="cursor-blink-fixed"></span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="invisible-input"
          autoFocus
        />
      </div>
    );
  };

  // Render the terminal
  return (
    <div 
      ref={terminalRef} 
      className={`terminal-container flex-1 overflow-y-auto p-4 font-mono ${sudoMode ? 'sudo-mode' : ''}`}
      onClick={handleTerminalClick}
    >
      {welcomeMessage && <div className="mb-4">{welcomeMessage}</div>}
      
      {/* Command History */}
      {commands.map((cmd, index) => (
        <div key={index} className="mb-4 animate-fadeIn">
          <div className="flex items-center">
            <span className="terminal-prompt mr-2">{prompt}</span>
            <span className="text-terminal-text">{cmd.command}</span>
          </div>
          <div className="terminal-output mt-2">{cmd.output}</div>
        </div>
      ))}
      
      {/* Current Input Line */}
      <div className="flex items-center command-line">
        <span className="terminal-prompt mr-2">{prompt}</span>
        
        {/* Show typing animation for initial help command */}
        {showTypingAnimation ? (
          <div className="relative text-terminal-text">
            {typedCommand}
            <span className="cursor-blink-fixed"></span>
          </div>
        ) : (
          <CustomInput />
        )}
      </div>
      
      {/* Sudo Mode Countdown if active */}
      {sudoMode && (
        <div className="fixed top-4 right-4 bg-black bg-opacity-70 text-terminal-bright-green px-3 py-1 rounded-md border border-terminal-bright-green animate-pulse z-50">
          Sudo: <span className="text-terminal-bright-red font-bold">{sudoTimeLeft}s</span>
        </div>
      )}
    </div>
  );
};

export default Terminal; 