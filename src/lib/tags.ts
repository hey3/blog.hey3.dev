import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'

import { postsDirectory } from './md2html'
import { getAllPostDirNames, getSortedPostsOverView, PostOverView } from './posts'

export type NavData = {
  [name in string]: number
}

const getAllTagNames = (dirNames: string[]): string[] => {
  return dirNames
    .map(dirName => {
      const fullPathOfEntry = path.join(postsDirectory, dirName, 'index.md')
      const postMarkdown = fs.readFileSync(fullPathOfEntry, 'utf8')
      const matterResult = matter(postMarkdown)
      return matterResult.data.tag.toLowerCase().split(',')
    })
    .flat()
    .map(tag => tag.trim())
}

const getTagsData = (): NavData => {
  const dirNames = getAllPostDirNames()
  const tags = getAllTagNames(dirNames)

  return tags
    .sort((a, b) => {
      if (a > b) {
        return 1
      } else {
        return -1
      }
    })
    .reduce(
      (acc, tag, index, tags) => ({
        ...acc,
        [tag]: tags.filter(x => x === tag).length,
      }),
      {}
    )
}

const getAllTagPaths = (): { params: { tag: string } }[] => {
  const dirNames = getAllPostDirNames()
  const tags = getAllTagNames(dirNames)

  const uniqueTags = [...Array.from(new Set(tags))]
  return uniqueTags.map(tag => ({
    params: {
      tag,
    },
  }))
}

const getFilteredPostData = (tag: string): PostOverView[] => {
  const allPostData = getSortedPostsOverView()
  return allPostData.filter(postData => postData.tags.includes(tag))
}

export { getTagsData, getAllTagPaths, getFilteredPostData }
