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
            if (dificuldade === 'fácil') {
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

const gerarNumerosCartela = (quantidade, config) => {
  const numeros = new Set();
  const max = config.dificuldade === 'fácil' ? 50 : (config.dificuldade === 'médio' ? 100 : 200);
  
  const apenasMultiplicacao = config.operacoes.length === 1 && config.operacoes[0] === 'multiplicação';

  while (numeros.size < quantidade) {
    const maximoParaGerar = (apenasMultiplicacao && config.dificuldade === 'fácil') ? 50 : max;
    let candidato = Math.floor(Math.random() * maximoParaGerar) + 2;

    if (apenasMultiplicacao) {
        if (!isNumeroValidoParaMultiplicacao(candidato, config.dificuldade)) {
            continue;
        }
    }
    
    numeros.add(candidato);
  }

  const numerosGerados = Array.from(numeros);

  // Verifica se a dificuldade exige ordenação
  if (config.dificuldade === 'fácil' || config.dificuldade === 'médio') {
    // 1. Ordena os números do menor para o maior
    const numerosOrdenados = numerosGerados.sort((a, b) => a - b);
    
    // 2. Prepara a cartela final de 25 posições
    const cartelaFinal = Array(25);
    let contadorNumeros = 0;

    // 3. Preenche a cartela por colunas para obter o efeito desejado
    for (let coluna = 0; coluna < 5; coluna++) {
      for (let linha = 0; linha < 5; linha++) {
        const index = linha * 5 + coluna; // Fórmula para calcular o índice na cartela

        // Se for a posição central (12), insere a estrela
        if (index === 12) {
          cartelaFinal[index] = '⭐️';
        } else {
          // Caso contrário, insere o próximo número da lista ordenada
          cartelaFinal[index] = numerosOrdenados[contadorNumeros];
          contadorNumeros++;
        }
      }
    }
    // Retorna a cartela ordenada por colunas
    return cartelaFinal;

  } else {
    // Para a dificuldade "Difícil", mantém a ordem aleatória para maior desafio
    const cartelaDificil = [...numerosGerados];
    // Adiciona a estrela no centro
    cartelaDificil.splice(12, 0, '⭐️');
    return cartelaDificil;
  }
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
  // ... (toda a lógica do componente, hooks useState, useEffect, etc., permanece a mesma)
  const [cartela, setCartela] = useState([]);
  const [expressao, setExpressao] = useState({ texto: 'Carregando...', resultado: null });
  const [vidas, setVidas] = useState(VIDAS_INICIAIS);
  const [tempo, setTempo] = useState(0);

  const renderizarVidas = () => {
    const coracoes = [];
    for (let i = 0; i < VIDAS_INICIAIS; i++) {
      // Adiciona a classe 'inativo' se a vida já foi perdida
      coracoes.push(<span key={i} className={`coracao ${i >= vidas ? 'inativo' : ''}`}>❤️</span>);
    }
    return coracoes;
  };

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
        onFinalizar({ vitoria: true, tempo: tempo, vidasRestantes: vidas, ...config  });
      } else {
        buscarNovaExpressao(novaCartela);
      }
    } else {
      setVidas(v => {
          const novasVidas = v - 1;
          if(novasVidas <= 0) {
              onFinalizar({ vitoria: false, tempo: tempo, ...config });
          }
          return novasVidas;
      });
    }
  };
  
  // O JSX para renderização permanece o mesmo...
  if (cartela.length === 0) return <div>Carregando jogo...</div>;

  return (
    <>
    <div className="tela-jogo">
      <div className="info-superior">
            <div className="vidas">{renderizarVidas()}</div>
            <div className="tempo">⏱️ <span>{tempo}s</span></div>
        </div>
        <div className="painel-superior">
            <div className="expressao-container">{expressao.texto} = ?</div>
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
  </>
  );
}

export default TelaJogo;