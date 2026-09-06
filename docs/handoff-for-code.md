# 引継ぎメモ（Claude Code 用）

最終更新：2026-09-06（フェーズ8完了時点）

pair-canvas（React19 + Vite8 + Tailwind v4、キャラクター関係性シート作成SPA）の改修作業の引継ぎメモ。

**トークン節約のため**：このファイルは要点のみ。詳細は重複させず、以下を参照すること。

- 全体仕様・設計判断の理由 → `docs/requirements.md`（0〜6章）
- ユーザー向けの変更履歴 → リポジトリ直下の `修正履歴.md`（フェーズ1〜8を平易な日本語でまとめてある。**「何が変わったか」を知りたいときはまずこれ**）
- 各変更の技術的な理由 → 各コミットメッセージ本文（`git log --format="%h %s%n%b"`）。**コード側にも日本語コメントで「なぜそうしたか」「戻すならどこを触るか」を書き込み済み**なので、新しく説明を書き起こす前に、まずコミット本文とコメントを読むこと。

---

## リポジトリの状態

```
tag  baseline-original   … 元の未改修コミット（938a149）。git checkout baseline-original で即座に復元可能
main                      … フェーズ1〜8をすべてマージ済み（ab33bef）。これが最新
phase/0-baseline          … 未改修の原本
phase/1-basics            … 内部整理＋基本機能一式
phase/2-design            … 見た目のシームレス化
phase/3-safari            … Safari書き出し安定化
phase/4-ui-refine         … UI整理（ヘッダー新設・左カラム圧縮）＋不具合修正
phase/5-ui-feedback       … ユーザーフィードバック対応（1回目＋追加分）
phase/6-layout-presets    … 画像の自由縮小＋レイアウトプリセット6種
phase/7-feedback          … 画像の拡大縮小方式の作り直しほか
phase/8-feedback          … カード位置入替ほか
```

- `main` は `origin/main` より **48コミット先行。まだ一度も push していない**（ユーザーの指示：「originへはプッシュしないでいい」）。push する際は必ず確認を取ること。
- `npx eslint src` はクリーン、`npm run build` も通ることを確認済み。
- **phase系ブランチの親子関係は一直線ではない。** `phase/1-basics` と `phase/2-design` は `phase/5-*` の祖先になっていない（過去のrebase/cherry-pickで同じ変更が別SHAとして重複している）。そのため main へのマージは毎回「最新のphaseブランチ1本だけ」を取り込む方式で行っている。`git merge-base --is-ancestor` で確認してから作業すること。

### zipを作るときの決めごと

外部提出用zipは `git archive` で作る。`.claude/`（開発サーバー起動設定）と `docs/handoff-for-code.md`（＝このメモ。内部用）は含めない。

```bash
git archive --format=zip -9 -o "../pair-canvas-main.zip" HEAD -- . ':(exclude).claude' ':(exclude)docs/handoff-for-code.md'
```

日本語ファイル名（`修正履歴.md` / `動作確認手順.md`）があるので、作成後に **UTF-8フラグ（汎用フラグ bit 11）が立っているか** を確認すること。Pythonの `zipfile` で `flag_bits & 0x800` を見るのが早い。

---

## いま動いているものの構造

### データの持ち方

すべて `App.jsx` の2つのstateに集約されている。

- `page` … シート全体の設定（`DEFAULT_PAGE` 参照：タイトル表示/文言、背景色、文字色、背景パターン、フォント、**`layoutPreset`**）
- `relations` … 関係性の配列（最大 `MAX_RELATIONS` = 4件）。1件の中身は `utils/createRelation.js` の `createRelation` / `normalizeRelation` が定義

この2つをまとめて localStorage（キー：`DRAFT_STORAGE_KEY` = `pair-canvas-draft`）へ自動保存し、次回起動時に復元している。JSON保存/読込も同じ形。**サーバーへは何も送っていない**（プレビュー下にその旨を明記済み）。

読込時の保険：知らないプリセット名が入っていたら `withValidPreset()` が既定に戻す。

### 主なファイルと役割

