import { forwardRef } from "react";

import RelationCard from "./RelationCard";
import {
  getRelationLayout,
  DEFAULT_LAYOUT_PRESET,
  DEFAULT_DESC_SCALE,
  clampDescScale,
} from "../utils/relationLayout";

// -----------------------------------------------------------------------
// RelationSheet
//
// 「関係性シート」本体（タイトル＋カードの並び）を組み立てる共通コンポーネント。
//
// 以前は、画面プレビュー用の Preview.jsx と PNG書き出し用の ExportPreview.jsx に
// 同じレイアウト分岐（1〜4件でカードの並べ方を変える処理）がそれぞれ書かれていて、
// 片方だけ直して見た目がズレる、ということが起きていました。
//
// 今はこのファイル1つが「見た目の並び」の唯一の場所です。
// カードの並び（1〜4件時のレイアウト）を変えたい場合は、このファイルだけ直せば
// 画面表示・PNG書き出しの両方に同じように反映されます。
//
// シートは画面プレビュー・PNG書き出しのどちらでも「表示専用」です
// （画像の位置調整はサイドバーの位置調整モーダルだけで行う。RelationCard.jsx参照）。
// -----------------------------------------------------------------------
const RelationSheet = forwardRef(function RelationSheet(
  { page, relations, extraClassName = "" },
  ref
) {
  const cls = `paper pattern-${page.backgroundPattern} ${extraClassName}`.trim();

  // レイアウトプリセットはシート全体で1つ（フェーズ6）。
  // 全カードに同じ値を渡すので、ここで一度だけ取り出しておく。
  const preset = page.layoutPreset || DEFAULT_LAYOUT_PRESET;

  // 説明文の文字サイズの倍率（フェーズ9で「語り」限定、フェーズ10で全レイアウトへ）。
  // カードごとにclassを足す代わりに、シート直下のCSS変数として1回だけ渡す。
  // card.css 側は font-size:calc(基準px * var(--desc-scale)) で参照し、
  // 基準px（=100%のときの実寸）はレイアウトごとにCSS側が持っている。
  // こうしておくと、カードの枚数ぶんある <RelationCard> を触らずに済み、
  // 画面プレビューとPNG書き出しの両方に同じ値が効く（どちらもこの共通部品）。
  const descScale = clampDescScale(page.descTextScale ?? DEFAULT_DESC_SCALE);

  return (
    <div
      ref={ref}
      className={cls}
      style={{
        "--paper-color": page.backgroundColor,
        "--desc-scale": descScale,
        color: page.textColor,
        fontFamily: page.fontFamily,
      }}
    >
      {page.showTitle && <h1>{page.title || "タイトル"}</h1>}

      <div className="paperContent">
        {/* 1枚 */}
        {relations.length === 1 && (
          <div className="cardGrid one">
            <RelationCard
              relation={relations[0]}
              layout={getRelationLayout(1, 0)}
              preset={preset}
            />
          </div>
        )}

        {/* 2枚 */}
        {relations.length === 2 && (
          <div className="cardGrid two">
            {relations.map((relation, index) => (
              <RelationCard
                key={relation.id}
                relation={relation}
                layout={getRelationLayout(2, index)}
                preset={preset}
              />
            ))}
          </div>
        )}

        {/* 3枚 */}
        {relations.length === 3 && (
          <>
            <div className="cardGrid threeTop">
              <RelationCard
                relation={relations[0]}
                layout={getRelationLayout(3, 0)}
                preset={preset}
              />
            </div>

            <div className="cardGrid threeBottom">
              <RelationCard
                relation={relations[1]}
                layout={getRelationLayout(3, 1)}
                preset={preset}
              />

              <RelationCard
                relation={relations[2]}
                layout={getRelationLayout(3, 2)}
                preset={preset}
              />
            </div>
          </>
        )}

        {/* 4枚 */}
        {relations.length === 4 && (
          <div className="cardGrid four">
            {relations.map((relation, index) => (
              <RelationCard
                key={relation.id}
                relation={relation}
                layout={getRelationLayout(4, index)}
                preset={preset}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default RelationSheet;
