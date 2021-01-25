module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      'styled-components',
      { ssr: true, displayName: process.env.NEXT_PUBLIC_ENV === 'development', preprocess: false },
    ],
  ],
}
