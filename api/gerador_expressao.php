<?php
// Permite que o front-end React acesse esta API
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Pega os parâmetros da URL (ex: ?dificuldade=facil&operacoes=soma,subtracao)
$dificuldade = $_GET['dificuldade'] ?? 'facil';
$operacoes_str = $_GET['operacoes'] ?? 'soma';
$operacoes = explode(',', $operacoes_str);

// Define os limites dos números com base na dificuldade
$limites = [
    'facil' => ['min' => 1, 'max' => 10],
    'medio' => ['min' => 10, 'max' => 50],
    'dificil' => ['min' => 20, 'max' => 100]
];
$min = $limites[$dificuldade]['min'];
$max = $limites[$dificuldade]['max'];

// Escolhe uma operação aleatória dentre as selecionadas
$operacao = $operacoes[array_rand($operacoes)];

$num1 = 0;
$num2 = 0;
$expressao = '';
$resultado = 0;

switch ($operacao) {
    case 'soma':
        $num1 = rand($min, $max);
        $num2 = rand($min, $max);
        $expressao = "$num1 + $num2";
        $resultado = $num1 + $num2;
        break;
    case 'subtracao':
        $num1 = rand($min, $max);
        $num2 = rand($min, $num1); // Garante que o resultado não seja negativo
        $expressao = "$num1 - $num2";
        $resultado = $num1 - $num2;
        break;
    case 'multiplicacao':
        // Ajusta os números para não gerar resultados muito grandes
        $max_mult = ($dificuldade == 'facil') ? 10 : 20;
        $num1 = rand($min, $max_mult);
        $num2 = rand(1, 10);
        $expressao = "$num1 × $num2";
        $resultado = $num1 * $num2;
        break;
    case 'divisao':
        // Lógica para garantir divisão exata
        $divisor = rand(2, 10);
        $resultado_temp = rand(2, ($dificuldade == 'facil') ? 10 : 20);
        $dividendo = $divisor * $resultado_temp;
        $expressao = "$dividendo ÷ $divisor";
        $resultado = $resultado_temp;
        break;
}

// Retorna a expressão e o resultado em formato JSON
echo json_encode([
    'expressao' => $expressao,
    'resultado' => $resultado
]);

?>