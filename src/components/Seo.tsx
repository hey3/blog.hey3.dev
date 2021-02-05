import { FC } from 'react'
import { NextSeo } from 'next-seo'

import { siteMeta } from '../../blog.config'
import { routes } from '../routes'

type Props = {
  path: string
  title: string
  description?: string
  image?: string
  isProtect?: boolean
  children?: never
}

const Seo: FC<Props> = ({ path, title, description, image, isProtect }) => {
  const metaType = path === routes.top ? 'blog' : 'article'
  const metaImage = image
    ? `${siteMeta.siteUrl}${image}`
    : `${siteMeta.siteUrl}${siteMeta.siteImage}`
  const metaDescription = description ? description : siteMeta.description

  return (
    <NextSeo
      title={title}
      description={metaDescription}
      canonical={`${siteMeta.siteUrl}${path}`}
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
  )
}

export default Seo
