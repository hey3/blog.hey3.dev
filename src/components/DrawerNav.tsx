import { FC } from 'react'
import styled from 'styled-components'

type ContainerProps = {
  className?: string
  isOpen: boolean
}

type PresenterProps = Record<string, unknown>

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({ className, children }) => (
  <nav className={className}>{children}</nav>
)

const StyledComponent = styled(DomComponent)`
  width: 250px;
  height: 100%;
  transition: all 0.2s;
  transform: ${({ isOpen }) => (isOpen ? 'translate(0)' : 'translate(250px)')};
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1;
  background-color: #fff;
  overflow-x: hidden;
  overflow-y: auto;
  border-radius: 5px;
  padding-bottom: 6rem;
`

const DrawerNav: FC<ContainerProps> = props => {
  return <StyledComponent {...props} />
}

export default DrawerNav
