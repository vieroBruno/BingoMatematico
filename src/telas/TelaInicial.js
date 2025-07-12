import React from 'react';

function TelaInicial({ onIniciar, onRanking , onSair}) {
  return (
    <>
      <h1>Bingo Matemático! 🔢</h1>
      <p>Aprenda matemática de um jeito divertido.</p>
      
      {/* Container principal para todos os botões */}
      <div className="container-botoes-inicial">
        {/* Grupo para os botões principais */}
        <div className="botoes-principais">
          <button className="btn" onClick={onIniciar}>
            ▶️ Iniciar Partida
          </button>
          <button className="btn btn-secundario" onClick={onRanking}>
            🏆 Ver Ranking
          </button>
        </div>

        {/* Botão de sair fica fora do grupo principal */}
        <button className="btn btn-sair" onClick={onSair}>
          Sair
        </button>
      </div>
    </>
  );
}

export default TelaInicial;