import { FC } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'

import { siteMeta } from '../../../blog.config'
import { routes } from '../../routes'
import { PostOverView } from '../../lib/posts'
import { getAllTagPaths, getFilteredPostData, getTagsData, NavData } from '../../lib/tags'
import NewsTemplate from '../../templates/NewsTemplate'

type Props = {
  title: string
  tagId: string
  filteredPostData: PostOverView[]
  allTagsData: NavData
  children?: never
}

const Tag: FC<Props> = ({ title, tagId, filteredPostData, allTagsData }) => (
  <NewsTemplate
    path={routes.tags(tagId)}
    title={title}
    description={siteMeta.description}
    pageSubject={`${tagId} Posts`}
    postsData={filteredPostData}
    allTagsData={allTagsData}
  />
)

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllTagPaths()

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const tag = params?.tag as string
  const title = `${tag} | ${siteMeta.title}`
  const filteredPostData = await getFilteredPostData(tag)
  const allTagsData = getTagsData()

  return {
    props: {
      title,
      tagId: tag,
      filteredPostData,
      allTagsData,
    },
  }
}

export default Tag
