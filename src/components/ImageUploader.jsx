import { useRef, useState, useEffect } from "react";
import "../styles/imageUploader.css";
import { useImageDrag } from "../hooks/useImageDrag";

const DEFAULT_TRANSFORM = { scale: 1, x: 0, y: 0 };

// クロップ枠(実際に書き出される範囲)の、長い方の辺の基準サイズ(px)。
// 短い方の辺は aspect(縦横比)から自動計算します。
const FRAME_MAX_SIZE = 220;

// ステージ(枠の外側、暗く見える部分も含めた全体)は、枠に対してこの倍率で大きくする。
// 大きくするほど「枠の外にどれだけ写真がはみ出しているか」が見やすくなる。
const STAGE_PADDING_RATIO = 1.3;

function resizeImage(file, maxSize = 1600) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // 【重要】onloadの中でのエラーも確実にcatchへ送るためのtry-catch
        try {
          let width = img.width;
          let height = img.height;

          // 長辺を制限
          if (width > height) {
            if (width > maxSize) {
              height = Math.round(height * (maxSize / width));
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round(width * (maxSize / height));
              height = maxSize;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          // スマホのメモリ不足でCanvasが作れなかった場合の検知
          if (!ctx) {
            throw new Error("スマホのメモリ制限で画像が処理できませんでした");
          }

          ctx.drawImage(img, 0, 0, width, height);

          // 圧縮して保存
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        } catch (err) {
          reject(err); // ここでエラーを投げないと永遠にフリーズします
        }
      };

      img.onerror = () => reject(new Error("Image load error"));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsDataURL(file);
  });
}

// aspect(幅÷高さ)から、クロップ枠の実ピクセルサイズを求める。
// 縦長・横長どちらでも、長い方の辺が FRAME_MAX_SIZE になるようにしている。
function getFrameSize(aspect) {
  if (aspect >= 1) {
    return { width: FRAME_MAX_SIZE, height: FRAME_MAX_SIZE / aspect };
  }
  return { width: FRAME_MAX_SIZE * aspect, height: FRAME_MAX_SIZE };
}

