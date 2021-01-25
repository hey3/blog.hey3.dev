import { Dispatch, FC, SetStateAction, useState } from 'react'
import styled from 'styled-components'

import { NavData } from '../lib/tags'
import Drawer from './Drawer'
import Link from 'next/link'
import { routes } from '../routes'

type ContainerProps = {
  className?: string
  tags: NavData
  children?: never
}

type PresenterProps = {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({ className, isOpen, setIsOpen, tags }) => (
  <Drawer className={className} isOpen={isOpen} setIsOpen={setIsOpen}>
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

const StyledComponent = styled(DomComponent)`
  & .title {
    font-size: 1.5rem;
    font-weight: 900;
    padding: 1rem;
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

const NewsDrawer: FC<ContainerProps> = props => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const presenterProps: PresenterProps = {
    isOpen,
    setIsOpen,
  }

  return <StyledComponent {...presenterProps} {...props} />
}

export default NewsDrawer
