import React from 'react';

const GoogleButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 20px',
        backgroundColor: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#3c4043',
        fontFamily: 'Roboto, Arial, sans-serif',
        fontWeight: '500',
        borderRadius: '8px'
      }}
    >
      <img 
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
        alt="Google logo" 
        style={{ width: '20px', height: '20px', marginRight: '12px' }} 
      />
      Login com Google
    </button>
  );
};

export default GoogleButton;   