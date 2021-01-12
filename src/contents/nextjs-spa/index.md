---
title: 'Next.js の zero-config の恩恵を受けて SPA を作る'
tag: nextjs
isProtect: false
create: '2021-01-12T23:30:00+09:00'
---

Next.js の zero-config の恩恵を受けながら SPA だけのアプリケーション作成できないかなと試行錯誤し、あーこれでいけるんだとなった備忘録です。  
SSG や SSR を使わなければ Cloudfront + S3 のような構成で静的サイトホスティングも出来るので、サクッと開発したい時に便利だなと思いました。

## TL;DR

- Static HTML Export を使って静的 HTML を吐き出す
- ルーティングライブラリを使って `pages/index.js` 内でルーティングを行えるようにする
- サーバー側での pre-render を抑制する

## なぜ Next.js を使うのか

Dynamic import を使うことでバンドルを分割でき、これにより、大規模な SPA に関連するパフォーマンスの問題の１つを解決できるためです。  
また、これが zero-config によって複雑な設定をしなくて済むのがでかいです。

API Routes や SSG, SSR などの機能もありますが、今回は単純な Web サーバの上で SPA を動かすことを考えます。

## ルーティングライブラリを使って SPA にする

まずはルーティングに必要なライブラリを追加します。

```shell
$ yarn add react-router-dom
```

React router を使用する理由は、全てのネストされたルートをフラット化するためです。

※ `react-router` と `react-router-dom` の違いについて  
`react-router` は React router のコアであり、ブラウザで使用するために wrap したものが `react-router-dom` です。  
`BrowserRouter`, `HashRouter`, `Link`, `LinkNav` コンポーネントが `react-router` を wrap した形で追加で実装されています。  
[FYI: react-router/packages/react-router-dom/modules](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-dom/modules)

## サーバー側での pre-render を抑制する

React Router を入れた状態で `pages/index.js` を以下のように修正してみます。

```jsx
// pages/index.js
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

export default function App() {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/hoge">Hoge Page</Link>
          </li>
        </ul>

        <Switch>
          <Route path="/hoge">
            <h2>This is hoge page.</h2>
          </Route>
          <Route path="/">
            <h2>This is Home page</h2>
          </Route>
        </Switch>
      </div>
    </Router>
  )
}
```

これで `yarn dev` を実行してページを開いてみると以下のエラーが吐き出されます。

`Error: Invariant failed: Browser history needs a DOM`

これは、Next.js が開発モードで開発サーバー上のページを事前にレンダリングしようとするために発生します。  
React Router は、ブラウザによって提供されるグローバルの `windows` オブジェクトへのアクセスを必要とします。しかし、サーバー環境では `windows` は利用不可であるため、このようなエラーが吐き出されます。

これを解決するために `_app.js` でサーバーでの pre-render を抑制します。

```jsx
// _pages/_app.js

const App = ({ Component, pageProps }) => {
  return <div>{typeof window === 'undefined' ? null : <Component {...pageProps} />}</div>
}

export default App
```

サーバー側では `null` を返す事でレンダリングを行わないようにします。これで先程のエラーは解消することができます。  
ただ、サーバーのレンダリング結果とクライアントのレンダリング結果が異なることになるため、コンソール上に以下のようなエラーが表示されます。

`Expected server HTML to contain a matching <div> in <div>.`

流れは以下のようになっています。

1. サーバー上で pre-render が行われる
2. pre-render 結果をブラウザに返信
3. ブラウザで re-hydrate が行われる

re-hydrate 時にはブラウザでレンダリングが行われた結果がサーバーでレンダリングされたバージョンと同じかを比較しています。  
一致しない場合に React が上記エラーを吐き出します。

このエラーを抑制するために `suppressHydrationWarning` というものが React に用意されています。

> If you use server-side React rendering, normally there is a warning when the server and the client render different content. However, in some rare cases, it is very hard or impossible to guarantee an exact match. For example, timestamps are expected to differ on the server and on the client.

