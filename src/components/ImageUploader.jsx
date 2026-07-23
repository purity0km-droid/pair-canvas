import { useRef, useState } from "react";
import "../styles/imageUploader.css";

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

export default function ImageUploader({ image, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    
    // どこで止まっているか確認するためのアラート（不要になったら消してください）
     alert("1. ファイル選択を検知しました"); 

    if (!file) {
       alert("エラー: ファイルが取得できません");
      return;
    }

    // デバッグ: スマホが認識しているファイル形式を表示
     alert(`2. ファイル名: ${file.name}\nタイプ: ${file.type}`);

    if (file.type && !file.type.startsWith("image/")) {
      alert(`画像として認識されませんでした（Type: ${file.type}）。別の画像をお試しください。`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    try {
       alert("3. リサイズ処理を開始します");
      const resizedImage = await resizeImage(file);
      
       alert("4. リサイズ完了！画面に反映します");
      onChange(resizedImage);
    } catch (error) {
      console.error("画像の処理に失敗しました", error);
      alert(`エラーが発生しました:\n${error.message}`);
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

return (
    <>

      <label
        className={`imageUploader ${dragging ? "dragging" : ""}`}
        // label要素にしたので onClick は削除します
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
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // Drop時は手動で関数を呼ぶ
            handleFile({ target: { files: e.dataTransfer.files } });
          }
        }}
        // カーソルをポインターにしてボタンっぽくする
        style={{ cursor: "pointer", display: "block" }} 
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg, image/png, image/webp, image/gif"
          // hidden属性だとスマホで発火しないことがあるので、CSSで安全に隠す
          style={{ display: "none" }}
          onChange={handleFile}
        />

        {image ? (
          <>
            <img src={image} alt="" className="imagePreview" />
            <button
              className="removeImageButton"
              onClick={(e) => {
                e.preventDefault(); // 親のlabelクリックを防ぐ
                e.stopPropagation();
                onChange(null);
                if (inputRef.current) inputRef.current.value = ""; // クリア
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
    </>
  );
}