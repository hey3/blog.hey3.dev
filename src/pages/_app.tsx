import { Fragment } from 'react'
import { AppProps } from 'next/app'
import { DefaultSeo } from 'next-seo'
import Router from 'next/router'
import '../styles/base.css'
import '../styles/reset.css'

import SEO from '../../next-seo.config'
import { pageview } from '../lib/gtag'

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
  Router.events.on('routeChangeComplete', url => pageview(url))

  return (
    <Fragment>
      <DefaultSeo {...SEO} />
      <Component {...pageProps} />
    </Fragment>
  )
}

export default App
