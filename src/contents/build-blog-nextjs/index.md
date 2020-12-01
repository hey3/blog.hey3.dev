---
title: 'Next.js + TypeScript でブログを作った'
tag: next.js, typescript
isProtect: false
create: '2020-12-02T01:00:00+09:00'
---

ブログを作成しました！  
最初の記事として、ブログを作った経緯や作成するまでに考慮した点・躓いた点などについて記載します。

## なぜブログを作ろうと思ったか

得た知識をラフにアウトプット出来る場が欲しかった事が大きいです。

普段は主に React + TypeScript での SPA 開発をメインで行っています。 web フロントエンドとして成長しようと思うと、学ぶべき事も多く、その過程としても自分のブログを作成することは通過点として考えていました。  
アウトプットのみであれば Qiita や Zenn でのアウトプットでも良いのですが、スキルをつけるという点でも自分で作りたいという思いが大きかったです。

主に業務以外で学習した内容を記事にしていきたいと思っています。  
当ブログは Next.js で作成していますが、業務での経験は無くドキュメントとにらめっこで学習しました。  
最初の記事もそこで学んだアウトプットとしての位置付けです。

## どのようにして作ったか

### 技術スタック

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)

を基準として構成しています。

スタイリングには styled-components を使用しています。  
styled-components を選択した理由は、自分の使用経験からなのですが、 Next.js の最適化の観点も考えると CSS modules に変更しようかなと考えています。  
(ある程度実装を進めてからだったので、一通り突き通してからまとまった時間で対応しようかなと思っています。)

