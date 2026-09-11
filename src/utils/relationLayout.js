// -----------------------------------------------------------------------
// 関係性カードの「見た目の決まりごと」をまとめた場所。
//
//   1. 枚数(1〜4件)から、各カードが large/medium/small のどのサイズで
//      表示されるかを求める（getRelationLayout）
//   2. レイアウトプリセットの一覧（LAYOUT_PRESETS）
//   3. 「プリセット × サイズ」ごとの画像枠の縦横比（getImageAspect）
//
// カードの並び方（グリッドの組み方）自体は RelationSheet.jsx が、
// カード1枚の中身は RelationCard.jsx が担当していますが、
// 「何番目の関係性がどのサイズになるか」「画像枠がどんな形になるか」の
// 判定はここに集約し、サイドバー側（画像の位置・範囲調整プレビュー）でも
// 同じ判定を使えるようにしています。
//
// ★ここを直すときは、必ず RelationSheet.jsx / RelationCard.jsx /
//   card.css 側と一致させてください（ズレると「サイドバーで見た枠」と
//   「実際の書き出し」が食い違ってしまいます）。
// -----------------------------------------------------------------------
export function getRelationLayout(totalCount, index) {
  if (totalCount <= 1) return "large";
  if (totalCount === 2) return "medium";
  if (totalCount === 3) return index === 0 ? "large" : "small";
  return "small"; // 4件のとき
}

// -----------------------------------------------------------------------
// レイアウトプリセット（フェーズ6）
//
// 「関係性の紹介」に重きを置いたときの見せ方の候補。シート全体に対して
// 1つだけ選ぶ設定で、そのシートの全カードが同じ形になります。
// （関係性ごとの設定ではありません。左カラムの「▼ レイアウト（おまけ）」で選ぶ）
//
// id はJSONに保存される値なので、一度出したものは変えないでください
// （変えると、以前保存したJSONを読んだときにプリセットが既定へ戻ります）。
// -----------------------------------------------------------------------
export const LAYOUT_PRESETS = [
  {
    id: "facing",
    label: "対面",
    description: "左右に並べ、中央に関係性。デザイン変更前からの形。",
  },
  {
    id: "band",
    label: "帯",
    description: "写真をカード幅いっぱいに2分割し、継ぎ目に関係性を大きく出す。",
  },
  {
    id: "overlap",
    label: "交差",
    description: "2枚を重ねて「近さ」を絵にする。",
  },
  {
    id: "headline",
    label: "見出し",
    description: "関係性をカード上部の大見出しにする。",
  },
  {
    id: "twoway",
    label: "双方向",
    description: "矢印を上下2本に分け、左→右と右→左で別々の言葉を出す。",
  },
  {
    id: "quote",
    label: "語り",
    description: "説明文を主役にし、写真は丸く小さく添える。",
  },
];

export const DEFAULT_LAYOUT_PRESET = "facing";

// -----------------------------------------------------------------------
// 説明文の文字サイズ倍率（フェーズ9 → フェーズ10で作り直し）
//
// フェーズ9では「語り」限定で大/中/小の3段だったが、
// フェーズ10で「スライダーで細かく決めたい」「他のレイアウトでも使いたい」
// という要望を受けて、倍率1つ（page.descTextScale）に置き換えた。
//
// 【基準（100%）の決め方】
//   - 「語り」……フェーズ9の「小」を基準にした（12.75px / 小カードは10.2px）。
//                ユーザー指示：「小を基準にしてスライダーで調整」
//   - それ以外……各レイアウトの現行サイズがそのまま基準（12px）。
//                ユーザー指示：「語りの小サイズには合わせない」
//   基準値そのものは card.css 側に px で書いてある（.description の font-size）。
//   ここで持っているのは掛け算する倍率だけ。
//
// 行間(line-height)は単位なしの倍数で指定してあるため、文字サイズに
// 追従して自動で広がる（ここで別途指定する必要はない）。
// -----------------------------------------------------------------------
export const DESC_SCALE_MIN = 1;
export const DESC_SCALE_MAX = 2;
export const DESC_SCALE_STEP = 0.05;
export const DEFAULT_DESC_SCALE = 1;

