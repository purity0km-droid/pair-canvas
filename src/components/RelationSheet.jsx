import { forwardRef } from "react";

import RelationCard from "./RelationCard";
import { getRelationLayout } from "../utils/relationLayout";

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
// editable=true のときだけ、カード内の画像をドラッグで動かせるようにします
// （PNG書き出し用の非表示コピーは editable=false のまま、常に静止画として扱う）。
// -----------------------------------------------------------------------
const RelationSheet = forwardRef(function RelationSheet(
  { page, relations, updateRelation, editable = false, extraClassName = "" },
  ref
) {
  const cls = `paper pattern-${page.backgroundPattern} ${
    editable ? "editable" : ""
  } ${extraClassName}`.trim();

  return (
    <div
      ref={ref}
      className={cls}
      style={{
        "--paper-color": page.backgroundColor,
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
              editable={editable}
              updateRelation={updateRelation}
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
                editable={editable}
                updateRelation={updateRelation}
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
                editable={editable}
                updateRelation={updateRelation}
              />
            </div>

            <div className="cardGrid threeBottom">
              <RelationCard
                relation={relations[1]}
                layout={getRelationLayout(3, 1)}
                editable={editable}
                updateRelation={updateRelation}
              />

              <RelationCard
                relation={relations[2]}
                layout={getRelationLayout(3, 2)}
                editable={editable}
                updateRelation={updateRelation}
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
                editable={editable}
                updateRelation={updateRelation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default RelationSheet;
