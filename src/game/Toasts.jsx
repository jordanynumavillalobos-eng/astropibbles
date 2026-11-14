export default function Toasts({ toasts }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`} style={{ '--ghost': t.color }}>
          <span className="toast-kind">{t.label}</span>
          <strong>{t.title}</strong>
          {t.text && <p>{t.text}</p>}
        </div>
      ))}
    </div>
  )
}
