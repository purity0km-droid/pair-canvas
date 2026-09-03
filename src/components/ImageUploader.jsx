import { useRef, useState, useEffect } from "react";
import "../styles/imageUploader.css";

const DEFAULT_TRANSFORM = { scale: 1, x: 0, y: 0 };

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

export default function ImageUploader({
  image,
  onChange,
  transform,
  onTransformChange,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  // 新しい画像に差し替えたら、前の画像用の位置・拡大率は引き継がずリセットする
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
    // 無限にリスナーを張り直してしまう。ここでは意図的に image 変更契機のみで良い。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ドラッグ＆ドロップ時の手動発火用関数
  const handleDropFile = async (file) => {
    if (!file || (file.type && !file.type.startsWith("image/"))) return;
    try {
      const resizedImage = await resizeImage(file);
      applyNewImage(resizedImage);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
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

        {image ? (
          <>
            <img src={image} alt="Preview" className="imagePreview" />
            <button
              className="removeImageButton"
              onClick={(e) => {
                e.preventDefault(); // 親のlabelクリックを防ぐ
                e.stopPropagation();
                onChange(null);
                onTransformChange?.(DEFAULT_TRANSFORM);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              ✕
            </button>
          </>
        ) : (
          <div className="imagePlaceholder">
            <div className="plus">＋</div>
            <div>
              タップ または
              <br />
              ドラッグ＆ドロップ
            </div>
          </div>
        )}
      </label>

      {/* 画像の位置・拡大率調整：ドラッグでの位置調整はプレビュー側（カード上の画像）で行う。
          ここではスライダーでの拡大率調整と、まとめてのリセットだけを扱う。 */}
      {image && (
        <div className="imageAdjust">
          <label className="imageAdjustRow">
            <span>拡大</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={transform?.scale ?? 1}
              onChange={(e) =>
                onTransformChange?.({
                  ...(transform || DEFAULT_TRANSFORM),
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
      )}
    </>
  );
}
