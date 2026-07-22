export default function RelationEditor({
  relation,
  updateRelation,
}) {
  if (!relation) return null;

  return (
    <section className="panel">

      <h2>関係性編集</h2>

      <h3>左キャラクター</h3>

      <label>
        <span>表示名</span>
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

      <label>
        <span>補足</span>
        <textarea
          rows="2"
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

      <hr />

      <h3>右キャラクター</h3>

      <label>
        <span>表示名</span>
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

      <label>
        <span>補足</span>
        <textarea
          rows="2"
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

      <hr />

      <label>
        <span>関係性</span>
        <input
          type="text"
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

    </section>
  );
}