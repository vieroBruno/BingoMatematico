import React, { useState, useEffect } from 'react';

function TelaRanking({ onVoltar }) {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const rankingSalvo = JSON.parse(localStorage.getItem('bingoRanking')) || [];
    setRanking(rankingSalvo);
  }, []);

  return (
    <div>
      <h2>🏆 Ranking dos Melhores 🏆</h2>
      {ranking.length > 0 ? (
        <ol className="ranking-list">
          {ranking.map((item, index) => (
            <li key={index}>
              <span>{index + 1}. {item.nome}</span>
              <span>{item.pontuacao} pts</span>
            </li>
          ))}
        </ol>
      ) : (
        <p>Nenhuma pontuação registrada ainda. Seja o primeiro!</p>
      )}
      <button className="btn" onClick={onVoltar}>Voltar</button>
    </div>
  );
}

export default TelaRanking;