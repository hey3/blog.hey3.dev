import { FC } from 'react'
import Image from 'next/image'
import styled from 'styled-components'

type ContainerProps = {
  className?: string
  imageSource: string
  alt: string
  children?: never
}

type PresenterProps = Record<string, unknown>

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({ className, imageSource, alt }) => (
  <div className={className}>
    <Image className="avatar" src={imageSource} alt={alt} layout="fill" />
  </div>
)

const StyledComponent = styled(DomComponent)`
  position: relative;
  width: 2.5rem;
  height: 2.5rem;

  & .avatar {
    border-radius: 100%;
  }
`

const Avatar: FC<ContainerProps> = props => {
  return <StyledComponent {...props} />
}

export default Avatar