| ファイル | 役割 |
|---|---|
| `src/App.jsx` | 状態の唯一の持ち主。PNG書き出し、JSON入出力、`moveRelation`（カード位置入替）もここ |
| `src/components/RelationSheet.jsx` | カード**並び**レイアウトの唯一の実装（画面表示・書き出し共通＝WYSIWYG） |
| `src/components/RelationCard.jsx` | カード**1枚の中身**。プリセットごとの組み方を `renderBody()` の `switch` で分岐 |
| `src/components/Preview.jsx` | 表示倍率の計算とズームUI。`DESIGN_WIDTH = 1000` を実幅に合わせて `transform:scale()` |
| `src/components/RelationAccordion.jsx` | 関係性1件ぶんの編集ボックス。画像位置入替・カード位置入替ボタン |
| `src/components/ImageUploader.jsx` | 画像選択と「位置調整ウインドウ」 |
| `src/components/PageSettings.jsx` | シート全体の設定UI（色・フォント・背景・レイアウトプリセット） |
| `src/utils/relationLayout.js` | **見た目の決まりごとの中心。** 件数→large/medium/small判定、プリセット一覧、プリセット×サイズごとの画像枠寸法 |
| `src/utils/imageFit.js` | 画像を枠にどう収めるかの計算（`coverFactor`） |
| `src/hooks/useImageAspect.js` | 写真そのものの縦横比を `<img>` の load から取得 |
| `src/hooks/useImageDrag.js` | 画像位置調整の共通フック（**現在はサイドバーのモーダル専用**。プレビューは表示専用） |
| `src/constants.js` | `MAX_RELATIONS`、`DRAFT_STORAGE_KEY` |

### ★ 触るときに必ずセットで直す場所

**レイアウトプリセットを追加・変更するとき**は次の3か所を必ず一致させる。ズレると「サイドバーで見た枠」と「実際の書き出し」が食い違う。

1. `utils/relationLayout.js` の `LAYOUT_PRESETS` と `IMAGE_BOX_SIZE`
2. `components/RelationCard.jsx` の `renderBody()` の `switch`
3. `styles/card.css` の該当セクション（`--img-w` / `--img-h` の表）

---

## 各フェーズの中身（要約）

### phase/1-basics
- Preview/ExportPreview の重複を `RelationSheet.jsx` に統合、WYSIWYG化（`transform:scale()` で縮小、レイアウト組み替えはしない）
- 画像の位置・拡大調整モーダルを新設（画像選択直後に自動オープン）
- 中央ラベルの上下2段自由入力（`relationSub`）、左右入替、写真サイズ比率の「おまけ」機能
- 自動下書き保存（localStorage）、フォント選択プレビュー、未使用コード削除、定数化

### phase/2-design
- サイドバーを単色紫（`#6D5DFC`）＋ボーダーレスに刷新、画像のフレームレス化、関係性タブに「＋」統合
- **名前タグ／関係性ラベル／プロット名の暗色スクリムは維持**（意図的。後述の制約参照）

### phase/3-safari
- PNG書き出しを `document.fonts.ready` ＋画像 `decode()` 待ちに変更（固定100ms待ちを廃止）
- `getFontEmbedCSS` を1回計算して使い回す、書き出し中のローディング表示

### phase/4-ui-refine
- プレビューを**表示専用化**（カード上のドラッグ廃止。位置調整はモーダルに一本化）
- ラベルをピル形→角丸四角に戻す、ヘッダーバー新設（`AppHeader.jsx` / `header.css`）、リセットボタン追加
- 左カラム圧縮（幅460→400px）、縦積みの基準幅を768pxに統一
- 不具合2件修正：サイドバーのスクロール枠突き抜け（`.sidebar` に `position:relative`）／画像選択がD&Dでしか効かない

### phase/5-ui-feedback（フィードバック1回目＋追加分）
- 明朝体をやめて Noto Sans JP 継承に戻す
- 関係性①②③タブで**編集ボックスを切り替え**（それまでは並べて全部出ていた）
- フォント選択欄を色選択の並びへ移動、ヘッダーをsticky＋スマホで高さ52px固定
- **スマホ幅限定のズームUI**（PC幅では倍率固定＝1.0、ズームバー非表示）
- 左カラムの文字サイズを **14/13/12px の3段** に統一（`sidebar.css` 冒頭のコメント参照。新しい文字を足すときはこのどれかに合わせる）
- 関係性ラベルの初期値を空に（上下とも空なら矢印のみ）、「左右を入れ替え」→「画像位置入替」に改名
- 画像下端のホワイトアウト（maskフェード）を無効化、「サーバーへ保存しない」旨の表記を追加

### phase/6-layout-presets
- 画像を**枠より小さく縮小できる**ように（`SCALE_MIN` を 1 → 0.3、フェーズ7でさらに 0.2）
- **レイアウトプリセット6種**（対面/帯/交差/見出し/双方向/語り）を実装。`page.layoutPreset` としてJSONにも保存される

