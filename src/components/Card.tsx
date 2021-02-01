import { FC, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styled, { css } from 'styled-components'

import { routes } from '../routes'
import Date from '../components/Date'

type ContainerProps = {
  className?: string
  slug: string
  title: string
  date: string
  visual: string
  tags: string[]
  excerpt: string
  children?: never
}

type PresenterProps = {
  isHover: boolean
  setIsHover: (state: boolean) => void
}

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({
  className,
  slug,
  title,
  date,
  visual,
  tags,
  excerpt,
  setIsHover,
}) => (
  <div
    className={className}
    onFocus={() => setIsHover(true)}
    onBlur={() => setIsHover(false)}
    onMouseOver={() => setIsHover(true)}
    onMouseLeave={() => setIsHover(false)}
  >
    <Link href={routes.posts(slug)}>
      <a className="wrapper" aria-label={title}>
        <Image
          className="visual"
          src={visual}
          alt={title}
          title={title}
          layout="responsive"
          width={72}
          height={50}
          quality={100}
          loading="lazy"
        />
        <section className="description">
          <h2 className="title">{title}</h2>
          <Date className="date" date={date} />
          <ul className="tag-panel" aria-label="この記事のタグ">
            {tags.map(tag => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
          </ul>
          <div className="excerpt">{excerpt}</div>
        </section>
      </a>
    </Link>
  </div>
)

const StyledComponent = styled(DomComponent)`
  background-color: #ffffff;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
  height: 100%;
  width: 100%;

  &:hover {
    border: 1px solid rgb(80, 202, 249);
  }

  & .wrapper {
    display: flex;
    background-color: transparent;
    padding: 1rem;
    height: 100%;
    width: 100%;
    max-width: 70rem;

    @media screen and (max-width: 480px) {
      flex-direction: column;
      min-width: auto;
    }

    // next/image のレスポンシブ対応による div に対して適用
    > div:first-child {
      flex: 30%;
    }

    & .visual {
      transition: 0.5s all;

      ${({ isHover }) =>
        isHover &&
        css`
          transform: scale(1.1, 1.1);
        `};
    }

    & .description {
      flex: 70%;
      display: flex;
      flex-direction: column;
      margin: 0 0 0 1rem;

      @media screen and (max-width: 480px) {
        margin: 1rem 0 0 0;
      }

      & .title {
        font-size: 1.2rem;
        font-weight: 500;
      }

      & .date {
        padding-top: 0.5rem;
      }

      & .tag-panel {
        & .tag {
          display: inline-block;
          background-color: #0054ad;
          color: #ffffff;
          width: fit-content;
          height: 1.5rem;
          padding: 0.1rem 0.5rem;
          border-radius: 0.2rem;
          margin-top: 0.5rem;

          &:nth-child(n + 2) {
            margin-left: 0.5rem;
          }
        }
      }

      & .excerpt {
        margin-top: 1.2rem;
        color: #595959;
        line-height: 1.5rem;
      }
    }
  }
`

const Card: FC<ContainerProps> = props => {
  const [isHover, setIsHover] = useState<boolean>(false)
  const presenterProps: PresenterProps = {
    isHover,
    setIsHover,
  }
  return <StyledComponent {...presenterProps} {...props} />
}

export default Card
