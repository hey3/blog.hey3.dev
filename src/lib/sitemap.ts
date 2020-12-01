import path from 'path'
import fs from 'fs'

import { siteMeta } from '../../blog.config'
import { getSortedPostsOverView } from './posts'
import { getTagsData } from './tags'

const posts = getSortedPostsOverView()
const tagsData = getTagsData()
const tags = Object.keys(tagsData)

const sitemap = `<?xml version="1.0"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
<url>
    <loc>${siteMeta.siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
</url>
${posts
  .map(post => {
    return `<url>
    <loc>${siteMeta.siteUrl}/posts/${post.slug}</loc>
    <lastmod>${post.update || post.create}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  `
  })
  .join('')}
${tags
  .map(tag => {
    return `<url>
    <loc>${siteMeta.siteUrl}/tags/${tag}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  `
  })
  .join('')}
</urlset>`

fs.writeFileSync(path.join('./public', 'sitemap.xml'), sitemap)
