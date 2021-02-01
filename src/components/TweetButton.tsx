import { FC } from 'react'
import styled from 'styled-components'

import { siteMeta } from '../../blog.config'

type ContainerProps = {
  className?: string
  title: string
  path: string
  children?: never
}

type PresenterProps = Record<string, unknown>

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({ className, title, path }) => (
  <a
    className={className}
    href={`https://twitter.com/share?text=${encodeURIComponent(title)}&url=${
      siteMeta.siteUrl
    }${path}&related=${encodeURIComponent(siteMeta.author)}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="この記事をツイートする"
  >
    <svg className="icon" viewBox="328 355 335 276" fill="#ffffff">
      <path
        d="
          M 630, 425
          A 195, 195 0 0 1 331, 600
          A 142, 142 0 0 0 428, 570
          A  70,  70 0 0 1 370, 523
          A  70,  70 0 0 0 401, 521
          A  70,  70 0 0 1 344, 455
          A  70,  70 0 0 0 372, 460
          A  70,  70 0 0 1 354, 370
          A 195, 195 0 0 0 495, 442
          A  67,  67 0 0 1 611, 380
          A 117, 117 0 0 0 654, 363
          A  65,  65 0 0 1 623, 401
          A 117, 117 0 0 0 662, 390
          A  65,  65 0 0 1 630, 425
          Z
        "
      />
    </svg>
    <div className="word">ツイート</div>
  </a>
)

const StyledComponent = styled(DomComponent)`
  display: flex;
  align-items: center;
  position: relative;
  height: 1.7rem;
  box-sizing: border-box;
  padding: 1px 8px 1px 6px;
  background-color: #1b95e0;
  color: #fff;
  border-radius: 3px;
  font-weight: 500;
  cursor: pointer;

  & .icon {
    display: block;
    height: 40%;
    width: 0.75rem;
  }

  & .word {
    font-size: 0.7rem;
    padding-left: 0.5rem;
  }
`

const TweetButton: FC<ContainerProps> = props => {
  return <StyledComponent {...props} />
}

export default TweetButton
