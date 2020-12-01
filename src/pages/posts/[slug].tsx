import { FC } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'

import { routes } from '../../routes'
import { getAllPostPaths, getPostData, PostData } from '../../lib/posts'
import PostTemplate from '../../templates/PostTemplate'

type Props = {
  postData: PostData
  children?: never
}

const Post: FC<Props> = ({ postData }) => (
  <PostTemplate path={routes.posts(postData.slug)} postData={postData} />
)

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPostPaths()
  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const postData = await getPostData(params?.slug as string)
  return {
    props: {
      postData,
    },
  }
}

export default Post
