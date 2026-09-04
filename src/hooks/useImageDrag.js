import { useRef } from "react";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// -----------------------------------------------------------------------
// 画像のドラッグ移動（位置調整）をまとめた共通フック。
//
// もともとは RelationCard.jsx（プレビューカード上で直接つまんで動かす方式）
// だけにあった処理でしたが、ImageUploader.jsx（サイドバーの範囲調整枠）でも
// 同じ「つまんで動かす」機能が必要になったため、ここに切り出して両方から
// 使えるようにしています。
//
// 【boxSize について】
// ドラッグした距離(px)を「%」に変換するとき、何pxを100%とみなすかの基準です。
// - 渡さない場合：ドラッグしている要素自身の実際のサイズ(clientWidth/Height)を使う
//   （＝RelationCard.jsxでの、実物大の画像枠を直接つまむ場合の挙動）
// - 渡す場合：その固定サイズを基準にする
//   （＝ImageUploader.jsxのように、実際の枠より小さい/大きいプレビューの上で
//     ドラッグしていても、保存される％の値は「本来の枠の大きさ」基準で揃えたい場合）
//
// こうしておくことで、保存されるtransform（{scale, x, y}）の意味が
// どちらの場所で操作しても同じになり、値を共有できます。
// -----------------------------------------------------------------------
export function useImageDrag({ editable, hasImage, transform, onChange, boxSize }) {
  const boxRef = useRef(null);
  const dragState = useRef(null);

  function handlePointerDown(e) {
    if (!editable || !hasImage) return;
    const box = boxRef.current;
    if (!box) return;

    box.setPointerCapture?.(e.pointerId);
    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTransform: transform,
      boxWidth: boxSize?.width || box.clientWidth || 1,
      boxHeight: boxSize?.height || box.clientHeight || 1,
    };
  }

  function handlePointerMove(e) {
    if (!dragState.current) return;
    const { startX, startY, startTransform, boxWidth, boxHeight } =
      dragState.current;

    const dxPercent = ((e.clientX - startX) / boxWidth) * 100;
    const dyPercent = ((e.clientY - startY) / boxHeight) * 100;

    // 動かしすぎて画像が完全に枠外へ消えてしまわないよう、大まかに範囲を制限
    const nextX = clamp(startTransform.x + dxPercent, -50, 50);
    const nextY = clamp(startTransform.y + dyPercent, -50, 50);

    onChange({ ...startTransform, x: nextX, y: nextY });
  }

  function handlePointerUp(e) {
    if (!dragState.current) return;
    dragState.current = null;
    boxRef.current?.releasePointerCapture?.(e.pointerId);
  }

  return {
    boxRef,
    dragHandlers: editable && hasImage
      ? {
          onPointerDown: handlePointerDown,
          onPointerMove: handlePointerMove,
          onPointerUp: handlePointerUp,
          onPointerCancel: handlePointerUp,
        }
      : {},
  };
}
