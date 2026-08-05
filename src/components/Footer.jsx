import { B, BD, OR } from '../constants.js';

export const Footer = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const linkStyle = { 
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', 
    textAlign: 'left', padding: '4px 0', cursor: 'pointer', fontSize: '14px', 
    fontFamily: 'inherit', fontWeight: 500, transition: 'color 0.2s',
    display: 'block'
  };

  return (
    <footer style={{
      background: `linear-gradient(135deg, ${BD}, ${B})`,
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '48px 24px 24px',
      color: 'white',
      marginTop: 0
    }}>
      <div style={{ 
        maxWidth: '780px', margin: '0 auto', display: 'flex', 
        flexWrap: 'wrap', justifyContent: 'space-between', gap: '36px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: OR, borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 12px rgba(232,119,34,.3)' }}>★</div>
            <span style={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>ProfesoresUCSUR</span>
          </div>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.5, maxWidth: 280 }}>
            Opiniones reales y anónimas de estudiantes de la Universidad Científica del Sur.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '120px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' }}>Navegación</h3>
          <button onClick={() => onNavigate('home')} style={linkStyle} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>🏠 Inicio</button>
          <button onClick={() => onNavigate('ranking')} style={linkStyle} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>🏆 Ranking</button>
          <button onClick={() => onNavigate('agregar')} style={linkStyle} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>➕ Agregar profe</button>
        </div>
      </div>

      <div style={{ 
        maxWidth: '780px', margin: '32px auto 0', paddingTop: '16px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
        textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontWeight: 500
      }}>
        © {currentYear} ProfesoresUCSUR · Universidad Científica del Sur
      </div>
    </footer>
  );
};
