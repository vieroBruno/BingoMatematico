import React, { useState } from 'react';
import TelaInicial from './telas/TelaInicial';
import TelaConfiguracao from './telas/TelaConfiguracao';
import TelaJogo from './telas/TelaJogo';
import TelaFinal from './telas/TelaFinal';
import TelaRanking from './telas/TelaRanking';
import TelaSaida from './telas/TelaSaida'; // 1. Importe a nova tela
import './css/App.css';
import './css/Jogo.css';

function App() {
  const [telaAtual, setTelaAtual] = useState('inicial'); // inicial, configuracao, jogo, final, ranking
  const [configJogo, setConfigJogo] = useState(null);
  const [resultado, setResultado] = useState(null);

  const iniciarJogo = (config) => {
    setConfigJogo(config);
    setTelaAtual('jogo');
  };

  const verRanking = () => {
    setTelaAtual('ranking');
  };

  const finalizarJogo = (resultadoFinal) => {
    setResultado(resultadoFinal);
    setTelaAtual('final');
  };

  const voltarAoInicio = () => {
    setTelaAtual('inicial');
  };
  
  const jogarNovamente = () => {
      setTelaAtual('configuracao');
  }
  const irParaSaida = () => {
    if(window.confirm("Você tem certeza que deseja sair?")){
      
      var tab = window.open("","_self");
      tab.close();
    }
    
  };

  const renderizarTela = () => {
    switch (telaAtual) {
      case 'configuracao':
        return <TelaConfiguracao onIniciar={iniciarJogo} onVoltar={voltarAoInicio} />;
      case 'jogo':
        return <TelaJogo config={configJogo} onFinalizar={finalizarJogo} />;
      case 'final':
        return <TelaFinal resultado={resultado} onJogarNovamente={jogarNovamente} onVoltarAoInicio={voltarAoInicio} />;
      case 'ranking':
        return <TelaRanking onVoltar={voltarAoInicio} />;
      case 'saida':
        return <TelaSaida />;
      case 'inicial':
      default:
        return <TelaInicial onIniciar={() => setTelaAtual('configuracao')} onRanking={verRanking} onSair={irParaSaida} />;
    }
  };

  return (
    <div className="app-container">
      {renderizarTela()}
    </div>
  );
}

export default App;