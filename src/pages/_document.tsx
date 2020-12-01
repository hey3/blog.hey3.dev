import { Fragment, ReactElement } from 'react'
import NextDocument, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document'
import { RenderPageResult } from 'next/dist/next-server/lib/utils'
import { ServerStyleSheet } from 'styled-components'

import { siteMeta } from '../../blog.config'
import { GA_TRACKING_ID } from '../lib/gtag'

class CustomDocument extends NextDocument {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const styledComponentsSheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = (): RenderPageResult | Promise<RenderPageResult> =>
        originalRenderPage({
          enhanceApp: App => (
            props
          ): ReactElement<{
            sheet: ServerStyleSheet
          }> => styledComponentsSheet.collectStyles(<App {...props} />),
        })

      const initialProps = await NextDocument.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: [
          <Fragment key="styles">
            {initialProps.styles}
            {styledComponentsSheet.getStyleElement()}
          </Fragment>,
        ],
      }
    } finally {
      styledComponentsSheet.seal()
    }
  }

  render(): ReactElement {
    return (
      <Html lang="ja">
        <Head>
          <meta name="theme-color" content="#fffbed" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="manifest" crossOrigin="use-credentials" href="/manifest.json" />
          <link rel="alternate" type="application/rss+xml" title={siteMeta.title} href="/rss.xml" />
          <link
            rel="alternate"
            type="application/atom+xml"
            title={siteMeta.title}
            href="/atom.xml"
          />
          <link
            rel="alternate"
            type="application/rss+xml"
            title={siteMeta.title}
            href="/sitemap.xml"
          />
          <link rel="apple-touch-icon" href="/author.png" />
          {process.env.NEXT_PUBLIC_ENV === 'production' && (
            <Fragment>
              <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}');
            `,
                }}
              />
            </Fragment>
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default CustomDocument
