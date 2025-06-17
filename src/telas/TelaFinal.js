import React, { useEffect, useState, useRef } from 'react';

const calcularPontuacao = (tempo, vidasRestantes) => {
    if (tempo === 0) return 5000 + (vidasRestantes * 500);
    return Math.floor((10000 / tempo) * (vidasRestantes || 1));
}

function TelaFinal({ resultado, onJogarNovamente, onVoltarAoInicio }) {
  const [pontuacao, setPontuacao] = useState(0);
  const efeitoJaRodou = useRef(false);

  useEffect(() => {
    if (resultado.vitoria && efeitoJaRodou.current === false) {
      const p = calcularPontuacao(resultado.tempo, resultado.vidasRestantes);
      setPontuacao(p);
      
      const nomeJogador = prompt("Parabéns! Você venceu! Digite seu nome para o ranking:");
      
      // Garante que o usuário não cancelou o prompt
      if (nomeJogador) {
        const ranking = JSON.parse(localStorage.getItem('bingoRanking')) || [];
        
        // --- INÍCIO DA NOVA LÓGICA DE VALIDAÇÃO ---

        // 1. Procura se o jogador já existe (ignorando maiúsculas/minúsculas)
        const indexJogadorExistente = ranking.findIndex(
          jogador => jogador.nome.toLowerCase() === nomeJogador.toLowerCase()
        );

        if (indexJogadorExistente !== -1) {
          // JOGADOR JÁ EXISTE NO RANKING
          const jogadorExistente = ranking[indexJogadorExistente];

          // 2. Compara a pontuação nova com a antiga
          if (p > jogadorExistente.pontuacao) {
            // A nova pontuação é MAIOR
            const querAtualizar = window.confirm(
              `Parece que você já está no ranking!\n\nSua pontuação anterior: ${jogadorExistente.pontuacao} pts\nSua nova pontuação: ${p} pts\n\nGostaria de atualizar para a pontuação mais alta?`
            );

            if (querAtualizar) {
              // Remove a entrada antiga e adiciona a nova para reordenar
              ranking.splice(indexJogadorExistente, 1);
              ranking.push({ nome: nomeJogador, pontuacao: p, tempo: resultado.tempo });
              ranking.sort((a, b) => b.pontuacao - a.pontuacao);
              localStorage.setItem('bingoRanking', JSON.stringify(ranking.slice(0, 10)));
              alert("Pontuação atualizada com sucesso!");
            } else {
              alert("Ok, sua pontuação anterior foi mantida.");
            }
          } else {
            // A nova pontuação é MENOR ou IGUAL
            alert(`Sua nova pontuação (${p} pts) não superou a anterior (${jogadorExistente.pontuacao} pts). Vamos manter a sua melhor marca!`);
          }
        } else {
          // JOGADOR NOVO: Lógica original
          ranking.push({ nome: nomeJogador, pontuacao: p, tempo: resultado.tempo });
          ranking.sort((a, b) => b.pontuacao - a.pontuacao);
          localStorage.setItem('bingoRanking', JSON.stringify(ranking.slice(0, 10)));
        }
        
        // --- FIM DA NOVA LÓGICA DE VALIDAÇÃO ---
      }

      efeitoJaRodou.current = true;
    }
  }, [resultado]);


  return (
    <div className="resultado-container">
      {resultado.vitoria ? (
        <>
          <h2>Vitória! 🏆</h2>
          <div className="resultado-info">
            <p>Seu tempo: <strong>{resultado.tempo} segundos</strong></p>
            <p>Vidas restantes: <strong>{resultado.vidasRestantes}</strong></p>
            <p>Pontuação final: <strong>{pontuacao}</strong></p>
          </div>
        </>
      ) : (
        <>
          <h2>Derrota! 💔</h2>
          <p className="resultado-info">Não foi desta vez! Continue praticando.</p>
        </>
      )}
      <div>
        <button className="btn" onClick={onJogarNovamente}>Jogar Novamente</button>
        <button className="btn btn-secundario" onClick={onVoltarAoInicio}>Menu Principal</button>
      </div>
    </div>
  );
}

export default TelaFinal;