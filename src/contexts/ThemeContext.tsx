import { useState, useEffect, type ReactNode } from 'react';
import { ThemeContext } from '../hooks/useTheme';
import type { Theme } from '../types';

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setTheme] = useState<Theme>(() => {
        // Check localStorage for saved preference
        const saved = localStorage.getItem('theme') as Theme;
        let initialTheme: Theme = 'light';

        if (saved) {
            initialTheme = saved;
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            initialTheme = 'dark';
        }

        document.documentElement.setAttribute('data-theme', initialTheme);
        return initialTheme;
    });

    useEffect(() => {
        // Apply theme to document when it changes
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

