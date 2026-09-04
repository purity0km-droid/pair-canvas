import RelationAccordion from "./RelationAccordion";
import { MAX_RELATIONS } from "../constants";

// 関係性の編集エリア。
//
// 【フェーズ5の変更：タブ＝表示の切り替えにした】
// 以前は関係性の件数ぶんだけ編集ボックスを縦に並べ、選択中のものだけ中身を
// 開く（アコーディオン）形にしていた。そのため②を選んでも①③の紫の
// ヘッダー帯が残り、「タブで切り替えているのに前のものが残っている」状態に
// なっていた。
// 今は「①②③のタブで表示するボックスそのものを切り替える」形にして、
// 選択中の1件だけを描画している。
//
// 全件を並べる形に戻したい場合は、下の selectedIndex で1件だけ描いている
// 箇所を relations.map(...) に戻し、RelationAccordion に isOpen / onToggle を
// 渡す形に戻す（RelationAccordion.jsx 側のコメントも参照）。
export default function RelationPanel({
  relations,
  layoutPreset,
  selectedRelationId,
  setSelectedRelationId,
  updateRelation,
  removeRelation,
  addRelation,
}) {
  const selectedIndex = relations.findIndex(
    (relation) => relation.id === selectedRelationId
  );

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

      {/* 選択中の1件だけを表示する。
          selectedIndex は「実際のカードで何番目に描かれるか」を
          RelationAccordion に伝えるために必要（画像枠の縦横比の判定に使う）。 */}
      {selectedIndex >= 0 && (

        <RelationAccordion
          key={relations[selectedIndex].id}
          relation={relations[selectedIndex]}
          index={selectedIndex}
          totalCount={relations.length}
          layoutPreset={layoutPreset}
          updateRelation={updateRelation}
          removeRelation={removeRelation}
        />

      )}

    </section>
  );
}
