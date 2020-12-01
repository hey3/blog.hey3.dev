const withPWA = require('next-pwa')

module.exports = withPWA({
  reactStrictMode: true,
  pwa: {
    disable: process.env.NEXT_PUBLIC_ENV === 'development',
    dest: 'public',
    publicExcludes: ['!robots.txt', '!sitemap.xml', '!rss.xml', '!atom.xml'],
  },
})