export default function ImageUploader({
  image,
  onChange,
  transform,
  onTransformChange,
  aspect = 1,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  // アップロードした画像本来の(圧縮後の)ピクセルサイズ。
  // 「枠にちょうど収まる拡大率」を計算するために使う。
  // { image, width, height } の形で、どの画像を測ったものかも一緒に持っておき、
  // 画像が差し替わった直後は(measuredがまだ古い画像のものなら)使わないようにする
  // ＝ useEffectでリセットする代わりに、描画時に「今の画像のものか」を見て判定する。
  const [measured, setMeasured] = useState(null);
  const naturalSize = measured && measured.image === image ? measured : null;

  const currentTransform = transform || DEFAULT_TRANSFORM;

  // 新しい画像に差し替えたら、前の画像用の位置・拡大率を引き継がない
  function applyNewImage(resizedImage) {
    onChange(resizedImage);
    onTransformChange?.(DEFAULT_TRANSFORM);
  }

  // 対策2: ReactのonChangeを使わず、ネイティブのイベントリスナーで確実に検知する
  useEffect(() => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const handleNativeChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.type && !file.type.startsWith("image/")) {
        alert("画像として認識されませんでした。別の画像をお試しください。");
        inputEl.value = "";
        return;
      }

      try {
        const resizedImage = await resizeImage(file);
        applyNewImage(resizedImage);
      } catch (error) {
        console.error("画像処理エラー:", error);
        alert(`画像の処理に失敗しました: ${error.message}`);
      } finally {
        inputEl.value = "";
      }
    };

    // イベントを直接アタッチ
    inputEl.addEventListener("change", handleNativeChange);

    // クリーンアップ
    return () => {
      inputEl.removeEventListener("change", handleNativeChange);
    };
    // applyNewImage は onChange/onTransformChange に依存するが、
    // 呼び出し側は毎レンダー新しい関数を渡すため、依存配列に含めると
    // 無限にリスナーを張り直してしまう。ここでは意図的に初回のみで良い。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ドラッグ＆ドロップ時の手動発火用関数（新しいファイルへの差し替え）
  const handleDropFile = async (file) => {
    if (!file || (file.type && !file.type.startsWith("image/"))) return;
    try {
      const resizedImage = await resizeImage(file);
      applyNewImage(resizedImage);
    } catch (error) {
      console.error(error);
    }
  };

  const frame = getFrameSize(aspect);
  const stage = {
    width: frame.width * STAGE_PADDING_RATIO,
    height: frame.height * STAGE_PADDING_RATIO,
  };

  // 「枠にちょうど収まる(=object-fit:coverと同じ)」ときの、画像の表示サイズ。
  // 実際のカード側(card.css の .cardImage)と同じ考え方で、枠を基準に計算する
  // （ステージはあくまで「枠の外側も見せるための余白」であって、切り抜きの
  //   基準はステージではなく枠のサイズにしないと、実際の書き出しとズレる）。
  let displaySize = null;
  if (naturalSize) {
    const baseScale = Math.max(
      frame.width / naturalSize.width,
      frame.height / naturalSize.height
    );
    displaySize = {
      width: naturalSize.width * baseScale,
      height: naturalSize.height * baseScale,
    };
  }

  const { boxRef, dragHandlers } = useImageDrag({
    editable: true,
    hasImage: !!image,
    transform: currentTransform,
    onChange: (t) => onTransformChange?.(t),
    boxSize: frame,
  });

  let imageStyle = { opacity: 0 };
  if (displaySize) {
    const zoomedWidth = displaySize.width * (currentTransform.scale ?? 1);
    const zoomedHeight = displaySize.height * (currentTransform.scale ?? 1);
    const offsetX = ((currentTransform.x ?? 0) / 100) * frame.width;
    const offsetY = ((currentTransform.y ?? 0) / 100) * frame.height;

    imageStyle = {
      width: zoomedWidth,
      height: zoomedHeight,
      left: stage.width / 2 - zoomedWidth / 2 + offsetX,
      top: stage.height / 2 - zoomedHeight / 2 + offsetY,
    };
  }

  return (
    <>
      {/* ファイル選択用のinputは常に存在させ、「写真を変更」ボタンから
          明示的にクリックする形にする（枠の上でのドラッグ操作と、
          ファイル選択ダイアログが誤って同時に反応しないようにするため） */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg, image/png, image/webp, image/gif"
        // 対策1: hidden や display: none は絶対に使わない！
        // 代わりに「透明にして、サイズを極小にする」ことで画面から隠す
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          opacity: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: -1,
        }}
        // onChange={...} は使いません（useEffect内で処理するため）
      />

      {!image ? (
        // ---------------------------------------------------------
        // 画像が未設定のとき：タップ or ドラッグ＆ドロップでアップロード
        // ---------------------------------------------------------
        <label
          className={`imageUploader ${dragging ? "dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => {
            setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleDropFile(file);
          }}
          style={{ cursor: "pointer", display: "block" }}
        >
          <div className="imagePlaceholder">
            <div className="plus">＋</div>
            <div>
              タップ または
              <br />
              ドラッグ＆ドロップ
            </div>
          </div>
        </label>
      ) : (
        // ---------------------------------------------------------
        // 画像が設定済みのとき：
        // Xのアイコン設定のように「実際に切り取られる範囲」の枠を表示し、
        // 枠の中で画像をドラッグして位置調整・スライダーで拡大縮小できる。
        // 枠の外側は暗く表示され、はみ出している部分の見当がつくようにしている。
        // ---------------------------------------------------------
        <div className="cropWrap">
          <div
            ref={boxRef}
            className={`cropStage ${dragging ? "dragging" : ""}`}
            style={{ width: stage.width, height: stage.height }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => {
              setDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleDropFile(file);
            }}
            {...dragHandlers}
          >
            <img
              src={image}
              alt="Preview"
              className="cropImage"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onLoad={(e) =>
                setMeasured({
                  image,
                  width: e.target.naturalWidth,
                  height: e.target.naturalHeight,
                })
              }
              style={imageStyle}
            />

            {/* 実際に切り取られる範囲そのもの。box-shadowで外側だけを暗くしている */}
            <div
              className="cropFrame"
              style={{ width: frame.width, height: frame.height }}
            />
          </div>

          <div className="cropToolbar">
            <button
              type="button"
              className="cropIconButton"
              onClick={() => inputRef.current?.click()}
              title="写真を変更"
            >
              🖼️ 変更
            </button>

            <button
              type="button"
              className="cropIconButton danger"
              onClick={() => {
                onChange(null);
                onTransformChange?.(DEFAULT_TRANSFORM);
                if (inputRef.current) inputRef.current.value = "";
              }}
              title="削除"
            >
              ✕ 削除
            </button>
          </div>

          {/* 画像の拡大率調整。位置調整は上のクロップ枠を直接ドラッグして行う */}
          <div className="imageAdjust">
            <label className="imageAdjustRow">
              <span>拡大</span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={currentTransform.scale ?? 1}
                onChange={(e) =>
                  onTransformChange?.({
                    ...currentTransform,
                    scale: parseFloat(e.target.value),
                  })
                }
              />
            </label>

            <button
              type="button"
              className="imageAdjustReset"
              onClick={() => onTransformChange?.(DEFAULT_TRANSFORM)}
            >
              位置・拡大をリセット
            </button>
          </div>
        </div>
      )}
    </>
  );
}
