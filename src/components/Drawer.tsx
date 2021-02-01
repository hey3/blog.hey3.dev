import { Dispatch, FC, MutableRefObject, SetStateAction, useRef } from 'react'
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
  handleBGAnimationEnd: () => void
  handleNavAnimationEnd: () => void
  bgRef: MutableRefObject<HTMLDivElement | null>
  navRef: MutableRefObject<HTMLElement | null>
}

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({
  className,
  isOpen,
  setIsOpen,
  handleClickButton,
  handleBGAnimationEnd,
  handleNavAnimationEnd,
  bgRef,
  navRef,
  children,
}) => (
  <div className={className}>
    <div
      className="drawer-bg"
      id="drawer-bg"
      role="button"
      tabIndex={0}
      ref={bgRef}
      onKeyDown={() => setIsOpen(false)}
      onClick={() => setIsOpen(false)}
      onAnimationEnd={handleBGAnimationEnd}
    />
    <DrawerButton className="drawer-button" isOpen={isOpen} handleClick={handleClickButton} />
    <DrawerNav navRef={navRef} onAnimationEnd={handleNavAnimationEnd} isOpen={isOpen}>
      {children}
    </DrawerNav>
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
    display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(51, 51, 51, 0.5);
    animation: 0.2s ${({ isOpen }) => (isOpen ? fadeIn : fadeOut)} linear;
    z-index: 1;
  }
`

const Drawer: FC<ContainerProps> = props => {
  const { isOpen, setIsOpen } = props
  const bgRef = useRef<HTMLDivElement | null>(null)
  const navRef = useRef<HTMLElement | null>(null)

  const handleClickButton = (): void => {
    setIsOpen(!isOpen)
    if (navRef.current) {
      navRef.current.style.display = 'block'
    }
    if (bgRef.current) {
      bgRef.current.style.display = 'block'
    }
  }
  const handleBGAnimationEnd = (): void => {
    if (bgRef.current) {
      isOpen ? (bgRef.current.style.display = 'block') : (bgRef.current.style.display = 'none')
    }
  }

  const handleNavAnimationEnd = (): void => {
    if (navRef.current) {
      isOpen ? (navRef.current.style.display = 'block') : (navRef.current.style.display = 'none')
    }
  }

  const presenterProps: PresenterProps = {
    handleClickButton,
    handleBGAnimationEnd,
    handleNavAnimationEnd,
    bgRef,
    navRef,
  }

  return <StyledComponent {...presenterProps} {...props} />
}

export default Drawer
