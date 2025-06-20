<?php
// ... (cabeçalhos e leitura de parâmetros continuam iguais)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$dificuldade = $_GET['dificuldade'] ?? 'facil';
$operacoes_str = $_GET['operacoes'] ?? 'soma';
$operacoes = explode(',', $operacoes_str);
$resultado_desejado = isset($_GET['resultado_desejado']) ? (int)$_GET['resultado_desejado'] : null;

if ($resultado_desejado === null) {
    echo json_encode(['error' => 'Resultado desejado não foi fornecido.']);
    exit;
}
// ... (definição de limites continua igual)
$limites = [
    'facil' => ['min' => 1, 'max' => 10, 'max_sub' => 20],
    'medio' => ['min' => 10, 'max' => 25, 'max_sub' => 50],
    'dificil' => ['min' => 20, 'max' => 50, 'max_sub' => 100]
];
$min = $limites[$dificuldade]['min'];
$max = $limites[$dificuldade]['max'];
$max_sub = $limites[$dificuldade]['max_sub'];

$operacao = $operacoes[array_rand($operacoes)];
$resultado = $resultado_desejado;
$expressao = '';

switch ($operacao) {
    // ... (cases 'soma', 'subtracao', 'divisao' continuam iguais)
    case 'soma':
        $num1_max = ($resultado > 1) ? $resultado - 1 : 0;
        $num1 = rand(1, $num1_max);
        $num2 = $resultado - $num1;
        $expressao = "$num1 + $num2";
        break;

    case 'subtracao':
        $num2 = rand($min, $max);
        $num1 = $resultado + $num2;
        if($num1 > $max_sub) {
            $num1 = rand($resultado + 1, $max_sub);
            $num2 = $num1 - $resultado;
        }
        $expressao = "$num1 - $num2";
        break;

    case 'multiplicacao':
        // --- LÓGICA MODIFICADA AQUI ---
        $divisores = [];
        // Itera até a raiz quadrada para otimização
        for ($i = 2; $i <= sqrt($resultado); $i++) {
            if ($resultado % $i == 0) {
                $divisor_par = $resultado / $i;
                // Validação de dificuldade para o par de divisores
                if ($dificuldade == 'facil' && ($i > 10 || $divisor_par > 10)) continue;
                
                $divisores[] = $i;
            }
        }
        
        // Se encontrarmos divisores válidos, criamos a expressão.
        // O front-end agora garante que sempre haverá divisores se a multiplicação for a única opção.
        if (count($divisores) > 0) {
            $num2 = $divisores[array_rand($divisores)];
            $num1 = $resultado / $num2;
            $expressao = "$num1 × $num2";
        } else {
            // Se, por algum motivo raro, não encontrar (ex: número primo),
            // a melhor opção é uma multiplicação por 1, que é sempre válida.
            $expressao = "$resultado × 1";
        }
        // --- FIM DA MODIFICAÇÃO ---
        break;
    
    case 'divisao':
        $num2 = rand(2, ($dificuldade == 'facil' ? 10 : 12));
        $num1 = $resultado * $num2;
        $expressao = "$num1 ÷ $num2";
        break;
}

echo json_encode([
    'expressao' => $expressao,
    'resultado' => $resultado
]);
?>