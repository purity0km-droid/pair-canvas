import "../styles/preview.css";
import "../styles/exportPreview.css";

import RelationCard from "./RelationCard";

export default function ExportPreview({
  page,
  relations,
  exportPreviewRef,
}) {
  return (
    <div className="preview">

      <div
        ref={exportPreviewRef}
        className={`paper pattern-${page.backgroundPattern} export-pc`}
        style={{
          "--paper-color": page.backgroundColor,
          color: page.textColor,
          fontFamily: page.fontFamily,
        }}
      >

        {page.showTitle && (
          <h1>{page.title || "タイトル"}</h1>
        )}

        <div className="paperContent">

          {/* 1枚 */}
          {relations.length === 1 && (
            <div className="cardGrid one">

              <RelationCard
                relation={relations[0]}
                layout="large"
                updateRelation={() => {}}
              />

            </div>
          )}

          {/* 2枚 */}
          {relations.length === 2 && (
            <div className="cardGrid two">

              {relations.map((relation) => (
                <RelationCard
                  key={relation.id}
                  relation={relation}
                  layout="medium"
                  updateRelation={() => {}}
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
                  layout="large"
                  updateRelation={() => {}}
                />

              </div>

              <div className="cardGrid threeBottom">

                <RelationCard
                  relation={relations[1]}
                  layout="small"
                  updateRelation={() => {}}
                />

                <RelationCard
                  relation={relations[2]}
                  layout="small"
                  updateRelation={() => {}}
                />

              </div>
            </>
          )}

          {/* 4枚 */}
          {relations.length === 4 && (
            <div className="cardGrid four">

              {relations.map((relation) => (
                <RelationCard
                  key={relation.id}
                  relation={relation}
                  layout="small"
                  updateRelation={() => {}}
                />
              ))}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}