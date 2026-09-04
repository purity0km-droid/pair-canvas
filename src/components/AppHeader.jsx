import "../styles/header.css";

import Logo from "./Logo";

// -----------------------------------------------------------------------
// AppHeader
//
// 画面いちばん上に置く横一本のヘッダーバー。
//
// 以前は「タイトル（ロゴ）」も「JSON保存／PNG保存などのボタン」も、すべて
// サイドバー（左カラム）の中に縦積みで入っていました。そのため左カラムが
// 「作品の設定」と「ファイル操作」の混ざった長い列になり、ごちゃついて
// 見えていました。
//
// フェーズ4では、
//   - ヘッダー … アプリ名と、ファイル操作（リセット／JSON／PNG書き出し）
//   - 左カラム … 作品そのものの設定（タイトル・色・パターン・フォント・関係性）
// という役割分担にして、左カラムをすっきりさせています。
//
// ボタンを増やしたい場合はこのファイルに、見た目を変えたい場合は
// src/styles/header.css を触ってください。
//
// 【スマホ幅のラベルについて（フェーズ5）】
// 狭い画面ではヘッダーの高さを固定したまま1行に5つのボタンを収める必要が
// あるため、480px以下では短いラベルに切り替えています。
// CSSには「文字そのものを差し替える」手段が無いので、
//   <span className="labelFull">  … 広い画面で表示
//   <span className="labelShort"> … 480px以下で表示
// の2つをDOMに持たせ、header.css のメディアクエリで出し分けています。
// ボタン自体には常にフルの名称を aria-label / title で付けているので、
// 短縮表示でも読み上げとマウスオーバーでは正式名称が分かります。
// ラベルを増減するときは、この2つを必ずセットで書いてください。
// -----------------------------------------------------------------------
export default function AppHeader({
  saveProject,
  loadProject,
  savePng,
  savePngHighQuality,
  resetAll,
  isExporting,
}) {
  return (
    <header className="appHeader">

      <Logo />

      <div className="headerActions">

        <button
          type="button"
          className="headerButton quiet"
          onClick={resetAll}
          aria-label="リセット"
          title="入力内容をすべて消して最初の状態に戻します"
        >
          <span className="labelFull">リセット</span>
          <span className="labelShort" aria-hidden="true">↺</span>
        </button>

        <label
          className="headerButton importButton"
          title="JSON読込"
        >
          <span className="labelFull">JSON読込</span>
          <span className="labelShort" aria-hidden="true">読込</span>
          <input
            type="file"
            accept=".json"
            hidden
            aria-label="JSON読込"
            onChange={(e) => {
              loadProject(e.target.files?.[0]);
              // 同じファイルを続けて選び直せるように、値をクリアしておく
              e.target.value = "";
            }}
          />
        </label>

        <button
          type="button"
          className="headerButton"
          onClick={saveProject}
          aria-label="JSON保存"
          title="JSON保存"
        >
          <span className="labelFull">JSON保存</span>
          <span className="labelShort" aria-hidden="true">保存</span>
        </button>

        <button
          type="button"
          className="headerButton primary"
          onClick={savePng}
          disabled={isExporting}
          aria-label="PNG保存"
          title="PNG保存"
        >
          {isExporting ? (
            // 書き出し中はボタンの幅が変わらないよう、短い表記で統一する
            <span className="labelExporting">書き出し中…</span>
          ) : (
            <>
              <span className="labelFull">PNG保存</span>
              <span className="labelShort" aria-hidden="true">PNG</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="headerButton"
          onClick={savePngHighQuality}
          disabled={isExporting}
          aria-label="高画質PNG"
          title="PC推奨。2倍サイズの高画質PNGで書き出します"
        >
          {isExporting ? (
            <span className="labelExporting">書き出し中…</span>
          ) : (
            <>
              <span className="labelFull">高画質PNG</span>
              <span className="labelShort" aria-hidden="true">高画質</span>
            </>
          )}
        </button>

      </div>

    </header>
  );
}
