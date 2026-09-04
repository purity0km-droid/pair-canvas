// -----------------------------------------------------------------------
// 画像を枠にどう収めるかの計算（フェーズ7）
//
// 【なぜこの計算が必要か】
// フェーズ6までは、画像を CSS の object-fit:cover で表示していた。
// cover は「枠が埋まるように自動でトリミングする」表示方法なので、
//
//   - 100%（等倍）… 枠がぴったり埋まる（はみ出した部分は切り落とされる）
//   - 100%未満    … 「切り落とされた後の絵」がそのまま小さくなるだけで、
//                    切れていた部分は戻ってこない
//
// という挙動になっていた。「縮小して写真全体を枠に収めたい」という用途に
// 対して、これは期待と逆の動きだった。
//
// そこでフェーズ7から、切り取らない表示方法（object-fit:contain）を土台にし、
// そこへ「cover と同じ見た目になる倍率」を掛ける方式に変えた。
//
//   実際の倍率 = ユーザーが選んだ倍率 × coverFactor
//
// これにより、
//
//   - 100%   … coverFactor がちょうど掛かるので、見た目はこれまでと完全に同じ
//              （枠が埋まった状態。保存済みのデータも見え方が変わらない）
//   - 100%未満 … 縮小しながら、切れていた部分が戻ってきて、最終的に
//                写真全体が枠の中に収まる
//   - 100%超  … これまでどおり拡大してトリミングされる
//
// となる。
//
// 【coverFactor の求め方】
// 枠の縦横比を Af、写真の縦横比を Ai とすると、
//   contain の倍率 = min(枠幅/写真幅, 枠高/写真高)
//   cover   の倍率 = max(枠幅/写真幅, 枠高/写真高)
// で、その比は約分すると max(Af/Ai, Ai/Af) になる（必ず1以上）。
// つまり枠と写真の形が違うほど大きくなり、形が同じなら1（＝差が無い）。
// -----------------------------------------------------------------------
export function getCoverFactor(frameAspect, imageAspect) {
  if (!frameAspect || !imageAspect) return 1;
  if (!Number.isFinite(frameAspect) || !Number.isFinite(imageAspect)) return 1;

  return Math.max(frameAspect / imageAspect, imageAspect / frameAspect);
}

// 画像タグに当てるスタイルを組み立てる。
// カード（RelationCard）・サムネイル・位置調整ウインドウの3か所すべてで
// これを使うことで、どこで見ても同じ大きさ・同じ位置に見えるようにしている。
//
// imageAspect（写真そのものの縦横比）は読み込み完了まで分からないため、
// 分かるまでは今までどおり cover で表示する。cover と「contain×coverFactor」は
// 100%のときに完全に同じ見え方になるので、切り替わっても見た目は飛ばない。
export function buildImageStyle({ transform, frameAspect, imageAspect }) {
  const { scale = 1, x = 0, y = 0 } = transform || {};

  if (!imageAspect) {
    return {
      objectFit: "cover",
      transform: `translate(${x}%, ${y}%) scale(${scale})`,
    };
  }

  const factor = getCoverFactor(frameAspect, imageAspect);

  return {
    objectFit: "contain",
    transform: `translate(${x}%, ${y}%) scale(${scale * factor})`,
  };
}
