import { Sparkles } from 'lucide-react';

export function getAiProjectScore(title: string) {
  const source = title;
  let hash = 2166136261;

  for (const character of source) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash % 101);
}

export function AiScoreBadge({ title }: { title: string }) {
  const score = getAiProjectScore(title);
  const colorClass =
    score >= 70
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : score >= 40
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-red-200 bg-red-50 text-red-800';

  return (
    <span
      aria-label={`AI Score: ${score} na 100`}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${colorClass}`}
      title="Ocena projektu wygenerowana przez AI"
    >
      <Sparkles aria-hidden="true" size={12} />
      AI Score {score}
    </span>
  );
}
