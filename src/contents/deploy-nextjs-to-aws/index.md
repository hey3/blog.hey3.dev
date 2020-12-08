---
title: 'Serverless Next.js Component が AWS に deploy するのに超便利だった'
tag: next.js, aws
isProtect: false
create: '2020-12-08T01:00:00+09:00'
update: '2020-12-08T12:00:00+09:00'
---

Next.js で作成したアプリケーションを AWS にデプロイする際に、 `Serverless Next.js Component` を使うと超絶楽ちんだったのでデプロイまでの手順を試す + α を記事にまとめます。

## Serverless Next.js Component とは

[Serverless Next.js Component](https://github.com/serverless-nextjs/serverless-next.js) は、 [Serverless framework](https://www.serverless.com/) の関連機能の Serverless Component の１つです。  
Serverless Component とは、

> Serverless Components are simple abstractions that enable developers to deploy serverless applications and use-cases easily, via the Serverless Framework.

とあるように Serverless Framework という仕組みを通じてユースケースを意識した Serverless Application をデプロイできるというものです。  
今回利用する Serverless Next.js Component は、 Next.js をサーバーレスにいい感じにデプロイしてくれる Serverless Component です。

Next.js 同様に Zero-config を標榜しており、デプロイするだけであれば `serverless.yml` を作成し、２行書くだけで使えます。(簡単！)

Serverless Next.js Component の特徴は、 Next.js の SSR を Lambda@Edge で実現してくれるというものです。  
AWS の CDN である CloudFront のエッジサーバ上で稼働する Lambda@Edge を利用します。また、静的なアセットや静的ファイルとして生成されたものは S3 でホスティングするようにデプロイされ、CloudFront を使って配信されるようになります。  
Lambda@Edge で 静的ページへのリクエストをハンドリングし、SSR しないリクエストは S3 へフォワードしてくれます。 Dynamic Routing にも対応しています。  
この辺自力で実装しようとするとかなり大変なので、それを Zero-config で扱えるのはかなり良いなと思います。

最近、 web アプリケーションの開発は Next.js 一択だと個人的に思っているのですが、サーバーレスで使う場合には Serverless Next.js Component が現時点で一択かなとも思っています。

## 簡単な確認用のアプリケーションを用意する

今回は簡単に、SSR, SSG, CSR を使った画面を用意して、デプロイ後に期待動作をしてくれるかを確認するアプリケーションを作成しました。  
ソースコードは [こちら](https://github.com/hey3/serverless-nextjs-sample) にあります。

### SSG を使ったページ

SSG を行うページでは以下の項目を確認します。

- 静的生成されたページは S3 に保存されているのか
- ビルド時に生成された値を返しているのか

実際のコードは以下です。

```tsx
type Props = {
  currentTime: string
}

const Ssg: FC<Props> = ({ currentTime }) => {
  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.description}>
          SSG だとビルド時にレンダリングされているため時刻が変わらない
        </h1>
        <div className={styles.time}>{currentTime}</div>
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const currentTime = new Date().toISOString()

  return {
    props: {
      currentTime,
    },
  }
}

export default Ssg
```

わかりやすいようにレンダリングされた時刻を表示するようなページとしています。

### SSR を使ったページ

SSR を行うページでは以下の項目を確認します。

- S3 に当該ページは保存されない
- リクエスト毎にレンダリングがされるのか

実際のコードは以下です。

```tsx
type Props = {
  currentTime: string
}

const Ssr: FC<Props> = ({ currentTime }) => {
  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.description}>
          SSR はリクエスト時にレンダリングされるためアクセスする度に時刻が変わる
        </h1>
        <div className={styles.time}>{currentTime}</div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const currentTime = new Date().toISOString()

  return {
    props: {
      currentTime,
    },
  }
}

export default Ssr
```

SSG のページとの違いは `getStaticProps` -> `getServerSideProps` としている点のみです。

### CSR を使ったページ

CSR を行うページでは以下の項目を確認します。

- 生成されたページが S3 に保存される
- Data fetch が期待動作となる

実際のコードは以下です。

```tsx
const Csr: FC = () => {
  return (
    <Layout>
      <div className={styles.container}>
        <DogImage />
      </div>
    </Layout>
  )
}

const DogImage: FC = () => {
  const { data, error } = useSWR('https://dog.ceo/api/breeds/image/random', (url: string) =>
    fetch(url).then(res => res.json())
  )

  if (error) {
    return <div>fetch error</div>
  }
  if (!data) {
    return <div>loading...</div>
  }
  return <img src={data.message} alt={data.message} />
}

export default Csr
```

確認用なので雑なコードです。。  
データフェッチ用のライブラリには [SWR](https://github.com/vercel/swr) を使用しています。  
また、[こちら](https://dog.ceo/dog-api/documentation/random) の public API を使用しています。

ページにアクセスした際にランダムな犬の画像を取得し、レンダリングを行います。

### Next.js の API route を使ったページ

こちらも CSR なのですが、 Next.js の API Routes を使った場合も用意しておきます。

実際のコードは以下です。

```tsx
const NextApi: FC = () => {
  return (
    <Layout>
      <div className={styles.container}>
        <Name />
      </div>
    </Layout>
  )
}

const Name: FC = () => {
  const { data, error } = useSWR('/api/hello', (url: string) => fetch(url).then(res => res.json()))

  if (error) {
    return <div>fetch error</div>
  }
  if (!data) {
    return <div>loading...</div>
  }
  return <div>{data.name}</div>
}

export default NextApi
```

API のコードは `create-next-app` したものを ts にしただけです。

```tsx
export default (_: NextApiRequest, res: NextApiResponse): void => {
  res.status(200).json({ name: 'John Doe' })
}
```

## デプロイしてみる

ドキュメントでは、グローバルにインストールした `serverless` を使っていますが、今回はローカルにインストールした場合の構成でやっています。  
公式には稀と書かれていますが、こちらの方が何かと利便性があるなと個人的には思っています。

公式ドキュメントの記述

> In uncommon scenarios, you can also point it to a local installation.

### ローカルに serverless をインストールする

以下のライブラリをインストールします。

```shell
$ yarn add -D serverless @sls-next/serverless-component
```

ここで注意が必要なのは、 `@sls-next/serverless-component` を常に最新のバージョンを使うようにしてください。  
Serverless Next.js Component は開発頻度も早く、破壊的変更も含まれてくるため、古いバージョンを使っていると簡単に動かなくなるためです。  
ローカルにインストールする場合は、[Dependabot](https://dependabot.com/) や [Renovate](https://www.whitesourcesoftware.com/free-developer-tools/renovate) などのツールを併用すると良いと思います。

### serverless.yml ファイルを用意する

ライブラリのインストール後、 Next.js アプリのルートディレクトリに `serverless.yml` ファイルを作成します。  
公式の例は以下です。（執筆時の最新版は v1.18.0）

```yaml
myNextApplication:
  component: '@sls-next/serverless-component@1.18.0'
```

※ `myNextApplication` の部分は任意の名前で大丈夫です。

今回はローカルにインストールした Serverless Next.js Component を参照するため以下のように記述しています。

```yaml
serverlessNextjsSample:
  component: './node_modules/@sls-next/serverless-component'
```

### serverless コマンドでデプロイを行う

`serverless.yml` を作成したら、以下のコマンドでデプロイ可能です。  
事前に [AWS profile の設定](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-profiles.html) をしておくと楽です。

```shell
$ yarn serverless
```

zero-config を標榜しているだけ合って簡単ですね！  
また、 CloudFormation ベースでのデプロイではないため、デプロイ処理も早いです。  
注意としては、初回実行時に CloudFront のディストリビューションを伴うため、有効までに少し時間がかかります。

実行すると以下のようなログが吐かれます。

```
serverlessNextjsSample:
    appUrl:              https://<XXXXXXXXXXXXX>.cloudfront.net
    bucketName:   XXXXXXXXXXXXX
    distributionId:  XXXXXXXXXXXXX

68s › serverlessNextjsSample › done
```

appUrl にアクセスするとちゃんとデプロイ出来ている事がわかります。

![deployed-web-screen](/posts/deploy-nextjs-to-aws/deployed-web-screen.png)

（SSR, SSG, CSR も問題なし）

### 作成されたリソース

serverless コマンドでデプロイ後に作成されたリソースを確認してみます。

#### S3

以下の構成のバケットが作成されます。  
静的アセットファイルや静的 Web サイトの配信に使用されるファイルなどが格納されています。

![S3](/posts/deploy-nextjs-to-aws/s3.png)

#### CloudFront

以下のようなディストリビューションが作成されます。  
※serverless コマンドでデプロイすると毎度 invalidation が実行され、 cache がパージされます。

![cloudfront-distribution](/posts/deploy-nextjs-to-aws/cloudfront.png)

Behaviors は以下のようになっています。  
Origin が S3 に設定されています。また、Origin Access Identity（OAI）も設定され、 Cloudfront 経由のリクエストのみに制限されるようにもなっています。

![cloudfront-behaviors](/posts/deploy-nextjs-to-aws/croudfront-behaviors.png)

Next.js をビルドした際に生成されるディレクトリやパスを基にリクエストの振り分けが行われていることがわかります。  
もう少し掘り下げてみると、静的ファイルが保存される `_next/static/*` , `static/*` はそのまま S3 にフォワードされ、 `api/*` は api 用の Lambda@Edge にフォワードされ、 `_next/data/*` と `Default (*)` は SSR 用の Lambda@Edge にフォワードされます。  
また、 Lambda@Edge にフォワードされるものは Origin Request のみ Lambda@Edge で処理がされるようになっています。（キャッシュからレスポンスする場合は実行されない）

#### Lambda@Edge

以下のような２つの Lambda 関数が作成されます。  
すべての API ルートに１つの Lambda, すべてのページルートに１つの Lambda が作成されます。

※ Lambda@Edge は us-east-1 のみ使用可能なので、コンソールで確認出来ない場合はリージョンを確認してみると良いです。また、ログは CloudFront の処理が行われたエッジサーバがあるリージョンでの確認になります。

![Lambda](/posts/deploy-nextjs-to-aws/lambda.png)

#### IAM

以下の IAM ロールが作成されます。

- AWSServiceRoleForLambdaReplicator
- AWSServiceRoleForCloudFrontLogger
- Lambda@Edge に付与されるロール(x2)

## マルチステージにデプロイ可能にする

実務で使うとなると dev や prod などのマルチステージを用意して開発すると思います。  
この辺も簡単に設定出来たのでやってみました。今回は `staging` と `prod` 環境それぞれにインスタンスを作成します。

### ライブラリのインストール

マルチステージに対応するために以下のライブラリをインストールします。

```shell
$ yarn add -D dotenv @serverless/core @serverless/template
```

### 必要なファイルを作成する

#### serverless.js を作成する

まずは `serverless.js` を作成し、 serverless コマンドの拡張を行います。  
以下のように実装しています。

```js
const { Component } = require('@serverless/core')

const validEnvs = ['staging', 'prod']

class Deploy extends Component {
  async default(inputs = {}) {
    const { stage } = inputs
    if (validEnvs.includes(stage)) {
      require('dotenv').config({ path: `${__dirname}/env-${stage}` })

      const template = await this.load('@serverless/template', stage)
      return await template({ template: 'serverless.yml' })
    } else {
      this.context.log('No environment defined... Choices are staging and prod')
    }
  }

  async remove(inputs = {}) {
    const { stage } = inputs
    if (validEnvs.includes(stage)) {
      const template = await this.load('@serverless/template', stage)
      return await template.remove()
    }
  }
}

module.exports = Deploy
```

[@serverless/template](https://github.com/serverless/template) を使用して実現しています。

#### env ファイルを作成する

次に dotenv が参照する env ファイルを作成します。  
serverless.yml が読み込む環境変数をここに記述していきます。

```
// env-staging
BUCKET_NAME='XXXXXXXXXXXXX-staging'
API_LAMBDA_NAME='XXXXXXXXXX-staging'
DEFAULT_LAMBDA_NAME='XXXXXXXXXXXXXX-staging'

// env-prod
BUCKET_NAME='XXXXXXXXXXXXX-prod'
API_LAMBDA_NAME='XXXXXXXXXX-prod'
DEFAULT_LAMBDA_NAME='XXXXXXXXXXXXXX-prod'
```

#### serverless.yml で環境変数を読み込む

今回はわかりやすいように `serverless.yml` を以下のように変更しています。（OAI が設定される事もあり自分で名前を付けていますが、あまり自分で名前を付けないほうが良いかも）  
環境に応じてサブドメインを変えるなんかも簡単ですね。

```yaml
serverlessNextjsSample:
  component: './node_modules/@sls-next/serverless-component'
  inputs:
    bucketName: ${env.BUCKET_NAME}
    name:
      defaultLambda: ${env.DEFAULT_LAMBDA_NAME}
      apiLambda: ${env.API_LAMBDA_NAME}
```

#### 各環境用の npm scripts を用意しておく

以下のような npm scripts を用意しておきます。

```
"deploy:staging": "serverless --stage=staging",
"deploy:prod": "serverless --stage=prod",
"remove:staging": "serverless remove --stage=staging",
"remove:prod": "serverless remove --stage=prod",
```

### マルチステージにデプロイしてみる

まずは staging 環境にデプロイしてみます。

```shell
$ yarn deploy:staging
```

S3 バケット

![S3-staging](/posts/deploy-nextjs-to-aws/s3-staging.png)

Lambda 関数

![Lambda-staging](/posts/deploy-nextjs-to-aws/lambda-staging.png)

staging 用のリソースが作成されました。  
次に prod 環境にデプロイしてみます。

```shell
$ yarn deploy:prod
```

S3 バケット

![S3-prod](/posts/deploy-nextjs-to-aws/s3-prod.png)

Lambda 関数

![Lambda-prod](/posts/deploy-nextjs-to-aws/lambda-prod.png)

CloudFront も確認してみると、それぞれの環境が作成できていることを確認出来ます。

![CloudFront-multi-staging](/posts/deploy-nextjs-to-aws/cloudfront-multi-staging.png)

## Github Actions でデプロイを行う

マルチステージの対応も出来たので、 Github Actions を使用して CI/CD でデプロイまでしてみます。

### CI/CD 用の IAM ユーザーを用意する

以下のコマンドで CI/CD 用の IAM ユーザーを作成し、アクセスキーを取得します。（awscli がインストールされている必要があります）  
GUI からでももちろん OK です

```shell
$ aws iam create-user --user-name XXXXXXXX
$ aws iam create-access-key --user-name XXXXXXXX
```

取得した `AccessKeyId` と　`SecretAccessKey`　を Github Actions の Secrets に設定しておきます。

また、作成した IAM ユーザーにデプロイに必要な以下の Actions を許可します。[参考 - AWS Permissions for deployment](https://github.com/serverless-nextjs/serverless-next.js/blob/master/README.md#aws-permissions-for-deployment)  
ドキュメントに書かれている Actions と別に今回 `iam:PutRolePolicy` が必要でした。


```
"acm:DescribeCertificate", // only for custom domains
"acm:ListCertificates",    // only for custom domains
"acm:RequestCertificate",  // only for custom domains
"cloudfront:CreateCloudFrontOriginAccessIdentity",
"cloudfront:CreateDistribution",
"cloudfront:CreateInvalidation",
"cloudfront:GetDistribution",
"cloudfront:GetDistributionConfig",
"cloudfront:ListCloudFrontOriginAccessIdentities",
"cloudfront:ListDistributions",
"cloudfront:ListDistributionsByLambdaFunction",
"cloudfront:ListDistributionsByWebACLId",
"cloudfront:ListFieldLevelEncryptionConfigs",
"cloudfront:ListFieldLevelEncryptionProfiles",
"cloudfront:ListInvalidations",
"cloudfront:ListPublicKeys",
"cloudfront:ListStreamingDistributions",
"cloudfront:UpdateDistribution",
"iam:AttachRolePolicy",
"iam:PutRolePolicy",
"iam:CreateRole",
"iam:CreateServiceLinkedRole",
"iam:GetRole",
"iam:PassRole",
"lambda:CreateFunction",
"lambda:EnableReplication",
"lambda:DeleteFunction",            // only for custom domains
"lambda:GetFunction",
"lambda:GetFunctionConfiguration",
"lambda:PublishVersion",
"lambda:UpdateFunctionCode",
"lambda:UpdateFunctionConfiguration",
"route53:ChangeResourceRecordSets", // only for custom domains
"route53:ListHostedZonesByName",
"route53:ListResourceRecordSets",   // only for custom domains
"s3:CreateBucket",
"s3:GetAccelerateConfiguration",
"s3:GetObject",                     // only if persisting state to S3 for CI/CD
"s3:HeadBucket",
"s3:ListBucket",
"s3:PutAccelerateConfiguration",
"s3:PutBucketPolicy",
"s3:PutObject"
```

### ワークフローファイルを作成する

例として以下のようなワークフローを用意します。  
staging ブランチにマージされると、 staging 環境にデプロイを行うようにしています。

```yaml
name: staging

on:
  push:
    branches: ['staging']

env:
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  AWS_DEFAULT_REGION: ap-northeast-1

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [12.x]

    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node-version }}
      - name: Cache node modules
        uses: actions/cache@v2
        env:
          cache-name: cache-node-modules
        with:
          path: ~/.cache/yarn
          key: ${{ runner.os }}-build-${{ env.cache-name }}-${{ hashFiles('**/yarn.lock') }}
          restore-keys: |
            ${{ runner.os }}-build-${{ env.cache-name }}-
            ${{ runner.os }}-build-
            ${{ runner.os }}-
      - name: npm install
        run: yarn
      - name: run typecheck
        run: yarn typecheck
      - name: run eslint
        run: yarn lint
      - name: run prettier
        run: yarn format
      - name: deploy to staging
        run: yarn deploy:staging
```

実際に Github Actions 上でデプロイが行われることが確認できると思います。  

## リソースの削除

`$ yarn serverless remove` コマンドで削除を行います。ただ、完全に削除されるわけではないので以下の注意が必要です。

- CloudFront ディストリビューションは Disabled となっているので、エッジロケーションに伝搬後に手動で削除
- OAI は手動で削除
- Lambda@Edge は手動で削除（レプリカが削除されるまでは削除できない）
- IAM ロールは手動で削除
- CloudWatchLogs はリクエストを処理したエッジサーバのあるリージョンから手動で削除

## まとめ

今回は Serverless Next.js Component を使用してサクッとデプロイをしてみました。  
`serverless.yml` に記述を加えることで柔軟に設定が行えるため、実際に使おうとしてみても良さそうな気がしています。 [参考](https://www.serverless.com/plugins/serverless-nextjs-plugin)  
ただ、現時点では以下のデメリットもあります。

- ISR にはまだ対応していない
- Lambda@Edge のコードサイズ制限に引っかかる場合は対策が必要（SSR を多用するとなるっぽい？）

環境変数周りはもう少し上手く出来そうかなー。（CI/CD する時とか特に）

今後コード読んでみて深堀りしてみようかなと思います。
