import "../styles/sidebar.css";

import Logo from "./Logo";
import PageSettings from "./PageSettings";
import RelationPanel from "./RelationPanel";

export default function Sidebar(props) {
  return (
    <div className="sidebar">

      <Logo />

      <PageSettings
        page={props.page}
        updatePage={props.updatePage}
        saveProject={props.saveProject}
        loadProject={props.loadProject}
        fileInputRef={props.fileInputRef}
        savePng={props.savePng}
        savePngHighQuality={props.savePngHighQuality}
      />

      <RelationPanel
        relations={props.relations}
        selectedRelationId={props.selectedRelationId}
        setSelectedRelationId={props.setSelectedRelationId}

        updateRelation={props.updateRelation}
        removeRelation={props.removeRelation}
        addRelation={props.addRelation}
      />

    </div>
  );
}