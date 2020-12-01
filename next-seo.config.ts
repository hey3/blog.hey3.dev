import { siteMeta } from './blog.config'

const { title, description, author, siteUrl } = siteMeta

export default {
  title,
  description,
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: siteUrl,
    site_name: title,
  },
  twitter: {
    handle: author,
    cardType: 'summary_large_image',
  },
}
