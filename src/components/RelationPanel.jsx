import RelationAccordion from "./RelationAccordion";
import { MAX_RELATIONS } from "../constants";

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

      <h2>関係性</h2>

      {/* 番号タブの並びの最後に「＋」を同じ丸ボタンとして続ける形にした
          （以前は右上に別デザインの「＋追加」ボタンが独立していた） */}
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

        <button
          className="relationTab addTab"
          onClick={addRelation}
          disabled={relations.length >= MAX_RELATIONS}
          aria-label="関係性を追加"
          title="関係性を追加"
        >
          ＋
        </button>

      </div>

      {relations.map((relation, index) => (

        <RelationAccordion
          key={relation.id}
          relation={relation}
          index={index}
          totalCount={relations.length}
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
