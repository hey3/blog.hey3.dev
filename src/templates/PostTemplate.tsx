import { FC } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styled from 'styled-components'

import { siteMeta, twitter } from '../../blog.config'
import { routes } from '../routes'
import { markDownStyle } from '../styles/markdown'
import { PostData } from '../lib/posts'
import Layout from '../components/Layout'
import Seo from '../components/Seo'
import Toc from '../components/Toc'
import Avatar from '../components/Avatar'
import Date from '../components/Date'
import TweetButton from '../components/TweetButton'
import PostLinkButton from '../components/PostLinkButton'

export type LinkPostData = {
  title: string
  slug: string
} | null

type ContainerProps = {
  className?: string
  path: string
  postData: PostData
  prevPostData: LinkPostData
  nextPostData: LinkPostData
  children?: never
}

type PresenterProps = Record<string, unknown>

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({
  className,
  path,
  postData: { title, tags, toc, excerpt, slug, create, update, isProtect, contentHtml },
  prevPostData,
  nextPostData,
}) => (
  <Layout>
    <Seo
      path={path}
      title={title}
      description={excerpt}
      image={routes.postVisualImage(slug)}
      datePublished={create}
      dateModified={update}
      isProtect={isProtect}
    />
    <div className={className}>
      <article className="post-area">
        <div className="post">
          <div className="post-header">
            <h1 className="title">{title}</h1>
            <div className="detail">
              <div className="info">
                <Date className="date" date={create} />
                <ul className="tag-panel">
                  {tags.map(tag => (
                    <li key={tag} className="tag">
                      <Link href={routes.tags(tag)} passHref>
                        <a>
                          <div>{tag}</div>
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="user-row">
              <div className="user">
                <Avatar imageSource={siteMeta.authorImage} alt="author" />
                <div className="user-info">
                  <a
                    className="author-name"
                    href={twitter.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {siteMeta.author}
                  </a>
                </div>
              </div>
              <TweetButton className="twitter-share-button" title={title} path={path} />
            </div>
          </div>
          <Image
            src={routes.postVisualImage(slug)}
            alt={title}
            layout="responsive"
            width={720}
            height={500}
            quality={100}
            loading="lazy"
          />
          <section className="content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
        <section className="link-area">
          {prevPostData ? (
            <PostLinkButton
              position="Previous"
              title={prevPostData.title}
              slug={prevPostData.slug}
            />
          ) : (
            <div />
          )}
          {nextPostData ? (
            <PostLinkButton position="Next" title={nextPostData.title} slug={nextPostData.slug} />
          ) : (
            <div />
          )}
        </section>
      </article>
      <Toc className="tocs" toc={toc} slug={slug} />
    </div>
  </Layout>
)

const StyledComponent = styled(DomComponent)`
  display: flex;
  justify-content: center;

  & .post-area {
    margin-top: 1rem;
    overflow: hidden;

    @media screen and (min-width: 1025px) {
      max-width: 50rem;
    }

    & .post {
      background-color: #fff;
      padding-left: 1rem;
      padding-right: 1rem;
      padding-bottom: 1rem;

      & .post-header {
        & .title {
          color: #2c2c2c;
          font-size: 2rem;
          font-weight: 700;
          padding-top: 1.5rem;
        }

        & .detail {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;

          & .info {
            & .date {
              padding: 0.5rem 0;
            }

            & .tag-panel {
              & .tag {
                display: inline-block;
                background-color: #0054ad;
                color: #ffffff;
                width: fit-content;
                height: 1.5rem;
                margin: 0.5rem 0;
                padding: 0.1rem 0.5rem;
                border-radius: 0.2rem;
                cursor: pointer;

                &:nth-child(n + 2) {
                  margin-left: 0.5rem;
                }
              }
            }
          }
        }

        & .user-row {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          margin: 0.5rem 0;

          & .user {
            display: flex;
            align-items: center;

            & .user-info {
              display: flex;
              flex-direction: column;
              margin-left: 0.7rem;
              font-weight: 700;

              & .author-name {
                text-decoration: underline;
              }
            }
          }

          & .twitter-share-button {
            margin-top: 0.5rem;
          }
        }
      }

      & .content {
        ${markDownStyle};
        margin-top: 1rem;
        line-height: 1.5;
        font-weight: 400;

        @media screen and (max-width: 1024px) {
          margin: 0 auto;
          width: 90%;
        }

        > pre {
          white-space: pre-wrap;
          padding: 1rem;
          border-radius: 0.3rem;
          margin: 0.5rem;
          overflow-x: auto;

          @media screen and (max-width: 1024px) {
            font-size: 0.9rem;
          }
        }
      }
    }

    & .link-area {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;

      & > a {
        width: 50%;
      }
    }
  }

  & .tocs {
    position: sticky;
    top: 5rem;
    max-width: 25em;
    margin-top: 10rem;
    margin-left: 5rem;
    width: fit-content;
    height: fit-content;
    visibility: ${props => props.postData.toc.length === 0 && 'hidden'};

    @media screen and (max-width: 1024px) {
      display: none;
    }
  }
`

const PostTemplate: FC<ContainerProps> = props => {
  return <StyledComponent {...props} />
}

export default PostTemplate
