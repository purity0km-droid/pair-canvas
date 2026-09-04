import "../styles/preview.css";
import "../styles/exportPreview.css";

import RelationSheet from "./RelationSheet";

// PNG書き出し専用の非表示コピー。
// レイアウトの中身は RelationSheet（Preview.jsx と共通）を使うので、
// ここでは「常にPCサイズの実寸（1000px）で組む」という指定だけを行っています。
export default function ExportPreview({ page, relations, exportPreviewRef }) {
  return (
    <div className="preview">
      <RelationSheet
        ref={exportPreviewRef}
        page={page}
        relations={relations}
        extraClassName="export-pc"
      />
    </div>
  );
}
