import React, { useState } from 'react';

function TelaConfiguracao({ onIniciar, onVoltar }) {
  const [operacoes, setOperacoes] = useState({ soma: true, subtracao: false, multiplicacao: false, divisao: false });
  const [dificuldade, setDificuldade] = useState('fácil');
  const [tipoBingo, setTipoBingo] = useState('linha');

  const handleOperacaoChange = (e) => {
    const { name, checked } = e.target;
    setOperacoes(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const operacoesSelecionadas = Object.keys(operacoes).filter(op => operacoes[op]);
    if (operacoesSelecionadas.length > 0) {
      onIniciar({ operacoes: operacoesSelecionadas, dificuldade, tipoBingo });
    } else {
      alert('Selecione pelo menos uma operação!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="config-form">
      <h2>Configurar Partida ⚙️</h2>
      
      <div className="config-section">
        <h3>1. Escolha as operações:</h3>
        <div className="options-group">
          {['soma', 'subtração', 'multiplicação', 'divisão'].map(op => (
            <div key={op}>
              <input type="checkbox" id={op} name={op} checked={operacoes[op]} onChange={handleOperacaoChange} />
              <label htmlFor={op}>{op.charAt(0).toUpperCase() + op.slice(1)}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="config-section">
        <h3>2. Escolha a dificuldade:</h3>
        <div className="options-group">
          {['fácil', 'médio', 'difícil'].map(d => (
            <div key={d}>
              <input type="radio" id={d} name="dificuldade" value={d} checked={dificuldade === d} onChange={(e) => setDificuldade(e.target.value)} />
              <label htmlFor={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="config-section">
        <h3>3. Tipo de Bingo:</h3>
        <div className="options-group">
          <input type="radio" id="linha" name="tipoBingo" value="linha" checked={tipoBingo === 'linha'} onChange={(e) => setTipoBingo(e.target.value)} />
          <label htmlFor="linha">Uma Linha</label>
          <input type="radio" id="cartela" name="tipoBingo" value="cartela" checked={tipoBingo === 'cartela'} onChange={(e) => setTipoBingo(e.target.value)} />
          <label htmlFor="cartela">Cartela Cheia</label>
        </div>
      </div>
      
      <div className="botoes-acao-config">
            <button type="button" className="btn btn-voltar" onClick={onVoltar}>
                Voltar
            </button>
               <button type="submit" className="btn">
                Começar Jogo
            </button>
        </div>
    </form>
  );
}

export default TelaConfiguracao;