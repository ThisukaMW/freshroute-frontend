// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     extend: {
//       fontFamily: {
//         sans: ["Outfit", "system-ui", "sans-serif"],
//       },
//       colors: {
//         // Core organic green (kept from existing design)
//         primary: {
//           DEFAULT: "#16a34a", // green-600
//           light: "#4ade80",
//           dark: "#15803d",
//         },

//         // Dark dashboard-inspired palette (from reference UI)
//         brand: {
//           // Deep navy background
//           background: "#020617", // slate-950 style
//           // Slightly lighter surface behind main truck area
//           surface: "#a8bff7",
//           // Card surface
//           card: "#020c24",
//           // Soft border / separators
//           muted: "#1f2937",
//         },
//         accent: {
//           yellow: "#facc15", // similar to amber/yellow in the template
//           yellowSoft: "#fad850",
//           yellowDark: "#FFFACD",
//           blue: "#38bdf8",
//           greenSoft: "#bbf7d0",
//         },

//         // Legacy light theme colors (kept for potential reuse)
//         cream: {
//           light: "#FFF9EC",
//           DEFAULT: "#FDEFD4",
//           dark: "#F2D3A3",
//         },
//         offwhite: "#FAF7F2",
//         mint: {
//           light: "#D9FBEA",
//           DEFAULT: "#B6F3D2",
//         },
//         // Supply Link-inspired palette
//         supply: {
//           charcoal: "#191919",
//           ash: "#E4E4E4",
//           paper: "#ffffff",
//           orange: "#EB4304",
//           clay: "#DC8360",
//           peach: "#CEB8AD",
//           teal: "#236571",
//           deep: "#2E2F34",
//         },
//       },
//     },
//   },
//   plugins: [],
// };

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Core organic green (kept from existing design)
        primary: {
          DEFAULT: "#16a34a", // green-600
          light: "#4ade80",
          dark: "#15803d",
        },

        // Dark dashboard-inspired palette (from reference UI)
        brand: {
          // Deep navy background
          background: '#020617', // Main app background color
          // Footer color
          //footer: "#11151d",
          // Slightly lighter surface behind main truck area
          surface: '#a8bff7',
          // Card surface
          card: "#020c24",
          // Soft border / separators
          muted: "#1f2937",
        },
        accent: {
          yellow: "#facc15", // similar to amber/yellow in the template
          yellowSoft: "#fad850",
          yellowDark: "#FFFACD",
          blue: "#38bdf8",
          greenSoft: "#bbf7d0",
        },

        // Legacy light theme colors (kept for potential reuse)
        cream: {
          light: "#FFF9EC",
          DEFAULT: "#FDEFD4",
          dark: "#F2D3A3",
        },
        offwhite: "#FAF7F2",
        mint: {
          light: "#D9FBEA",
          DEFAULT: "#B6F3D2",
        },
        // Supply Link-inspired palette
        supply: {
          charcoal: "#191919",
          ash: "#E4E4E4",
          paper: "#ffffff",
          orange: "#EB4304",
          clay: "#DC8360",
          peach: "#CEB8AD",
          teal: "#236571",
          deep: "#2E2F34",
        },
        // Gradient colors
        /*gradient: {
          stop1: "#061D24", // 0%
          stop2: "#08262E", // 14%
          stop3: "#0C363F", // 39%
        },*/
      },
      /*backgroundImage: {
        'gradient-teal': 'linear-gradient(to bottom, #061D24 0%, #08262E 14%, #0C363F 39%)',
        'gradient-teal-full': 'linear-gradient(to bottom, #061D24, #08262E 14%, #0C363F 39%, #08262E 60%, #061D24 100%)',
      },*/
    },
  },
  plugins: [],
};