import { FC, Fragment } from 'react'
import { NextSeo, ArticleJsonLd } from 'next-seo'

import { siteMeta } from '../../blog.config'
import { routes } from '../routes'

type Props = {
  path: string
  title: string
  description?: string
  image?: string
  datePublished?: string
  dateModified?: string
  isProtect?: boolean
  children?: never
}

const Seo: FC<Props> = ({
  path,
  title,
  description,
  image,
  datePublished,
  dateModified,
  isProtect,
}) => {
  const metaType = path === routes.top ? 'blog' : 'article'
  const metaImage = image
    ? `${siteMeta.siteUrl}${image}`
    : `${siteMeta.siteUrl}${siteMeta.siteImage}`
  const metaDescription = description ? description : siteMeta.description
  const ldDatePublished = datePublished ? new Date(datePublished).toISOString() : ''
  const ldDateModified = dateModified ? new Date(dateModified).toISOString() : ldDatePublished

  return (
    <Fragment>
      <NextSeo
        title={title}
        description={metaDescription}
        openGraph={{
          type: metaType,
          url: `${siteMeta.siteUrl}${path}`,
          title: title,
          description: metaDescription,
          images: [
            {
              url: metaImage,
              width: 800,
              height: 600,
              alt: title,
            },
          ],
        }}
        additionalMetaTags={
          isProtect
            ? [
                {
                  name: 'Hatena::Bookmark',
                  content: 'nocomment',
                },
              ]
            : []
        }
      />
      {datePublished && (
        <ArticleJsonLd
          url={`${siteMeta.siteUrl}${path}`}
          title={title}
          images={[metaImage]}
          datePublished={ldDatePublished}
          dateModified={ldDateModified}
          authorName={siteMeta.author}
          description={metaDescription}
          publisherName={siteMeta.author}
          publisherLogo={`${siteMeta.siteUrl}${siteMeta.authorImage}`}
        />
      )}
    </Fragment>
  )
}

export default Seo
