export const SkeletonCard = ({ count = 4 }) => (
  <>
    {Array(count).fill(0).map((_, i) => (
      <div key={i} className="card" style={{
        padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16,
        borderLeft: '5px solid var(--border-color)'
      }}>
        {/* Avatar */}
        <div className="shimmer" style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0 }} />
        {/* Text */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="shimmer" style={{ width: '65%', height: 18, borderRadius: 6 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <div className="shimmer" style={{ width: 95, height: 22, borderRadius: 20 }} />
            <div className="shimmer" style={{ width: 68, height: 22, borderRadius: 20 }} />
          </div>
        </div>
        {/* Rating */}
        <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div className="shimmer" style={{ width: 52, height: 28, borderRadius: 10 }} />
          <div className="shimmer" style={{ width: 64, height: 14, borderRadius: 4 }} />
        </div>
      </div>
    ))}
  </>
);
