# codemap
最終更新: 2026-09-12 / フェーズ11作業時点

pair-canvas（React19 + Vite8、キャラクター関係性シート作成SPA）の
「どこに何があるか」のポインタ集。実装の解説は書かない。
仕様の理由は `docs/handoff-for-code.md` と各コミット本文・コード内コメントを見る。

## 場所（状態とデータ）
- src/App.jsx — 状態の唯一の持ち主。DEFAULT_PAGE / withValidPreset / updatePage / moveRelation / PNG書き出し / JSON入出力
- src/utils/createRelation.js — 関係性1件の初期値。createRelation / normalizeRelation（古いJSONの項目補完）
- src/constants.js — MAX_RELATIONS、DRAFT_STORAGE_KEY（localStorageキー）

## 場所（見た目の決まりごと）
- src/utils/relationLayout.js — 件数→large/medium/small判定、LAYOUT_PRESETS、IMAGE_BOX_SIZE、DESC_SCALE_MIN/MAX/STEP、clampDescScale、LEGACY_QUOTE_TEXT_SCALE
- src/utils/imageFit.js — 画像を枠にどう収めるかの計算。coverFactor。冒頭コメントに理屈あり
- src/components/RelationSheet.jsx — カードの並びの唯一の実装（画面プレビューと書き出しで共通）。paper直下のCSS変数もここ
- src/components/RelationCard.jsx — カード1枚の中身。プリセットごとの組み方は renderBody() の switch

## 場所（UI）
- src/components/Sidebar.jsx — 左カラムの組み立て。page系propsの受け渡し
- src/components/PageSettings.jsx — シート全体の設定UI。色・フォント・背景パターン・レイアウトプリセット・説明文サイズのスライダー
- src/components/RelationPanel.jsx — 関係性タブの切替と RelationAccordion の呼び出し
- src/components/RelationAccordion.jsx — 関係性1件ぶんの編集ボックス。画像位置入替・カード位置入替ボタン
- src/components/ImageUploader.jsx — 画像選択と位置調整ウインドウ
- src/components/Preview.jsx — 表示倍率の計算とズームUI。DESIGN_WIDTH = 1000
- src/components/ExportPreview.jsx — PNG書き出し用の描画先。RelationSheet を使う
- src/components/AppHeader.jsx / Logo.jsx — ヘッダーバーとロゴ
- src/hooks/useImageAspect.js — 写真の縦横比を img の load から取得
- src/hooks/useImageDrag.js — 画像位置調整の共通フック。現在はサイドバーのモーダル専用

## 場所（CSS）
- src/styles/card.css — カード内部。冒頭に --img-w / --img-h の表（プリセット×サイズ）、後半にプリセットごとのセクション
- src/styles/sidebar.css — 左カラム。冒頭コメントに文字サイズ3段（14/13/12px）の方針。presetGrid / presetButton / descScaleRow
- src/styles/preview.css / exportPreview.css — プレビュー枠とズームUI、書き出し用の器
- src/styles/app.css / header.css / fonts.css / imageUploader.css — 全体レイアウト、ヘッダー、フォント読み込み、画像選択UI

## 場所（ドキュメント）
- docs/handoff-for-code.md — 開発側の引継ぎメモ（内部用。zipには含めない）
- docs/requirements.md — 全体仕様と設計判断の理由（0〜6章）
- 修正履歴.md — ユーザー向けの変更履歴。フェーズ1〜11
- 動作確認手順.md — 手動確認の手順。フェーズ4時点のままで古い

## 場所（配信）
- package.json の `deploy` — `gh-pages -d dist`。origin/gh-pages が公開ブランチ。build のあとに実行する

## 落とし穴
- CSSの詳細度を毎回数える。`.panel label` は (0,1,1)、`input[type="text"]` の属性セレクタはクラスと同じ重み。負けたら親を1段足して勝たせる
- レイアウトプリセットを触るときは relationLayout.js の IMAGE_BOX_SIZE / RelationCard.jsx の switch / card.css の --img-w・--img-h を必ず3点セットで直す
- `.preview-area` の `min-width:0` は消さない。消すと幅の測定が発散してズーム倍率が壊れる
- useEffect 内の setState は ESLint（react-hooks/set-state-in-effect）で禁止。サイズ検出は ResizeObserver ＋描画中に前回値と比較する方式
- relationLayout.js を書き換えると Vite の HMR が「exportが無い」と誤ったエラーを出す。開発サーバーを再起動すれば直る
- phase系ブランチの親子関係は一直線ではない。mainへのマージは毎回「最新のphaseブランチ1本だけ」
- 説明文の font-size は「基準px × var(--desc-scale)」。基準pxは card.css 側が持つ。フェーズ11で全レイアウト 12px に統一（語りの 12.75px / 10.2px をやめた）。JS側は倍率しか持たない
- 関係性ラベルは「文字幅に合わせて伸びる」。上限は器の幅（.relationCenter の max-width）。word-break:keep-all なので overflow-wrap:break-word と .relationOverlay の min-width:0 が無いとカードの外へ飛び出す
- 名前タグ／関係性ラベル／プロット名の暗色スクリムは変更しない（背景色・写真が自由なため視認性確保に必須）
