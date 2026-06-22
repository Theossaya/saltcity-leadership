import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:             'var(--bg)',
        'bg-2':         'var(--bg-2)',
        surface:        'var(--surface)',
        'surface-warm': 'var(--surface-warm)',
        'surface-calm': 'var(--surface-calm)',
        ink:            'var(--ink)',
        'ink-2':        'var(--ink-2)',
        'ink-3':        'var(--ink-3)',
        'ink-4':        'var(--ink-4)',
        primary:        'var(--primary)',
        'primary-ink':  'var(--primary-ink)',
        'primary-soft': 'var(--primary-soft)',
        accent:         'var(--accent)',
        'accent-soft':  'var(--accent-soft)',
        calm:           'var(--calm)',
        'calm-soft':    'var(--calm-soft)',
        gold:           'var(--gold)',
        urgent:         'var(--urgent)',
        'urgent-bg':    'var(--urgent-bg)',
        care:           'var(--care)',
        'care-bg':      'var(--care-bg)',
        ok:             'var(--ok)',
        'ok-bg':        'var(--ok-bg)',
      },
      borderRadius: {
        input: 'var(--r-input)',
        card:  'var(--r-card)',
        pill:  'var(--r-pill)',
      },
      boxShadow: {
        lift: 'var(--shadow-lift)',
        hero: 'var(--shadow-hero)',
      },
      fontFamily: {
        sans:  ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
