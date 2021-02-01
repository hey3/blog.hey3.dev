import { AnimationEvent, FC, MutableRefObject, ReactNode, memo } from 'react'
import styled, { keyframes } from 'styled-components'

type ContainerProps = {
  className?: string
  navRef: MutableRefObject<HTMLElement | null>
  onAnimationEnd: (e: AnimationEvent<HTMLElement>) => void
  isOpen: boolean
  children: ReactNode
}

type PresenterProps = Record<string, unknown>

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = memo(function dom({ className, navRef, onAnimationEnd, children }) {
  return (
    <nav className={className} ref={navRef} onAnimationEnd={onAnimationEnd}>
      {children}
    </nav>
  )
})

const fadeIn = keyframes`
  from {
    transform: translate(250px);
  }

  to {
    transform: translate(0);
  }
`

const fadeOut = keyframes`
  from {
    transform: translate(0);
  }

  to {
    transform: translate(250px);
  }
`

const StyledComponent = styled(DomComponent)`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  width: 250px;
  height: 100%;
  position: fixed;
  top: 0;
  right: 0;
  background-color: #fff;
  border-radius: 5px;
  overflow-x: hidden;
  overflow-y: auto;
  padding-bottom: 6rem;
  animation: 0.2s ${({ isOpen }) => (isOpen ? fadeIn : fadeOut)} linear;
  z-index: 1;
`

const DrawerNav: FC<ContainerProps> = props => {
  return <StyledComponent {...props} />
}

export default memo(DrawerNav)
