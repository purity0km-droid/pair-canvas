import ImageUploader from "./ImageUploader";

export default function RelationAccordion({
  relation,
  isOpen,
  onToggle,
  updateRelation,
  removeRelation,
}) {
  return (
    <section className="panel">

      <button
        className="accordionHeader"
        onClick={onToggle}
      >
        <div>

          <div className="accordionTitle">
            <span className="accordionIcon">
              {isOpen ? "▼" : "▶"}
            </span>

            <strong>{relation.name}</strong>
          </div>

          <div className="accordionSummary">
            {relation.leftName || "未設定"}
            {" ⇄ "}
            {relation.rightName || "未設定"}
          </div>

          {relation.relation && (
            <div className="accordionRelation">
              {relation.relation}
            </div>
          )}

        </div>
      </button>

      {isOpen && (

        <div className="accordionBody">

          {/* 左画像 */}
          <label>

            <span>左画像</span>

            <ImageUploader
              image={relation.leftImage}
              onChange={(image) =>
                updateRelation(
                  relation.id,
                  "leftImage",
                  image
                )
              }
            />

          </label>

          {/* 左名前 */}
          <label>

            <span>左の名前</span>

            <input
              type="text"
              value={relation.leftName}
              onChange={(e) =>
                updateRelation(
                  relation.id,
                  "leftName",
                  e.target.value
                )
              }
            />

          </label>

          {/* 左補足 */}
          <label>

            <span>左補足情報</span>

            <input
              type="text"
              value={relation.leftSub}
              onChange={(e) =>
                updateRelation(
                  relation.id,
                  "leftSub",
                  e.target.value
                )
              }
            />

          </label>

          {/* 右画像 */}
          <label>

            <span>右画像</span>

            <ImageUploader
              image={relation.rightImage}
              onChange={(image) =>
                updateRelation(
                  relation.id,
                  "rightImage",
                  image
                )
              }
            />

          </label>

          {/* 右名前 */}
          <label>

            <span>右の名前</span>

            <input
              type="text"
              value={relation.rightName}
              onChange={(e) =>
                updateRelation(
                  relation.id,
                  "rightName",
                  e.target.value
                )
              }
            />

          </label>

          {/* 右補足 */}
          <label>

            <span>右補足情報</span>

            <input
              type="text"
              value={relation.rightSub}
              onChange={(e) =>
                updateRelation(
                  relation.id,
                  "rightSub",
                  e.target.value
                )
              }
            />

          </label>

          {/* 関係性 */}
          <label>

            <span>関係性</span>

            <textarea
              rows="2"
              value={relation.relation}
              onChange={(e) =>
                updateRelation(
                  relation.id,
                  "relation",
                  e.target.value
                )
              }
            />

          </label>

          {/* プロット名 */}
          <label>

            <span>プロット名</span>

            <input
              type="text"
              value={relation.storyTitle}
              onChange={(e) =>
                updateRelation(
                  relation.id,
                  "storyTitle",
                  e.target.value
                )
              }
            />

          </label>

          {/* 説明 */}
          <label>

            <span>説明</span>

            <textarea
              rows="8"
              value={relation.description}
              onChange={(e) =>
                updateRelation(
                  relation.id,
                  "description",
                  e.target.value
                )
              }
            />

          </label>

          <button
            className="deleteButton"
            onClick={() => removeRelation(relation.id)}
          >
            🗑 削除
          </button>

        </div>

      )}

    </section>
  );
}