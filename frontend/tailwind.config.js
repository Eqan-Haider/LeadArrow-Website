/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      animation: {
        'circle-reveal': 'circleReveal 3s ease-in-out infinite',
      },
      keyframes: {
        circleReveal: {
          '0%, 100%': { clipPath: 'circle(0% at 50% 50%)' },
          '50%': { clipPath: 'circle(45% at 50% 50%)' },
        },
      },
    },
  },
  plugins: [],
};
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      animation: {
        'circle-reveal': 'circleReveal 3s ease-in-out infinite',
        'ring-shake': 'ringShake 0.5s ease-in-out infinite',     // new
        'particle-float': 'particleFloat 1.5s ease-out infinite', // new
      },
      keyframes: {
        circleReveal: {
          '0%, 100%': { clipPath: 'circle(0% at 50% 50%)' },
          '50%': { clipPath: 'circle(45% at 50% 50%)' },
        },
        ringShake: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '10%': { transform: 'translateX(-2px) translateY(1px)' },
          '20%': { transform: 'translateX(2px) translateY(-1px)' },
          '30%': { transform: 'translateX(-1px) translateY(-2px)' },
          '40%': { transform: 'translateX(1px) translateY(2px)' },
          '50%': { transform: 'translateX(-2px) translateY(-1px)' },
          '60%': { transform: 'translateX(2px) translateY(1px)' },
          '70%': { transform: 'translateX(-1px) translateY(2px)' },
          '80%': { transform: 'translateX(1px) translateY(-2px)' },
          '90%': { transform: 'translateX(-2px) translateY(-1px)' },
        },
        particleFloat: {
          '0%': { opacity: 1, transform: 'translateY(0) scale(1)' },
          '100%': { opacity: 0, transform: 'translateY(-80px) scale(0)' },
        },
      },
    },
  },
  plugins: [],
};