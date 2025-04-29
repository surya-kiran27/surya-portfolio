// Re-export the ASCII art content
export { profileAscii, nameAscii } from './ascii-content';

// Legacy functions maintained for compatibility
export const getProfileAscii = async (): Promise<string> => {
  return (await import('./ascii-content')).profileAscii;
};

export const getNameAscii = async (): Promise<string> => {
  return (await import('./ascii-content')).nameAscii;
};

export default getProfileAscii; 