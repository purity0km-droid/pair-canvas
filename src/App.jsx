import { useState, useRef } from "react";
import * as htmlToImage from "html-to-image";

import "./styles/app.css";

import Sidebar from "./components/Sidebar";
import Preview from "./components/Preview";

function App() {
  const [page, setPage] = useState({
    showTitle: true,
    title: "",
    backgroundColor: "#6D5DFC",
    textColor: "#3d3d3d",
    backgroundPattern: "solid",
    fontFamily: "Noto Sans JP",
  });

  const [relations, setRelations] = useState([
    {
      id: crypto.randomUUID(),
      name: "関係性①",

      leftImage: null,
      rightImage: null,

      leftName: "",
      rightName: "",

      leftSub: "",
      rightSub: "",

      relation: "",
      storyTitle: "",
      description: "",
    },
  ]);

  const [selectedRelationId, setSelectedRelationId] = useState(
    relations[0].id
  );

  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const exportPreviewRef = useRef(null);

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
    if (relations.length >= 4) return;

    const newRelation = {
      id: crypto.randomUUID(),
      name: `関係性${relations.length + 1}`,

      leftImage: null,
      rightImage: null,

      leftName: "",
      rightName: "",

      leftSub: "",
      rightSub: "",

      relation: "",
      storyTitle: "",
      description: "",
    };

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

        if (data.page) {
          setPage(data.page);
        }

        if (data.relations) {
          setRelations(data.relations);

          if (data.relations.length > 0) {
            setSelectedRelationId(data.relations[0].id);
          }
        }
      } catch {
        alert("JSONファイルを読み込めませんでした。");
      }
    };

    reader.readAsText(file);
  }

// -----------------------------
  // PNG保存（スマホ対応強化版）
  // -----------------------------
  async function savePng({ highQuality = false } = {}) {
    if (!exportPreviewRef.current) return;
    const element = exportPreviewRef.current;

    try {
      // 1. 要素内にあるすべての <img> や背景画像のロード・デコードを強制的に待つ
      const imgElements = Array.from(element.querySelectorAll("img"));
      await Promise.all(
        imgElements.map((img) => {
          if (img.complete) return img.decode().catch(() => {});
          return new Promise((resolve) => {
            img.onload = () => img.decode().then(resolve).catch(resolve);
            img.onerror = resolve;
          });
        })
      );

      // 2. スマホのレンダリング待ち（少しだけ待機）
      await new Promise((resolve) => setTimeout(resolve, 150));

      // 3. キャプチャ実行
      const options = {
        pixelRatio: highQuality ? 2 : 1,
        cacheBust: true,
        skipAutoScale: true,
      };

      const dataUrl = await htmlToImage.toPng(element, options);

      const link = document.createElement("a");
      link.download = highQuality
        ? "pair-canvas-hq.png"
        : "pair-canvas.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error(error);
      alert("PNG保存に失敗しました。");
    }
  }

  const selectedRelation = relations.find(
    (relation) => relation.id === selectedRelationId
  );

  return (
    <div className="app" style={{ position: "relative" }}>
      <aside className="sidebar-area" style={{ position: "relative", zIndex: 10 }}>
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
          fileInputRef={fileInputRef}
        />
      </aside>

      <main className="preview-area" style={{ position: "relative", zIndex: 5 }}>
        <Preview
          page={page}
          relations={relations}
          previewRef={previewRef}
        />
      </main>

      {/* 保存専用（画面には表示しない） */}
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 0, // メインコンテンツの後ろに隠す
            opacity: 1, // 完全描写
            pointerEvents: "none", // 誤タップ防止
          }}
        >
          <Preview
            page={page}
            relations={relations}
            exportPreviewRef={exportPreviewRef}
            exportMode
          />
        </div>
    </div>
  );
}

export default App;