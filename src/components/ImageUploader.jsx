import { useRef, useState, useEffect } from "react";
import "../styles/imageUploader.css";
import { useImageDrag } from "../hooks/useImageDrag";
import { useImageAspect } from "../hooks/useImageAspect";
import { buildImageStyle } from "../utils/imageFit";

const DEFAULT_TRANSFORM = { scale: 1, x: 0, y: 0 };

// 画像の大きさ（倍率）の可動範囲。
//
// scale=1 は「画像の短い辺が枠にぴったり収まり、枠が写真で埋まる状態」
// （CSSの object-fit:cover の状態）。
//
// フェーズ6より前は下限も1で、そこから拡大することしかできなかった。
// 「枠より小さく表示したい（余白を持たせて全身を入れたい等）」という要望を
// 受けて下限を下げている。1未満にすると写真が枠の内側に収まり、
// 余ったところは枠の下地（card.css の .imageBox の背景）が見える。
//
// フェーズ7で 0.3 → 0.2 に変更。写真と枠の形が大きく違うとき
// （横長の写真を縦長の枠に入れる等）、写真全体が枠に収まるまで縮小するのに
// 0.3では届かないことがあるため、余裕をもたせている。
const SCALE_MIN = 0.2;
const SCALE_MAX = 3;
const SCALE_STEP = 0.05;

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
  aspect = 1,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  // 位置調整用ウインドウ(モーダル)の開閉。
  // サイドバーに常時ドラッグ可能な枠を置いておくと、スマホでサイドバーを
  // スクロールしようとした指がそのまま画像の位置調整として拾われてしまう
  // （誤操作の原因になる）ため、普段は静止したサムネイルだけを表示し、
  // 「位置を調整」を押した(または新しく画像を選んだ)ときだけ、
  // 専用のウインドウを開いてそこでだけドラッグを受け付けるようにしている。
  const [adjusting, setAdjusting] = useState(false);

  const currentTransform = transform || DEFAULT_TRANSFORM;

  // 写真そのものの縦横比。カード側(RelationCard)とまったく同じ計算式で
  // スタイルを組み立てることで、「ここで調整した見た目」と「実際に
  // 書き出される見た目」が一致するようにしている（utils/imageFit.js）。
  // サムネイルと位置調整ウインドウは同じ写真・同じ枠の形なので、
  // 縦横比の取得は1回で足りる。
  const [imageAspect, handleImageLoad] = useImageAspect(image);

  const transformStyle = buildImageStyle({
    transform: currentTransform,
    frameAspect: aspect,
    imageAspect,
  });

  // 新しい画像に差し替えたら、前の画像用の位置・拡大率を引き継がず、
  // そのまま位置調整ウインドウを開いて調整を促す。
  function applyNewImage(resizedImage) {
    onChange(resizedImage);
    onTransformChange?.(DEFAULT_TRANSFORM);
    setAdjusting(true);
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

  // 位置調整ウインドウを開いている間は、背景(サイドバー全体)がスクロールしない
  // ようにする（スマホで指がずれて背景が動いてしまう誤操作を防ぐ）。
  useEffect(() => {
    if (!adjusting) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [adjusting]);

  // ドラッグでの位置調整は、位置調整ウインドウを開いているときだけ受け付ける。
  // boxSize を指定していないので、実際にドラッグしている枠(cropModalFrame)
  // 自身の表示サイズがそのまま基準になる
  // （＝実物の画像枠(imageBox)と縦横比さえ合っていれば、絶対サイズが違っても
  //   保存される％の値の意味は変わらない）。
  const { boxRef, dragHandlers } = useImageDrag({
    editable: adjusting,
    hasImage: !!image,
    transform: currentTransform,
    onChange: (t) => onTransformChange?.(t),
  });

  function closeAdjusting() {
    setAdjusting(false);
  }

  return (
    <>
      {/* ファイル選択用のinputは常に存在させ、「変更」ボタンから
          明示的にクリックする形にする（他の操作と誤って同時に反応しないように） */}
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
        // 【重要】ここは <label> にしないこと。
        //
        // ファイル選択用のinputは、上のとおり画面外へ隠したうえで
        // 「変更」ボタンなどから inputRef.current.click() で明示的に開く方式に
        // している（labelとinputを紐づける方式は、他の操作のクリックまで
        // 横取りしてしまう不具合があったため／フェーズ1で対応済み）。
        //
        // そのぶん、この置き場所も <label> のままでは何とも紐づいておらず、
        // クリックしてもファイル選択ダイアログが開かない（ドラッグ＆ドロップ
        // でしか画像を入れられない）状態になっていた。
        // 明示的に onClick で input を開く形にして解消している。
        <div
          className={`imageUploader ${dragging ? "dragging" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            // キーボード操作でも開けるようにする
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
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
        </div>
      ) : (
        // ---------------------------------------------------------
        // 画像が設定済みのとき：サイドバーには静止したサムネイルだけを表示し、
        // 位置・拡大の調整は「位置を調整」から専用ウインドウを開いて行う。
        // （常時ドラッグできる枠をサイドバーに置かないことで、スマホで
        //   スクロールしようとした指を誤って拾ってしまうのを防いでいる）
        // ---------------------------------------------------------
        <div className="imageSummary">
          <div className="imageThumb" style={{ aspectRatio: aspect }}>
            <img
              src={image}
              alt="Preview"
              className="imageThumbImg"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onLoad={handleImageLoad}
              style={transformStyle}
            />
          </div>

          <div className="cropToolbar">
            <button
              type="button"
              className="cropIconButton primary"
              onClick={() => setAdjusting(true)}
            >
              ⇔ 位置を調整
            </button>

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
        </div>
      )}

      {/* -----------------------------------------------------------
          位置調整ウインドウ(モーダル)
          Xのアイコン設定のように、実際に切り取られる範囲の枠を大きく表示し、
          その中で画像をドラッグ・スライダーで拡大縮小できる。
          枠は実際のカードの画像枠(imageBox)と全く同じ考え方
          (object-fit:cover + transform:translate/scale)で描画しているため、
          ここで見えている通りの範囲が、そのまま実際の書き出し画像にも反映される。
      ----------------------------------------------------------- */}
      {adjusting && image && (
        <div className="cropModalBackdrop" onClick={closeAdjusting}>
          <div
            className="cropModal"
            // 内側のクリックが背景(cropModalBackdrop)まで伝わって
            // 誤って閉じてしまわないようにする
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cropModalHeader">
              <span>位置・拡大を調整</span>
              <button
                type="button"
                className="cropModalClose"
                onClick={closeAdjusting}
                aria-label="閉じる"
              >
                ✕
              </button>
            </div>

            <div
              ref={boxRef}
              className="cropModalFrame"
              style={{ aspectRatio: aspect }}
              {...dragHandlers}
            >
              <img
                src={image}
                alt="Preview"
                className="cropModalImage"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onLoad={handleImageLoad}
                style={transformStyle}
              />
            </div>

            <div className="imageAdjust">
              <label className="imageAdjustRow">
                {/* 縮小もできるようになったので、表示名は「拡大」ではなく
                    「大きさ」。今どれくらいかが分かるよう％も出している
                    （100%＝枠がちょうど写真で埋まる状態） */}
                <span>大きさ</span>
                <input
                  type="range"
                  min={SCALE_MIN}
                  max={SCALE_MAX}
                  step={SCALE_STEP}
                  value={currentTransform.scale ?? 1}
                  onChange={(e) =>
                    onTransformChange?.({
                      ...currentTransform,
                      scale: parseFloat(e.target.value),
                    })
                  }
                />
                <span className="imageAdjustValue">
                  {Math.round((currentTransform.scale ?? 1) * 100)}%
                </span>
              </label>

              <button
                type="button"
                className="imageAdjustReset"
                onClick={() => onTransformChange?.(DEFAULT_TRANSFORM)}
              >
                位置・拡大をリセット
              </button>
            </div>

            <button
              type="button"
              className="cropModalDone"
              onClick={closeAdjusting}
            >
              完了
            </button>
          </div>
        </div>
      )}
    </>
  );
}
