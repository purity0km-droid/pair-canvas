import {
  LAYOUT_PRESETS,
  DEFAULT_LAYOUT_PRESET,
  DESC_SCALE_MIN,
  DESC_SCALE_MAX,
  DESC_SCALE_STEP,
  DEFAULT_DESC_SCALE,
} from "../utils/relationLayout";

// 色見本ひとつぶん。
//
// フェーズ5で「#rrggbb を直接打てる欄」を色見本の下に並べていたが、
// ブラウザ標準のカラーピッカー側にカラーコードの入力欄が既にあるため
// （Chrome/Edgeでは R/G/B 表示の右にある切り替えボタンでHEX表示にできる）、
// 二重になるのでフェーズ7で削除した。
// 復活させる場合は、この中に <input type="text"> を足して
// 「入力途中の文字」と「確定した色」を別々に持つ必要がある
// （6桁そろった時点で親へ通知し、中途半端なまま欄を離れたら戻す）。
function ColorField({ label, value, onChange }) {
  return (
    <label className="colorField">

      <span>{label}</span>

      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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

      {/* レイアウトプリセット（フェーズ6）。

          要件定義 6-2 で「レイアウトプリセットをチップ形式で前面に並べる
          構成は主画面に持ち込まず、"おまけ" 機能として既定では折りたたむ」と
          決めているため、<details> で閉じた状態にしている
          （関係性ごとの「▼ レイアウト（おまけ）」と同じ扱い）。

          こちらはシート全体に効く設定で、関係性ごとの「写真の大きさ」とは
          別物。役割が混ざらないよう、置き場所も左カラムのページ設定側に
          分けている。 */}
      <details className="layoutExtra">
        <summary>レイアウト（おまけ）</summary>

        <div className="layoutExtraBody">
          <span>関係性の見せ方</span>

          <div className="presetGrid">
            {LAYOUT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={
                  (page.layoutPreset || DEFAULT_LAYOUT_PRESET) === preset.id
                    ? "presetButton active"
                    : "presetButton"
                }
                title={preset.description}
                onClick={() => updatePage("layoutPreset", preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* 選択中のものだけ説明を出す。6つぶん並べると左カラムが
              説明文で埋まってしまうため。 */}
          <p className="presetNote">
            {
              (
                LAYOUT_PRESETS.find(
                  (preset) =>
                    preset.id === (page.layoutPreset || DEFAULT_LAYOUT_PRESET)
                ) || LAYOUT_PRESETS[0]
              ).description
            }
          </p>

          {/* 説明文の文字サイズ（フェーズ9で「語り」限定の大/中/小、
              フェーズ10でスライダー＋全レイアウト対応に作り直した）。

              100%のときの実寸はレイアウトごとに違う。
              「語り」はフェーズ9の「小」、それ以外は従来のサイズが100%。
              （utils/relationLayout.js と card.css のコメント参照）

              シート全体に効く設定で、関係性ごとの設定ではない。 */}
          <label className="descScaleRow">

            <span>説明の文字サイズ</span>

            <input
              type="range"
              min={DESC_SCALE_MIN}
              max={DESC_SCALE_MAX}
              step={DESC_SCALE_STEP}
              value={page.descTextScale ?? DEFAULT_DESC_SCALE}
              onChange={(e) =>
                updatePage("descTextScale", parseFloat(e.target.value))
              }
            />

            <span className="descScaleValue">
              {Math.round((page.descTextScale ?? DEFAULT_DESC_SCALE) * 100)}%
            </span>

          </label>
        </div>
      </details>

    </section>
  );
}
