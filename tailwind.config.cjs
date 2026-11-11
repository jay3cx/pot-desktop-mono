// tailwind.config.js
const { nextui } = require('@nextui-org/react');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        // ...
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
        './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // 纯中性灰阶，不带任何色相
                neutral: {
                    canvas: '#FAFAFA',
                    sidebar: '#F5F5F5',
                    surface: '#FFFFFF',
                    subtle: '#F0F0F0',
                    muted: '#E8E8E8',
                    border: '#E0E0E0',
                    text: '#171717',
                    'text-secondary': '#737373',
                },
            },
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                app: '8px',
                'app-lg': '12px',
            },
        },
    },
    darkMode: 'class',
    plugins: [
        nextui({
            themes: {
                light: {
                    colors: {
                        // 纯黑白：白底、近黑字、灰阶分层
                        background: '#FAFAFA',
                        foreground: '#171717',
                        content1: '#FFFFFF',
                        content2: '#F5F5F5',
                        content3: '#F0F0F0',
                        content4: '#E8E8E8',
                        divider: '#E8E8E8',
                        focus: '#171717',
                        overlay: '#000000',
                        default: {
                            DEFAULT: '#A3A3A3',
                            50: '#FAFAFA',
                            100: '#F5F5F5',
                            200: '#E8E8E8',
                            300: '#D4D4D4',
                            400: '#A3A3A3',
                            500: '#737373',
                            600: '#525252',
                            700: '#404040',
                            800: '#262626',
                            900: '#171717',
                        },
                        primary: {
                            DEFAULT: '#171717',
                            foreground: '#FFFFFF',
                        },
                        secondary: {
                            DEFAULT: '#737373',
                            foreground: '#FFFFFF',
                        },
                        success: {
                            DEFAULT: '#404040',
                            foreground: '#FFFFFF',
                        },
                        warning: {
                            DEFAULT: '#525252',
                            foreground: '#FFFFFF',
                        },
                        danger: {
                            DEFAULT: '#262626',
                            foreground: '#FFFFFF',
                        },
                    },
                },
                dark: {
                    colors: {
                        // 深色：近黑底、白字
                        background: '#161616',
                        foreground: '#F5F5F5',
                        content1: '#1C1C1C',
                        content2: '#212121',
                        content3: '#292929',
                        content4: '#333333',
                        divider: '#292929',
                        focus: '#FAFAFA',
                        overlay: '#000000',
                        default: {
                            DEFAULT: '#737373',
                            50: '#1C1C1C',
                            100: '#292929',
                            200: '#333333',
                            300: '#404040',
                            400: '#525252',
                            500: '#737373',
                            600: '#A3A3A3',
                            700: '#C4C4C4',
                            800: '#E0E0E0',
                            900: '#F5F5F5',
                        },
                        primary: {
                            DEFAULT: '#FAFAFA',
                            foreground: '#171717',
                        },
                        secondary: {
                            DEFAULT: '#A3A3A3',
                            foreground: '#171717',
                        },
                        success: {
                            DEFAULT: '#C4C4C4',
                            foreground: '#171717',
                        },
                        warning: {
                            DEFAULT: '#A3A3A3',
                            foreground: '#171717',
                        },
                        danger: {
                            DEFAULT: '#E0E0E0',
                            foreground: '#171717',
                        },
                    },
                },
            },
        }),
    ],
};
