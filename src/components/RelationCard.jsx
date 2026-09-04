import "../styles/card.css";

import { DEFAULT_LAYOUT_PRESET, getImageAspect } from "../utils/relationLayout";
import { buildImageStyle } from "../utils/imageFit";
import { useImageAspect } from "../hooks/useImageAspect";

// -----------------------------------------------------------------------
// RelationCard
//
// 関係性1件ぶんのカード。画面プレビューでもPNG書き出し用の非表示コピーでも、
// まったく同じ静止状態で描画される「表示専用」のコンポーネントです。
//
// 【画像の位置調整について】
// 以前はこのカード上で画像を直接つまんで動かせるようにしていましたが、
// 「見るための場所」で操作できてしまうと、触っただけで意図せず位置が
// ずれてしまうため、ドラッグ機能はここから外しました。
// 位置・拡大の調整は、サイドバーの「位置調整モーダル」(ImageUploader.jsx)
// だけで行います（ドラッグ処理の本体は src/hooks/useImageDrag.js）。
//
// 【レイアウトプリセットについて（フェーズ6）】
// preset に応じて中身の組み方を切り替えます。プリセットはシート全体で
// 1つだけ選ぶ設定で、一覧は utils/relationLayout.js の LAYOUT_PRESETS。
// 実寸（画像枠の大きさなど）はCSS変数 --img-w / --img-h で
// card.css 側が「プリセット × サイズ」ごとに与えています。
//
// プリセットを追加するときは、
//   1. relationLayout.js の LAYOUT_PRESETS と IMAGE_BOX_SIZE
//   2. このファイルの renderBody のswitch
//   3. card.css の該当セクション
// の3か所をセットで足してください。
// -----------------------------------------------------------------------

function CharacterImage({ image, transform, frameAspect, alt }) {
  // 写真そのものの縦横比。読み込みが終わるまでは null。
  // これが分かると「切り取らない表示」に切り替わり、100%未満に縮小したときに
  // 切れていた部分が戻ってくる（utils/imageFit.js のコメント参照）。
  const [imageAspect, handleImageLoad] = useImageAspect(image);

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
      style={buildImageStyle({ transform, frameAspect, imageAspect })}
      onLoad={handleImageLoad}
      // <img>はブラウザ既定で「つかんでドラッグするとコピー/移動できる」状態に
      // なっており、プレビューを触ったときに画像のゴーストが付いてくる。
      // 表示専用なので、ここで止めておく。
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
    />
  );
}

// 画像枠＋その上に重ねる名前帯。
// 名前帯の暗色スクリムは、ユーザーが自由な写真・背景色を選べる仕様上、
// 文字の読みやすさを保証するために必須なので外さないこと。
function Portrait({ image, transform, name, side, frameAspect, showName = true }) {
  return (
    <div className="imageBox">
      <CharacterImage
        image={image}
        transform={transform}
        frameAspect={frameAspect}
        alt=""
      />

      {showName && (
        <div className={`nameOverlay ${side}`}>
          {name || (side === "left" ? "左の名前" : "右の名前")}
        </div>
      )}
    </div>
  );
}

function SubInfo({ text, side }) {
  return (
    <div className={side === "right" ? "subInfo right" : "subInfo"}>
      {text || "補足情報"}
    </div>
  );
}

// 中央の関係性ラベル（矢印の上・下とも任意）。
// 上段・下段とも入力があるときだけ出す。両方とも空なら矢印だけが残る。
function RelationLabels({ relation, relationSub, variant = "" }) {
  return (
    <div className={`relationOverlay ${variant}`.trim()}>
      {relation && <div className="relationLabel">{relation}</div>}

      <div className="arrow">⇄</div>

      {relationSub && (
        <div className="relationLabel relationLabelSub">{relationSub}</div>
      )}
    </div>
  );
}

function StoryTitle({ text }) {
  return <div className="storyTitle">{text || "プロット名"}</div>;
}

function Description({ text }) {
  return (
    <div className="description">
      {text || "ここに関係性の説明が入ります。"}
    </div>
  );
}

