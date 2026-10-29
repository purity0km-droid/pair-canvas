# Pair Canvas

キャラクター 2 人の画像と名前、関係性の説明を、1 枚の画像（PNG）にまとめる関係性シートのメーカーです。
ブラウザだけで動き、選んだ画像や入力した文字はその端末の中だけで処理・保存されます（サーバーへの送信・アカウント登録はありません）。

**サイト**: https://purity0km-droid.github.io/pair-canvas/

## できること

- 関係性を 1〜4 件並べたシートを作り、PNG（通常・縦横 2 倍の高画質）で保存
- 画像ごとに位置と大きさ（20%〜300%）を調整
- 関係性のラベルを、矢印の上下 2 段に自由に入力
- 背景色・文字色・背景の模様・フォント（9 種）を選択
- レイアウト 6 種（対面・帯・交差・見出し・双方向・語り）と、説明文の文字サイズの調整
- 入力した内容の自動の下書き保存と、JSON ファイルへの保存・読み込み

## 注意

- 個人で作っているツールです。
- 下書きはブラウザに保存されます。閲覧履歴やサイトデータを消すと失われるため、残したいときは「JSON保存」でファイルに書き出してください。

## 利用条件

- だれでも無料で使えます。
- 作った画像（PNG）や書き出した JSON は、自由に使えます（写っているキャラクターや画像の扱いは、それぞれの決まりに従ってください）。
- ツール（このリポジトリのコード）の再配布と、手を加えたものの公開はお断りします。紹介するときは、サイト https://purity0km-droid.github.io/pair-canvas/ を案内してください。
- 使ったことで起きた問題について、作者は責任を負えません。
- 同梱しているフォントと、使っているライブラリは、それぞれのライセンスに従います（下の「フォント」「ライブラリ」）。

© 2026 purity0km-droid

## フォント

画面の表示と PNG 書き出しのために、次のフォントを同梱しています。

- Noto Sans JP、Zen Maru Gothic、Shippori Mincho、Kaisei Decol、Yuji Syuku、Hachi Maru Pop、Kiwi Maru、DotGothic16、Limelight（SIL Open Font License 1.1）
- Kosugi Maru（Apache License 2.0）

## ライブラリ

- [React](https://react.dev/)（MIT）
- [html-to-image](https://github.com/bubkoo/html-to-image)（MIT）… PNG 書き出し
- [Tailwind CSS](https://tailwindcss.com/)（MIT）

## 開発

Node.js（20.19 以上、または 22.12 以上）で動きます。

```
npm ci
npm run dev
```

ビルドは `npm run build`、公開は `npm run deploy`（`dist/` を gh-pages ブランチへ送り、GitHub Pages で配信）。
