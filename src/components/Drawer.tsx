import { Dispatch, FC, SetStateAction } from 'react'
import styled, { keyframes } from 'styled-components'

import DrawerButton from './DrawerButton'
import DrawerNav from './DrawerNav'

type ContainerProps = {
  className?: string
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

type PresenterProps = {
  handleClickButton: () => void
  handleAnimationEnd: () => void
}

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({
  className,
  isOpen,
  setIsOpen,
  handleClickButton,
  handleAnimationEnd,
  children,
}) => (
  <div className={className}>
    <div
      className="drawer-bg"
      id="drawer-bg"
      role="button"
      tabIndex={0}
      onKeyDown={() => setIsOpen(false)}
      onClick={() => setIsOpen(false)}
      onAnimationEnd={handleAnimationEnd}
    />
    <DrawerButton className="drawer-button" isOpen={isOpen} handleClick={handleClickButton} />
    <DrawerNav isOpen={isOpen}>{children}</DrawerNav>
  </div>
)

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`

const fadeOut = keyframes`
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
`

const StyledComponent = styled(DomComponent)`
  @media screen and (min-width: 1025px) {
    display: none;
  }

  & > .drawer-bg {
    width: 100%;
    height: 100%;
    position: fixed;
    z-index: 1;
    background-color: rgba(51, 51, 51, 0.5);
    display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
    animation: 0.5s ${({ isOpen }) => (isOpen ? fadeIn : fadeOut)} linear;
    top: 0;
    left: 0;
  }
`

const Drawer: FC<ContainerProps> = props => {
  const { isOpen, setIsOpen } = props

  const handleClickButton = (): void => {
    setIsOpen(!isOpen)
    const bgElement = document.getElementById('drawer-bg')
    if (bgElement) {
      bgElement.style.display = 'block'
    }
  }
  const handleAnimationEnd = (): void => {
    const bgElement = document.getElementById('drawer-bg')
    if (bgElement) {
      isOpen ? (bgElement.style.display = 'block') : (bgElement.style.display = 'none')
    }
  }

  const presenterProps: PresenterProps = {
    handleClickButton,
    handleAnimationEnd,
  }

  return <StyledComponent {...presenterProps} {...props} />
}

export default Drawer
