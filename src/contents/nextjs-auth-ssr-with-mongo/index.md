---
title: 'Next.js で認証機能を実装する'
tag: nextjs
isProtect: true
create: '2020-12-17T02:45:00+09:00'
---

Next.js を使用してログインが必要なページを実装したいなと思ったときに意外と手こずったので備忘録として書いてみます。  
あまり記事がみつからなかったのもあり、原理から理解して実装してみました。(※正しくない内容が含まれているかもしれません。)

## どんなことがしたいか

簡単に言うと管理画面のようなイメージです。  
アカウントを持つユーザのみが閲覧できるページを Next.js で実装してみたかったのです。  
作成したリポジトリは [こちら](https://github.com/hey3/nextjs-sample-auth) です。

[next-auth](https://github.com/nextauthjs/next-auth) や firebase authentication を使っても良いのですが、理解を深めるために自分でやってみようと思った次第です。。  
他の provider を使うとなったらこの辺検討し始めようかなといった感じです。

## 技術スタック

- Next.js: `10.0.3`
- TypeScript: `4.1.2`
- React: `17.0.1`
- mongoDB:  `4.7.0`
- typegoose: `7.4.5`
- jsonwebtoken: `8.5.1`
- js-cookie: `2.2.1`

## 認証が必要なページには SSR が必要そう

これを実現するためにはどんな手順になるのかを考えてみました。  
認証が必要なページとは、サーバーへページをリクエストする際にリクエストしたアカウントが認証済みかどうかを判断し、認証済みであればページを返してもらうみたいな流れが必要になります。  
昨今の Next.js では SSG を推している（CDN から提供出来て早いため）が、 SSG では build 時にページを静的に生成しており、リクエスト時にサーバへ `IncomingMessage` を送ることが出来ず、認証情報をサーバへ送ることが出来ません。  
html を貰う前に認証で弾くみたいな仕組みが必要なので、 SSR でやっていく必要があるのかなと思っています。

DOM の mount 時に API でデータ取得時に認証して弾くようにすると、既に DOM が見えてしまっているので良くないです。

### SSR を理解する

Next.js の公式の画像がわかりやすいので引用させて頂きます。  
[引用 - Two Forms of Pre-rendering](https://nextjs.org/learn/basics/data-fetching/two-forms)

![static-generation](https://nextjs.org/static/images/learn/data-fetching/static-generation.png)

SSG も合わせて見直しておきます。  
SSG は build-time にページ HTML をレンダリングしています。  
`getStaticProps` を使った場合に、この関数がサーバ側で実行されビルドされます。

`getStaticProps` が受け取る context は、

```ts
export type GetStaticPropsContext<Q extends ParsedUrlQuery = ParsedUrlQuery> = {
  params?: Q
  preview?: boolean
  previewData?: any
  locale?: string
  locales?: string[]
  defaultLocale?: string
}
```

です。  
これを見てもわかるように、 `IncomingMessage` が使えないのがわかります。

![server-side-rendering](https://nextjs.org/static/images/learn/data-fetching/server-side-rendering.png)

SSR は各リクエスト毎にページ HTML をレンダリングしています。  
`getServerSideProps` を使った場合に、この関数がサーバ側で実行されビルドされます。

`getServerSideProps` が受け取る context は、

```ts
export type GetServerSidePropsContext<Q extends ParsedUrlQuery = ParsedUrlQuery> = {
  req: IncomingMessage
  res: ServerResponse
  params?: Q
  query: ParsedUrlQuery
  preview?: boolean
  previewData?: any
  resolvedUrl: string
  locale?: string
  locales?: string[]
  defaultLocale?: string
}
```

です。

`getServerSideProps` では `IncomingMessage` を使うことが出来、  
この中のヘッダ情報を使うことで認証を行うことが出来そうだと思いやってみたのが今回の実装です。

### getServerSideProps の中で verify を行う

おおまかな流れは以下です。

- ログイン時に jwt を生成する
- jwt を cookie に保存する
- `getServerSideProps` 内で jwt の verify を行うヘルパ関数を用意し、認証が必要なページで使う

cookie に保存するのでそれなりのセキュリティ対策は必要だと思うのですが、サンプルの実装で担保出来ているのかは正直自身が無いです。（レビューして欲しい。。。）

サンプルでは簡略のため API Routes を使用して API を実装し、アカウントの保存には mongoDB を使用しています。  
mongoDB には [Paas-sword](https://paassword.now.sh/) で生成した passwordId を保存します。  
[この辺り - src/pages/api/authenticate.ts](https://github.com/hey3/nextjs-sample-auth/blob/main/src/pages/api/authenticate.ts) の実装になります。

## 実装してみる

実際の実装の流れを記述していきます。

### サーバー側で jwt を発行する

ログイン時に jwt を生成します。

```ts
const AuthService = {
  // ...
  async sign(payload: SignPayload): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, process.env.SECRET || 'secret', { expiresIn: '1d' }, (err, token) => {
        if (err) {
          return reject(err)
        }
        return resolve(token)
      })
    })
  },
}
```

のようなメソッドを用意しておいて、ログイン時に以下のような流れで使用します。  
※SECRET 環境変数をクライアント側の js bundle に含まないように注意

```ts
export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'POST') {
    return res.status(405).end(`Method ${req.method} is not allowed.`)
  }
  await DatabaseService.connect()

  const { email } = req.body
  const user = await User.findOne({ email })

  const token = await AuthService.sign({
    id: user._id,
  })
}
```

`sign` の payload には mongoDB に登録した users ドキュメントの ObjectId を渡します。  
jwt は base64 でエンコードされているだけなので、あまり重要なデータを入れてはいけません。

受け取った jwt を Cookie に保存しておきます。  
サンプルでは [js-cookie](https://github.com/js-cookie/js-cookie) を使ってクライアント側で保存しています。  
[nookies](https://github.com/maticzav/nookies) を使って cookie の扱いをクライアントとサーバで共通にしてもよかったのかなとは思ったのですが、今回は使っていません。

### getServerSideProps と各 API で jwt を使った Auth を行う

認証が必要なページの `getServerSideProps` 内で jwt の verify を行うヘルパ関数を用意しておきます。  
認証が必要なページを実装する際には、このヘルパ関数で wrap してあげるだけでよいので楽になります。

```ts
type InnerGetServerSideProps<P extends { [key: string]: unknown }> = (
  context: GetServerSidePropsContext
) => Promise<{ props: P }>

export const withAuth = <P extends { [key: string]: unknown }>(
  inner?: InnerGetServerSideProps<P>
): GetServerSideProps => {
  return async ctx => {
    const {
      req: { headers },
      res,
    } = ctx
    const isAuthenticated = await validateTokenCookie(headers)
    if (!isAuthenticated) {
      res.setHeader('Location', '/login')
      res.statusCode = 307
    }

    return inner ? inner(ctx) : { props: {} }
  }
}
```

`validateTokenCookie()` では headers から cookie -> jwt を取り出し `jsonwebtoken` の [verify 関数を使用して verify をしています](https://github.com/hey3/nextjs-sample-auth/blob/main/src/services/auth.ts#L47) 。

認証が必要なページの実装側で

```ts
export const getServerSideProps: GetServerSideProps = withAuth()
```

みたいにしてやれば OK です。

認証に加えて SSR でレンダリング時にデータの取得を行いたい場合は、

```ts
export const getServerSideProps: GetServerSideProps = withAuth(async () => {
  const response = await fetch('/hoge').then(res => res.json())

  return {
    props: {
      hoge: response.hoge,
    },
  }
})
```

みたいな感じで withAuth の中で普段どおりの実装を行うことで可能になるようにしています。

API には data fetch 時に Authorization ヘッダに載せてあげるようにすると良いと思います。

```ts
const response = await fetch('/fuga', {
  // ...
  headers: {
    Authorization: Cookies.get('クッキーに保存したトークン'),
  },
})
```

## まとめ

SSR の場合の認証周りの知見が少なかったので、発想が思いつくまで結構苦労しました。。  
今回の実装の懸念点としては、毎回 verify を噛ましているのでパフォーマンスの観点ではどうなのかなとも思っています。  
しょうがないのかなとも思いつつ、、良い方法がありましたら DM にて教えて頂けると嬉しいです。
