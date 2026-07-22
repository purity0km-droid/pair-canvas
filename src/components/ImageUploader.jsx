import { useRef, useState } from "react";

import "../styles/imageUploader.css";

export default function ImageUploader({
  image,
  onChange,
}) {
  const inputRef = useRef(null);

  const [dragging, setDragging] = useState(false);

  function handleFile(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = () => {
      onChange(reader.result);
    };

    reader.readAsDataURL(file);
  }

  return (
    <>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
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

          handleFile(e.dataTransfer.files[0]);
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