### phase/7-feedback
- **画像の拡大縮小方式を作り直し**（最重要）。`object-fit:cover` をやめ、`contain` ＋ `coverFactor` を掛ける方式へ。100%のときの見た目は従来と完全に一致し、100%未満に縮小すると**切れていた部分が戻ってくる**。理屈は `utils/imageFit.js` の冒頭コメントに全部書いてある
- 補足事項が中央寄りになる不具合を修正（`.subInfo` の `width` 指定が2か所にあり後勝ちしていた）
- カラーコード欄を削除（Chrome標準のHEX切替で足りるとのユーザー判断）、「写真の大きさ（おまけ）」機能を削除、`<details>` の▼重複を解消

### phase/8-feedback
- **カード位置入替**を追加（`App.jsx` の `moveRelation`）。2件以上あるとき「◀ 前へ / 次へ ▶」を表示。※「画像位置入替」は1枚のカードの中で左右を入れ替えるもので、別物
- 「語り」レイアウト：補足情報を説明文の下 → **名前のすぐ下**へ移動、丸写真を拡大（168/180/110 → 230/240/140px）
- 「帯」レイアウト：中央の ⇄ を黒に

---

## CSSで繰り返し踏んだ罠（重要）

この改修で**同じ種類のバグを5回以上**踏んでいる。CSSを足すときは必ず詳細度を数えること。

- `.panel label` のような「クラス＋要素」は **(0,1,1)**。単独クラス `.checkboxInline` の **(0,1,0)** より強い。
- **`input[type="text"]` の属性セレクタはクラスと同じ重み**。`.panel input[type="text"]` は **(0,2,1)** であり、`.colorRow .colorCode`（0,2,0）では勝てない。
- 実際に起きた例：チェックボックスが7pxずれる／フォント選択欄のスタイルが丸ごと効かない／カラーコード欄が無視される／双方向レイアウトが小サイズで崩れる／補足事項が中央寄りになる。
- **対処**：`.panel .fontSelect`、`.relation-card.preset-twoway .twowayArea` のように親を1段足して勝たせている。同じ手を使うこと。

その他：

- flexアイテムの `min-width:auto` を `overflow:visible` で失うと、幅の測定が発散してズーム倍率が壊れる（フェーズ5で実際に起きた）。`.preview-area` の `min-width:0` は消さないこと。
- ESLint の `react-hooks/set-state-in-effect` により、`useEffect` 内の `setState` は書けない。サイズ検出は **ResizeObserver ＋「描画中に前回値と比べて調整する」パターン**で実装している（`Preview.jsx` / `useImageAspect.js`）。
- `relationLayout.js` のような広く import されるファイルを書き換えると、Vite の HMR が「存在するはずのexportが無い」と矛盾したエラーを出すことがある。**開発サーバーを再起動すれば直る。**

---

## 守ってほしい制約・方針

- 無料・軽量方針。追加ライブラリの導入は慎重に。
- **名前タグ／関係性ラベル／プロット名の暗色スクリムは変更しない。** ユーザーが自由な背景色・写真を選べる仕様のため、文字の視認性確保に必須。
- 参考にした類似ファンツール（aki-maron.site/jipuro、oshinote.netlify.app）との差別化方針は `docs/requirements.md` 第6章を厳守。プリセット名・カラーテーマ名・固有フィールド構成は流用しない。
- git commit の author は `junkfood <junkfood.kuitee@gmail.com>`（`.git/config` に設定済み）。
- ユーザーは日本語でやり取りする。コード内コメント・ドキュメントも日本語で書くこと。

---

## 未着手・次にやること候補

1. **PNG書き出しの実機確認が未了。** ブラウザ自動操作ではダウンロードを最後まで確認できない。**とくにフェーズ7で画像の表示方式（cover → contain + 倍率）を変えているので、Safari / iPhone での通し確認が望ましい。**
2. **`動作確認手順.md` がフェーズ4時点の内容のまま。** レイアウトプリセット切替・スマホズーム・画像の縮小・カード位置入替の手順が載っていない。追記が必要。
3. レイアウトプリセットを**実際のキャラクター立ち絵で検証していない**。「帯」は継ぎ目のラベルが顔と重なる可能性、「交差」は後ろ側の写真の左端が隠れる（約76px）。
4. スマホ幅では左カラムが `max-height:50vh` の内部スクロールで、スクロールする箱が入れ子になっている（フェーズ2からの既存挙動）。全高表示に変えるかはユーザー判断待ち。
5. `origin` への push、および `docs/handoff-for-code.md` の扱い（現在 main に追跡されているが、ローカルに未コミットの新しい版がある）はユーザー確認待ち。
