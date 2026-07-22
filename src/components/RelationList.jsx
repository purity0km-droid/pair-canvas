export default function RelationList({
  relations,
  selectedRelationId,
  setSelectedRelationId,
  addRelation,
}) {
  return (
    <section className="panel">

      <h2>関係性</h2>

      <div className="relationList">

        {relations.map((relation, index) => (

          <div
            key={relation.id}
            className={
              relation.id === selectedRelationId
                ? "relationItem active"
                : "relationItem"
            }
            onClick={() => setSelectedRelationId(relation.id)}
          >
            <strong>{index + 1}.</strong> {relation.name}
          </div>

        ))}

      </div>

      <button
        className="addButton"
        onClick={addRelation}
        disabled={relations.length >= 4}
      >
        ＋ 関係性を追加
      </button>

    </section>
  );
}