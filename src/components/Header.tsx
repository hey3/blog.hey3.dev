import { FC } from 'react'
import Link from 'next/link'
import styled from 'styled-components'

import { siteMeta, github } from '../../blog.config'
import { routes } from '../routes'
import SvgIcon from './SvgIcon'

type ContainerProps = {
  className?: string
  children?: never
}

type PresenterProps = Record<string, unknown>

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({ className }) => (
  <header className={className} role="banner">
    <h1 className="blog-title">
      <Link href={routes.top} passHref>
        <a aria-label="hey3 tech blog">{siteMeta.title}</a>
      </Link>
    </h1>
    <div className="icons">
      <SvgIcon
        href={routes.rss}
        width={40}
        height={40}
        viewWidth={24}
        viewHeight={24}
        color="black"
        ariaLabel="RSSを表示する"
      >
        <circle cx="6.18" cy="17.82" r="2.18" />
        <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
      </SvgIcon>
      <SvgIcon
        href={github.repository}
        width={40}
        height={40}
        viewWidth={24}
        viewHeight={24}
        color="black"
        ariaLabel="このブログのGithubリポジトリを開く"
      >
        <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8 0 3.2.9.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1 .9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3" />
      </SvgIcon>
    </div>
  </header>
)

const StyledComponent = styled(DomComponent)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fffbed;
  border-bottom: 1px solid #dcdcdc;
  position: fixed;
  width: 100%;
  height: 4rem;
  z-index: 1;

  & .blog-title {
    flex: 0.7;
    display: flex;
    font-size: 1.4rem;
    font-weight: 700;
    margin-left: 20px;
    margin-right: auto;
    color: #000412;
    text-shadow: 1px 1px 1px grey;
  }

  & .icons {
    flex: 0.3;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-left: auto;
    margin-right: 20px;

    & > a {
      margin: 5px;
    }
  }
`

const Header: FC<ContainerProps> = () => {
  return <StyledComponent />
}

export default Header
