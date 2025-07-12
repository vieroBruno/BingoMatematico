import React from 'react';

function TelaSaida() {
  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Obrigado por jogar! 👋</h2>
      <p>Você pode fechar esta aba do navegador com segurança.</p>
      <p style={{ marginTop: '40px', fontSize: '0.8rem', color: '#666' }}>
        Este aplicativo não pode fechar a aba automaticamente por motivos de segurança do seu navegador.
      </p>
    </div>
  );
}

export default TelaSaida;