コードのハイライトには [shiki](https://github.com/shikijs/shiki) を選択しています。  
これは、 prism だと jsx のシンタックスが崩れてしまうことが背景にあります。主に web 周りの記事を書いていこうと思っているので、 jsx のシンタックスが崩れるのは痛いなと思いました。

入稿は markdown から行います。  
将来的には CMS と連携することも考えています。

### Next.js を選択した背景

**「流行っているから。」**

というわけではありません。自分なりに主に以下の理由で選択しました。(正直なところ学ばないとと思ったのはあります。。)

- 最適化が強い
- SSG, SSR, CSR, ISR を場面で選択できる

他のフレームワークとの比較に Plugin の豊富さや情報の多さなどは特に考慮しませんでした。

詳細は以下に記載していきます。

#### 最適化が強い

まず、 Next.js は React ベースのフレームワークです。  
version 9 以前は SSG, SSR くらいが出来るフレームワークで、 SSG を行うのであれば Gatsby を選択するような状況でした。なので、React で SSR をするなら Next.js という感覚だったと思います。  
ただ、 Next.js はパフォーマンス周りの最適化が行われており、自ら build や compile, chunk 周りの最適化を行う必要がほぼありません。(`next.config.js` に記述を加えることで設定をいじることも出来ます。)  
この辺 webpack まわりのチューニングをした人ならわかると思いますが、知識が求められるなど結構な負担がかかります。  
version 9 以降では SSG に重点をおいたアップデートがされてきています。

Plugin が豊富な Gatsby も魅力的ですが、この辺の観点から Next.js を選択しました。

#### SSG, SSR, CSR, ISR を場面で選択できる

個人的な意見ですが、 Next.js は場面ごとに SSR, SSG, CSR, ISR を容易に組み合わせられる柔軟性がでかいなと思っています。  
簡単な例ですが v9.3 以降だと SSR -> SSG に切り替える場合も、 `getServerSideProps(getInitialProps)` -> `getStaticProps` に変えるくらいで切り替えられます。  
この `getServerSideProps`, `getStaticProps` を使い分けることで SSR, SSG(ISR) を用途ごとに使い分けられます。

簡単に記載しておきます。  
`getServerSideProps`, `getStaticProps` はそれぞれサーバーサイドのみで実行される関数です。  
`getServerSideProps` はリクエスト時に毎度実行されます。これを使うと SSR を行えます。  
`getStaticProps` はビルド時に実行されます。これを使うと SSG を行えます。 v9.5 以降では、返り値に `revalidate` を指定することで ISR を行うことが出来ます。  
この辺は後にまとめた記事を書いてみようかなと思います。

以下の例はデータフェッチをしているわけではないですが、SSR と SSG の挙動の違いが確認できる簡単な例です。

```tsx
// SSR の場合
const Page: FC<Props> = ({ currentTime }) => <div>{currentTime}</div>

export const getServerSideProps = () => {
  const currentTime = new Date().toISOString()

  return {
    props: {
      currentTime,
    },
  }
}

export default Page
```

`getServerSideProps` を使うとリクエスト毎に実行されるため、ページのリロードをするとリロード時の時刻が表示されます。

```tsx
// SSG の場合
const Page: FC<Props> = ({ currentTime }) => <div>{currentTime}</div>

export const getStaticProps = () => {
  const currentTime = new Date().toISOString()

  return {
    props: {
      currentTime,
    },
  }
}

export default Page
```

`getStaticProps` を使うとビルド時に実行されるため、ページのリロードをしてもビルド時の時刻が表示され、時刻は更新されません。

こんな感じで柔軟性とそれぞれの責務が別れているので扱いやすいですね。  
今後 SSR を使いたい場面があった場合などに簡単に組み込めるのが良いなと思っています。(多分 ISR を選択すると思いますが)

※ちなみに CSR を行う場合は [swr](https://github.com/vercel/swr) を使うと良いです。この辺も色々(`getInitialProps` との関係性とか)書きたいのですが軸がブレていくので今回は触れません。

### まずは Next.js で開発するための土台を作る

Next.js は zero config に力を入れています。  
環境構築に面倒な bundler などの設定が不要です。基本的には Next.js に従って実装するのがベストだと思います。

`npx create-next-app` とすれば Next.js のアプリケーションを作成できます。  
[Github: zeit/next.js/example](https://github.com/vercel/next.js/tree/master/examples) のように様々な Example が用意されています。今回は勉強も兼ねているので Example を使わずに default で作成しました。

実行するとこんな感じのディレクトリが作成されます。

```
.
├── README.md
├── node_modules
├── package-lock.json
├── package.json
├── pages
│       ├── _app.js
│       ├── api
│       │       └── hello.js
│       └── index.js
├── public
│       ├── favicon.ico
│       └── vercel.svg
└── styles
          ├── Home.module.css
          └── globals.css
```

TypeScript 環境も `touch tsconfig.json` として空の tsconfig.json ファイルを作成し、 必要なパッケージをインストール(`yarn add --dev typescript @types/react @types/node`) 後に `yarn dev` を実行すれば 自動で tsconfig.json を構成してくれます。  
パッケージのインストールをしていない場合は `It looks like you're trying to use TypeScript but do not have the required package(s) installed.` のように警告してくれます。

> TypeScript strict mode is turned off by default. When you feel comfortable with TypeScript, it's recommended to turn it on in your tsconfig.json.

とあるように Next.js が構成する tsconfig.json では strict が false なので、 TypeScript に慣れている場合は `strict` を true にしておきましょう。

### lint 周りの設定

開発に linter は欠かせません。  
ブログ作成時は以下のような設定を行いました。  
基本的に recommended の設定を使っています。

```js
// .eslintrc.js

module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  ignorePatterns: ['node_modules/*', '.next/*', '.out/*', '!.prettierrc'],
  extends: ['eslint:recommended'],
  overrides: [
    // この cofnig は TypeScript ファイルのみに適用します
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      settings: { react: { version: 'detect' } },
      env: {
        browser: true,
        es2021: true,
        node: true,
      },
      extends: [
        // 先頭から順に適用されます。後者に prettier を追加し競合するルールをオフにします。
        'eslint:recommended', // ESLint recommended rules
        'plugin:@typescript-eslint/recommended', // TypeScript recommended rules
        'plugin:react/recommended', // React recommended rules
        'plugin:react-hooks/recommended', // React hooks recommended rules
        'plugin:jsx-a11y/recommended', // Accessibility recommended rules
        'plugin:prettier/recommended', // prettier recommended rules
        'prettier/@typescript-eslint', // turn off TypeScript ESLint style rules
        'prettier/react', // turn off React style rules
      ],
      rules: {
        'prettier/prettier': [
          'error',
          {},
          {
            usePrettierrc: true,
          },
        ],
        'react/prop-types': 'off', // TypeScript を使用するため Off
        'react/react-in-jsx-scope': 'off', // React の import が不要なため Off
        'jsx-a11y/anchor-is-valid': 'off', // Next.js の Link コンポーネントと互換性がないため Off
        '@typescript-eslint/no-unused-vars': ['error'],
        '@typescript-eslint/explicit-function-return-type': [
          'warn',
          {
            allowExpressions: true,
            allowConciseArrowFunctionExpressionsStartingWithVoid: true,
          },
        ],
      },
    },
  ],
}
```

```json
// .prettierrc

{
  "arrowParens": "avoid",
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

lint 周りの npm-scripts は以下のように設定しました。  
v9.1 から `src` ディレクトリのサポートが入ったため、 ESLint, prettier をかける対象を src 以下に絞れるのがちょっぴり嬉しいやつです。

```json
// package.json

{
  ...,
  "format": "prettier --check './src/**/*.{ts,tsx,json}'",
  "format:fix": "prettier --write './src/**/*.{ts,tsx,json}'",
  "lint": "eslint './src/**/*.{ts,tsx,json}'",
  "lint:fix": "eslint --fix './src/**/*.{ts,tsx,json}'",
  "typecheck": "tsc --project tsconfig.json --pretty --noEmit"
}
```

### styled-components を使うための設定

Next.js の Example に例があったのでそちらを参考にしました。  
[Example app with styled-components](https://github.com/vercel/next.js/tree/canary/examples/with-styled-components)

`_document.tsx` 内で styled-components から吐き出されるスタイルを Head Tag に埋め込みます。  
Next.js は Html Tag など基本的なマークアップは \_document で管理出来ます。\_document はサーバーサイドのみでレンダリングされるため、イベントハンドラなどは動作しません。  
[Next.js - custome-document](https://nextjs.org/docs/advanced-features/custom-document)

### dynamic routing の利用

v9 から dynamic routing がサポートされました。  
Next.js ではページに `[]` 角カッコを追加することで dynamic routing することが出来ます。  
当ブログでは記事一覧 `src/pages/posts/[slug].tsx` とタグによる記事検索画面 `src/pages/tags/[id].tsx` で利用しています。

SSG で事前に動的ルートのパスを静的にビルドする場合は `getStaticPaths` を使用すると可能です。  
返り値の `paths` に指定したパスを事前に生成します。 `params` の値はそのページ内で使用する名前と一致している必要があります。

```tsx
// pages/posts/[slug].tsx

const Post: FC<Props> = props => (...)

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { slug: '1' } },
      { params: { slug: '2' } },
    ],
    fallback: false,
  }
}

