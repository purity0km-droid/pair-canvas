import { useState } from "react";

// -----------------------------------------------------------------------
// カラーコード（#rrggbb）の入力欄つき色見本。
//
// 色見本（<input type="color">）だけだと、
//   - 決まった色を正確に指定できない（OSのカラーピッカーで探すしかない）
//   - 今どの色なのかを人に伝えられない
// ので、フェーズ5で「カラーコードを直接打てる欄」を並べた。
//
// 入力途中（"#6D" のような状態）でも打てるように、確定した色（page側の値）とは
// 別に「入力欄に見えている文字」をこのコンポーネントの中で持っている。
//   - 打っている最中：文字だけ更新し、色は変えない
//   - 6桁そろった瞬間：正式な色として親へ通知する
//   - 欄から離れたとき：中途半端な入力なら、確定している色の表記へ戻す
// -----------------------------------------------------------------------
function normalizeHex(text) {
  const body = text.trim().replace(/^#/, "");

  // #abc のような3桁表記も受け付けて、6桁に展開する
  if (/^[0-9a-fA-F]{3}$/.test(body)) {
    const [r, g, b] = body;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  if (/^[0-9a-fA-F]{6}$/.test(body)) {
    return `#${body}`.toLowerCase();
  }

  return null;
}

function ColorField({ label, value, onChange }) {
  const [draft, setDraft] = useState(value);

  // 色見本側で色を変えたときや、JSON読込・リセットで色が差し替わったときに、
  // 入力欄の表示も追従させる。
  // （描画中に前回値と比べて調整する書き方。useEffectでsetStateすると
  //   描画が1回余分に走るため）
  const [lastValue, setLastValue] = useState(value);
  if (lastValue !== value) {
    setLastValue(value);
    setDraft(value);
  }

  function handleTextChange(text) {
    setDraft(text);

    const hex = normalizeHex(text);
    if (hex) onChange(hex);
  }

  function handleBlur() {
    // 入力しかけのまま欄から離れた場合は、確定している色の表記に戻す
    if (!normalizeHex(draft)) setDraft(value);
  }

  return (
    <label className="colorField">

      <span>{label}</span>

      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <input
        type="text"
        className="colorCode"
        value={draft}
        // スマホで先頭が大文字になったり、勝手に補完されたりしないようにする
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        inputMode="text"
        maxLength={7}
        aria-label={`${label}のカラーコード`}
        onChange={(e) => handleTextChange(e.target.value)}
        onBlur={handleBlur}
      />

    </label>
  );
}

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

      {/* 背景色・文字色・フォントの3つを1行に並べる。
          カラーコードの入力欄は色見本の「下」に置いて、行の横幅を食わない
          ようにしている（文字を小さめの等幅にして色見本と同じ幅に収めた）。
          これによりフォント選択欄の幅は従来どおり確保できている。
          詳しくは sidebar.css の .colorRow / .colorCode を参照。 */}
      <div className="colorRow">

        <ColorField
          label="背景色"
          value={page.backgroundColor}
          onChange={(hex) => updatePage("backgroundColor", hex)}
        />

        <ColorField
          label="文字色"
          value={page.textColor}
          onChange={(hex) => updatePage("textColor", hex)}
        />

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
