import "../styles/card.css";

export default function RelationCard({
  relation,
  layout = "small",
}) {
  return (
    <div className={`relation-card ${layout}`}>

      <div className="characterArea">

        {/* 左キャラクター */}
        <div className="character">

          <div className="imageBox">

            {relation.leftImage ? (
              <img
                src={relation.leftImage}
                alt=""
                className="cardImage"
              />
            ) : (
              <div className="imageEmpty">
                ここに画像が
                <br />
                表示されます
              </div>
            )}

            <div className="nameOverlay left">
              {relation.leftName || "左の名前"}
            </div>

          </div>

          <div className="subInfo">
            {relation.leftSub || "補足情報"}
          </div>

        </div>

        {/* 中央 */}
        <div className="relationCenter">

          <div className="relationOverlay">

            <div className="relationLabel">
              {relation.relation || "関係性"}
            </div>

            <div className="arrow">
              ⇄
            </div>

          </div>

        </div>

        {/* 右キャラクター */}
        <div className="character">

          <div className="imageBox">

            {relation.rightImage ? (
              <img
                src={relation.rightImage}
                alt=""
                className="cardImage"
              />
            ) : (
              <div className="imageEmpty">
                ここに画像が
                <br />
                表示されます
              </div>
            )}

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