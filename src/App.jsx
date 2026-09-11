import { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

import "./styles/app.css";

import AppHeader from "./components/AppHeader";
import Sidebar from "./components/Sidebar";
import Preview from "./components/Preview";
import ExportPreview from "./components/ExportPreview";

import { createRelation, normalizeRelation } from "./utils/createRelation";
import {
  DEFAULT_LAYOUT_PRESET,
  isLayoutPreset,
  DEFAULT_QUOTE_TEXT_SIZE,
  isQuoteTextSize,
} from "./utils/relationLayout";
import { MAX_RELATIONS, DRAFT_STORAGE_KEY } from "./constants";

const DEFAULT_PAGE = {
  showTitle: true,
  title: "",
  backgroundColor: "#6D5DFC",
  textColor: "#3d3d3d",
  backgroundPattern: "solid",
  fontFamily: "Noto Sans JP",

  // レイアウトプリセット（フェーズ6）。シート全体で1つだけ選ぶ。
  // 一覧は utils/relationLayout.js の LAYOUT_PRESETS。
  layoutPreset: DEFAULT_LAYOUT_PRESET,

  // 「語り」レイアウトの説明文の文字サイズ（フェーズ9）。大/中/小の3段。
  // 一覧は utils/relationLayout.js の QUOTE_TEXT_SIZES。
  // 「語り」以外のプリセットでは使わないが、プリセットを切り替えても
  // 選んだ値が残るよう、page 側に持たせている。
  quoteTextSize: DEFAULT_QUOTE_TEXT_SIZE,
};

// 下書きや読み込んだJSONに、知らない値（プリセット名・文字サイズ名）が
// 入っていた場合の保険。
// （将来プリセットを削除・改名したときに、表示が壊れるのを防ぐ）
function withValidPreset(page) {
  const fixed = { ...page };

  if (!isLayoutPreset(fixed.layoutPreset)) {
    fixed.layoutPreset = DEFAULT_LAYOUT_PRESET;
  }

  // 「語り」の文字サイズも同じ保険をかける（フェーズ9）
  if (!isQuoteTextSize(fixed.quoteTextSize)) {
    fixed.quoteTextSize = DEFAULT_QUOTE_TEXT_SIZE;
  }

  return fixed;
}

// -----------------------------------------------------------------
// 自動下書き保存（localStorage）
//
// うっかりタブを閉じたりリロードしたりしても、直前の入力内容が消えないよう、
// ページ設定・関係性データを localStorage に保存しておき、次回起動時に
// 自動で復元します。サーバーには何も送っていません（この端末の中だけ）。
// -----------------------------------------------------------------
function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;

    return data;
  } catch (error) {
    console.error("下書きの読み込みに失敗しました:", error);
    return null;
  }
}

function initialPage() {
  const draft = loadDraft();
  if (draft?.page && typeof draft.page === "object") {
    return withValidPreset({ ...DEFAULT_PAGE, ...draft.page });
  }
  return DEFAULT_PAGE;
}

function initialRelations() {
  const draft = loadDraft();
  if (Array.isArray(draft?.relations) && draft.relations.length > 0) {
    return draft.relations.map((r, i) => normalizeRelation(r, i + 1));
  }
  return [createRelation(1)];
}

