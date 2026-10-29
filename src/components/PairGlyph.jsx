import { useId } from "react";

// 左カラムの小見出しに付ける印（2026-10-29）。
// シートの「対面」レイアウトの重なった丸写真を、2つの円の重なりで表し、
// その項目が「左の人」「右の人」「ふたりの間」のどれについてかを示す。
//   side="left"  … 左の円を塗る（左のキャラクター）
//   side="right" … 右の円を塗る（右のキャラクター）
//   side="both"  … 重なった部分を塗る（ふたりの関係）
// 円の中心（左・右）と半径。中心の間を半径の2倍より少しだけ狭くして、
// 重なりを細くしている（重なりは side="both" で塗る部分）
const L = 8.5;
const RIGHT = 17.5;
const R = 6.5;

export default function PairGlyph({ side }) {
  // 重なり部分を切り抜く clipPath の id。同じ印が画面に何個も出るので、
  // 部品ごとに別の id にする
  const clipId = useId();

  return (
    <svg
      className="pairGlyph"
      width="26"
      height="16"
      viewBox="0 0 26 16"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={L} cy="8" r={R} />
        </clipPath>
      </defs>

      {/* 2つとも淡く塗った上に、該当する部分だけ濃く重ねる。
          色は sidebar.css の .pairGlyph（左＝墨、右＝ローズ、重なり＝本文の色。フェーズ14）。
          枠線で描いたり2つを大きく重ねたりすると、オン・オフの切り替え
          スイッチに見えてしまったので、円を少し離し、濃い円には
          帯の丸写真（.pairAvatar）と同じ白い縁を付けている */}
      <circle className="left" cx={L} cy="8" r={R} opacity=".28" />
      <circle className="right" cx={RIGHT} cy="8" r={R} opacity=".28" />

      {side === "left" && (
        <circle className="left" cx={L} cy="8" r={R} stroke="#fff" strokeWidth="1.5" />
      )}
      {side === "right" && (
        <circle className="right" cx={RIGHT} cy="8" r={R} stroke="#fff" strokeWidth="1.5" />
      )}
      {side === "both" && (
        <circle
          className="between"
          cx={RIGHT}
          cy="8"
          r={R}
          clipPath={`url(#${clipId})`}
        />
      )}
    </svg>
  );
}
