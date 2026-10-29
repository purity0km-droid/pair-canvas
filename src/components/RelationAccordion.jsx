import ImageUploader from "./ImageUploader";
import PairGlyph from "./PairGlyph";
import {
  getRelationLayout,
  getImageAspect,
  DEFAULT_LAYOUT_PRESET,
} from "../utils/relationLayout";

// 関係性1件ぶんの編集ボックス。
//
// 【フェーズ5の変更：開閉しなくなった】
// もともとはクリックで開閉するアコーディオンだったが、①②③のタブで
// 表示するボックスそのものを切り替える形になり（RelationPanel.jsx参照）、
// 画面に出るのは常に選択中の1件だけになった。開くものが1つしか無い以上
// 開閉ボタンはタブと役割が重複して紛らわしいので、
//
//   - 紫の帯を <button>（クリックで開閉）から <div>（ただの見出し）に変更
//   - 先頭の ▼ / ▶ アイコンを廃止
//   - 中身は常に表示（isOpen による出し分けをやめた）
//
// とした。帯に出している「関係性N」「左の名前 ⇄ 右の名前」の情報表示は
// そのまま残している（今どれを編集しているかの目印になるため）。
//
// 開閉する形に戻すなら、帯を <button onClick={onToggle}> に戻し、
// isOpen / onToggle を props で受け取って中身を {isOpen && (...)} で囲む。
// ファイル名は差分を大きくしないため Accordion のままにしてある。
// 見出しの帯に並べる小さな丸写真（2026-10-29）。
// 画像があれば写真を、無ければ名前の1文字目（名前も無ければ「？」）を出す。
// どの関係性を編集しているかが、番号より先に顔で分かるようにしている。
// 位置調整の値は反映しない（帯の丸は小さすぎて差が見えないため）。
function PairAvatar({ image, name }) {
  if (image) {
    return (
      <span className="pairAvatar">
        <img src={image} alt="" draggable={false} />
      </span>
    );
  }
  // 絵文字などサロゲートペアの文字を半分で切らないよう Array.from で分ける
  const initial = Array.from(name.trim())[0] ?? "？";
  return <span className="pairAvatar empty">{initial}</span>;
}

// 小見出し（左のキャラクター／右のキャラクター／ふたりの関係）
function FieldSectionTitle({ side, children }) {
  return (
    <h3 className="fieldSectionTitle">
      <PairGlyph side={side} />
      {children}
    </h3>
  );
}

export default function RelationAccordion({
  relation,
  index,
  totalCount,
  layoutPreset = DEFAULT_LAYOUT_PRESET,
  updateRelation,
  removeRelation,
  moveRelation,
}) {
  // この関係性が実際のカードで表示されるサイズ(large/medium/small)を求め、
  // 画像の位置調整プレビュー枠を「実際に書き出される画像と同じ縦横比」にする。
  // （判定ロジックは RelationSheet.jsx と揃えるため utils/relationLayout.js に集約）
  //
  // フェーズ6でレイアウトプリセットが入り、枠の形はサイズだけでなく
  // プリセットによっても変わるようになったため、両方を渡して求めている。
  const layout = getRelationLayout(totalCount, index);
  const imageAspect = getImageAspect(layoutPreset, layout);

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

  // 【2026-10-29】外側を <section className="panel"> から <div> にした。
  // RelationPanel.jsx の .panel の中に .panel が入れ子になり、
  // .panel:first-of-type の余白・罫線の打ち消しにたまたま頼っていたため。
  return (
    <div className="relationEditor">

      {/* 見出しの帯。クリックしても何も起きない「ラベル」なので、
          ボタンではなく div にしている（フェーズ5）。
          2026-10-29 に紫の塗りつぶしをやめて薄い紫の面にし、
          左にふたりの小さな丸写真を重ねて置いた */}
      <div className="accordionHeader">

        <div className="pairAvatars">
          <PairAvatar image={relation.leftImage} name={relation.leftName} />
          <PairAvatar image={relation.rightImage} name={relation.rightName} />
        </div>

        <div className="accordionText">

          <div className="accordionTitle">
            {relation.name}
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

      </div>

      <div className="accordionBody">

        {/* 入れ替えの2つ（このカードの左右／カードの並び順）を1行にまとめた
            （2026-10-29）。どちらも「並びを変える」操作なので */}
        <div className="relationTools">

          {/* 表示名はフェーズ5で「左右を入れ替え」→「画像位置入替」に変更。
              ※動作は名称変更前と同じで、画像だけでなく名前・補足情報・
                画像の位置調整もまとめて左右入れ替えている（swapSides参照）。
                画像だけを入れ替える動作に変えたい場合は、swapSides から
                leftName/rightName・leftSub/rightSub の行を外す。 */}
          <button
            type="button"
            className="swapSidesButton"
            onClick={swapSides}
          >
            ⇄ 画像位置入替
          </button>

          {/* カードの並び順の入れ替え（フェーズ8）。
              関係性が2件以上あるときだけ出す。1件しか無いときに
              押せないボタンが並んでいても意味が無いため。
              並び順は relations 配列の順番そのままなので、隣と入れ替えると
              シート上のカードの位置も入れ替わる（App.jsx の moveRelation）。 */}
          {totalCount > 1 && (
            <div className="cardOrderRow">
              <span>カード位置</span>

              <button
                type="button"
                className="cardOrderButton"
                onClick={() => moveRelation?.(relation.id, -1)}
                disabled={index === 0}
                title="ひとつ前の位置へ移動"
              >
                ◀ 前へ
              </button>

              <button
                type="button"
                className="cardOrderButton"
                onClick={() => moveRelation?.(relation.id, 1)}
                disabled={index === totalCount - 1}
                title="ひとつ後ろの位置へ移動"
              >
                次へ ▶
              </button>
            </div>
          )}

        </div>

        <FieldSectionTitle side="left">左のキャラクター</FieldSectionTitle>

        {/* 左画像
            【重要】ここは意図的に<label>ではなく<div>にしています。
            <label>で囲むと、中にある(隠れた)ファイル選択用<input>に
            クリックがすべて転送されてしまい、クロップ枠のドラッグ操作や
            「変更」ボタンのクリックのたびにファイル選択ダイアログが
            二重に開いてしまう不具合の原因になっていました。 */}
        <div className="fieldGroup">

          <span>画像</span>

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

          <span>名前</span>

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

          <span>補足情報</span>

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

        <FieldSectionTitle side="right">右のキャラクター</FieldSectionTitle>

        {/* 右画像（左画像と同じ理由で<label>ではなく<div>にしています） */}
        <div className="fieldGroup">

          <span>画像</span>

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

          <span>名前</span>

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

          <span>補足情報</span>

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

        <FieldSectionTitle side="both">ふたりの関係</FieldSectionTitle>

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
        type="button"
        className="deleteButton"
        onClick={() => removeRelation(relation.id)}
      >
        🗑 削除
      </button>

      </div>

    </div>
  );
}