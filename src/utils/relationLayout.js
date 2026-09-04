// -----------------------------------------------------------------------
// 関係性カードの「枚数(1〜4件)」から、各カードが large/medium/small の
// どのサイズで表示されるかを求める共通ロジック。
//
// カードの並び方（グリッドの組み方）自体は RelationSheet.jsx が担当して
// いますが、「何番目の関係性が、どのサイズになるか」の判定はここに集約し、
// サイドバー側（画像の位置・範囲調整プレビュー）でも同じ判定を使えるように
// しています。
//
// ★ここを直すときは、必ず RelationSheet.jsx 側のレイアウト分岐と
//   一致させてください（ズレると「サイドバーで見た枠」と「実際の書き出し」が
//   食い違ってしまいます）。
// -----------------------------------------------------------------------
export function getRelationLayout(totalCount, index) {
  if (totalCount <= 1) return "large";
  if (totalCount === 2) return "medium";
  if (totalCount === 3) return index === 0 ? "large" : "small";
  return "small"; // 4件のとき
}

// 各レイアウトでの画像枠(imageBox)の縦横比（幅 ÷ 高さ）。
// src/styles/card.css の .imageBox のサイズ指定と対応しています。
// imageBoxのサイズそのものを変えた場合は、ここも合わせて直してください。
export const LAYOUT_IMAGE_ASPECT = {
  large: 320 / 280,
  medium: 320 / 320,
  small: 150 / 200,
};
