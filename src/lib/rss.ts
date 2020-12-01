import fs from 'fs'
import path from 'path'
import RSS from 'rss'

import { siteMeta } from '../../blog.config'
import { getSortedPostsOverView, getPostData } from './posts'

const { title, author, description, siteUrl } = siteMeta

const feed = new RSS({
  title,
  description,
  feed_url: `${siteUrl}/rss.xml`,
  site_url: siteUrl,
  webMaster: `hey3@blog.hey3.dev (${author})`,
  language: 'ja',
})

const allPosts = getSortedPostsOverView()

Promise.all(
  allPosts.map(async post => {
    const { title, create, tags, contentHtml } = await getPostData(post.slug)
    feed.item({
      title,
      description: contentHtml,
      url: `${siteUrl}/posts/${post.slug}`,
      author,
      date: create,
      categories: tags,
    })
  })
)
  .then(() => {
    const xml = feed.xml()

    fs.writeFileSync(path.join('./public', 'rss.xml'), xml)
  })
  .catch(err => console.log(err))
