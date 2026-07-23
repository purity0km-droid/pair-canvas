import { useRef, useState } from "react";

import "../styles/imageUploader.css";


function resizeImage(file, maxSize = 1600) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();


    reader.onload = (e) => {

      const img = new Image();


      img.onload = () => {

        let width = img.width;
        let height = img.height;


        // 長辺を制限
        if (width > height) {

          if (width > maxSize) {

            height = Math.round(
              height * (maxSize / width)
            );

            width = maxSize;

          }

        } else {

          if (height > maxSize) {

            width = Math.round(
              width * (maxSize / height)
            );

            height = maxSize;

          }

        }


        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;


        const ctx = canvas.getContext("2d");


        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );


        // 圧縮して保存
        resolve(
          canvas.toDataURL(
            "image/jpeg",
            0.85
          )
        );

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
    if (!file) return;

    // 変更: file.typeが空になるAndroidバグ対策（空欄の場合はスルーさせる）
    if (file.type && !file.type.startsWith("image/")) {
      // 処理を終わらせる前にinputをリセット
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    try {
      const resizedImage = await resizeImage(file);
      onChange(resizedImage);
    } catch (error) {
      console.error("画像の処理に失敗しました", error);
      alert("画像の読み込みに失敗しました。別の画像をお試しください。");
    } finally {
      // 追加: 同じ画像を再選択できるようにリセット
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        // 変更: iOSでHEICをJPEGに自動変換させるための魔法の指定
        accept="image/jpeg, image/png, image/webp, image/gif"
        hidden
        onChange={handleFile} // 変更: eventをそのまま渡す
      />

      <div
        className={`imageUploader ${dragging ? "dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
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
          // 変更: 疑似的なeventオブジェクトを作ってhandleFileへ渡す
          handleFile({ target: { files: e.dataTransfer.files } });
        }}
      >

        {image ? (

          <>

            <img
              src={image}
              alt=""
              className="imagePreview"
            />


            <button
              className="removeImageButton"

              onClick={(e) => {

                e.stopPropagation();

                onChange(null);

              }}
            >
              ✕
            </button>

          </>

        ) : (

          <div className="imagePlaceholder">

            <div className="plus">
              ＋
            </div>


            <div>
              クリック または
              <br />
              ドラッグ＆ドロップ
            </div>

          </div>

        )}

      </div>

    </>
  );

}