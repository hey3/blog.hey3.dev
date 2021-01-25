import { Dispatch, FC, SetStateAction, useState } from 'react'
import styled from 'styled-components'

import { routes } from '../routes'
import { TocRef } from '../lib/toc'
import { NavData } from '../lib/tags'
import Drawer from './Drawer'
import Link from 'next/link'

type ContainerProps = {
  className?: string
  toc: TocRef[]
  slug: string
  tags: NavData
  children?: never
}

type PresenterProps = {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({ className, isOpen, setIsOpen, toc, slug, tags }) => (
  <Drawer className={className} isOpen={isOpen} setIsOpen={setIsOpen}>
    <h1 className="title">目次</h1>
    <ul className="toc-list">
      {toc.map(head => (
        <HeadLink key={head.value} className="head" depth={head.depth}>
          <a href={routes.postsHashLink(slug, head.id)} onClick={() => setIsOpen(false)}>
            {head.value}
          </a>
        </HeadLink>
      ))}
    </ul>
    <h1 className="title">タグ一覧</h1>
    <ul className="tag-list">
      <li>
        <Link href={routes.top}>
          <a
            className="tag-link"
            role="button"
            tabIndex={0}
            onKeyDown={() => setIsOpen(false)}
            onClick={() => setIsOpen(false)}
          >
            All
          </a>
        </Link>
      </li>
      {Object.entries(tags).map(([name, count]) => (
        <li key={name}>
          <Link href={routes.tags(name)}>
            <a
              className="tag-link"
              role="button"
              tabIndex={0}
              onKeyDown={() => setIsOpen(false)}
              onClick={() => setIsOpen(false)}
            >
              {name}: ({count})
            </a>
          </Link>
        </li>
      ))}
    </ul>
  </Drawer>
)

const HeadLink = styled.li<{ depth: number }>`
  padding: 0.5rem 0.5rem 0.5rem calc(${props => props.depth * 1}rem - 1rem);

  & > a {
    display: block;
  }
`

const StyledComponent = styled(DomComponent)`
  & .title {
    font-size: 1.5rem;
    font-weight: 900;
    padding: 1rem;
  }

  & .toc-list {
    color: #595959;
    background-color: #fff;
    border-radius: 0.5rem;

    & .head:active {
      background-color: #fffbf0;
      cursor: pointer;
      color: #444;
    }
  }

  & .tag-list {
    & > li {
      padding: 0.5rem 0 0.5rem 1rem;

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

      &:active {
        color: #129299;
      }
    }
  }
`

const PostDrawer: FC<ContainerProps> = props => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const presenterProps: PresenterProps = {
    isOpen,
    setIsOpen,
  }

  return <StyledComponent {...presenterProps} {...props} />
}

export default PostDrawer
