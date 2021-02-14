---
title: 'AWS CDK で lambda のバージョンが上手く発行できない時の対処'
tag: aws
isProtect: false
create: '2021-01-26T01:00:00+09:00'
---

AWS CDK を使っていて、 lambda のバージョン発行しているのに「バージョンが上手く発行されない！」、「古いバージョンが残らない！」となって結構困っていた時期がありました。  
本記事は、その問題の解決方法を簡単に記述していきます。

## 検証環境

- aws-cdk: 1.86.0
- @aws-cdk/aws-lambda: 1.86.0
- typescript: 4.1.3
- lambda runtime: Node.js 12

本記事では

```shell
$ cdk init app --language typescript
```

で作成したものをベースに説明していきます。

サンプルコードは[こちら](https://github.com/hey3/aws-cdk-lambda-version-sample)  
サンプルコードは多少使いやすいように config をいじっています。

## 上手く行かない実装

最小限のコードで説明していきます。

最初はドキュメントもあまり読まずに、「Version 生成すれば良いだろう」という気持ちで `Version` class のインスタンスを作れば出来るんじゃと思い、以下のような記述をしていました。

※ lambda 関数は `functions` ディレクトリに用意しています。

```ts
export class TestCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const functionName = 'MyFunction'

    const fn = new lambda.Function(this, functionName, {
      functionName,
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('functions/hoge'),
    })

    new lambda.Version(this, `${functionName}-Version`, {
      lambda: fn,
    })
  }
}
```

これでデプロイしてみると、 version 自体は発行されるのですが、
lambda 関数を編集してから再度デプロイしてみると新しいバージョンが発行されません。  
しかも、作成されているバージョンのコードは初期のコードのままです。（LATEST だけ更新されている状態）

これは metadata を見るとわかるのですが、どんなに lambda 関数のコードを修正したとしても作成されるバージョンのリソースは変わらないからです。

## 解決方法

上で書いた原因を基に考えると、

- デプロイ毎に新しいバージョンを作成するようにする
- 古いバージョンが削除されないようにする

を満たせば解決できそうに見えます。

### id をユニークにする

new Version の第２引数の `id` を毎回関数毎にユニークにしてあげることで、デプロイの度に新しいバージョンを作成することが出来ます。  

先程のコードを以下のように修正します。

```ts
export class TestCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const functionName = 'MyFunction'

    const fn = new lambda.Function(this, functionName, {
      functionName,
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('functions/hoge'),
    })

    const uniqueVersionId = `${new Date().getTime()}`

    new lambda.Version(this, `${functionName}-${uniqueVersionId}`, {
      lambda: fn,
    })
  }
}
```

デプロイの時刻を各 lambda 関数バージョンの id に付与しています。

これをデプロイすると、いつも通り LATEST が更新され、新しいバージョン `2` が作成され、最新のコードがバージョン `2` として作成されます。

バージョンの更新はされましたが、過去に作成したバージョン `1` が消えてしまっているため、バージョンとしては使えないです。

ここまでは、ググると出てくるのであっさり来られるのですが、「過去のバージョン消えたら使えないな」となり結局諦めてしまっていました。

### removalPolicy を RETAIN にする

過去のバージョンが削除されてしまうのであれば、バージョンの `removalPolicy` を `RETAIN` にしてあげれば解決できそうです。  
（この組み合わせに気づくのに時間がかかりました。。。片方だけやってみてもだめ）

先程のコードを以下のように修正します。

```ts
export class TestCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const functionName = 'MyFunction'

    const fn = new lambda.Function(this, functionName, {
      functionName,
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('functions/hoge'),
    })

    const uniqueVersionId = `${new Date().getTime()}`

    new lambda.Version(this, `${functionName}-${uniqueVersionId}`, {
      lambda: fn,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })
  }
}
```

`removalPolicy` を `RETAIN` にすると、そのリソースの `UpdateReplacePolicy` と `DeletionPolicy` に `Retain` が設定されます。

lambda 関数更新後にデプロイしてみると、以降作成されたバージョンはスタックの更新・削除をしても保持してくれるようになります。  
※注意としては `RETAIN` に設定する前のバージョン（ここでは `2` ）は removalPolicy が `Retain` ではないので削除されます。

なので `RETAIN` が残ることを確認するために２回デプロイを行います。

結果としては、  
１度目のデプロイ -> LATEST と同じコードのバージョン `3` のみが残る  
２度目のデプロイ -> １度目のコードのバージョン `3` と LATEST と同じコードのバージョン `4` が残る  
となります。

これでバージョンを管理することが出来るようになりました。

### コード差分が無い時のエラー対応をする

ここまでで、 `removalPolicy` を `RETAIN` にした場合に起こるエラーがあります。  
それは、 lambda 関数のコードを更新せずにデプロイを行った場合です。

コード差分が無いのに新しいバージョンを発行しようとすると

```
A version for this Lambda function exists ( )
```

のようなエラーが発生します。  
これは lambda の仕様によるものです。

これを回避するためのハックが存在します。（そもそも差分がなければバージョン発行しない方が理想だとは思います）

lambda の description に対しても `uniqueVersionId` を含めることで差分を発生させます。

```ts
export class TestCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const functionName = 'MyFunction'

    const uniqueVersionId = `${new Date().getTime()}`

    const fn = new lambda.Function(this, functionName, {
      functionName,
      description: `This lambda deployed at ${uniqueVersionId}`, // ここを追加
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('functions/hoge'),
    })

    new lambda.Version(this, `${functionName}-${uniqueVersionId}`, {
      lambda: fn,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })
  }
}
```

## Alias を設定する場合

dev や prod 環境毎に lambda 関数の指定のバージョンに Alias を設定したくなると思います。

その場合には、

- dev は最新のバージョンに対して Alias を設定
- prod は指定のバージョン固定にし、アップデートしたい場合に最新のバージョンに合わせる

dev の例

```ts
const version = new lambda.Version(this, `${functionName}-${uniqueVersionId}`, {
  lambda: fn,
  removalPolicy: cdk.RemovalPolicy.RETAIN,
})

new lambda.Alias(this, 'Dev-Alias', {
  aliasName: 'dev',
  version,
})
```

prod の例

```ts
new lambda.Alias(this, 'Prod-Alias', {
  aliasName: 'prod',
  version: lambda.Version.fromVersionArn(this, 'Prod-Version', `${fn.functionArn}:3`),
})
```

などとすると良いと思います。  
prod のバージョン指定部分などの運用は色んなやり方があると思うので今回は割愛します。

## まとめ

今回は、 AWS CDK で lambda 関数のバージョン管理をする時に少し躓いていたので根本から理解して解決しました。  
気づくと簡単ですが気づくまで大変でした。。

重要なのは

- デプロイ毎に新しいバージョンを作成するようにする
- 古いバージョンが削除されないようにする

です。

snapshot test ではちょっと不便さが出るかも。
