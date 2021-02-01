import { FC } from 'react'
import styled from 'styled-components'

import { siteMeta, github, other } from '../../blog.config'

type ContainerProps = {
  className?: string
  children?: never
}

type PresenterProps = Record<string, unknown>

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({ className }) => (
  <footer className={className} role="contentinfo">
    <p>
      © 2020-{new Date().getFullYear()}, {siteMeta.author}
    </p>
    <p>
      Website built with{' '}
      <a
        href="https://nextjs.org"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Next.jsの公式サイト"
      >
        Next.js
      </a>
    </p>
    <p>
      Source code is{' '}
      <a
        href={github.repository}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="このブログのソースコードのリポジトリ"
      >
        here(GitHub)
      </a>
    </p>
    <p>
      This site uses{' '}
      <a
        href={other.gaPolicyUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Google Analyticsのポリシーと規約"
      >
        Google Analytics
      </a>
    </p>
  </footer>
)

const StyledComponent = styled(DomComponent)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fffbed;
  width: 100%;
  height: 7rem;
  position: absolute;
  bottom: 0;

  & > p:not(:first-child) {
    margin-top: 0.5rem;
  }

  & > p > a {
    text-decoration: underline;
  }
`

const Footer: FC<ContainerProps> = () => {
  return <StyledComponent />
}

export default Footer
