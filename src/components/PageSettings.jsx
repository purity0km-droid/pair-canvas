export default function PageSettings({
  page,
  updatePage,
  saveProject,
  loadProject,
  fileInputRef,
  savePng,
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

        <select
            value={page.fontFamily}
            onChange={(e) =>
            updatePage("fontFamily", e.target.value)
            }
        >
            <option value="Noto Sans JP">
            Noto Sans JP
            </option>

            <option value="Zen Maru Gothic">
            Zen Maru Gothic
            </option>

            <option value="M PLUS Rounded 1c">
            M PLUS Rounded
            </option>

            <option value="Shippori Mincho">
            Shippori Mincho
            </option>

            <option value="Kaisei Decol">
            Kaisei Decol
            </option>

            <option value="Yuji Syuku">
            Yuji Syuku
            </option>

            <option value="Hachi Maru Pop">
            Hachi Maru Pop
            </option>
        </select>

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

        </div>
    </section>
  );
}