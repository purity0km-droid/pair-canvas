// アプリ全体で使う定数をここにまとめています。
//
// MAX_RELATIONS: 「関係性」を追加できる最大件数。
//   上限を増やしたい／減らしたい場合は、この数字を変えるだけでOKです。
//   （カードのレイアウトは1〜4件を想定して preview.css / card.css が組まれているため、
//    5件以上に増やす場合はレイアウト側の対応も必要になります）
export const MAX_RELATIONS = 4;

// DRAFT_STORAGE_KEY: 自動下書き保存（localStorage）に使うキー名。
export const DRAFT_STORAGE_KEY = "pair-canvas-draft";
