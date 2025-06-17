import React from 'react';

function TelaInicial({ onIniciar, onRanking }) {
  return (
    <>
      <h1>Bingo Matemático! 🔢</h1>
      <p>Aprenda matemática de um jeito divertido.</p>
      <div>
        <button className="btn" onClick={onIniciar}>
          ▶️ Iniciar Partida
        </button>
        <button className="btn btn-secundario" onClick={onRanking}>
          🏆 Ver Ranking
        </button>
         <button className="btn btn-sair" onClick={() => window.close()}>
          Sair
        </button>
      </div>
    </>
  );
}

export default TelaInicial;