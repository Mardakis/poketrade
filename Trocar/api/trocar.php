<?php
header('Content-Type: application/json');

// Configurações do banco
$servername = "localhost";
$username = "usuario";
$password = "senha";
$dbname = "pokemon_tcg";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Parâmetros
$params = json_decode(file_get_contents('php://input'), true);

$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$search = isset($_GET['search']) ? "%".$_GET['search']."%" : "%";
$tags = isset($_GET['tags']) ? json_decode($_GET['tags']) : [];
$minPrice = isset($_GET['minPrice']) ? floatval($_GET['minPrice']) : 0;
$maxPrice = isset($_GET['maxPrice']) ? floatval($_GET['maxPrice']) : 1000;
$sort = isset($_GET['sort']) ? $_GET['sort'] : 'recentes';

// Ordenação
$sortOptions = [
    'recentes' => 'id DESC',
    'preco_asc' => 'preco ASC',
    'preco_desc' => 'preco DESC',
    'nome_asc' => 'nome_carta ASC',
    'nome_desc' => 'nome_carta DESC'
];
$order = $sortOptions[$sort] ?? 'id DESC';

// Montar query
$sql = "SELECT * FROM trocoCartas 
        WHERE disponivel = 1 
        AND nome_carta LIKE ?
        AND preco BETWEEN ? AND ?
        AND (".(empty($tags) ? '1=1' : "tag IN (".str_repeat('?,', count($tags)-1)."?)").")
        ORDER BY $order
        LIMIT ?, ?";

$types = 'sdd'.str_repeat('s', count($tags)).'ii';
$values = array_merge([$search, $minPrice, $maxPrice], $tags, [($page-1)*$itemsPerPage, $itemsPerPage]);

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$values);

// Executar e retornar resultados
// ... (similar ao anterior)