// 下書きや読み込んだJSONに範囲外の値・数値でない値が入っていても
// 表示が壊れないようにする。
export function clampDescScale(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return DEFAULT_DESC_SCALE;
  return Math.min(DESC_SCALE_MAX, Math.max(DESC_SCALE_MIN, num));
}

// -----------------------------------------------------------------------
// フェーズ9の page.quoteTextSize（"small" / "medium" / "large"）からの移行表。
//
// フェーズ9の基準は「中」＝15px で、小0.85倍=12.75px、大1.25倍=18.75px だった。
// フェーズ10では「小」を100%の基準に置き直したので、同じ見た目を保つには
// 新しい基準（12.75px）に対する倍率へ読み替える必要がある。
//   小 12.75 / 12.75 = 1.00
//   中 15.00 / 12.75 = 1.18 → スライダーの刻み(5%)に合わせて 1.20
//   大 18.75 / 12.75 = 1.47 → 同じく 1.45
// フェーズ9のJSONを読んでも文字の大きさがほぼ変わらないようにするための表で、
// 新しく保存されるJSONには quoteTextSize は入らない。
// -----------------------------------------------------------------------
export const LEGACY_QUOTE_TEXT_SCALE = {
  small: 1,
  medium: 1.2,
  large: 1.45,
};

export function isLayoutPreset(value) {
  return LAYOUT_PRESETS.some((preset) => preset.id === value);
}

// -----------------------------------------------------------------------
// 画像枠(imageBox)の縦横比（幅 ÷ 高さ）。
//
// src/styles/card.css の --img-w / --img-h（プリセットごと・サイズごとに
// 指定している画像枠の実寸）と必ず対応させてください。
// ここがズレると、サイドバーの位置調整モーダルで見ている枠の形と、
// 実際に書き出される画像の形が食い違います。
//
// 「語り」だけは丸い枠なので、どのサイズでも 1:1 です。
// -----------------------------------------------------------------------
const IMAGE_BOX_SIZE = {
  facing: { large: [320, 280], medium: [320, 320], small: [150, 200] },
  band: { large: [460, 320], medium: [460, 340], small: [223, 190] },
  overlap: { large: [300, 330], medium: [300, 340], small: [150, 190] },
  headline: { large: [422, 230], medium: [422, 260], small: [197, 150] },
  twoway: { large: [300, 300], medium: [300, 320], small: [130, 170] },
  // 語りは丸い枠。フェーズ8で「もう少し大きく」の要望を受けて
  // 168/180/110 → 230/240/140 に拡大した。
  quote: { large: [230, 230], medium: [240, 240], small: [140, 140] },
};

export function getImageAspect(preset, layout) {
  const byPreset = IMAGE_BOX_SIZE[preset] || IMAGE_BOX_SIZE[DEFAULT_LAYOUT_PRESET];
  const [width, height] = byPreset[layout] || byPreset.small;
  return width / height;
}

// 旧名の互換用。フェーズ5以前は「プリセット」が無く、サイズだけで縦横比が
// 決まっていたため、この表を直接参照している箇所がありました。
// 新しく書くコードでは getImageAspect(preset, layout) を使ってください。
export const LAYOUT_IMAGE_ASPECT = {
  large: IMAGE_BOX_SIZE.facing.large[0] / IMAGE_BOX_SIZE.facing.large[1],
  medium: IMAGE_BOX_SIZE.facing.medium[0] / IMAGE_BOX_SIZE.facing.medium[1],
  small: IMAGE_BOX_SIZE.facing.small[0] / IMAGE_BOX_SIZE.facing.small[1],
};
