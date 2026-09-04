// 「関係性」1件分のデータのひな形をここで作ります。
//
// 以前は同じ形のオブジェクトが App.jsx の中に2箇所（初期state と addRelation）
// バラバラに書かれていて、項目を1つ増やすと2箇所直す必要がありました。
// 今はこの関数だけを直せば、新規追加時も初期状態も両方に反映されます。
//
// 関係性データに新しい項目を追加したい場合：
//   1. このファイルの戻り値に項目を追加する
//   2. 表示側（RelationCard.jsx）と入力側（RelationAccordion.jsx）に対応を追加する
//   3. 保存したJSONを読み込んだ時に古い形式でも壊れないよう、App.jsx の loadProject
//      にあるチェックも必要なら見直す
export function createRelation(index) {
  return {
    id: crypto.randomUUID(),
    name: `関係性${index}`,

    leftImage: null,
    rightImage: null,

    // 画像の表示位置・拡大率（ドラッグ／スライダーで調整する機能で使う）
    // scale: 1 が等倍、x/y は画像枠に対する % 移動量
    leftImageTransform: { scale: 1, x: 0, y: 0 },
    rightImageTransform: { scale: 1, x: 0, y: 0 },

    leftName: "",
    rightName: "",

    leftSub: "",
    rightSub: "",

    relation: "",
    // 矢印の下に表示する、もう1段の自由入力欄（絵文字だけでも可）
    relationSub: "",

    storyTitle: "",
    description: "",

    // 左右の写真の大きさの比率（「おまけ」機能：既定は均等）
    // "even"（既定・均等） / "left"（左を大きく） / "right"（右を大きく）
    imageRatio: "even",
  };
}

// 読み込んだJSON（古いバージョンで保存されたものを含む）を、
// 今のデータ構造に合わせて補完します。
// 例：relationSub や leftImageTransform が無い古いJSONを読み込んでも、
//     欠けている項目だけ初期値で埋めて、表示が壊れないようにする。
export function normalizeRelation(partial, index) {
  const base = createRelation(index);

  if (!partial || typeof partial !== "object") return base;

  return {
    ...base,
    ...partial,
    id: partial.id || base.id,
    leftImageTransform: {
      ...base.leftImageTransform,
      ...(partial.leftImageTransform || {}),
    },
    rightImageTransform: {
      ...base.rightImageTransform,
      ...(partial.rightImageTransform || {}),
    },
  };
}
