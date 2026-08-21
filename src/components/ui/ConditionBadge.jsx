import { CONDITION_COLORS, CONDITION_SHORT } from "../../lib/auctions";
import Pill from "./Pill";

export default function ConditionBadge({ condition, isGraded, gradingCompany, grade }) {
  if (isGraded) {
    return (
      <Pill tone="gold">
        {gradingCompany?.toUpperCase() ?? "GRADEADA"} {grade ?? ""}
      </Pill>
    );
  }
  if (!condition) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${
        CONDITION_COLORS[condition] ?? "border-line bg-paper text-ink-soft"
      }`}
    >
      {CONDITION_SHORT[condition] ?? condition}
    </span>
  );
}
