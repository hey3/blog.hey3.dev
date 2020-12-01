import fs from 'fs'
import glob from 'glob'
import matter from 'gray-matter'
import path from 'path'

import { routes } from '../routes'
import md2html, {
  postDirNamePattern,
  escapeSymbolPattern,
  postsDirectory,
  FrontMatter,
} from './md2html'
import { getPostToc, TocRef } from './toc'

export type PostOverView = Omit<FrontMatter, 'tag'> & {
  slug: string
  visualPath: string
  excerpt: string
  tags: string[]
}

export type PostData = PostOverView & {
  toc: TocRef[]
  contentHtml: string
}

const getMarkdownExcerpt = (content: string, maxExcerptLength = 120): string => {
  const excerpt = content
    .replace(escapeSymbolPattern, '')
    .replace(/\n/g, '')
    .slice(0, maxExcerptLength)

  if (content.length > maxExcerptLength) {
    return excerpt + '...'
  }

  return excerpt
}

const getAllPostDirNames = (): string[] => {
  const entries = glob.sync(`${postsDirectory}/**/index.md`)
  return entries
    .map(entry => {
      const matched = entry.match(postDirNamePattern)
      return matched ? matched[1] : ''
    })
    .filter(Boolean)
}

const getAllPostPaths = (): { params: { slug: string } }[] => {
  const dirNames = getAllPostDirNames()
  return dirNames.map(dirName => ({
    params: {
      slug: dirName,
    },
  }))
}

const getSortedPostsOverView = (): PostOverView[] => {
  const dirNames = getAllPostDirNames()
  const allPostsData = dirNames.map(dirName => {
    const fullPathOfEntry = path.join(postsDirectory, dirName, 'index.md')
    const postMarkdown = fs.readFileSync(fullPathOfEntry, 'utf8')
    const matterResult = matter(postMarkdown)

    const slug = dirName
    const { tag, ...frontMatter }: FrontMatter = matterResult.data as FrontMatter
    const tags = tag.split(',').map(tag => tag.trim())
    const visualPath = routes.postVisualImage(slug)
    const excerpt = getMarkdownExcerpt(matterResult.content)

    return {
      slug,
      tags,
      excerpt,
      visualPath,
      ...frontMatter,
    }
  })

  return allPostsData.sort((a, b) => {
    if (a.create < b.create) {
      return 1
    } else {
      return -1
    }
  })
}

const getPostData = async (slug: string): Promise<PostData> => {
  const fullPathOfEntry = path.join(postsDirectory, slug, 'index.md')
  const postMarkdown = fs.readFileSync(fullPathOfEntry, 'utf8')
  const matterResult = matter(postMarkdown)

  const { tag, ...frontMatter }: FrontMatter = matterResult.data as FrontMatter
  const tags = tag.split(',').map(tag => tag.trim())
  const contentHtml = await md2html(matterResult.content)
  const toc = getPostToc(matterResult.content)
  const visualPath = routes.postVisualImage(slug)
  const excerpt = getMarkdownExcerpt(matterResult.content)

  return {
    slug,
    toc,
    tags,
    excerpt,
    visualPath,
    contentHtml,
    ...frontMatter,
  }
}

export { getAllPostDirNames, getAllPostPaths, getSortedPostsOverView, getPostData }
