import { FC } from 'react'
import Link from 'next/link'
import styled from 'styled-components'

import { routes } from '../routes'
import { NavData } from '../lib/tags'

type ContainerProps = {
  className?: string
  items: NavData
  children?: never
}

type PresenterProps = Record<string, unknown>

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({ className, items }) => (
  <div className={className}>
    <h1 className="title">Tags</h1>
    <ul className="tag-list">
      <li>
        <Link href={routes.top}>
          <a className="tag-link" aria-label="すべてのタグを含む記事一覧ページ">
            All
          </a>
        </Link>
      </li>
      {Object.entries(items).map(([name, count]) => (
        <li key={name}>
          <Link href={routes.tags(name)}>
            <a className="tag-link" aria-label={`${name}タグの記事一覧ページ`}>
              {name}: ({count})
            </a>
          </Link>
        </li>
      ))}
    </ul>
  </div>
)

const StyledComponent = styled(DomComponent)`
  & .title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  & .tag-list {
    & > li {
      border-bottom: 1px solid #ecebeb;
      padding: 0.5rem 0;

      & > a {
        display: block;

        &:before {
          content: '>';
          font-family: FontAwesome, serif;
          font-size: 8px;
          padding-right: 10px;
          position: relative;
          top: -1px;
        }
      }

      &:hover {
        cursor: pointer;
        color: #129299;
      }
    }
  }
`

const Tags: FC<ContainerProps> = props => {
  return <StyledComponent {...props} />
}

export default Tags
