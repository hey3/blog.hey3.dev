---
title: 'oh-my-zsh + anyenv から fish + pure + asdf にした話'
tag: asdf, fish
isProtect: false
create: '2021-01-04T23:00:00+09:00'
---

ずっと zsh + oh my zsh + anyenv で構成していたのですが、どうも起動が遅い。。  
dotfiles の見直しを含めて fish + pure + asdf の構成にしました。  
その背景、手順、乗り換えてみて良かった事を書いていきます。

## 今までどんな構成だったか

正直記事を書くより結構前に乗り換えていたのでうろ覚えです。。  
git のコミットログから思い出して書いていきます。(dotfiles を git 管理しといて良かった。。。)

今までは zsh 入れて oh my zsh 入れて、 theme を agnoster にするのみの、初期にやりがちな感じで使っていました。  
`.zshrc` にも oh my zsh の設定と `PATH` を記述するだけでした。

anyenv に関しても、 `node` の管理どうしようかってなったときに anyenv で管理したら便利やなってくらいの気持ちで導入していました。

ただ、ある程度使ってくるとどうも遅い。。  
いっそのこと一新してやろうと思ったのが始まりです。

## oh-my-zsh とは

> Oh My Zsh is an open source, community-driven framework for managing your zsh configuration.

とあるように oh-my-zsh は、コミュニティ主導の zsh 構成用のフレームワークとなっています。  
コミュニティ主導ということもあり、各自が便利と思われる設定を取り込ませた盛々なフレームワークです。

つまり、初めて zsh を使う人でもフルカスタマイズな zsh を使うことが出来ます。  
その反面、以下のことも起こります。

- 個人的に不要なカスタマイズまで含まれており遅い
- プラグインによっては長い間更新されていないものがある

自分用にカスタマイズすればよいのですが、不要なものを持っているのは気が引けますね。また、メンテナンスされていないものがあるのも不安になります。

