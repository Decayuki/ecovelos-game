import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'eco-green': '#10B981',
        'eco-blue': '#3B82F6',
        'eco-yellow': '#F59E0B',
      },
    },
  },
  plugins: [],
}
export default config
