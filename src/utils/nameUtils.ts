
/**
 * Utility functions for generating anonymous usernames and handling avatar generation
 */

/**
 * Generates a random anonymous username
 */
export const generateRandomUsername = (): string => {
  const adjectives = ['Cool', 'Amazing', 'Awesome', 'Super', 'Mega', 'Epic', 'Rad', 'Sneaky', 'Mystic', 
                     'Shadow', 'Cyber', 'Wild', 'Frozen', 'Neon', 'Silent', 'Thunder', 'Cosmic', 'Phantom'];
  const nouns = ['Star', 'Ninja', 'Warrior', 'Hero', 'Coder', 'Genius', 'Master', 'Wolf', 'Panther', 
                'Ghost', 'Dragon', 'Phoenix', 'Tiger', 'Hawk', 'Raven', 'Fox', 'Knight', 'Wizard'];
  const num = Math.floor(Math.random() * 1000);
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adj}${noun}${num}`;
};

/**
 * Gets the avatar URL based on username and gender
 */
export const getAvatarUrl = (username: string, gender?: 'male' | 'female' | 'other'): string => {
  // Add gender as part of the seed for the avatar if available
  const seedWithGender = gender ? `${username}-${gender}` : username;
  
  // Using different styles based on gender
  let style = 'avataaars';
  if (gender === 'female') {
    style = 'lorelei';
  } else if (gender === 'male') {
    style = 'micah';
  }
  
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seedWithGender}`;
};

/**
 * This is a helper function to safely ensure a string gender value is cast to one of the allowed types
 */
export const getSafeGender = (gender: string | null | undefined): 'male' | 'female' | 'other' => {
  if (gender === 'male' || gender === 'female') {
    return gender;
  }
  return 'other';
};

