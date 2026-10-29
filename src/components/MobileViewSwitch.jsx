// スマホ幅だけ画面の下に出す「編集／プレビュー」の切り替え（2026-10-29）。
//
// 以前のスマホ幅は、左カラムを高さの半分までに制限して中だけスクロール
// させ、その下にプレビューを積んでいた。スクロールする箱が入れ子になり、
// 関係性の編集欄が狭い箱の奥に隠れていたので、どちらか一方だけを
// 画面いっぱいに出す形にした。
//
// どちらを出すかの状態は App.jsx が持ち（mobileView）、表示の出し分けは
// app.css が .app の data-mobile-view を見て行う。PC幅ではこの部品ごと
// CSS で隠れていて、左右に両方並んだまま。

const VIEWS = [
  {
    id: "edit",
    label: "編集",
    // 鉛筆
    icon: (
      <path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />
    ),
  },
  {
    id: "preview",
    label: "プレビュー",
    // シート（紙の上に丸が2つ並ぶ）
    icon: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2.5" />
        <circle cx="10" cy="10" r="3" />
        <circle cx="14" cy="10" r="3" />
        <path d="M8 16.5h8" />
      </>
    ),
  },
];

export default function MobileViewSwitch({ view, onChange }) {
  return (
    <nav className="mobileViewSwitch" aria-label="表示の切り替え">
      {VIEWS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={
            view === item.id ? "mobileViewButton active" : "mobileViewButton"
          }
          aria-pressed={view === item.id}
          onClick={() => onChange(item.id)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {item.icon}
          </svg>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
