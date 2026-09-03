import { useEffect, useRef, useState } from "react";

import "../styles/preview.css";

import RelationSheet from "./RelationSheet";

// .paper の設計上の実寸幅（card.css / preview.css はこの幅を基準に組まれている）
const DESIGN_WIDTH = 1000;

export default function Preview({ page, relations, updateRelation, previewRef }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [naturalHeight, setNaturalHeight] = useState(0);

  // -----------------------------------------------------------------
  // 入力中のプレビューを「常に書き出し画像と同じ配置」で見せるための処理。
  //
  // 以前はスマホ幅のときにCSSでレイアウトそのものを組み替えていたため、
  // 入力中に見えている配置と、実際に書き出されるPNGの配置がズレることが
  // ありました（画像が横並び→縦積みになる等）。
  //
  // 今は配置は常に固定（DESIGN_WIDTH＝1000px基準）のままにして、
  // 画面が狭いときは transform: scale() でカード全体を丸ごと縮小表示するだけに
  // しています。これにより「入力中に見えている見た目＝書き出される見た目」に
  // なります。
  //
  // 説明文などの自由入力が長くなってカードの縦が伸びても、画像の大きさ自体は
  // DESIGN_WIDTH基準の一定の縮小率のままです（伸びた分はスクロールで見る形）。
  //
  // レイアウトの並び自体を変えたい場合は RelationSheet.jsx を、
  // 「どこまで縮小するか」を変えたい場合はこのファイルの DESIGN_WIDTH を見てください。
  // -----------------------------------------------------------------
  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const update = () => {
      const width = outer.clientWidth;
      setScale(width > 0 ? width / DESIGN_WIDTH : 1);
      setNaturalHeight(inner.scrollHeight);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(outer);
    ro.observe(inner);

    return () => ro.disconnect();
    // page/relations が変わるたび（文章が伸びる等）に高さを測り直す
  }, [page, relations]);

  return (
    <div className="preview">
      <div
        ref={outerRef}
        className="scaleOuter"
        style={naturalHeight ? { height: naturalHeight * scale } : undefined}
      >
        <div
          ref={innerRef}
          className="scaleInner"
          style={{ width: DESIGN_WIDTH, transform: `scale(${scale})` }}
        >
          <RelationSheet
            ref={previewRef}
            page={page}
            relations={relations}
            updateRelation={updateRelation}
            editable
          />
        </div>
      </div>
    </div>
  );
}
