import ImageUploader from "./ImageUploader";
import { getRelationLayout, LAYOUT_IMAGE_ASPECT } from "../utils/relationLayout";

export default function RelationAccordion({
  relation,
  index,
  totalCount,
  isOpen,
  onToggle,
  updateRelation,
  removeRelation,
}) {
  // この関係性が実際のカードで表示されるサイズ(large/medium/small)を求め、
  // 画像の位置調整プレビュー枠を「実際に書き出される画像と同じ縦横比」にする。
  // （判定ロジックは RelationSheet.jsx と揃えるため utils/relationLayout.js に集約）
  const layout = getRelationLayout(totalCount, index);
  const imageAspect = LAYOUT_IMAGE_ASPECT[layout];

  // 左右のキャラクター設定（画像・名前・補足・画像の位置調整）をまとめて入れ替える。
  // 4つのフィールドを個別にupdateRelationしているが、どれも「入れ替え前」の
  // relationの値を参照しているので、呼び出し順に関わらず正しく入れ替わる。
  function swapSides() {
    updateRelation(relation.id, "leftImage", relation.rightImage);
    updateRelation(relation.id, "rightImage", relation.leftImage);
    updateRelation(relation.id, "leftImageTransform", relation.rightImageTransform);
    updateRelation(relation.id, "rightImageTransform", relation.leftImageTransform);
    updateRelation(relation.id, "leftName", relation.rightName);
    updateRelation(relation.id, "rightName", relation.leftName);
    updateRelation(relation.id, "leftSub", relation.rightSub);
    updateRelation(relation.id, "rightSub", relation.leftSub);
  }

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

          <button
            type="button"
            className="swapSidesButton"
            onClick={swapSides}
          >
            ⇄ 左右を入れ替え
          </button>

          {/* 左画像
              【重要】ここは意図的に<label>ではなく<div>にしています。
              <label>で囲むと、中にある(隠れた)ファイル選択用<input>に
              クリックがすべて転送されてしまい、クロップ枠のドラッグ操作や
              「変更」ボタンのクリックのたびにファイル選択ダイアログが
              二重に開いてしまう不具合の原因になっていました。 */}
          <div className="fieldGroup">

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
              transform={relation.leftImageTransform}
              onTransformChange={(t) =>
                updateRelation(
                  relation.id,
                  "leftImageTransform",
                  t
                )
              }
              aspect={imageAspect}
            />

          </div>

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

            <textarea
              rows="2"
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

          {/* 右画像（左画像と同じ理由で<label>ではなく<div>にしています） */}
          <div className="fieldGroup">

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
              transform={relation.rightImageTransform}
              onTransformChange={(t) =>
                updateRelation(
                  relation.id,
                  "rightImageTransform",
                  t
                )
              }
              aspect={imageAspect}
            />

          </div>

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

            <textarea
              rows="2"
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

          {/* 関係性（矢印の上のラベル） */}
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

          {/* 関係性（矢印の下のラベル・任意／絵文字だけでもOK） */}
          <label>

            <span>関係性（矢印の下・任意）</span>

            <textarea
              rows="1"
              value={relation.relationSub}
              placeholder="空欄なら表示されません（例：🌙 など）"
              onChange={(e) =>
                updateRelation(
                  relation.id,
                  "relationSub",
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