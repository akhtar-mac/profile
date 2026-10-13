export default { content: ['./index.html','./src/**/*.tsx'], theme: { extend: {
  fontFamily: { sans: ['Satoshi','ui-sans-serif','system-ui','sans-serif'], display: ['"Cabinet Grotesk"','Satoshi','system-ui','sans-serif'], mono: ['"JetBrains Mono"','ui-monospace','SFMono-Regular','monospace'] },
  colors: {
    ink: '#05060c', void: '#05060c', deep: '#0a0c18', surface: '#10132a',
    bone: '#efe9df', muted: '#a9a6b8', subtle: '#8a879c',
    accent: '#ffb169', accent2: '#9d8cff', ember: '#9a4a14',
  },
  fontSize: {
    hero: ['clamp(4.25rem, 15.5vw, 15rem)', { lineHeight: '.84', letterSpacing: '-.035em' }],
    d1: ['clamp(2.6rem, 6.6vw, 6.25rem)', { lineHeight: '.92', letterSpacing: '-.03em' }],
    d2: ['clamp(1.6rem, 2.6vw, 2.4rem)', { lineHeight: '1.05', letterSpacing: '-.02em' }],
    about: ['clamp(1.45rem, 2.9vw, 2.7rem)', { lineHeight: '1.18', letterSpacing: '-.015em' }],
    lead: ['clamp(1.05rem, 1.25vw, 1.25rem)', { lineHeight: '1.6' }],
    eyebrow: ['.6875rem', { lineHeight: '1', letterSpacing: '.18em' }],
  } } }, plugins: [] }
