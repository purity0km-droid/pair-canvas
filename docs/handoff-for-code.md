# 引継ぎメモ（Claude Code 用）

pair-canvas（React19 + Vite8 + Tailwind v4、キャラクター関係性シート作成SPA）の改修作業を、別環境からこのリポジトリでの直接作業に引き継ぐ。

**トークン節約のため**：このファイルは要点のみ。詳細な要件・理由付けは重複させず、以下を参照すること。

- 全体仕様・設計判断の理由 → `docs/requirements.md`（0〜6章、最新）
- 各変更の詳細な理由 → 各コミットメッセージ本文（`git log <branch> --format="%H %s%n%b"`）。コード側にも日本語コメントで「なぜこの実装か」「変更したい場合はどこを触るか」を書き込み済みなので、まずコメントを読む。
- 新規に説明を書き起こす前に、上記2つで足りるか確認する。

## リポジトリの状態

```
tag  baseline-original   … 元の未改修コミット（938a149）。git checkout baseline-original で即座に復元可能
main                      … baseline + docs/requirements.md（コードは未改修）
phase/1-basics            … 内部整理＋基本機能一式（mainから分岐）
phase/2-design            … phase1 + 見た目のシームレス化（phase1から分岐）
phase/3-safari            … phase2 + Safari書き出し安定化（phase2から分岐）
```

3ブランチとも `npx eslint src` はクリーン。**`npm run build`は未検証**（旧作業環境がLinuxサンドボックスで、Vite8のrolldownネイティブバイナリがWindows用しか無く、npmレジストリもブロックされていてビルドできなかったため）。このリポジトリで直接 `npm install && npm run build` を確認してほしい。

まだ`origin`にはpushしていない（ローカルブランチのみ）。

## 各フェーズの中身（要約）

### phase/1-basics
- Preview/ExportPreviewの重複を`RelationSheet.jsx`に統合、WYSIWYG化（`transform:scale()`でスマホ幅に縮小、レイアウト組み替えはしない）
- 画像の位置・拡大調整：サイドバーに「位置調整モーダル」を新設（画像選択直後に自動オープン）。実カードと全く同じCSS機構（`object-fit:cover`+`transform`）を使い、ズレが出ない設計
- 中央ラベルの上下2段自由入力（`relationSub`、空なら非表示）
- 左右入れ替えボタン、写真サイズ比率の「おまけ」機能（`<details>`で既定折りたたみ、均等/左を大きく/右を大きく）
- 自動下書き保存（localStorage）、フォント選択プレビュー
- 未使用コード削除、Lintエラー解消、`MAX_RELATIONS`等の定数化
- 修正したバグ：ブラウザのネイティブ画像ドラッグとの競合／`<label>`がファイル選択inputへのクリックを横取りしていた問題／初期表示のちらつき／サイドバーのクロップ枠と実カードの見た目ズレ

### phase/2-design（phase1を含む）
- サイドバーを単色紫（`#6D5DFC`）＋ボーダーレスに刷新（白い箱＋罫線をやめ、余白と罫線1本で区切る）
- キャラクター画像をフレームレス化（下端をmaskでフェード）
- 関係性タブに「＋」を統合（①②③＋）
- 名前タグ／関係性ラベル／プロット名の暗色スクリムは**維持**（視認性確保のため意図的に変更していない）

### phase/3-safari（phase2を含む）
- PNG書き出しを`document.fonts.ready`＋画像`decode()`待ちに変更（固定100ms待ちをやめた）
- `getFontEmbedCSS`を1回計算して使い回す
- 書き出し中のローディング表示・ボタン無効化

## 新規追加ファイル（phase1で作成、以降のフェーズも使用）

- `src/components/RelationSheet.jsx` … カード並びレイアウトの唯一の実装（画面表示・書き出し共通）
- `src/hooks/useImageDrag.js` … 画像ドラッグ位置調整の共通フック
- `src/utils/createRelation.js` … 関係性データの初期値／読込時の補完（`normalizeRelation`）
- `src/utils/relationLayout.js` … 関係性の件数→large/medium/smallレイアウト判定、画像枠の縦横比定義
- `src/constants.js` … `MAX_RELATIONS`、`DRAFT_STORAGE_KEY`

## 守ってほしい制約・方針（要件定義から抜粋）

- 無料・軽量方針。追加ライブラリの導入は慎重に。
- 名前タグ／関係性ラベル／プロット名の暗色スクリムは変更しない（ユーザーが自由な背景色・写真を選べる仕様のため、視認性確保に必須）。
- 参考にした類似ファンツール（aki-maron.site/jipuro、oshinote.netlify.app）との差別化方針は `docs/requirements.md` 第6章を厳守：プリセット名・カラーテーマ名・固有フィールド構成は流用しない。UIの「シームレスな質感」は取り入れるが、機能は前面に出しすぎず「おまけ」的に。
- git commit時のauthorは `junkfood <junkfood.kuitee@gmail.com>` を使用中（`.git/config`に設定済み）。

## 未着手・次にやること候補

1. `npm install && npm run dev` / `npm run build` の実機確認（最優先。旧環境では未検証）
2. 各フェーズのzipは既に一度ユーザーに渡し、指摘されたバグ（上記「修正したバグ」）は反映済みだが、**改めて実機（特にスマホ・Safari）での通し確認**が望ましい
3. フェーズ2の「シームレスデザイン」を、aki-maron.site参考にさらに深掘りするかは未定（現状で十分という可能性もある。ユーザーに確認）
4. phase1→2→3を`main`にマージするか、`origin`にpushするかは未指示。ユーザーに確認してから実施
5. `docs/requirements.md` 第6章のレイアウトプリセット案（シンメトリー/フォーカス/スタック/ミニマル）のうち、実装済みは「フォーカス」相当の写真サイズ比率のみ。他は未着手（優先度未定）
