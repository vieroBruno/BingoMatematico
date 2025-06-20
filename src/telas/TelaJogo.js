import React, { useState, useEffect, useCallback } from 'react';

// ... (constantes TAMANHO_CARTELA, VIDAS_INICIAIS)
const TAMANHO_CARTELA = 5;
const VIDAS_INICIAIS = 5;


// ### NOVA FUNÇÃO AUXILIAR ###
// Verifica se um número é composto (não primo) e tem fatores dentro dos limites da dificuldade.
const isNumeroValidoParaMultiplicacao = (num, dificuldade) => {
    if (num <= 3) return false; // Números muito pequenos não são bons para gerar contas.
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
            const par = num / i;
            if (dificuldade === 'facil') {
                // Para ser fácil, ambos os fatores devem ser 10 ou menos.
                if (i <= 10 && par <= 10) return true;
            } else {
                // Para outras dificuldades, basta que seja composto.
                return true;
            }
        }
    }
    return false; // É primo ou não atende aos critérios de dificuldade.
};

// ### FUNÇÃO gerarNumerosCartela MODIFICADA ###
const gerarNumerosCartela = (quantidade, config) => {
  const numeros = new Set();
  const max = config.dificuldade === 'facil' ? 100 : (config.dificuldade === 'medio' ? 150 : 300);
  
  // Condição especial: se SÓ tem multiplicação, precisamos garantir que os números sejam válidos.
  const apenasMultiplicacao = config.operacoes.length === 1 && config.operacoes[0] === 'multiplicacao';

  while (numeros.size < quantidade) {
    // Para multiplicação fácil, o resultado não pode ser muito grande.
    const maximoParaGerar = (apenasMultiplicacao && config.dificuldade === 'facil') ? 100 : max;
    let candidato = Math.floor(Math.random() * maximoParaGerar) + 2;

    if (apenasMultiplicacao) {
        // Se o número candidato não for válido, pula para a próxima iteração.
        if (!isNumeroValidoParaMultiplicacao(candidato, config.dificuldade)) {
            continue;
        }
    }
    
    numeros.add(candidato);
  }

  const arrayNumeros = Array.from(numeros);
  arrayNumeros[Math.floor(quantidade / 2)] = '⭐️';
  return arrayNumeros;
};

// ... (verificarVitoria não muda)
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
  // ... (toda a lógica do componente, hooks useState, useEffect, etc., permanece a mesma)
  const [cartela, setCartela] = useState([]);
  const [expressao, setExpressao] = useState({ texto: 'Carregando...', resultado: null });
  const [vidas, setVidas] = useState(VIDAS_INICIAIS);
  const [tempo, setTempo] = useState(0);

  const buscarNovaExpressao = useCallback(async (cartelaAtual) => {
    const numerosDisponiveis = cartelaAtual
      .flat()
      .filter(celula => !celula.marcado && celula.numero !== '⭐️')
      .map(celula => celula.numero);

    if (numerosDisponiveis.length === 0) {
        console.log("Não há mais números disponíveis.");
        return;
    }
    
    const resultadoAlvo = numerosDisponiveis[Math.floor(Math.random() * numerosDisponiveis.length)];

    const params = new URLSearchParams({
      dificuldade: config.dificuldade,
      operacoes: config.operacoes.join(','),
      resultado_desejado: resultadoAlvo,
    });
    
    try {
        const response = await fetch(`http://localhost/bingo-matematico/gerador_expressao.php?${params}`);
        const data = await response.json();

        if (data.error) {
            console.error("Erro da API:", data.error);
        } else {
            setExpressao({ texto: data.expressao, resultado: data.resultado });
        }
    } catch(e) {
        console.error("Falha ao buscar expressão:", e);
        setExpressao({ texto: "Erro de conexão", resultado: null });
    }
  }, [config]);

  // Inicialização do Jogo
  useEffect(() => {
    // Passa o objeto 'config' inteiro para a função ter acesso às operações e dificuldade
    const numeros = gerarNumerosCartela(TAMANHO_CARTELA * TAMANHO_CARTELA, config);
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
    buscarNovaExpressao(novaCartela);

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
        buscarNovaExpressao(novaCartela);
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