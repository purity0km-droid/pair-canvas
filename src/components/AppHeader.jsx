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
        >
          リセット
        </button>

        <label className="headerButton importButton">
          JSON読込
          <input
            type="file"
            accept=".json"
            hidden
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
        >
          JSON保存
        </button>

        <button
          type="button"
          className="headerButton primary"
          onClick={savePng}
          disabled={isExporting}
        >
          {isExporting ? "書き出し中…" : "PNG保存"}
        </button>

        <button
          type="button"
          className="headerButton"
          onClick={savePngHighQuality}
          disabled={isExporting}
          title="PC推奨。2倍サイズの高画質PNGで書き出します"
        >
          {isExporting ? "書き出し中…" : "高画質PNG"}
        </button>

      </div>

    </header>
  );
}
