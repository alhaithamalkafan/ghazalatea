import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './app/Livewire/**/*.php',
        './app/Http/Controllers/**/*.php',
    ],
    theme: {
        extend: {
            colors: {
                dark: '#2b2b2b',   // Primary Dark
                brown: '#6d5b4b',  // Secondary Brown
                beige: '#f4ece3',  // Background Beige
            },
            fontFamily: {
                tajawal: ['Tajawal', ...defaultTheme.fontFamily.sans],
            },
        },
    },
    plugins: [forms, typography],
};