export default Post
```

上記のように記述すると、 Next.js はビルド時に `pages/posts/[slug].tsx` を利用して `posts/1` と `posts/2` を静的に生成します。

fallback に `false` を指定した場合、 `paths` に含まれないパスは 404 になります。これは新しいページを頻繁に追加しない場合に役立ちます。ただし、新しいページをレンダリングする場合は再度ビルドの実行が必要になります。
fallback に `true` を指定した場合、 `paths` に含まれるパスが事前にビルドされるのは一緒です。`paths` に含まれないパスにアクセスした際に 404 にならず最初のリクエスト時に静的に生成します。２度目以降のアクセスは事前レンダリングされたページ同様生成されたページが使われます。

上記のコード例で fallback を `true` にし、 `posts/3` にアクセスした場合、該当するページが生成可能であれば `posts/3` を表示し、そうでなければエラーになります。

新しいページは記事投稿時しか増えないため `false` を指定しています。

### markdown での入稿対応

当ブログでは、 [unified](https://github.com/unifiedjs/unified) エコシステムを使用しています。  
markdown -> html への変換には [remark](https://github.com/remarkjs/remark) , [rehype](https://github.com/rehypejs/rehype) を使用しています。

以下の図は unified の README に載っている図です。

![unified-readme-figure](/posts/build-blog-nextjs/unified-figure.png)

この parse -> run -> stringify のプロセスに乗せて markdown -> html への変換を行います。  
当ブログでは、  
`remark-parse`: markdown から mdast(markdown の AST)に変換  
`remark-slug`: heading に id を挿入(目次のリンク機能のため)  
`remark-rehype`: mdast から hast(html の AST)に変換  
`rehype-shiki`: shiki によるコードのハイライト  
`rehype-stringify`: hast から HTML へ変換  
のプロセスで処理を行っています。

```ts
const result = await unified()
  .use(remarkParse)
  .use(slug)
  .use(remarkRehype)
  .use(shiki, { theme: 'monokai' })
  .use(rehypeStringify)
  .process(markdown)
