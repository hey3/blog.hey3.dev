import { css } from 'styled-components'

const markDownStyle = css`
  > h1 {
    display: block;
    color: #2c2c2c;
    font-size: 2em;
    margin: 0.67em 0;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
  }

  > h2 {
    display: block;
    color: #2c2c2c;
    font-size: 1.5em;
    margin: 0.83em 0;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
  }

  > h3 {
    display: block;
    color: #2c2c2c;
    font-size: 1.17em;
    margin: 1em 0;
    font-weight: bold;
  }

  > h4 {
    display: block;
    color: #2c2c2c;
    margin: 1.33em 0;
    font-weight: bold;
  }

  > h5 {
    display: block;
    color: #2c2c2c;
    font-size: 0.83em;
    margin: 1.67em 0;
    font-weight: bold;
  }

  > h6 {
    display: block;
    color: #2c2c2c;
    font-size: 0.67em;
    margin: 2.33em 0;
    font-weight: bold;
  }

  > hr {
    margin: 3em 0;
    border: 0;
    height: 2px;
    background-color: #ddd;
  }

  ul {
    list-style-type: disc;
    margin-block-start: 1em;
    margin-block-end: 1em;
    padding-left: 2rem;
  }

  ol {
    list-style-type: decimal;
    margin-block-start: 1em;
    margin-block-end: 1em;
    padding-left: 2rem;

    > li::marker {
      unicode-bidi: isolate;
      font-variant-numeric: tabular-nums;
      text-transform: none;
      text-indent: 0;
      text-align: start;
      text-align-last: start;
    }
  }

  li + li {
    margin-top: 0.25em;
  }

  ul ul,
  ol ul {
    list-style-type: circle;
    margin-left: 15px;
  }

  ol ol,
  ul ol {
    list-style-type: lower-latin;
    margin-left: 15px;
  }

  blockquote {
    border-left: 5px solid #ddd;
    color: #595959;
    padding: 0.5em 0 0.5em 1em;
    margin: 1.5em 0;
  }

  img {
    max-width: 100%;
    height: auto;
    object-fit: cover;
    object-position: center center;
  }

  a {
    color: #245a89;

    &:hover {
      color: cadetblue;
    }
  }

  // default code tag color
  code {
    color: #f8f9f9;
  }

  > ul,
  > ol {
    code {
      background-color: #eee;
      color: #333;
      padding: 0.1em 0.4em;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    }
  }

  > p {
    margin-top: 1em;
    margin-bottom: 1em;
    color: #2c2c2c;
    word-break: break-word;

    code {
      background-color: #eee;
      color: #333;
      padding: 0.1em 0.4em;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    }
  }
`

export { markDownStyle }
