import "../styles/preview.css";

import RelationCard from "./RelationCard";

export default function Preview({
  page,
  relations,
  updateRelation,
  previewRef,
  exportPreviewRef,
  exportMode = false,
}) {

  const exportClass =
    exportMode
      ? relations.length === 1
        ? "export-mode-single"
        : "export-mode"
      : "";

  return (
    <div className="preview">

      <div
        ref={exportMode ? exportPreviewRef : previewRef}
        className={`paper pattern-${page.backgroundPattern} ${exportClass}`}
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
                updateRelation={updateRelation}
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
                  layout="large"
                  updateRelation={updateRelation}
                />

              </div>

              <div className="cardGrid threeBottom">

                <RelationCard
                  relation={relations[1]}
                  layout="small"
                  updateRelation={updateRelation}
                />

                <RelationCard
                  relation={relations[2]}
                  layout="small"
                  updateRelation={updateRelation}
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
                  updateRelation={updateRelation}
                />
              ))}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}