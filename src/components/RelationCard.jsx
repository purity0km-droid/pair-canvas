import "../styles/card.css";
import { useImageDrag } from "../hooks/useImageDrag";

// 画像のドラッグ移動（位置調整）の処理本体は src/hooks/useImageDrag.js に
// 共通化しています（サイドバーの範囲調整枠(ImageUploader.jsx)と共有するため）。
// editable が false（PNG書き出し用の非表示コピー）のときは何もしません。

function CharacterImage({ image, transform, editable, dragProps, boxRef, alt }) {
  const { scale = 1, x = 0, y = 0 } = transform || {};

  if (!image) {
    return (
      <div className="imageEmpty">
        ここに画像が
        <br />
        表示されます
      </div>
    );
  }

  return (
    <img
      ref={boxRef}
      src={image}
      alt={alt}
      className={`cardImage ${editable ? "draggable" : ""}`}
      style={{ transform: `translate(${x}%, ${y}%) scale(${scale})` }}
      // 【重要】<img>はブラウザの既定で「つかんでドラッグするとコピー/移動できる」
      // 機能(ネイティブドラッグ)が有効になっており、位置調整用の自前のドラッグ処理と
      // 競合してカクついたり、ブラウザ側の「画像をドラッグ中」の挙動が割り込みます。
      // draggable={false}とonDragStartでのpreventDefaultの両方でこれを止めています。
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      {...dragProps}
    />
  );
}

export default function RelationCard({
  relation,
  layout = "small",
  editable = false,
  updateRelation,
}) {
  const left = useImageDrag({
    editable,
    hasImage: !!relation.leftImage,
    transform: relation.leftImageTransform,
    onChange: (t) => updateRelation?.(relation.id, "leftImageTransform", t),
  });

  const right = useImageDrag({
    editable,
    hasImage: !!relation.rightImage,
    transform: relation.rightImageTransform,
    onChange: (t) => updateRelation?.(relation.id, "rightImageTransform", t),
  });

  // 左右の写真の大きさの比率（「おまけ」機能）。
  // "left" なら左を大きく／右を小さく、"right" ならその逆、
  // "even"（既定）なら何もしない（現状どおり均等）。
  // 縦横比自体は変えず、大きさだけを一定倍率で拡大縮小するので、
  // 位置調整モーダルのクロップ枠の縦横比計算(utils/relationLayout.js)には影響しない。
  const imageRatio = relation.imageRatio || "even";
  const leftRatioClass =
    imageRatio === "left" ? "ratioBig" : imageRatio === "right" ? "ratioSmall" : "";
  const rightRatioClass =
    imageRatio === "right" ? "ratioBig" : imageRatio === "left" ? "ratioSmall" : "";

  return (
    <div className={`relation-card ${layout}`}>

      <div className="characterArea">

        {/* 左キャラクター */}
        <div className={`character ${leftRatioClass}`}>

          <div className="imageBox">
            <CharacterImage
              image={relation.leftImage}
              transform={relation.leftImageTransform}
              editable={editable}
              dragProps={left.dragHandlers}
              boxRef={left.boxRef}
              alt=""
            />

            <div className="nameOverlay left">
              {relation.leftName || "左の名前"}
            </div>
          </div>

          <div className="subInfo">
            {relation.leftSub || "補足情報"}
          </div>

        </div>

        {/* 中央：関係性ラベル＋矢印（＋任意で下段のラベル） */}
        <div className="relationCenter">

          <div className="relationOverlay">

            <div className="relationLabel">
              {relation.relation || "関係性"}
            </div>

            <div className="arrow">
              ⇄
            </div>

            {relation.relationSub && (
              <div className="relationLabel relationLabelSub">
                {relation.relationSub}
              </div>
            )}

          </div>

        </div>

        {/* 右キャラクター */}
        <div className={`character ${rightRatioClass}`}>

          <div className="imageBox">
            <CharacterImage
              image={relation.rightImage}
              transform={relation.rightImageTransform}
              editable={editable}
              dragProps={right.dragHandlers}
              boxRef={right.boxRef}
              alt=""
            />

            <div className="nameOverlay right">
              {relation.rightName || "右の名前"}
            </div>
          </div>

          <div className="subInfo right">
            {relation.rightSub || "補足情報"}
          </div>

        </div>

      </div>

      <div className="storyTitle">
        {relation.storyTitle || "プロット名"}
      </div>

      <div className="description">
        {relation.description || "ここに関係性の説明が入ります。"}
      </div>

    </div>
  );
}
