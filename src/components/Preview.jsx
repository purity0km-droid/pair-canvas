import { useLayoutEffect, useRef, useState } from "react";

import "../styles/preview.css";

import RelationSheet from "./RelationSheet";

// .paper の設計上の実寸幅（card.css / preview.css はこの幅を基準に組まれている）
const DESIGN_WIDTH = 1000;

// ズーム倍率の選べる範囲と刻み（フェーズ5）
// 1 = 「画面にちょうど収まる大きさ」。ここを基準に何倍にするかを持つ。
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.5;

export default function Preview({ page, relations, previewRef }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [fitScale, setFitScale] = useState(1);
  const [naturalHeight, setNaturalHeight] = useState(0);

  // -----------------------------------------------------------------
  // 拡大表示（フェーズ5）
  //
  // スマホ幅では 1000px の設計を画面幅に合わせて縮小するため、375px幅だと
  // 約0.335倍になり、設計上12pxの文字が実質4pxになって読めませんでした。
  //
  // ブラウザ標準のピンチズームも使えます（index.html の viewport に
  // user-scalable=no は入れていません）が、ヘッダーやサイドバーごと拡大されて
  // しまい、見たいところに合わせるのが難しいので、プレビュー専用の
  // 拡大操作を用意しました。
  //
  //   実際の縮小率 = fitScale（画面に収まる倍率） × zoom（この操作で変える倍率）
  //
  // zoom=1 が「画面にちょうど収まる大きさ」、2 なら倍の大きさです。
  // 拡大すると横にはみ出すので、preview.css 側で横スクロールできるように
  // しています（指で左右になぞって見る）。
  //
  // この操作は画面表示だけのもので、PNG書き出し（ExportPreview）には
  // いっさい影響しません。書き出される画像は常に実寸1000px基準のままです。
  // -----------------------------------------------------------------
  const [zoom, setZoom] = useState(1);

  const scale = fitScale * zoom;

  // 縮小表示になっていない（＝ほぼ実寸で見えている）ときは拡大する意味が
  // 無いので、操作列そのものを出さない。
  // 逆に言うと、PC幅でもウィンドウが狭くてプレビューが縮んでいるときは
  // 表示される（例：ウィンドウ1280px → 縮小率0.75で表示される）。
  // スマホでだけ出したい場合は、この条件を画面幅で判定する形に変える。
  const showZoomControls = fitScale < 0.95;

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
  //
  // 【useEffectではなくuseLayoutEffectを使う理由】
  // 初期状態は scale=1（等倍）から始まるため、通常のuseEffect（画面に描画した後で
  // 実行される）だと、スマホ幅などでは「一瞬だけ縮小前の大きいカードが見えてから
  // 一気に縮む」というチラつきが発生します。
  // useLayoutEffectは画面に描画される直前に実行されるため、このチラつきを防げます。
  // -----------------------------------------------------------------
  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const update = () => {
      // 【重要】幅は outer ではなく、その親（.zoomViewport）から取る。
      // outer 自身は拡大時に画面幅より広くなるため、outer の幅で計算すると
      // 「拡大する → 枠が広がる → もっと拡大できる」という無限ループになる。
      const base = outer.parentElement ?? outer;
      const width = base.clientWidth;
      setFitScale(width > 0 ? width / DESIGN_WIDTH : 1);
      setNaturalHeight(inner.scrollHeight);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(outer.parentElement ?? outer);
    ro.observe(inner);

    return () => ro.disconnect();
    // page/relations が変わるたび（文章が伸びる等）に高さを測り直す
  }, [page, relations]);

  return (
    <div className="preview">

      {showZoomControls && (
        <div className="zoomBar">

          <button
            type="button"
            className="zoomButton"
            onClick={() =>
              setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))
            }
            disabled={zoom <= ZOOM_MIN}
            aria-label="プレビューを縮小"
            title="プレビューを縮小"
          >
            −
          </button>

          {/* 「画面に収まる大きさ」を100%とした表示。
              書き出されるPNGの実寸に対する倍率ではない点に注意。 */}
          <span className="zoomValue">{Math.round(zoom * 100)}%</span>

          <button
            type="button"
            className="zoomButton"
            onClick={() =>
              setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))
            }
            disabled={zoom >= ZOOM_MAX}
            aria-label="プレビューを拡大"
            title="プレビューを拡大"
          >
            ＋
          </button>

          <button
            type="button"
            className="zoomReset"
            onClick={() => setZoom(1)}
            disabled={zoom === 1}
          >
            全体表示
          </button>

        </div>
      )}

      {/* 拡大したときに横へはみ出したぶんをスクロールで見るための枠。
          縮小率の計算はこの枠の幅を基準にしている（上のupdate参照）。 */}
      <div className="zoomViewport">
        {/* 縮小・拡大した「後」の大きさをそのままこの箱の大きさにしている。
            transform:scale() は見た目を変えるだけで場所を取る大きさは
            変わらないため、ここで実サイズを指定しないと、
            拡大しても横スクロールできず、縮小すると下に余白が残る。 */}
        <div
          ref={outerRef}
          className="scaleOuter"
          style={
            naturalHeight
              ? {
                  width: DESIGN_WIDTH * scale,
                  height: naturalHeight * scale,
                }
              : undefined
          }
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
            />
          </div>
        </div>
      </div>

    </div>
  );
}
