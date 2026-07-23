import { useRef, useState } from "react";

import "../styles/imageUploader.css";


function resizeImage(file, maxSize = 1600) {

  return new Promise((resolve) => {

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


      img.src = e.target.result;

    };


    reader.readAsDataURL(file);

  });

}


export default function ImageUploader({
  image,
  onChange,
}) {

  const inputRef = useRef(null);

  const [dragging, setDragging] = useState(false);


  async function handleFile(file) {

    if (!file) return;

    if (!file.type.startsWith("image/")) return;


    const resizedImage = await resizeImage(file);


    onChange(resizedImage);

  }


  return (
    <>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) =>
          handleFile(e.target.files?.[0])
        }
      />


      <div
        className={`imageUploader ${dragging ? "dragging" : ""}`}

        onClick={() =>
          inputRef.current?.click()
        }

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

          handleFile(
            e.dataTransfer.files[0]
          );

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