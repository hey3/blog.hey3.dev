import { FC } from 'react'
import styled from 'styled-components'

type ContainerProps = {
  className?: string
  date: string
  children?: never
}

type PresenterProps = {
  formattedDate: string
}

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({ className, formattedDate }) => (
  <div className={className}>{formattedDate}</div>
)

const StyledComponent = styled(DomComponent)`
  color: #0055b8;
`

const Date: FC<ContainerProps> = props => {
  const formattedDate = props.date.substring(0, 10) // front matter format is fixed

  const presenterProps: PresenterProps = {
    formattedDate,
  }
  return <StyledComponent {...presenterProps} {...props} />
}

export default Date
