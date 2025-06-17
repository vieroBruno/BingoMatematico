import React, { useState, useEffect, useCallback } from 'react';

// As constantes e a função auxiliar `verificarVitoria` permanecem as mesmas...
const TAMANHO_CARTELA = 5;
const VIDAS_INICIAIS = 5;

const gerarNumerosCartela = (quantidade, dificuldade) => {
  const numeros = new Set();
  const max = dificuldade === 'facil' ? 50 : (dificuldade === 'medio' ? 150 : 300);
  // Garante que os números gerados não sejam muito pequenos (ex: 0 ou 1), que causam problemas na geração inversa.
  while (numeros.size < quantidade) {
    numeros.add(Math.floor(Math.random() * max) + 2);
  }
  const arrayNumeros = Array.from(numeros);
  arrayNumeros[Math.floor(quantidade / 2)] = '⭐️';
  return arrayNumeros;
};

const verificarVitoria = (cartela, tipoBingo) => {
  const vitoriaLinha = () => {
    for (let i = 0; i < TAMANHO_CARTELA; i++) {
      if (cartela[i].every(c => c.marcado) || cartela.every(row => row[i].marcado)) return true;
    }
    if (cartela.every((row, idx) => row[idx].marcado) || cartela.every((row, idx) => row[TAMANHO_CARTELA - 1 - idx].marcado)) return true;
    return false;
  };
  const vitoriaCartelaCheia = () => cartela.flat().every(c => c.marcado);
  return tipoBingo === 'linha' ? vitoriaLinha() : vitoriaCartelaCheia();
};


function TelaJogo({ config, onFinalizar }) {
  const [cartela, setCartela] = useState([]);
  const [expressao, setExpressao] = useState({ texto: 'Carregando...', resultado: null });
  const [vidas, setVidas] = useState(VIDAS_INICIAIS);
  const [tempo, setTempo] = useState(0);

  // ### LÓGICA MODIFICADA AQUI ###
  const buscarNovaExpressao = useCallback(async (cartelaAtual) => {
    // 1. Encontrar todos os números que ainda não foram marcados.
    const numerosDisponiveis = cartelaAtual
      .flat() // Transforma a matriz 2D em um array 1D
      .filter(celula => !celula.marcado && celula.numero !== '⭐️')
      .map(celula => celula.numero);

    if (numerosDisponiveis.length === 0) {
        // Não deveria acontecer se a vitória for checada corretamente, mas é uma segurança.
        console.log("Não há mais números disponíveis.");
        return;
    }
    
    // 2. Escolher um desses números para ser o próximo resultado.
    const resultadoAlvo = numerosDisponiveis[Math.floor(Math.random() * numerosDisponiveis.length)];

    // 3. Chamar a API passando o resultado desejado.
    const params = new URLSearchParams({
      dificuldade: config.dificuldade,
      operacoes: config.operacoes.join(','),
      resultado_desejado: resultadoAlvo, // Novo parâmetro!
    });
    
    try {
        const response = await fetch(`http://localhost/bingo-matematico/gerador_expressao.php?${params}`);
        const data = await response.json();

        if (data.error) {
            console.error("Erro da API:", data.error);
            // Tratar o erro, talvez tentando buscar outra expressão
        } else {
            setExpressao({ texto: data.expressao, resultado: data.resultado });
        }
    } catch(e) {
        console.error("Falha ao buscar expressão:", e);
        setExpressao({ texto: "Erro de conexão", resultado: null });
    }
  }, [config]); // A dependência agora é apenas 'config'

  // Inicialização do Jogo
  useEffect(() => {
    const numeros = gerarNumerosCartela(TAMANHO_CARTELA * TAMANHO_CARTELA, config.dificuldade);
    const novaCartela = [];
    for (let i = 0; i < TAMANHO_CARTELA; i++) {
      const linha = [];
      for (let j = 0; j < TAMANHO_CARTELA; j++) {
        const numero = numeros[i * TAMANHO_CARTELA + j];
        linha.push({
          numero: numero,
          marcado: numero === '⭐️'
        });
      }
      novaCartela.push(linha);
    }
    setCartela(novaCartela);
    buscarNovaExpressao(novaCartela); // Passa a cartela recém-criada para a função

    const timer = setInterval(() => setTempo(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [config, buscarNovaExpressao]);
  
  const handleNumeroClick = (numeroClicado) => {
    if (numeroClicado === expressao.resultado) {
      const novaCartela = cartela.map(linha =>
        linha.map(celula => 
          celula.numero === numeroClicado ? { ...celula, marcado: true } : celula
        )
      );
      setCartela(novaCartela);
      
      if (verificarVitoria(novaCartela, config.tipoBingo)) {
        onFinalizar({ vitoria: true, tempo: tempo, vidasRestantes: vidas });
      } else {
        buscarNovaExpressao(novaCartela); // Busca a próxima expressão com base na cartela atualizada
      }
    } else {
      setVidas(v => {
          const novasVidas = v - 1;
          if(novasVidas <= 0) {
              onFinalizar({ vitoria: false, tempo: tempo });
          }
          return novasVidas;
      });
    }
  };

  // O JSX para renderização permanece o mesmo...
  if (cartela.length === 0) return <div>Carregando jogo...</div>;

  return (
    <div className="tela-jogo">
        <div className="painel-superior">
            <div className="vidas">❤️ <span>{vidas}</span></div>
            <div className="expressao-container">{expressao.texto} = ?</div>
            <div className="tempo">⏱️ <span>{tempo}s</span></div>
        </div>

      <div className="cartela-bingo">
        {cartela.flat().map((celula, index) => (
          <div
            key={index}
            className={`numero-cartela ${celula.marcado ? 'marcado' : ''}`}
            onClick={() => !celula.marcado && celula.numero !== '⭐️' && handleNumeroClick(celula.numero)}
          >
            {celula.numero}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TelaJogo;