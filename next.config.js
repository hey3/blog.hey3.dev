const withPWA = require('next-pwa')

module.exports = withPWA({
  reactStrictMode: true,
  pwa: {
    disable: process.env.NEXT_PUBLIC_ENV === 'development',
    dest: 'public',
    publicExcludes: ['!robots.txt', '!sitemap.xml', '!rss.xml', '!atom.xml'],
  },
  //TODO: 登録されたら削除
  async redirects() {
    return [
      {
        source: '/posts/aws-cdk-lambda-version',
        destination: '/posts/aws-cdk-lambda-version-persist-with-alias',
        permanent: true,
      },
    ]
  },
})
