import { useRef } from "react";

import "../styles/card.css";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// -----------------------------------------------------------------------
// 画像のドラッグ移動（位置調整）をまとめた小さなフック。
// 拡大率（scale）はサイドバーのスライダー側で変更する想定なので、
// ここでは位置（x, y）のドラッグだけを扱っています。
//
// editable が false（PNG書き出し用の非表示コピー）のときは何もしません。
// -----------------------------------------------------------------------
function useImageDrag({ editable, hasImage, transform, onChange }) {
  const boxRef = useRef(null);
  const dragState = useRef(null);

  function handlePointerDown(e) {
    if (!editable || !hasImage) return;
    const box = boxRef.current;
    if (!box) return;

    box.setPointerCapture?.(e.pointerId);
    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTransform: transform,
      boxWidth: box.clientWidth || 1,
      boxHeight: box.clientHeight || 1,
    };
  }

  function handlePointerMove(e) {
    if (!dragState.current) return;
    const { startX, startY, startTransform, boxWidth, boxHeight } =
      dragState.current;

    const dxPercent = ((e.clientX - startX) / boxWidth) * 100;
    const dyPercent = ((e.clientY - startY) / boxHeight) * 100;

    // 動かしすぎて画像が完全に枠外へ消えてしまわないよう、大まかに範囲を制限
    const nextX = clamp(startTransform.x + dxPercent, -50, 50);
    const nextY = clamp(startTransform.y + dyPercent, -50, 50);

    onChange({ ...startTransform, x: nextX, y: nextY });
  }

  function handlePointerUp(e) {
    if (!dragState.current) return;
    dragState.current = null;
    boxRef.current?.releasePointerCapture?.(e.pointerId);
  }

  return {
    boxRef,
    dragHandlers: editable && hasImage
      ? {
          onPointerDown: handlePointerDown,
          onPointerMove: handlePointerMove,
          onPointerUp: handlePointerUp,
          onPointerCancel: handlePointerUp,
        }
      : {},
  };
}

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

  return (
    <div className={`relation-card ${layout}`}>

      <div className="characterArea">

        {/* 左キャラクター */}
        <div className="character">

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
        <div className="character">

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
