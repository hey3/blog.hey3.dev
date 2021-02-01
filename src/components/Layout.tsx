import { FC } from 'react'
import styled from 'styled-components'

import Header from './Header'
import Footer from './Footer'

type ContainerProps = {
  className?: string
}

type PresenterProps = Record<string, unknown>

type Props = ContainerProps & PresenterProps

const DomComponent: FC<Props> = ({ className, children }) => (
  <div className={className}>
    <Header className="header" />
    <main className="main" role="main">
      {children}
    </main>
    <Footer className="footer" />
  </div>
)

const StyledComponent = styled(DomComponent)`
  background-color: #f8f9f9;
  min-height: 100vh;
  position: relative;
  padding-bottom: 7rem; // footer's height
  box-sizing: border-box;

  & .main {
    padding-top: 4rem; // header's height
    padding-bottom: 2rem;
  }
`

const Layout: FC<ContainerProps> = ({ children }) => {
  return <StyledComponent>{children}</StyledComponent>
}

export default Layout
