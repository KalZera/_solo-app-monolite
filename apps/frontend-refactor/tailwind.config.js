/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Background gradient stops (see <GradientBackground />).
        backdrop: {
          top: '#132C3A',
          mid: '#0F2230',
          bottom: '#0B1720',
        },
        surface: {
          DEFAULT: '#11151B',
          raised: '#161C24',
          overlay: 'rgba(11, 23, 32, 0.72)',
        },
        primary: {
          DEFAULT: '#29B6F6',
          hover: '#53D3FF',
        },
        success: '#41E37A',
        warning: '#F6C453',
        danger: '#FF5C5C',
        epic: '#A970FF',
        legendary: '#FFD54A',
        content: {
          DEFAULT: '#F8FAFC',
          muted: '#A5B4C4',
        },
        line: {
          DEFAULT: 'rgba(41, 182, 246, 0.22)',
          soft: 'rgba(165, 180, 196, 0.14)',
        },
      },
      fontFamily: {
        // Rajdhani is the default typeface across the app.
        sans: ['Rajdhani_500Medium'],
        rajdhani: ['Rajdhani_500Medium'],
        'rajdhani-light': ['Rajdhani_300Light'],
        'rajdhani-regular': ['Rajdhani_400Regular'],
        'rajdhani-medium': ['Rajdhani_500Medium'],
        'rajdhani-semibold': ['Rajdhani_600SemiBold'],
        'rajdhani-bold': ['Rajdhani_700Bold'],
      },
      letterSpacing: {
        system: '4px',
      },
    },
  },
  plugins: [],
}
