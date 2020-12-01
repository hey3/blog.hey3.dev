export const routes = {
  top: '/',
  tags: (tagName: string): string => `/tags/${tagName}`,
  posts: (slug: string): string => `/posts/${slug}`,
  postsHashLink: (slug: string, hash: string): string =>
    `/posts/${slug}#${encodeURIComponent(hash)}`,
  postVisualImage: (slug: string): string => `/posts/${slug}/visual.png`,
  rss: '/rss.xml',
}
