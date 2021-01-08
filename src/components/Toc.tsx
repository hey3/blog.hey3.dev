import { FC } from 'react'
import styled from 'styled-components'

import { routes } from '../routes'
import { TocRef } from '../lib/toc'

type ContainerProps = {
  className?: string
  toc: TocRef[]
  slug: string
  children?: never
}

type PresenterProps = Record<string, unknown>

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({ className, toc, slug }) => (
  <nav className={className}>
    <ul className="toc-list">
      {toc.map(head => (
        <HeadLink key={head.value} className="head" depth={head.depth}>
          <a href={routes.postsHashLink(slug, head.id)}>{head.value}</a>
        </HeadLink>
      ))}
    </ul>
  </nav>
)

const HeadLink = styled.li<{ depth: number }>`
  padding-left: calc(${props => props.depth * 1}rem - 1rem);

  & > a {
    display: block;
    padding: 0.15rem 2rem 0.15rem 0;
  }
`

const StyledComponent = styled(DomComponent)`
  & > ul {
    color: #595959;
    background-color: #fff;
    padding: 1rem;
    border-radius: 0.5rem;
    line-height: 1.5rem;

    & .head:hover {
      background-color: #fffbf0;
      cursor: pointer;
      color: #444;
    }
  }
`

const Toc: FC<ContainerProps> = props => {
  return <StyledComponent {...props} />
}

export default Toc