oh my zsh はロード時に以下の流れで処理が行われます。  
[参考 - ohmyzsh/oh-my-zsh.sh](https://github.com/ohmyzsh/ohmyzsh/blob/master/oh-my-zsh.sh)

1. zsh のスクリプト、キャッシュディレクトリの解決
2. 自動アップデートの確認
3. fpath の追加と autoload の実行
4. カスタム構成ファイルの解決
5. plugins を fpath に追加
6. ホストネームの解決
7. dump ファイルの解決
8. config ファイルの読み込み
9. .zshrc の plugin の読み込み
10. custom の読み込み
11. テーマの読み込み

プラグインの多さからロードにかかる時間が長くなります。

初期にサクッと環境を作り出すのには便利だが、慣れてきたら乗り換えた方が良いフレームワークだと思っています。

## anyenv とは

anyenv は **env 系の環境マネージャーの wrapper です。  
複数の ** env の管理が anyenv にまとめられるみたいなイメージです。（実際には **env 毎にバージョン管理を行います）

自分が anyenv を入れていた理由も、言語毎に `nodenv` や `pyenv`、 `rbenv` などを入れており、この管理一つにまとめたいなと思っていたからです。
（ anyenv がナウいっていうのも当時見た。）  
ただ、これにも以下のようなデメリットがあります。

- 対応している言語が少なく感じる
- init が遅い
- メンテナンスがあまりされていない

対応している言語に関しては `anyenv install -l` で確認することが出来ます。  
インストールできる言語としては最低限カバー出来ているなとは思うのですが、 anyenv の特性上 init が無い env に関しては別途対応が必要になったりして不便です。

### oh my zsh と anyenv を組み合わせるとすごく遅い

oh my zsh の遅さと anyenv の遅さが重なって凄く遅いです。（※個人の主観が入っています）

以下は anyenv の init 処理の一部です。  
[参考 - anyenv/anyenv-init](https://github.com/anyenv/anyenv/blob/master/libexec/anyenv-init#L123-L146)

```shell
# Print stderr to show caveat of initialization.
$(anyenv-install --list > /dev/null)

for env in $(anyenv-envs); do
  ENV_ROOT_VALUE=$(echo ${env}_ROOT | tr "[a-z]" "[A-Z]")
  ENV_ROOT="${ANYENV_ROOT}/envs/${env}"

  case "$shell" in
  fish )
    echo "set -gx ${ENV_ROOT_VALUE} \"${ENV_ROOT}\""
    export ${ENV_ROOT_VALUE}="${ENV_ROOT}"
    echo "set -gx PATH \$PATH \"${ENV_ROOT}/bin\""
    ;;
  * )
    echo "export ${ENV_ROOT_VALUE}=\"${ENV_ROOT}\""
    export ${ENV_ROOT_VALUE}="${ENV_ROOT}"
    echo "export PATH=\"${ENV_ROOT}/bin:\$PATH\""
    ;;
  esac

  if { ${ENV_ROOT}/bin/${env} commands | grep -q '^init$' ; } 2> /dev/null  ; then
    echo "$(${ENV_ROOT}/bin/${env} init - ${no_rehash_arg}${shell})"
  fi
done
```

要はインストールされた env の init を anyenv の init 処理時にループで処理しています。

zsh に anyenv を追加する時は `.zshrc` に

```shell
eval "$(anyenv init -)"
```

を追加すると思います。

oh my zsh のロード処理 + anyenv による各 env の init 処理の相乗により起動が遅くなります。  
plugin を入れている限りしょうがないといえばしょうがないですが、シェルの起動時間を早くするとしたら何とか改善したい箇所ですよね。

## fish + asdf に乗り換える

この際ログインシェル毎入れ替えようと思い、何か良いシェルは無いかと探しました。  
色々見た感じ [fish](https://github.com/fish-shell/fish-shell) が良さそうだったので採用しました。

> fish is a smart and user-friendly command line shell for macOS, Linux, and the rest of the family. fish includes features like syntax highlighting, autosuggest-as-you-type, and fancy tab completions that just work, with no configuration required.

使ってみて以下の点が良いなと思いました。

**・補完が良い！**

zsh も plugin の追加で補完は強力なのですが、 fish はデフォルトで強力な補完が効きます。  
`ctrl + f` で使うサジェスト機能も便利です。

**・シンタックスハイライトが優秀**

これまた zsh も plugin でリアルタイムなシンタックスハイライトを利用できるのですが、 fish にはデフォルトで実装されていて、ラグも気になりません。

anyenv から乗り換えるバージョン管理には [asdf](https://github.com/asdf-vm/asdf) を採用しました。

> asdf is a CLI tool that can manage multiple language runtime versions on a per-project basis. It is like gvm, nvm, rbenv & pyenv (and more) all in one! Simply install your language's plugin!

これすごく便利！  
asdf は anyenv を使っていたときに比べて以下の点が良いなと思いました。

**・言語以外にも `postgres` や `mongoDB` などのツール群も管理できる**

anyenv の場合言語以外のツール群は別途管理する必要がありました。  
asdf はこの辺もまとめて管理できるので凄く扱いやすい！  
使える plugin は [https://asdf-vm.com/#/plugins-all](https://asdf-vm.com/#/plugins-all) で確認できます。

**・起動が早い**

コードが追えていないので詳細はわかっていないのですが、 anyenv よりも明らかに早いです。

### oh my zsh と anyenv を取り除く

自分の場合は `uninstall_oh_my_zsh` をしつつ oh my zsh、 anyenv zsh の config 周り全て初期化しました。  
zsh も不要だったので uninstall しました。

ここら辺覚えていないのですが、 `.zshrc` など全て初期化しました。

### fish に乗り換える

fish は `brew` を使ってインストールしています。

```shell
$ brew install fish
```

fish をログインシェルに設定するために `/etc/shells` に fish を追加します。

```shell
$ echo /usr/local/bin/fish | sudo tee -a /etc/shells
```

fish をデフォルトシェルに設定します。

```shell
$ chsh -s /usr/local/bin/fish
```

ここまでで一旦 fish への乗り換えは完了です。  
fish の設定は `~/.config/fish/` 以下で行います。

ちなみに設定ファイルは分割可能で、 `~/.config/fish/conf.d/*.fish` が設定ファイルとして読み込まれます。  
`~/.config/fish/conf.d/` 以下に、 `env.fish` や `alias.fish` など設定を分割して管理することで管理がしやすくなります。（いい！）

### fish のプラグインマネージャを入れる

プラグインマネージャには `fisher` を選択しています。  
選んだ理由は `fishfile` というテキストファイルでプラグインを管理できるため、 `dotfiles` 管理的にも良いなと思ったためです。（他のプラグインマネージャでも出来たらすみません。。）

fisher のインストールは以下のコマンドで行います。

```shell
$ curl https://git.io/fisher --create-dirs -sLo ~/.config/fish/functions/fisher.fish
```

### theme plugin を入れる

[Available themes - oh-my-fish/docs/Themes.md](https://github.com/oh-my-fish/oh-my-fish/blob/master/docs/Themes.md) から好きな theme を入れることが出来ます。

`fishfile` に入れたい theme plugin を記述して `fisher` コマンドでインストールします。  
自分の場合は [pure](https://github.com/rafaelrinaldi/pure) を入れています。

```shell
$ echo rafaelrinaldi/pure | tee -a ~/.config/fish/fishfile
$ fisher
```

また、個人的に`AWS_PROFILE` を切り替えて作業することが多いため、コマンドラインに現在の profile を表示するように少し修正しました。

`~/.config/fish/functions/_pure_prompt_aws.fish` を作成して以下を記述しています。

```shell
function _pure_prompt_aws \
    --description 'Print aws profile'

    set --local profile_name
    set profile_name $AWS_PROFILE

    if test -z $profile_name \
      -o $profile_name = "default"
      return
    end

    echo AWS: $profile_name
end
```

作成後、 `~/.config/fish/functions/_pure_prompt_first_line.fish` の `_pure_prompt_first_line` 関数内に `set --local prompt_aws (_pure_prompt_aws)` と追加して表示するようにしています。

### asdf に乗り換える

asdf は git から clone してきます。

```shell
$ git clone https://github.com/asdf-vm/asdf.git ~/.asdf
```

fish の設定ファイルに以下を追加（自分の場合は`~/.config/fish/conf.d/env.fish`）

```shell
source ~/.asdf/asdf.fish
set -g fish_user_paths "/usr/local/sbin" $fish_user_paths
```

これで fish 環境で asdf を使用する準備が整いました。後は必要なものを asdf に入れて好きに使っていくだけです。

`~/.asdfrc` に `legacy_version_file = yes` と書いておくと、 .ruby-version や .node-version を認識してくれるようになるので書いておくと良いです。

## dotfiles の管理も楽になった

以下のファイル群を dotfiles として管理しておくと楽です。

- `~/.config/fish/`: fish の設定ファイルなど
- `~/.tool-version`: asdf の global なバージョン管理
- `~/.asdfrc`

.tool-version を共有しておくことで、 dotfiles の install.sh なんかで `asdf install` とするだけで各 plugin のバージョンのインストールが可能です。  
ただし、事前に asdf で plugin を追加して上げる必要があるので

```shell
if [ ! $(asdf which node) ]; then asdf plugin add nodejs; fi
```

みたいな感じで `asdf install` する前に plugin を追加しておくようにすると良いです。

## まとめ

oh my zsh + anyenv を使っていた頃と比べて、大分起動時のもっさり感が無くなり満足！  
バージョン管理もしやすくなり、 dotfiles の育成も進んだので良かったなという感じでした。

乗り換えた時に記事にすれば良かったのですが、その頃にはブログも完成していなかったので。。  
当時メモしておけば実際の起動時間とか取れていたと思うと悔やまれる（再現するのがめんどかった）。
