import RelationAccordion from "./RelationAccordion";

export default function RelationPanel({
  relations,
  selectedRelationId,
  setSelectedRelationId,
  updateRelation,
  removeRelation,
  addRelation,
}) {
  return (
    <section className="panel">

      <div className="relationHeader">

        <h2>関係性</h2>

        <button
          className="addRelationButton"
          onClick={addRelation}
          disabled={relations.length >= 4}
        >
          ＋追加
        </button>

      </div>

      <div className="relationTabs">

        {relations.map((relation, index) => (

          <button
            key={relation.id}
            className={
              selectedRelationId === relation.id
                ? "relationTab active"
                : "relationTab"
            }
            onClick={() =>
              setSelectedRelationId(relation.id)
            }
          >
            {index + 1}
          </button>

        ))}

      </div>

      {relations.map((relation) => (

        <RelationAccordion
          key={relation.id}
          relation={relation}
          isOpen={selectedRelationId === relation.id}
          onToggle={() =>
            setSelectedRelationId(relation.id)
          }
          updateRelation={updateRelation}
          removeRelation={removeRelation}
        />

      ))}

    </section>
  );
}