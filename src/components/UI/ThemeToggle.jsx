import React from 'react';

export const ThemeToggle = ({ isDark, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '18px',
        transition: 'transform 0.5s ease',
        transform: isDark ? 'rotate(180deg)' : 'rotate(0deg)',
      }}
      title="Toggle theme"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};
