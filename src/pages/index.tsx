import { FC } from 'react'
import { GetStaticProps } from 'next'

import { siteMeta } from '../../blog.config'
import { routes } from '../routes'
import { getSortedPostsOverView, PostOverView } from '../lib/posts'
import { getTagsData, NavData } from '../lib/tags'
import NewsTemplate from '../templates/NewsTemplate'

type Props = {
  allPostsData: PostOverView[]
  allTagsData: NavData
  children?: never
}

const Home: FC<Props> = ({ allPostsData, allTagsData }) => (
  <NewsTemplate
    path={routes.top}
    title={siteMeta.title}
    description={siteMeta.description}
    pageSubject="Blog Posts"
    postsData={allPostsData}
    allTagsData={allTagsData}
  />
)

export const getStaticProps: GetStaticProps = async () => {
  const allPostsData = getSortedPostsOverView()
  const allTagsData = getTagsData()

  return {
    props: {
      allPostsData,
      allTagsData,
    },
  }
}

export default Home
