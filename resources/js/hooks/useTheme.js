import { useEffect, useState } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState(() => localStorage.getItem('petverse_theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('petverse_theme', theme);
    }, [theme]);

    return [theme, setTheme];
}