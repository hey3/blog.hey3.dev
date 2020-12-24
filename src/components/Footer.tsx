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
  <footer className={className}>
    <p className="info">
      © {new Date().getFullYear()}, {siteMeta.author}, Website built with{' '}
      <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
        Next.js
      </a>
    </p>
    <p className="source">
      Source code is{' '}
      <a href={github.repository} target="_blank" rel="noopener noreferrer">
        here(GitHub)
      </a>
    </p>
    <p className="using-ga">
      This site uses{' '}
      <a href={other.gaPolicyUrl} target="_blank" rel="noopener noreferrer">
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
  height: 6rem;
  position: absolute;
  bottom: 0;

  & .source,
  .using-ga {
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
