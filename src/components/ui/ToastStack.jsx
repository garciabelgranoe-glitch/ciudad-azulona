export default function ToastStack({ toasts }) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto max-w-sm rounded-lg border-2 border-[#B9432C]/30 bg-[#FBE6E0] px-4 py-2.5 text-center text-[13px] font-bold text-[#B9432C] shadow-card"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
