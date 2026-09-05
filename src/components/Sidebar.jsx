import "../styles/sidebar.css";

import PageSettings from "./PageSettings";
import RelationPanel from "./RelationPanel";

// 左カラム。
// アプリ名（ロゴ）とファイル操作ボタン（JSON／PNG／リセット）は
// フェーズ4でヘッダー（AppHeader.jsx）へ移したので、ここには
// 「作品そのものの設定」だけが残っている。
export default function Sidebar(props) {
  return (
    <div className="sidebar">

      <PageSettings
        page={props.page}
        updatePage={props.updatePage}
      />

      <RelationPanel
        relations={props.relations}
        // 位置調整モーダルのクロップ枠の形は、選んでいるレイアウト
        // プリセットによって変わるので渡している（フェーズ6）
        layoutPreset={props.page.layoutPreset}
        selectedRelationId={props.selectedRelationId}
        setSelectedRelationId={props.setSelectedRelationId}

        updateRelation={props.updateRelation}
        removeRelation={props.removeRelation}
        moveRelation={props.moveRelation}
        addRelation={props.addRelation}
      />

    </div>
  );
}
