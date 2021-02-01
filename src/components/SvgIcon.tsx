import { FC, SVGProps } from 'react'
import styled from 'styled-components'

type ContainerProps = {
  className?: string
  href?: string
  width: number
  height: number
  viewWidth: number
  viewHeight: number
  color: string
  ariaLabel?: string
  children: SVGProps<SVGElement> | SVGProps<SVGElement>[]
}

type PresenterProps = Record<string, unknown>

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({
  className,
  ariaLabel,
  href,
  viewWidth,
  viewHeight,
  color,
  children,
}) => (
  <a
    className={className}
    href={href}
    role="button"
    aria-label={ariaLabel}
    target="_blank"
    rel="noopener noreferrer"
  >
    <div className="button">
      <svg
        className="image"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        width={viewWidth}
        height={viewHeight}
        fill={color}
      >
        {children}
      </svg>
    </div>
  </a>
)

const StyledComponent = styled(DomComponent)`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  background-color: #fff;
  text-align: center;
  line-height: 40px;
  overflow: hidden;
  border-radius: 28%;
  box-shadow: 0 5px 15px -5px rgba(0, 0, 0, 0.1);
  opacity: 0.99;
  transition: all 0.35s;
  transition-timing-function: cubic-bezier(0.31, -0.105, 0.43, 1.59);
  cursor: pointer;

  &:before {
    position: absolute;
    content: '';
    top: 90%;
    left: -110%;
    width: 120%;
    height: 120%;
    background-color: ${props => props.color};
    transform: rotate(45deg);
    transition: all 0.35s;
    transition-timing-function: cubic-bezier(0.31, -0.105, 0.43, 1.59);
  }

  &:focus,
  &:hover {
    &:before {
      top: -10%;
      left: -10%;
    }

    & .image {
      fill: white;
      transform: scale(1);
    }
  }

  & .button {
    cursor: unset;

    & .image {
      color: ${props => props.color};
      font-size: 38px;
      vertical-align: middle;
      transform: scale(0.8);
      transition: all 0.35s;
      transition-timing-function: cubic-bezier(0.31, -0.105, 0.43, 1.59);
    }
  }
`

const SvgIcon: FC<ContainerProps> = ({ children, ...props }) => {
  return <StyledComponent {...props}>{children}</StyledComponent>
}

export default SvgIcon
