import { FC } from 'react'
import styled from 'styled-components'

import { PostOverView } from '../lib/posts'
import { NavData } from '../lib/tags'
import Layout from '../components/Layout'
import Seo from '../components/Seo'
import Tags from '../components/Tags'
import Card from '../components/Card'
import NewsDrawer from '../components/NewsDrawer'

type ContainerProps = {
  className?: string
  path: string
  title: string
  description: string
  pageSubject: string
  postsData: PostOverView[]
  allTagsData: NavData
  children?: never
}

type PresenterProps = Record<string, unknown>

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({
  className,
  path,
  title,
  description,
  pageSubject,
  postsData,
  allTagsData,
}) => (
  <Layout>
    <Seo path={path} title={title} description={description} />
    <div className={className}>
      <div className="content-area">
        <h1 className="page-subject" aria-label="記事一覧">
          {pageSubject}
        </h1>
        <ul className="posts">
          {postsData.map(({ slug, create, title, visualPath, tags, excerpt }) => (
            <li className="post" key={slug}>
              <Card
                slug={slug}
                title={title}
                date={create}
                visual={visualPath}
                tags={tags}
                excerpt={excerpt}
              />
            </li>
          ))}
        </ul>
      </div>
      <nav className="nav">
        <Tags items={allTagsData} />
      </nav>
    </div>
    <NewsDrawer tags={allTagsData} />
  </Layout>
)

const StyledComponent = styled(DomComponent)`
  display: flex;
  justify-content: center;
  margin: 3rem 5rem 0 5rem;

  @media screen and (max-width: 1024px) {
    margin: 1rem;
  }

  .content-area {
    flex: 0.75;

    @media screen and (max-width: 1024px) {
      flex: 1;
    }

    & .page-subject {
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
      font-weight: 400;
    }

    & .posts {
      display: flex;
      flex-direction: column;

      & .post {
        margin-bottom: 2rem;
      }
    }
  }

  .nav {
    flex: 0.25;
    margin-left: 3rem;

    @media screen and (max-width: 1024px) {
      display: none;
    }
  }
`

const NewsTemplate: FC<ContainerProps> = props => {
  return <StyledComponent {...props} />
}

export default NewsTemplate
