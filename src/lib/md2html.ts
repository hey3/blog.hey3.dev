import unified from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import path from 'path'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const slug = require('remark-slug')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const shiki = require('rehype-shiki')

export type FrontMatter = {
  title: string
  tag: string
  isProtect: boolean
  create: string
  update?: string
}

const md2html = async (markdown: string): Promise<string> => {
  const result = await unified()
    .use(remarkParse)
    .use(slug)
    .use(remarkRehype)
    .use(shiki, { theme: 'monokai' })
    .use(rehypeStringify)
    .process(markdown)

  return result.toString()
}

const escapeSymbolPattern = /\*|#|_|-|^1\. /g

const postsDirectory = path.join(process.cwd(), 'src/contents')
const postDirNamePattern = new RegExp(`${postsDirectory}/(.*?)/index.md`)

export default md2html
export { escapeSymbolPattern, postsDirectory, postDirNamePattern }