function App() {
  const [page, setPage] = useState(initialPage);
  const [relations, setRelations] = useState(initialRelations);

  const [selectedRelationId, setSelectedRelationId] = useState(
    relations[0].id
  );

  // PNG書き出し中かどうか（書き出しボタンのローディング表示に使う）
  const [isExporting, setIsExporting] = useState(false);

  const previewRef = useRef(null);
  const exportPreviewRef = useRef(null);

  // -----------------------------
  // 自動下書き保存：page / relations が変わるたびにlocalStorageへ保存
  // -----------------------------
  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ page, relations })
      );
    } catch (error) {
      // 端末のストレージ容量制限などで失敗しても、アプリの利用自体は継続する
      console.error("下書きの自動保存に失敗しました:", error);
    }
  }, [page, relations]);

  // -----------------------------
  // ページ設定更新
  // -----------------------------
  function updatePage(key, value) {
    setPage((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  // -----------------------------
  // 関係性追加
  // -----------------------------
  function addRelation() {
    if (relations.length >= MAX_RELATIONS) return;

    const newRelation = createRelation(relations.length + 1);

    setRelations((prev) => [...prev, newRelation]);
    setSelectedRelationId(newRelation.id);
  }

  // -----------------------------
  // 関係性更新
  // -----------------------------
  function updateRelation(id, key, value) {
    setRelations((prev) =>
      prev.map((relation) =>
        relation.id === id
          ? {
              ...relation,
              [key]: value,
            }
          : relation
      )
    );
  }

  // -----------------------------------------------------------------
  // 関係性の並び替え（カードの位置を入れ替える）
  //
  // 関係性が複数あるときのカードの並び順は relations 配列の順番そのもの
  // （RelationSheet.jsx が先頭から順に配置する）。そのため、配列の中で
  // 隣どうしを入れ替えるだけでカードの位置が入れ替わる。
  //
  // direction は -1（前へ）／+1（次へ）。端では何もしない。
  //
  // 【名前の振り直しについて】
  // 「関係性1」「関係性2」…という表示名は位置に対して付けているので、
  // 入れ替えたあとに必ず振り直す（削除時の removeRelation と同じ扱い）。
  // これをしないと、タブの数字と帯の見出しが食い違う。
  //
  // 選択中のIDは変えていないので、動かした関係性を選んだまま続けて
  // 操作できる（タブの位置だけが移動して見える）。
  // -----------------------------------------------------------------
  function moveRelation(id, direction) {
    setRelations((prev) => {
      const from = prev.findIndex((relation) => relation.id === id);
      if (from < 0) return prev;

      const to = from + direction;
      if (to < 0 || to >= prev.length) return prev;

      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];

      return next.map((relation, index) => ({
        ...relation,
        name: `関係性${index + 1}`,
      }));
    });
  }

  // -----------------------------
  // 関係性削除
  // -----------------------------
  function removeRelation(id) {
    if (relations.length === 1) return;

    const nextRelations = relations
      .filter((relation) => relation.id !== id)
      .map((relation, index) => ({
        ...relation,
        name: `関係性${index + 1}`,
      }));

    setRelations(nextRelations);
    setSelectedRelationId(nextRelations[0].id);
  }

  // -----------------------------
  // JSON保存
  // -----------------------------
  function saveProject() {
    const data = {
      page,
      relations,
    };

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "relationship.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  // -----------------------------
  // JSON読込
  // -----------------------------
  function loadProject(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);

        if (!data || typeof data !== "object") {
          throw new Error("JSONの形式が不正です");
        }

        if (data.page && typeof data.page === "object") {
          // 古いJSON（layoutPreset が無いもの）を読み込んでも壊れないよう、
          // 欠けている項目は DEFAULT_PAGE で埋め、知らないプリセット名は
          // 既定へ戻している
          setPage(withValidPreset({ ...DEFAULT_PAGE, ...data.page }));
        }

        if (Array.isArray(data.relations) && data.relations.length > 0) {
          // 古いバージョンで保存されたJSON（relationSub や
          // leftImageTransform が無いもの）でも壊れないよう、
          // 欠けている項目は normalizeRelation が初期値で補ってくれる
          const normalized = data.relations.map((r, i) =>
            normalizeRelation(r, i + 1)
          );

          setRelations(normalized);
          setSelectedRelationId(normalized[0].id);
        }
      } catch (error) {
        console.error("JSON読込エラー:", error);
        alert("JSONファイルを読み込めませんでした。ファイルの内容を確認してください。");
      }
    };

    reader.readAsText(file);
  }

  // -----------------------------------------------------------------
  // 全部リセット
  //
  // 入力内容はlocalStorageに自動保存されているため、「まっさらな状態から
  // やり直したい」ときは下書きごと消す必要がある。取り消しはできないので、
  // 必ず確認ダイアログを挟む。
  // -----------------------------------------------------------------
  function resetAll() {
    const ok = window.confirm(
      "入力内容をすべて消して、最初の状態に戻します。よろしいですか？（この操作は取り消せません）"
    );
    if (!ok) return;

    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.error("下書きの削除に失敗しました:", error);
    }

    const fresh = createRelation(1);

    setPage(DEFAULT_PAGE);
    setRelations([fresh]);
    setSelectedRelationId(fresh.id);
  }

  // -----------------------------------------------------------------
  // PNG保存（フェーズ3：サファリ問題対応）
  //
  // html-to-image（内部はSVGのforeignObject方式）には、Safari／iOSで
  // 主に2つの既知の問題がある。
  //   1) フォントがCSSOMに登録される前にキャプチャすると文字化け・フォント欠けが起きる
  //      → document.fonts.ready を待ってから撮る
  //   2) 画像のデコードタイミングがフレーキーで、初回キャプチャで画像が消えることがある
  //      → 対象画像すべての img.decode() 完了を待ってから撮る
  //
  // 以前は「固定100ms待ってから2回レンダリング」という運任せの実装だったが、
  // 今は「フォント・画像の準備ができたのを確認してから」待つ形にした。
  // ただしSafariのforeignObject実装自体が本質的に不安定なため
  // （html-to-image側の既知issue）、保険としての2回レンダリングという
  // 構造は残している。fontEmbedCSSは1回計算したものを使い回すことで、
  // 2回目の計算コストを省いて軽量化している。
  // -----------------------------------------------------------------
  async function waitUntilReadyToCapture(element) {
    // フォントの読み込み待ち
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch (error) {
        console.error("フォント読み込み待機でエラー:", error);
      }
    }

    // 画像（アップロードした写真など）のデコード待ち
    const images = Array.from(element.querySelectorAll("img"));
    await Promise.all(
      images.map((img) =>
        img.decode ? img.decode().catch(() => {}) : Promise.resolve()
      )
    );
  }

  async function savePng({ highQuality = false } = {}) {
    if (!exportPreviewRef.current) return;

    const element = exportPreviewRef.current;

    setIsExporting(true);

    try {
      await waitUntilReadyToCapture(element);

      // フォント埋め込み用CSSは1回だけ計算して使い回す
      let fontEmbedCSS;
      try {
        fontEmbedCSS = await htmlToImage.getFontEmbedCSS(element);
      } catch (error) {
        console.error("フォント埋め込みCSSの取得に失敗しました:", error);
      }

      const options = {
        pixelRatio: highQuality ? 2 : 1,
        cacheBust: true,
        skipAutoScale: true,
        fontEmbedCSS,
      };

      // =====================================
      // Safari対策：保険として2回レンダリングする
      // 1回目：画像をブラウザ側にレンダリングさせる
      // =====================================
      await htmlToImage.toPng(element, options);

      // =====================================
      // 2回目：本番画像
      // =====================================
      const dataUrl = await htmlToImage.toPng(element, options);

      // =====================================
      // Blob化
      // =====================================
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // =====================================
      // 保存
      // =====================================
      const fileName = highQuality
        ? "pair-canvas-hq.png"
        : "pair-canvas.png";

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      // すぐ revoke するとSafariで保存に失敗することがある
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

    } catch (error) {
      console.error(error);
      alert("PNG保存に失敗しました。");
    } finally {
      setIsExporting(false);
    }
  }

  const selectedRelation = relations.find(
    (relation) => relation.id === selectedRelationId
  );

  return (
    <div className="app">
      {/* アプリ名とファイル操作（リセット／JSON／PNG）は上部のヘッダーへ集約。
          左カラムは「作品の設定」だけに絞っている（AppHeader.jsx参照） */}
      <AppHeader
        saveProject={saveProject}
        loadProject={loadProject}
        savePng={savePng}
        savePngHighQuality={() => savePng({ highQuality: true })}
        resetAll={resetAll}
        isExporting={isExporting}
      />

      <div className="appBody">
        <aside className="sidebar-area">
          <Sidebar
            page={page}
            relations={relations}
            selectedRelation={selectedRelation}
            selectedRelationId={selectedRelationId}
            setSelectedRelationId={setSelectedRelationId}
            updatePage={updatePage}
            addRelation={addRelation}
            updateRelation={updateRelation}
            removeRelation={removeRelation}
            moveRelation={moveRelation}
          />
        </aside>

        <main className="preview-area">
          <Preview
            page={page}
            relations={relations}
            previewRef={previewRef}
          />
        </main>
      </div>

      {/* 保存専用（画面には表示しない） */}
      <div
        style={{
          position: "fixed",
          left: "-99999px",
          top: 0,
        }}
      >
        <ExportPreview
          page={page}
          relations={relations}
          exportPreviewRef={exportPreviewRef}
        />
      </div>
    </div>
  );
}

export default App;
