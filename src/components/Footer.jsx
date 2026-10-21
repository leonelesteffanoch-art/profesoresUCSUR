import { B, BD } from '../constants.js';
import { BrandLogo } from './UI/BrandLogo.jsx';

export const Footer = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const linkStyle = { 
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)', 
    textAlign: 'left', padding: '5px 0', cursor: 'pointer', fontSize: '14px', 
    fontFamily: 'inherit', fontWeight: 600, transition: 'color 0.2s',
    display: 'block'
  };

  return (
    <footer
      className="site-footer"
      style={{
        background: `linear-gradient(135deg, ${BD}, ${B})`,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        color: 'white',
        marginTop: 0
      }}
    >
      <div style={{ 
        maxWidth: '780px', margin: '0 auto', display: 'flex', 
        flexWrap: 'wrap', justifyContent: 'space-between', gap: '36px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '220px' }}>
          <div onClick={() => onNavigate('home')} style={{ cursor: 'pointer', display: 'inline-flex' }}>
            <BrandLogo size="sm" variant="light" showSubtitle={true} />
          </div>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.58)', fontSize: '13px', lineHeight: 1.55, maxWidth: 290 }}>
            Opiniones reales y anónimas de estudiantes de la Universidad Científica del Sur.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '140px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.2, textTransform: 'uppercase' }}>Navegación</h3>
          <button onClick={() => onNavigate('home')} style={linkStyle} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}>🏠 Inicio</button>
          <button onClick={() => onNavigate('ranking')} style={linkStyle} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}>🏆 Ranking</button>
          <button onClick={() => onNavigate('solicitudes')} style={linkStyle} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}>🗳️ Secciones Adicionales</button>
          <button onClick={() => onNavigate('agregar')} style={linkStyle} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}>➕ Agregar Profesor</button>
          <button onClick={() => onNavigate('feedback')} style={linkStyle} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}>💡 Sugerencias</button>
        </div>
      </div>

      <div style={{ 
        maxWidth: '780px', margin: '32px auto 0', paddingTop: '16px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
        textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 500
      }}>
        © {currentYear} ProfesoresUCSUR · Universidad Científica del Sur
      </div>
    </footer>
  );
};