export default function RelationCard({
  relation,
  layout = "small",
  preset = DEFAULT_LAYOUT_PRESET,
}) {
  // この組み合わせ（プリセット × サイズ）での画像枠の縦横比。
  // 「切り取らない表示」の倍率計算に使うため、各画像へ渡している
  // （サイドバーの位置調整ウインドウも同じ値を使うので、見え方が一致する）。
  const frameAspect = getImageAspect(preset, layout);

  const left = (
    <div className="character">
      <Portrait
        image={relation.leftImage}
        transform={relation.leftImageTransform}
        name={relation.leftName}
        side="left"
        frameAspect={frameAspect}
      />
      <SubInfo text={relation.leftSub} side="left" />
    </div>
  );

  const right = (
    <div className="character">
      <Portrait
        image={relation.rightImage}
        transform={relation.rightImageTransform}
        name={relation.rightName}
        side="right"
        frameAspect={frameAspect}
      />
      <SubInfo text={relation.rightSub} side="right" />
    </div>
  );

  // 左右の補足情報だけを1行にまとめたもの
  // （画像の下ではなく、カードの下側にまとめて置くプリセット用）
  const subInfoRow = (
    <div className="subInfoRow">
      <SubInfo text={relation.leftSub} side="left" />
      <SubInfo text={relation.rightSub} side="right" />
    </div>
  );

  function renderBody() {
    switch (preset) {
      // ---- 帯（フルブリード）------------------------------------------
      // 写真をカード幅いっぱいに2分割し、その継ぎ目に関係性を大きく置く。
      case "band":
        return (
          <>
            <div className="bandArea">
              <div className="bandHalf">
                <Portrait
                  image={relation.leftImage}
                  transform={relation.leftImageTransform}
                  name={relation.leftName}
                  side="left"
                  frameAspect={frameAspect}
                />
              </div>

              <div className="bandHalf">
                <Portrait
                  image={relation.rightImage}
                  transform={relation.rightImageTransform}
                  name={relation.rightName}
                  side="right"
                  frameAspect={frameAspect}
                />
              </div>

              <div className="relationCenter">
                <RelationLabels
                  relation={relation.relation}
                  relationSub={relation.relationSub}
                  variant="onBand"
                />
              </div>
            </div>

            <div className="bandBody">
              {subInfoRow}
              <StoryTitle text={relation.storyTitle} />
              <Description text={relation.description} />
            </div>
          </>
        );

      // ---- 交差（重ね）------------------------------------------------
      // 2枚を横に重ねて「近さ」そのものを絵にする。
      case "overlap":
        return (
          <>
            <div className="overlapArea">
              <div className="overlapFront">
                <Portrait
                  image={relation.leftImage}
                  transform={relation.leftImageTransform}
                  name={relation.leftName}
                  side="left"
                  frameAspect={frameAspect}
                />
              </div>

              <div className="overlapBack">
                <Portrait
                  image={relation.rightImage}
                  transform={relation.rightImageTransform}
                  name={relation.rightName}
                  side="right"
                  frameAspect={frameAspect}
                />
              </div>

              <div className="relationCenter">
                <RelationLabels
                  relation={relation.relation}
                  relationSub={relation.relationSub}
                />
              </div>
            </div>

            {subInfoRow}
            <StoryTitle text={relation.storyTitle} />
            <Description text={relation.description} />
          </>
        );

      // ---- 見出し ------------------------------------------------------
      // 関係性の言葉をカードの一番上に大見出しとして出す。
      // 読む順番が「関係性 → 2人 → 話」になり、紹介文として素直。
      case "headline":
        return (
          <>
            {(relation.relation || relation.relationSub) && (
              <div className="headlineBlock">
                {relation.relation && (
                  <div className="headlineMain">{relation.relation}</div>
                )}
                {relation.relationSub && (
                  <div className="headlineSub">{relation.relationSub}</div>
                )}
              </div>
            )}

            <div className="characterArea headlineArea">
              {left}
              {right}
            </div>

            <StoryTitle text={relation.storyTitle} />
            <Description text={relation.description} />
          </>
        );

      // ---- 双方向 ------------------------------------------------------
      // 矢印を上下2本に分け、左→右と右→左で別々の言葉を置く。
      // 既存の relation（矢印の上）と relationSub（矢印の下）を
      // そのまま →／← に割り当てているので、データ項目の追加は不要。
      case "twoway":
        return (
          <>
            <div className="characterArea twowayArea">
              {left}

              <div className="twowayCenter">
                <div className="twowayLane">
                  {relation.relation && (
                    <div className="relationLabel">{relation.relation}</div>
                  )}
                  <div className="twowayArrow">→</div>
                </div>

                <div className="twowayLane">
                  <div className="twowayArrow">←</div>
                  {relation.relationSub && (
                    <div className="relationLabel">{relation.relationSub}</div>
                  )}
                </div>
              </div>

              {right}
            </div>

            <StoryTitle text={relation.storyTitle} />
            <Description text={relation.description} />
          </>
        );

      // ---- 語り --------------------------------------------------------
      // 説明文を主役に置き、写真は丸く小さく添える。
      case "quote":
        return (
          <>
            <div className="quotePortraits">
              <div className="quoteFront">
                <Portrait
                  image={relation.leftImage}
                  transform={relation.leftImageTransform}
                  name={relation.leftName}
                  side="left"
                  frameAspect={frameAspect}
                  showName={false}
                />
              </div>

              <div className="quoteBack">
                <Portrait
                  image={relation.rightImage}
                  transform={relation.rightImageTransform}
                  name={relation.rightName}
                  side="right"
                  frameAspect={frameAspect}
                  showName={false}
                />
              </div>
            </div>

            {/* 丸い写真の上に名前帯を重ねると角が切れて読みづらいので、
                このプリセットだけは名前を写真の下に並べている。
                読みやすさを保証する暗色スクリムはそのまま維持。 */}
            <div className="quoteNames">
              <div className="nameOverlay">{relation.leftName || "左の名前"}</div>
              <div className="nameOverlay">{relation.rightName || "右の名前"}</div>
            </div>

            {(relation.relation || relation.relationSub) && (
              <div className="quoteRelation">
                {relation.relation && (
                  <div className="relationLabel">{relation.relation}</div>
                )}
                {relation.relationSub && (
                  <div className="relationLabel relationLabelSub">
                    {relation.relationSub}
                  </div>
                )}
              </div>
            )}

            <div className="quoteBody">
              <Description text={relation.description} />
            </div>

            {subInfoRow}
            <StoryTitle text={relation.storyTitle} />
          </>
        );

      // ---- 対面（既定・デザイン変更前からの形）--------------------------
      default:
        return (
          <>
            <div className="characterArea">
              {left}

              <div className="relationCenter">
                <RelationLabels
                  relation={relation.relation}
                  relationSub={relation.relationSub}
                />
              </div>

              {right}
            </div>

            <StoryTitle text={relation.storyTitle} />
            <Description text={relation.description} />
          </>
        );
    }
  }

  return (
    <div className={`relation-card ${layout} preset-${preset}`}>
      {renderBody()}
    </div>
  );
}
