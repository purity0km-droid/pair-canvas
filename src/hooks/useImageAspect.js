import { useState } from "react";

// -----------------------------------------------------------------------
// 表示中の写真そのものの縦横比（幅÷高さ）を知るためのフック（フェーズ7）。
//
// 「枠に対して写真をどれだけ拡大縮小するか」の計算に、写真自身の縦横比が
// 必要になる（utils/imageFit.js のコメント参照）。
// 縦横比は画像の読み込みが終わるまで分からないので、<img> の load イベントで
// naturalWidth / naturalHeight から求めている。
//
// 使い方：
//   const [imageAspect, handleImageLoad] = useImageAspect(image);
//   <img src={image} onLoad={handleImageLoad} ... />
//
// 画像を差し替えたら（image が変わったら）、前の写真の縦横比が残らないよう
// 自動でリセットされる。
// ※useEffectでリセットすると描画が1回余分に走るため、Reactが推奨している
//   「描画中に前回値と比べて調整する」書き方にしている。
// -----------------------------------------------------------------------
export function useImageAspect(image) {
  const [aspect, setAspect] = useState(null);
  const [lastImage, setLastImage] = useState(image);

  if (lastImage !== image) {
    setLastImage(image);
    setAspect(null);
  }

  function handleImageLoad(e) {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (!naturalWidth || !naturalHeight) return;

    setAspect(naturalWidth / naturalHeight);
  }

  return [aspect, handleImageLoad];
}
