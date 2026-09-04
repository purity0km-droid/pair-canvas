const FONT_OPTIONS = [
  { value: "Noto Sans JP", label: "Noto Sans JP" },
  { value: "Zen Maru Gothic", label: "Zen Maru Gothic" },
  { value: "Shippori Mincho", label: "Shippori Mincho" },
  { value: "Kaisei Decol", label: "Kaisei Decol" },
  { value: "Yuji Syuku", label: "Yuji Syuku" },
  { value: "Hachi Maru Pop", label: "Hachi Maru Pop" },
  { value: "Kiwi Maru", label: "キウイ丸" },
  { value: "Kosugi Maru", label: "小杉丸" },
  { value: "DotGothic16", label: "DotGothic16" },
];

// ページ全体の設定（タイトル・色・背景パターン・フォント）。
// 「ページ設定」という見出しは、左カラムに他の見出しが1つしか無く
// 説明として働いていなかったため、フェーズ4で外している。
export default function PageSettings({ page, updatePage }) {

  const patterns = [
    { id: "solid", label: "■■■■" },
    { id: "stripe", label: "////" },
    { id: "check", label: "▦▦▦" },
    { id: "dot", label: "・・・・" },
    { id: "grid", label: "＋＋＋" },
  ];

  return (
    <section className="panel">

      <div className="titleRow">

        <label className="checkboxInline">

          <input
            type="checkbox"
            checked={page.showTitle}
            onChange={(e) =>
              updatePage("showTitle", e.target.checked)
            }
          />

        </label>

        <input
          type="text"
          placeholder="タイトルを入力"
          value={page.title}
          disabled={!page.showTitle}
          onChange={(e) =>
            updatePage("title", e.target.value)
          }
        />

      </div>

      {/* 背景色・文字色・フォントを1行にまとめている（フェーズ5）。
          もともとフォントは色の下に独立した行として置いていたが、
          「色の選択箇所にフォントも並べたほうがすっきりしそう」という
          要望を受けて同じ行に入れた。
          色見本は「今の色が分かれば十分」なので幅を固定し、名前が長くなる
          フォント選択欄に残りの幅を全部渡している（sidebar.css の
          .colorRow を参照）。 */}
      <div className="colorRow">

        <label className="colorField">

          <span>背景色</span>

          <input
            type="color"
            value={page.backgroundColor}
            onChange={(e) =>
              updatePage("backgroundColor", e.target.value)
            }
          />

        </label>

        <label className="colorField">

          <span>文字色</span>

          <input
            type="color"
            value={page.textColor}
            onChange={(e) =>
              updatePage("textColor", e.target.value)
            }
          />

        </label>

        <label className="fontField">

          <span>フォント</span>

          {/*
            以前は選択欄の下に「あいうえお ABC 123」というサンプル表示を出して
            いたが、左カラムの縦を余計に使うので廃止した。
            代わりに、
              - 各option … そのフォント自身で表示（一覧のまま見比べられる）
              - 選択欄本体 … 現在選んでいるフォントで表示（選んだ結果が分かる）
            という形にして、この1行だけで確認できるようにしている。
            （OSやブラウザによってはoptionへのフォント適用が効かないことがあるが、
              その場合でも選択欄本体の表示は効くので、選んだフォントは分かる）
          */}
          <select
            className="fontSelect"
            value={page.fontFamily}
            style={{ fontFamily: page.fontFamily }}
            onChange={(e) =>
              updatePage("fontFamily", e.target.value)
            }
          >
            {FONT_OPTIONS.map((font) => (
              <option
                key={font.value}
                value={font.value}
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </option>
            ))}
          </select>

        </label>

      </div>

      <label>

        <span>背景パターン</span>

        <div className="patternGrid">

          {patterns.map((pattern) => (

            <button
              key={pattern.id}
              type="button"
              className={`patternButton ${
                page.backgroundPattern === pattern.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                updatePage(
                  "backgroundPattern",
                  pattern.id
                )
              }
            >

              <div
                className={`patternPreview ${pattern.id}`}
              />

              <small>{pattern.label}</small>

            </button>

          ))}

        </div>

      </label>

    </section>
  );
}
