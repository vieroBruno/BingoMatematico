<?php
if (function_exists('opcache_reset')) {
    opcache_reset();
}
// Força o navegador a não usar cache.
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

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
    case 'soma':
        $num1_max = ($resultado > 1) ? $resultado - 1 : 0;
        $num1 = rand(1, $num1_max);
        $num2 = $resultado - $num1;
        $expressao = "$num1 + $num2";
        break;

    case 'subtracao':
        $num2 = rand($min, $max);        
        $num1 = $resultado + $num2; 
    
        $expressao = "$num1 - $num2";
    break;

    case 'multiplicacao':
         $pares_de_fatores = [];
        for ($i = 2; $i <= sqrt($resultado); $i++) {
            if ($resultado % $i == 0) {
                $par = $resultado / $i;
                $pares_de_fatores[] = [$i, $par];
            }
        }
        
        if (count($pares_de_fatores) > 0) {
            $par_escolhido = $pares_de_fatores[array_rand($pares_de_fatores)];
            $num1 = $par_escolhido[0];
            $num2 = $par_escolhido[1];
            if(rand(0,1) == 1){
                 $expressao = "$num1 × $num2";
            } else {
                 $expressao = "$num2 × $num1";
            }
           
        } else {
            $expressao = "$resultado × 1";
        }

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