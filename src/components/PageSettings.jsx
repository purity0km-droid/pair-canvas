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

export default function PageSettings({
  page,
  updatePage,
  saveProject,
  loadProject,
  savePng,
  savePngHighQuality,
}) {

  const patterns = [
    { id: "solid", label: "■■■■" },
    { id: "stripe", label: "////" },
    { id: "check", label: "▦▦▦" },
    { id: "dot", label: "・・・・" },
    { id: "grid", label: "＋＋＋" },
  ];

  return (
    <section className="panel">

      <h2>ページ設定</h2>

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

      <div className="colorRow">

        <label>

          <span>背景色</span>

          <input
            type="color"
            value={page.backgroundColor}
            onChange={(e) =>
              updatePage("backgroundColor", e.target.value)
            }
          />

        </label>

        <label>

          <span>文字色</span>

          <input
            type="color"
            value={page.textColor}
            onChange={(e) =>
              updatePage("textColor", e.target.value)
            }
          />

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

        <label>

        <span>フォント</span>

        {/*
          選択肢名だけだと実際の見た目が分からなかったため、
          各optionにそのフォントを直接あてて見た目を確認できるようにしている
          （OSやブラウザによってはoptionへのフォント適用が効かない場合があるため、
           保険として下に選択中フォントのサンプル文字も出している）
        */}
        <select
            value={page.fontFamily}
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

        <div
          className="fontPreviewSample"
          style={{ fontFamily: page.fontFamily }}
        >
          あいうえお ABC 123
        </div>

        </label>

        <div className="saveButtons">

            <button
                className="primaryButton"
                type="button"
                onClick={saveProject}
            >
                JSON保存
            </button>

            <label className="primaryButton importButton">

                JSON読込

                <input
                type="file"
                accept=".json"
                hidden
                onChange={(e) =>
                    loadProject(e.target.files?.[0])
                }
                />

            </label>

            <button
                className="primaryButton"
                type="button"
                onClick={savePng}
            >
                PNG保存
            </button>

            <button
                className="primaryButton"
                type="button"
                onClick={savePngHighQuality}
            >
                PC推奨高画質保存
            </button>

        </div>
    </section>
  );
}