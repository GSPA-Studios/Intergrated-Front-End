/**
 * Theme Context
 * 
 * This file provides theme management functionality for the application:
 * - Creates a context for storing and accessing theme state
 * - Implements a ThemeProvider component that manages theme state
 * - Provides a custom hook (useTheme) for components to access theme functions
 * 
 * Features:
 * - Light/Dark theme toggle functionality
 * - Persistence of theme preference in localStorage
 * - Application of theme via data-theme attribute on the body element
 * 
 * For beginners: A Context in React allows data to be passed through the component 
 * tree without having to pass props down manually at every level.
 */
import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Define the possible theme values
type Theme = 'light' | 'dark';

// Define the shape of the context values that will be provided
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Create a context with undefined as initial value
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define props for the ThemeProvider component
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider Component
 * 
 * Wraps your application and provides theme state and functionality
 * to all components within it.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme state from localStorage or use light theme as default
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    // Default to 'light' if no theme is saved or an invalid theme is saved
    return (savedTheme === 'dark') ? 'dark' : 'light';
  });

  // Effect to apply theme changes to the document and save to localStorage
  useEffect(() => {
    // Set the data-theme attribute on the body element
    // This allows CSS to apply theme-specific styles
    document.body.setAttribute('data-theme', theme);
    
    // Save theme preference to localStorage for persistence
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Provide the theme state and toggle function to children components
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme Hook
 * 
 * Custom hook to access the theme context from any component
 * Throws an error if used outside of a ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 