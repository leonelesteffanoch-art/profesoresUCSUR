export const SkeletonCard = ({ count = 6 }) => (
  <>
    {Array(count).fill(0).map((_, i) => (
      <div
        key={i}
        className="card"
        style={{
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div className="shimmer" style={{ width: 52, height: 52, borderRadius: 18, flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="shimmer" style={{ width: "68%", height: 17, borderRadius: 6 }} />
            <div className="shimmer" style={{ width: "44%", height: 13, borderRadius: 6 }} />
          </div>
          <div className="shimmer" style={{ width: 56, height: 30, borderRadius: 10, flexShrink: 0 }} />
        </div>
        <div style={{ display: "flex", gap: 6, paddingTop: 10, borderTop: "1px dashed var(--border-color)" }}>
          <div className="shimmer" style={{ width: 92, height: 22, borderRadius: 99 }} />
          <div className="shimmer" style={{ width: 112, height: 22, borderRadius: 99 }} />
          <div className="shimmer" style={{ width: 54, height: 22, borderRadius: 99, marginLeft: "auto" }} />
        </div>
      </div>
    ))}
  </>
);
