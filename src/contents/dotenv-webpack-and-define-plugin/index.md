---
title: 'dotenv-webpack と DefinePlugin の関係を理解してみた'
tag: webpack
isProtect: false
create: '2021-01-05T19:30:00+09:00'
---

webpack で bundle する際の環境変数の扱いに対して曖昧な知識だったので、よく使っていた dotenv-webpack, DefinePlugin それぞれの動きを確認してみました。  
自分用の React + typescript テンプレートを作成した際にも混乱した使い方をしてしまっていたので、その時の反省も含んでいます。

## 検証環境

- webpack: 4.44.2
- webpack-cli: 4.3.1
- dotenv-webpack: 6.0.0

## dotenv-webpack とは

> A secure webpack plugin that supports dotenv and other environment variables and only exposes what you choose and use.

[引用 - mrsteele/dotenv-webpack](https://github.com/mrsteele/dotenv-webpack)

`dotenv-webpack` は [dotenv](https://github.com/motdotla/dotenv) と [webpack.DefinePlugin](https://github.com/webpack/webpack/blob/master/lib/DefinePlugin.js) を wrap したものです。
`dotenv-webpack` は指定の `.env` ファイルに記述した環境変数を `process.env.***` に設定し、コード上で使用されている場合に webpack の bundle 時に置き換えてくれます。

```js
// .env
MESSAGE = 'hello'

// webpack.config.js
const Dotenv = require('dotenv-webpack')

module.exports = {
  // ...
  plugins: [new Dotenv()],
}

// script
console.log(process.env.MESSAGE)

// result
console.log('hello')
```

## DefinePlugin とは

> The DefinePlugin allows you to create global constants which can be configured at compile time.

[引用 - webpack/DefinePlugin](https://webpack.js.org/plugins/define-plugin/)

`DefinePlugin` は webpack 本体のプラグインです。  
`DefinePlugin` はコンパイル時に構成できるグローバル定数を作成することが出来ます。  
詳細は後に記載しますが、 `dotenv-webpack` もこの `DefinePlugin` を用いて定数の設定を行っています。

```js
// webpack.config.js
const webpack = require('webpack')

module.exports = {
  // ...
  plugins: [
    new webpack.DefinePlugin({
      MESSAGE: JSON.stringify('hello'),
    }),
  ],
}

// script
console.log(MESSAGE)

// result
console.log('hello')
```

## それぞれの動作を実際に確認してみる

それぞれ簡潔に使い方はわかりましたが、実際どんな挙動をしているのかコードを基に見ていきます。

### dotenv-webpack

dotenv-webpack のコードを見てみます。（一部抜粋）

[FYI: dotenv-webpack/src/index.js#L19-L176](https://github.com/mrsteele/dotenv-webpack/blob/master/src/index.js#L19-L176)

```js
class Dotenv {
  constructor(config = {}) {
    this.config = Object.assign({}, {
      path: './.env'
    }, config)

    this.checkDeprecation()

    return new DefinePlugin(this.formatData(this.gatherVariables()))
  }

  // ...
}
```

簡単に言うと、

1. path(デフォルトは `./.env`) のファイルから環境変数を取得
2. 取得した環境変数の key を `process.env.${key}` を key とする object に整形
3. 整形された object を `DefinePlugin` に渡す

となっています。

#### dotenv-webpack の動作を確認してみる

簡単な検証環境を用意して実際に確認してみます。

構成はこんな感じです。

```
$ tree
.
├── node_modules
├── package.json
├── src
│       └── index.js
├── .env
├── webpack.config.js
└── yarn.lock
```

以下のような .env を用意します。

```js
// .env
DOTENV = 'This is dotenv-webpack variable.'
```

`webpack.config.js` は以下のようにします。

```js
// webpack.config.js
const path = require('path')
const Dotenv = require('dotenv-webpack')

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
  },
  plugins: [new Dotenv()],
}
```

`src/index.js` は以下のように環境変数のログを吐くだけのコードにしています。

```js
console.log(process.env.DOTENV)
```

吐き出された `dist/bundle.js` の当該箇所は

```js
function(e,t){console.log("This is dotenv-webpack variable.")}
```

のようになります。  
`process.env.DOTENV` が .env に指定した文字列に置き換わっていることがわかります。

#### dotenv-webpack は process.env の destructuring が出来ない

ここで `dotenv-webpack` のコードを見返してみます。

[FYI: dotenv-webpack/src/index.js#L124-L151](https://github.com/mrsteele/dotenv-webpack/blob/master/src/index.js#L124-L151)

```js
formatData (vars = {}) {
const { expand } = this.config
const formatted = Object.keys(vars).reduce((obj, key) => {
  const v = vars[key]
  const vKey = `process.env.${key}`
  let vValue
  if (expand) {
    if (v.substring(0, 2) === '\\$') {
      vValue = v.substring(1)
    } else if (v.indexOf('\\$') > 0) {
      vValue = v.replace(/\\\$/g, '$')
    } else {
      vValue = interpolate(v, vars)
    }
  } else {
    vValue = v
  }

  obj[vKey] = JSON.stringify(vValue)

  return obj
}, {})

// fix in case of missing
formatted['process.env'] = '{}'

return formatted
}
```

このコードは

> 2. 取得した環境変数の key を process.env.${key} を key とする object に整形

の部分です。  
察する人は既にわかると思いますが、各環境変数をそれぞれ `process.env.***` に割り当てています。  
こうなると実際に `DefinePlugin` に渡される object は

```js
new webpack.DefinePlugin({
  'process.env.hoge': '"hoge"',
  'process.env.fuga': '"fuga"',
  'process.env': {},
})
```

のようになります。（執筆時点）

`process.env` の property に持っているわけでは無いので

```js
const { HOGE, FUGA } = process.env
```

のようなコードを書くと `undefined` になります。

結果 `dist/bundle.js` のコードは以下のようになります。

```js
const{HOGE:n,FUGA:r}={};console.log(n),console.log(r)}
```

#### destructuring するなら dotenv を使う

どうしても destructuring したい場合は `dotenv` を使って自分で `process.env` 以下に環境変数を作成することで可能になります。

```js
// .env
DOTENV = 'This is dotenv-webpack variable.'
HOGE = 'hoge'
FUGA = 'fuga'

// webpack.config.js
const path = require('path')
const webpack = require('webpack')
const dotenv = require('dotenv')

const env = dotenv.config().parsed

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(env),
    }),
  ],
}

// index.js
const { HOGE, FUGA } = process.env
console.log(HOGE)
console.log(FUGA)
```

こうすることで destructuring で環境変数を扱うことが出来ます。  
しかし、**実際のコードで使っていない環境変数も bundle に含まれてしまうので注意は必要です。**

bundle.js の結果

```js
function(e,t){const{HOGE:n,FUGA:r}={DOTENV:"This is dotenv-webpack variable.",HOGE:"hoge",FUGA:"fuga"};console.log(n),console.log(r)}
```

destructuring は出来ますが、 `src/index.js` で使っていない `process.env.DOTENV` の値が意図せず漏れてしまいます。  
`dotenv-webpack` が secure と標榜しているのはこの辺りになります。

### DefinePlugin

コード量が多いので抜粋して引用します。

[FYI: webpack/lib/DefinePlugin.js](https://github.com/webpack/webpack/blob/master/lib/DefinePlugin.js)

```js
const toCode = (code, parser) => {
  if (code === null) {
    return 'null'
  }
  if (code === undefined) {
    return 'undefined'
  }
  if (code instanceof RuntimeValue) {
    return toCode(code.exec(parser), parser)
  }
  if (code instanceof RegExp && code.toString) {
    return code.toString()
  }
  if (typeof code === 'function' && code.toString) {
    return '(' + code.toString() + ')'
  }
  if (typeof code === 'object') {
    return stringifyObj(code, parser)
  }
  return code + ''
}

class DefinePlugin {
  constructor(definitions) {
    this.definitions = definitions
  }
  // ...
  apply(compiler) {
    const definitions = this.definitions
    compiler.hooks.compilation.tap('DefinePlugin', (compilation, { normalModuleFactory }) => {
      // ...
      const handler = parser => {
        const walkDefinitions = (definitions, prefix) => {
          Object.keys(definitions).forEach(key => {
            const code = definitions[key]
            if (
              code &&
              typeof code === 'object' &&
              !(code instanceof RuntimeValue) &&
              !(code instanceof RegExp)
            ) {
              walkDefinitions(code, prefix + key + '.')
              applyObjectDefine(prefix + key, code)
              return
            }
            applyDefineKey(prefix, key)
            applyDefine(prefix + key, code)
          })
        }
        const applyDefineKey = (prefix, key) => {
          const splittedKey = key.split('.')
          splittedKey.slice(1).forEach((_, i) => {
            const fullKey = prefix + splittedKey.slice(0, i + 1).join('.')
            parser.hooks.canRename.for(fullKey).tap('DefinePlugin', approve)
          })
        }
      }
      const applyDefine = (key, code) => {
        const isTypeof = /^typeof\s+/.test(key)
        if (isTypeof) key = key.replace(/^typeof\s+/, '')
        let recurse = false
        let recurseTypeof = false
        if (!isTypeof) {
          parser.hooks.canRename.for(key).tap('DefinePlugin', ParserHelpers.approve)
          parser.hooks.evaluateIdentifier.for(key).tap('DefinePlugin', expr => {
            if (recurse) return
            recurse = true
            const res = parser.evaluate(toCode(code, parser))
            recurse = false
            res.setRange(expr.range)
            return res
          })
          parser.hooks.expression.for(key).tap('DefinePlugin', expr => {
            const strCode = toCode(code, parser)
            if (/__webpack_require__/.test(strCode)) {
              return ParserHelpers.toConstantDependencyWithWebpackRequire(parser, strCode)(expr)
            } else {
              return ParserHelpers.toConstantDependency(parser, strCode)(expr)
            }
          })
        }
        // ...
      }
    })
  }
  // ...
}
```

要するに、 `DefinePlugin` に渡された object の key に対して、コード上のその key を当該 property に置き換える処理をしています。

#### DefinePlugin の動作を確認してみる

`dotenv-webpack` 同様に簡単な検証環境を用意して確認してみます。

構成はこんな感じです。

```
$ tree
.
├── node_modules
├── package.json
├── src
│       └── index.js
├── webpack.config.js
└── yarn.lock
```

今回は .env を読み込まないので以下のような `webpack.config.js` にします。

```js
const path = require('path')
const webpack = require('webpack')

const definePlugin = new webpack.DefinePlugin({
  DEFINE: JSON.stringify('This is DefinePlugin variable.'),
})

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
  },
  plugins: [definePlugin],
}
```

`src/index.js` は同様に定数のログを吐くだけのコードにしています。

```js
console.log(DEFINE)
```

吐き出された `dist/bundle.js` の当該箇所は

```js
function(e,t){console.log("This is DefinePlugin variable.")}
```

のようになります。  
`DefinePlugin` に渡した object の key に対して property の値に置き換わっているのがわかります。

これまでの確認から

```js
// webpack.config.js
const path = require('path')
const webpack = require('webpack')

const definePlugin = new webpack.DefinePlugin({
  DEFINE: JSON.stringify('This is DefinePlugin variable.'),
  'process.env': {
    DEFINE: JSON.stringify('This is process.env with DefinePlugin variable.'),
  },
})

module.exports = {
  // 省略
}

// index.js
console.log(DEFINE)
console.log(process.env.DEFINE)
```

のように `process.env.***` という定数に値を指定することで `dotenv-webpack` を使わなくても `process.env.***` で参照できます。

結果

```js
function(e,n){console.log("This is DefinePlugin variable."),console.log("This is process.env with DefinePlugin variable.")}
```

また、システム環境変数に渡される環境変数を bundle に含める際などにも使えます。

```js
// $ HOGE='hoge' yarn webpack

const definePlugin = new webpack.DefinePlugin({
  HOGE: JSON.stringify(process.env.HOGE),
})
```

## まとめ

`dotenv-webpack` がどんな挙動になっていて、 `DefinePlugin` の動作も含め関係性を理解しました。  
やりようによっては `DefinePlugin` のみで `dotenv-webpack` のような事が出来そうではありますね。  
今まで両方合わせて使っていた事もあり、自分で混乱する場面もあったのでスッキリしました。

個人的には不要に依存を増やしたくないとかでなければ `.env` ファイルを使う `dotenv-webpack` にまとめる方が管理が楽そうな気がします。これは、 `DefinePlugin` だと環境変数が増えた場合に変更箇所が増えるためです。(システム環境変数も必要だろうし)  
CI/CD で build する場合を考えると、 `dotenv-webpack` の `systemvars` option を true にしておいて、 CI/CD 側では `secrets` などから環境変数を流し込むので良いのかなと思います。（`systemvars` を有効にするとシステム環境変数も読み込んでくれるようになります。）

検証に使ったソースコードは [こちら](https://github.com/hey3/dotenv-webpack-and-define-plugin) です。