[引用 - React DOM Elements#suppressHydrationWarning](https://reactjs.org/docs/dom-elements.html#suppresshydrationwarning)

意図的にサーバー側で `null` を返しているため、今回は `suppressHydrationWarning` を使う事でこの警告を無視します。

`pages/_app.js` を以下のように変更します。

```jsx
// _pages/_app.js

const App = ({ Component, pageProps }) => {
  return (
    // この div で suppressHydrationWarning を true に設定
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : <Component {...pageProps} />}
    </div>
  )
}

export default App
```

ここまでで一旦アプリを動かせる状態になります。

## rewrites で全てのパスを pages/index.js にリダイレクトする

このままだと、 React Router と Next Router が相互作用してしまいます。

試しに `/about` ページを表示後にリロードを行うと `404 Not Found` になります。  
これは、ページが再読込されることで Next.js は `pages/about` を読み込もうとします。 `pages/about.js` は実装していないため、 Not Found になるというわけです。

この問題を解決するには `next.config.js` で [rewrites](https://nextjs.org/docs/api-reference/next.config.js/rewrites) を記述することで解決できます。  
※ `rewrites` は Next.js v9.5 以上が必要です。

`rewrites` は指定のソース URL を宛先 URL にマッピングすることが可能になります。

ルートディレクトリに `next.config.js` ファイルを用意し、以下の記述を加えます。

```js
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/:any*',
        destination: '/',
      },
    ]
  },
}
```

`rewrites` の各プロパティには、 Path Matching, Wildcard, Regex の使用が可能です。  
上記のように記述することで、全てのルートを `pages/index.js` にマップする事が出来ます。

`next.config.js` を作成後、再度 `/about` ページを表示してリロードを行ってみると、正常に `/about` ページが表示されることが確認できます。

`rewrites` はソース URL に該当するファイルが存在する場合、このルールを無視します。  
なので、この状態で、 `pages/about.js` を実装すると、 `/about` へ遷移した際には `pages/about` が読み込まれます。（すごい！）

また、 Next.js の利点の１つである SSR, SSG をページ単位で選択できることにも対応しています。  
上記の `rewrites` の設定で、後に SSR のページを追加した場合、そのページは SSR でレンダリングされたページとして動作します。（※このページへのリンクは `next/link` の `Link` コンポーネントを使用する必要があります。）

### deploy 先では別途リダイレクトルールの設定が必要

後は、 Static HTML Export によって吐き出された静的ファイルを Web サーバーに deploy すれば OK です。  
しかし、Static HTML Export 時には `rewrites` は適用されません。  
[FYI - next export No Custom Routes](https://github.com/vercel/next.js/blob/master/errors/export-no-custom-routes.md)

そのため、 deploy 先に設定によってはリダイレクトルールを設定する必要が出てきます。  
今回は AWS 環境に deploy する場合の手順を例として記載しておきます。構成は cloudfront + s3 での単純な構成で行います。

1. S3 にバケットを作成
2. 作成したバケットに静的ファイルをアップロード  
   `next build` -> `next export` -> `aws s3 sync ./out s3://{bucketName}`
3. バケットプロパティで静的ウェブサイトホスティングを有効にする  
   インデックスドキュメント、エラードキュメントを `index.html` に設定
4. 作成した s3 バケットを Origin とする cloudfront distribution を作成  
   Restric Bucket Access を Yes  
   OAI を作成  
   Grant Read Permissions on Bucket を Yes(バケットポリシーを更新してくれる)
5. cloudfront にカスタムエラーレスポンスを設定  
   index.html 以外のファイルパスは 403 になるため、HTTP Error Code: 403、 Response Page Path: / として設定

こうすることで aws で Next.js で作成した SPA を動かすことが出来ます。

## まとめ

Next.js は凄く便利で、SPA も Next.js の恩恵を受けながら開発したいと思っていましたが、簡単な設定をするだけで使うことが出来ました。  
よくあるブラウザのストレージにトークンを保存してルーティングを制御するなども問題なく出来ました。

サンプルで作成したソースコードは [こちら](https://github.com/hey3/nextjs-spa-sample) です。

Static HTML Export を使用する際には他にも注意しておく事柄があります。  
[Static HTML Export#caveats](https://nextjs.org/docs/advanced-features/static-html-export#caveats) に目を通しておくと良いと思います。