```

上記の図で言う parse の部分を `remark-parse` が相当。  
run の部分で id 付けとハイライトを行い、 stringify を `rehype-stringify` が行っています。

その他の content のスタイリングは CSS で行っていきます。  
この辺ライブラリに頼っているのですが、いずれ自分でも細工を行おうと考えています。  
目次の取得は AST に変換後に探索して取得を行っています。

## 躓いたポイント

ブログを作成する上で躓いた点を記載します。

### ダークモード theme の persist

ブログ作成当初はダークモードの対応も含めておこうと思っていました。実際にブログの theme color もダークモードを意識した配色でデザインしています。  
しかし、 styled-components を使うとどうも難しい事に気付き、結局対応を先延ばしにしました。  
単に dark theme に切り替えるだけであれば、 themeProvider を用意し、 context で配信するようにすれば難なく出来るのですが、モードを persist しようとすると難しくなります。  
persist 先を local storage に格納することを考えていたのですが、単に格納するだけだと SSG をしている兼ね合いでサーバ側とクライアント側で参照する className が異なり、スタイルの適用が出来ません。

例えば、デフォルトのモードが light で、クライアント側でモードを dark にしてページを再取得した場合、  
サーバ側で生成されたページは light のスタイルが適用されているので light が適用された html が返されるが、クライアント側は dark のスタイルを参照するためスタイルが適用できないという動きになる。(っぽい？)

これに関しては方針は何となく決まっているので後ほど対応しようと思います。

### markdown 入稿の手順

上でサクッと書いていますが、実装当時はめちゃくちゃ悩みました。  
そもそも markdown から html に変換する方法を知らなかったためです。。  
Gatsby であれば豊富な Plugin からサクッと実装できそうだったので何度か乗り換えようかなと思ってしまいました。しかし、 Gatsby で出来るならと Gatsby の Plugin 周りを読み漁り、 remark と rehype について漁り、なんとか実装することが出来ました。

mdx で書きたくなったら [msx-js/mdx](https://github.com/mdx-js/mdx) を使ってみようかなという感じです。

### 各記事の static file の管理

markdown ファイルを `src/contents/` 以下に記事毎にディレクトリを作成して、static file をまとめようと思ったのですが出来ず。。(public 以下であれば serve してくれるのですが、そのディレクトリ以下は serve されていないのでファイルが見つからないのはそれはそうって感じでした)  
v9.1 から `public` directory のサポートが入り、 public 以下に配置したファイルはアプリケーションのルートにマウントされるようになりました。  
public 以下に contents を作って管理することも出来るのですが、そうすると不要な markdown も配信されるため辞めました。

現状は `src/contents/` 以下に markdown、 public 以下に contents と同じ構成で static file を管理するようにしています。  
記事投稿時の運用でカバーしているのでなんとかしたいと思っています。

## Todo

今後対応していく内容も、その中で得た知見を記事にしていきたいと思います。

### スマホ向けのメニュー追加

ブログ作成時点ではスマホでサイトを閲覧した場合のタグや目次の選択をサポートしていません。
この辺 UI/UX 的にも良くないので近いうちに対応しようと思っています。

### style の統一・修正

Next.js を使っているうえで css 周りの実装が一番悩みました。(ベストな方法がちょっと分かりづらい。。。)  
[[Docs] Recommend CSS Modules over css-in-js](https://github.com/vercel/next.js/issues/15542)  
現状は、 reset.css や base.css を global style sheet として読み込み、各コンポーネントは styled-components を使用しています。  
Next.js の最適化の観点から CSS modules に乗り換えていこうかなと思っています。  
また、ダークモード対応も含めようと思います。

### code title の取得

pre Tag のファイル名を取得して表示できるようにしたいと思っています。  
現状だとコメント表記でファイル名を記載しているのですが、コントラスト比も悪いし見辛いので。

### AMP 対応

技術的にやっておきたい対応なのでやってみたいと思います。

### highlighter のコントラスト比対応

本ブログでは、 markdown の highlighter に shiki を使っています。  
shiki の theme にもよると思いますが、 pre Tag の背景色と文字色のコントラスト比の影響で lighthouse の a11y が下がってしまいます。  
この辺も近いうちに上手く対応できたらなと思っています。

### 全文検索

現状優先度は低いですが、 記事が増えた際に検索が出来ると便利だなと思うのでいずれやります。  
Algolia を使う想定です。

### パフォーマンスの維持

ブログ作成初期から lighthouse の高得点を意識して実装していました。  
記事投稿前ですが、これを維持していくことも目標にしていきます。(上にも書きましたが、記事のページでは a11y が下がります。。)

![first-lighthouse](/posts/build-blog-nextjs/first-lighthouse.png)
