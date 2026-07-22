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
  // PNG保存
  // -----------------------------
  async function savePng() {
    if (!previewRef.current) return;

    try {
      const dataUrl = await htmlToImage.toPng(
        previewRef.current,
        {
          pixelRatio: 2,
          cacheBust: true,
        }
      );

      const link = document.createElement("a");

      link.download = "relationship.png";
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
          fileInputRef={fileInputRef}
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
  );
}

export default App;