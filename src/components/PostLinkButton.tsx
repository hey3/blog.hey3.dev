import { FC } from 'react'
import Link from 'next/link'
import styled from 'styled-components'

import { routes } from '../routes'

type ContainerProps = {
  className?: string
  position: 'Previous' | 'Next'
  title: string
  slug: string
  children?: never
}

type PresenterProps = Record<string, unknown>

type Props = ContainerProps & PresenterProps

const ChevronRight: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#000000"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
)

const ChevronLeft: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#000000"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

const DomComponent: FC<Props> = ({ className, position, title, slug }) => (
  <Link href={routes.posts(slug)} passHref>
    <a>
      <div className={className}>
        <div className="position">
          {position === 'Previous' && <ChevronLeft />}
          {position}
          {position === 'Next' && <ChevronRight />}
        </div>
        <div className="title">{title}</div>
      </div>
    </a>
  </Link>
)

const StyledComponent = styled(DomComponent)`
  display: flex;
  align-items: ${({ position }) => (position === 'Previous' ? 'flex-start' : 'flex-end')};
  flex-direction: column;
  padding: 1rem;
  margin: 0.5rem;
  border-radius: 5px;
  border: 1px solid transparent;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
  background-color: #ffffff;

  &:hover {
    border: 1px solid rgb(80, 202, 249);
  }

  & .position {
    display: flex;
    align-items: center;
  }

  & .title {
    color: #245a89;
    text-decoration: underline;
    margin-top: 0.5rem;
    width: 100%;
  }
`

const PostLinkButton: FC<ContainerProps> = props => {
  return <StyledComponent {...props} />
}

export default PostLinkButton
