import { FC, memo } from 'react'
import styled from 'styled-components'

type ContainerProps = {
  className?: string
  isOpen: boolean
  handleClick: () => void
  children?: never
}

type PresenterProps = Record<string, unknown>

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = memo(function dom({ className, handleClick }) {
  return (
    <button className={className} onClick={handleClick}>
      <svg width="46" height="46" viewBox="0 0 100 100">
        <path
          className="bar"
          d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058"
        />
        <path className="bar" d="M 20,50 H 80" />
        <path
          className="bar"
          d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942"
        />
      </svg>
    </button>
  )
})

const StyledComponent = styled(DomComponent)`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: space-around;
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 3.5rem;
  height: 3.5rem;
  background-color: #08233e;
  border: none;
  border-radius: 100%;
  padding: 5px;
  outline: none;
  cursor: pointer;
  z-index: 2;

  & .bar {
    fill: none;
    stroke: #ffffff;
    stroke-width: 6;
    transition: stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1),
      stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1);

    &:nth-child(1) {
      stroke-dasharray: ${({ isOpen }) => (isOpen ? '90 207' : '60 207')};
      stroke-dashoffset: ${({ isOpen }) => isOpen && '-134'};
      stroke-width: 6;
    }
    &:nth-child(2) {
      stroke-dasharray: ${({ isOpen }) => (isOpen ? '1 60' : '60 60')};
      stroke-dashoffset: ${({ isOpen }) => isOpen && '-30'};
      stroke-width: 6;
    }
    &:nth-child(3) {
      stroke-dasharray: ${({ isOpen }) => (isOpen ? '90 207' : '60 207')};
      stroke-dashoffset: ${({ isOpen }) => isOpen && '-134'};
      stroke-width: 6;
    }
  }
`

const DrawerButton: FC<ContainerProps> = props => {
  return <StyledComponent {...props} />
}

export default memo(DrawerButton)
