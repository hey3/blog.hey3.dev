import path from 'path'
import fs from 'fs'

import { siteMeta } from '../../blog.config'
import { getSortedPostsOverView } from './posts'

const posts = getSortedPostsOverView()

const atom = `<?xml version='1.0'?>
<feed xmlns='http://www.w3.org/2005/Atom' xml:lang='ja'>
  <id>${siteMeta.siteUrl}/</id>
  <title>${siteMeta.title}</title>
  <updated>${new Date().toISOString()}</updated>
  <link rel='alternate' type='text/html' href='${siteMeta.siteUrl}' />
  <link rel='self' type='application/atom+xml' href='${siteMeta.siteUrl + '/atom.xml'}' />
  <author><name>${siteMeta.author}</name></author>
  ${posts
    .map(post => {
      return `<entry>
      <id>${siteMeta.siteUrl + '/posts/' + post.slug}</id>
      <title>${post.title}</title>
      <link rel='alternate' type='text/html' href='${siteMeta.siteUrl + '/posts/' + post.slug}' />
      <updated>${new Date(post.update || post.create).toISOString()}</updated>
      <summary>${post.excerpt}</summary>
    </entry>`
    })
    .join('')}
</feed>`

fs.writeFileSync(path.join('./public', 'atom.xml'), atom)
