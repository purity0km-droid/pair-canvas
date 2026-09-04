import "../styles/card.css";

// -----------------------------------------------------------------------
// RelationCard
//
// 【画像の位置調整について】
// 以前はこのプレビューカード上で画像を直接つまんで動かせるようにしていましたが、
// 「見るための場所」で操作できてしまうと、カードを触っただけで意図せず位置が
// ずれてしまうため、ドラッグ機能はここから外しました。
// 位置・拡大の調整は、サイドバーの「位置調整モーダル」(ImageUploader.jsx)
// だけで行います（ドラッグ処理の本体は src/hooks/useImageDrag.js）。
//
// つまりこのコンポーネントは「表示専用」です。画面プレビューでもPNG書き出し用の
// 非表示コピーでも、まったく同じ静止状態で描画されます。
// -----------------------------------------------------------------------

function CharacterImage({ image, transform, alt }) {
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
      src={image}
      alt={alt}
      className="cardImage"
      style={{ transform: `translate(${x}%, ${y}%) scale(${scale})` }}
      // <img>はブラウザ既定で「つかんでドラッグするとコピー/移動できる」状態に
      // なっており、プレビューを触ったときに画像のゴーストが付いてくる。
      // 表示専用なので、ここで止めておく。
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
    />
  );
}

export default function RelationCard({ relation, layout = "small" }) {
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

        {/* 中央：関係性ラベル（矢印の上・下とも任意）＋矢印
            上段・下段とも、入力が空ならラベル自体を出さない（フェーズ5）。
            以前は上段だけ空のときに「関係性」という文字を仮表示していたが、
            未入力の見本がそのまま書き出されてしまうため廃止した。
            両方とも空なら、中央には矢印だけが残る。 */}
        <div className="relationCenter">

          <div className="relationOverlay">

            {relation.relation && (
              <div className="relationLabel">
                {relation.relation}
              </div>
            )}

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
