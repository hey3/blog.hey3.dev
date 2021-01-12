import { FC } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'

import { routes } from '../../routes'
import {
  getAllPostPaths,
  getPostData,
  getSortedPostsOverView,
  PostData,
  PostOverView,
} from '../../lib/posts'
import PostTemplate, { LinkPostData } from '../../templates/PostTemplate'

type Props = {
  postData: PostData
  prevPostData: LinkPostData
  nextPostData: LinkPostData
  children?: never
}

const Post: FC<Props> = ({ postData, prevPostData, nextPostData }) => (
  <PostTemplate
    path={routes.posts(postData.slug)}
    postData={postData}
    prevPostData={prevPostData}
    nextPostData={nextPostData}
  />
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
  const allPosts = await getSortedPostsOverView()
  const currentPostIndex = allPosts.map(({ slug }) => slug).indexOf(params?.slug as string)
  const prevPost: PostOverView | undefined = allPosts[currentPostIndex + 1]
  const nextPost: PostOverView | undefined = allPosts[currentPostIndex - 1]

  const prevPostData = prevPost
    ? {
        title: prevPost.title,
        slug: prevPost.slug,
      }
    : null
  const nextPostData = nextPost
    ? {
        title: nextPost.title,
        slug: nextPost.slug,
      }
    : null

  return {
    props: {
      postData,
      prevPostData,
      nextPostData,
    },
  }
}

export default Post
