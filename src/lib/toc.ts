import remark from 'remark'
import visit from 'unist-util-visit'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const GithubSlugger = require('github-slugger')

const githubSlugger = new GithubSlugger()

export type TocRef = {
  id: string
  value: string
  depth: number
}

type Children = {
  type: string
  value: string
  position: Position
}

type Position = {
  start: {
    line: number
    column: number
    offset: number
  }
  end: {
    line: number
    column: number
    offset: number
  }
}

type HeadingNode = {
  type: string
  depth: number
  children: Children[]
  position: Position
}

const getPostToc = (rawMarkdownBody: string): TocRef[] => {
  githubSlugger.reset()

  const result: TocRef[] = []
  const ast = remark().parse(rawMarkdownBody)
  visit(ast, 'heading', (child: HeadingNode) => {
    const { value } = child.children[0]
    const id = githubSlugger.slug(value)
    const depth = child.depth
    result.push({
      id,
      value,
      depth,
    })
  })
  return result
}

export { getPostToc }
