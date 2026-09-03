import { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

import "./styles/app.css";

import Sidebar from "./components/Sidebar";
import Preview from "./components/Preview";
import ExportPreview from "./components/ExportPreview";

import { createRelation, normalizeRelation } from "./utils/createRelation";
import { MAX_RELATIONS, DRAFT_STORAGE_KEY } from "./constants";

const DEFAULT_PAGE = {
  showTitle: true,
  title: "",
  backgroundColor: "#6D5DFC",
  textColor: "#3d3d3d",
  backgroundPattern: "solid",
  fontFamily: "Noto Sans JP",
};

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
    return { ...DEFAULT_PAGE, ...draft.page };
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
          setPage({ ...DEFAULT_PAGE, ...data.page });
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
  // PNG保存
  //
  // Safari／iPhoneでの書き出し崩れ対策として、同じ要素を2回レンダリングしている。
  // より根本的な対策（document.fonts.ready を待つ等）は、
  // 「フェーズ3：サファリ問題対応」でまとめて見直す予定。今回はここには触れていない。
  // -----------------------------------------------------------------
  async function savePng({ highQuality = false } = {}) {
    if (!exportPreviewRef.current) return;

    const element = exportPreviewRef.current;

    try {
      const options = {
        pixelRatio: highQuality ? 2 : 1,
        cacheBust: true,
        skipAutoScale: true,
      };

      // =====================================
      // Safari / iPhone対策
      // 1回目：画像をブラウザ側にレンダリングさせる
      // =====================================
      await htmlToImage.toPng(element, options);

      // 少し待つ
      await new Promise((resolve) => setTimeout(resolve, 100));

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
    }
  }

  const selectedRelation = relations.find(
    (relation) => relation.id === selectedRelationId
  );

  return (
    <div className="app">
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
          saveProject={saveProject}
          loadProject={loadProject}
          savePng={savePng}
          savePngHighQuality={() => savePng({ highQuality:true })}
        />
      </aside>

      <main className="preview-area">
        <Preview
          page={page}
          relations={relations}
          updateRelation={updateRelation}
          previewRef={previewRef}
        />
      </main>

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
