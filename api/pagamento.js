// Página de Pagamento PIX - Node.js version
export default async function handler(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    // Recebe os dados via query parameters
    const transacao = req.query.transacao || req.query.hash || generateId();
    const nome = req.query.nome || 'Cliente';
    const email = req.query.email || '';
    const telefone = req.query.telefone || '';
    const chavePix = req.query.pix || '';
    const qrcode = req.query.qrcode || '';
    const valor = req.query.valor || '0,00';
    const hash = req.query.hash || transacao;

    // Função para gerar ID único
    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Receber produtos via JSON
    const produtosJson = req.query.produtos ? decodeURIComponent(req.query.produtos) : '[]';
    let produtos = [];
    
    try {
        produtos = JSON.parse(produtosJson);
    } catch (error) {
        produtos = [];
    }

    // Calcular total baseado nos produtos
    let totalProdutos = 0;
    if (Array.isArray(produtos) && produtos.length > 0) {
        produtos.forEach(produto => {
            totalProdutos += (produto.preco * produto.quantidade);
        });
    }

    // Se não veio produtos, usar valor do parâmetro
    if (totalProdutos === 0 && valor !== '0,00') {
        totalProdutos = parseFloat(valor.replace(',', '.').replace(/\./g, ''));
    }

    const valorFormatado = totalProdutos.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const html = `
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
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 12px;
      border: 2px dashed #f53d5c;
    }

    .qrcode img {
      max-width: 200px;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .pix-input {
      display: flex;
      margin: 15px 0;
      width: 100%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    .pix-input input {
      flex: 1;
      padding: 12px;
      border: 1px solid #ddd;
      border-right: none;
      font-size: 12px;
      font-family: monospace;
      background: #f8f9fa;
      color: #495057;
    }

    .pix-input button {
      padding: 12px 16px;
      border: none;
      background: #f53d5c;
      color: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: background 0.3s ease;
    }

    .pix-input button:hover {
      background: #e02d49;
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

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="container">

    <!-- Cabeçalho e instruções -->
    <div class="card">
      <h1>Pague o Pix</h1>
      <div class="transacao">Transação: <strong>${escapeHtml(transacao)}</strong></div>

      <h2>Olá, ${escapeHtml(nome)}! 👋</h2>
      
      <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #007bff;">
        <p style="margin: 0 0 10px 0;"><strong>📱 Como pagar com PIX:</strong></p>
        <ol style="margin: 0; padding-left: 20px;">
          <li>Escaneie o QR Code <strong>OU</strong> copie o código PIX</li>
          <li>Abra o app do seu banco</li>
          <li>Vá em <strong>PIX → Pagar</strong></li>
          <li>Cole o código ou use a câmera para o QR Code</li>
          <li>Confirme o pagamento</li>
        </ol>
      </div>

      <div class="status" id="statusPagamento">Aguardando pagamento ⏳</div>

      <!-- QR Code -->
      <div class="qrcode">
        ${chavePix ? 
          `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(chavePix)}" alt="QR Code PIX" style="max-width: 200px; height: auto;">` :
          qrcode ? 
            `<img src="${escapeHtml(qrcode)}" alt="QR Code PIX" style="max-width: 200px; height: auto;">` :
            '<p style="color:#999;">QR Code não disponível</p>'
        }
      </div>

      ${chavePix ? `
        <p><strong>Escaneie o QR Code acima com seu banco ou copie o código PIX abaixo:</strong></p>
        
        <!-- Chave PIX -->
        <div class="pix-input">
          <input type="text" id="pix-chave" value="${escapeHtml(chavePix)}" readonly style="font-size: 12px;">
          <button onclick="copiarChave()" id="botao-copiar">Copiar</button>
        </div>

        <button class="confirm-btn" onclick="copiarChave()">📋 Copiar Código PIX</button>
      ` : `
        <p style="color:#f53d5c;">⚠️ Código PIX não foi gerado. Tente novamente.</p>
        <button class="confirm-btn" onclick="window.history.back()">← Voltar</button>
      `}
    </div>

    <!-- Itens da compra -->
    <div class="card">
      <h3>Itens da sua compra</h3>
      
      ${Array.isArray(produtos) && produtos.length > 0 ? 
        produtos.map(produto => `
          <div class="item">
            <img src="${produto.imagem || 'produto.png'}" 
                 alt="${escapeHtml(produto.nome)}" 
                 class="item-img"
                 onerror="this.src='produto.png'">
            
            <div class="item-info">
              <p class="item-name">${escapeHtml(produto.nome)}</p>
              <p class="item-details">Qtd: ${escapeHtml(produto.quantidade)}</p>
            </div>
            
            <div class="item-price">
              R$ ${(produto.preco * produto.quantidade).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
          </div>
        `).join('') :
        '<div class="empty-cart">Nenhum produto no carrinho</div>'
      }

      <!-- Total -->
      <div class="total">
        <span>Total: R$ ${valorFormatado}</span>
      </div>
    </div>

    <!-- Dados do cliente -->
    <div class="card dados">
      <h3>Seus dados</h3>
      <p><strong>Nome:</strong> ${escapeHtml(nome)}</p>
      ${email ? `<p><strong>E-mail:</strong> ${escapeHtml(email)}</p>` : ''}
      ${telefone ? `<p><strong>Telefone:</strong> ${escapeHtml(telefone)}</p>` : ''}
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
    async function copiarChave() {
      const input = document.getElementById("pix-chave");
      const botao = document.getElementById("botao-copiar");
      
      try {
        // Método moderno para copiar
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(input.value);
        } else {
          // Fallback para navegadores antigos
          input.select();
          input.setSelectionRange(0, 99999);
          document.execCommand("copy");
        }
        
        // Feedback visual
        const textoOriginal = botao.innerText;
        botao.innerText = "✅ Copiado!";
        botao.style.background = "#28a745";
        
        setTimeout(() => {
          botao.innerText = textoOriginal;
          botao.style.background = "";
        }, 2000);
        
        // Mostrar notificação
        mostrarNotificacao("Código PIX copiado com sucesso!", "success");
        
      } catch (err) {
        console.error("Erro ao copiar:", err);
        mostrarNotificacao("Erro ao copiar. Selecione o texto manualmente.", "error");
      }
    }
    
    function mostrarNotificacao(mensagem, tipo) {
      const notificacao = document.createElement('div');
      notificacao.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        \${tipo === 'success' ? 'background: #28a745;' : 'background: #dc3545;'}
      \`;
      notificacao.textContent = mensagem;
      
      document.body.appendChild(notificacao);
      
      setTimeout(() => {
        notificacao.remove();
      }, 3000);
    }

    const API_BASE_OVERRIDE = (window.CHECKOUT_API_BASE_URL || document.body?.dataset?.apiBase || '').trim();

    function buildApiUrl(path) {
      const sanitizedPath = \`\${path}\`.replace(/^\\/+/, '');

      if (API_BASE_OVERRIDE !== '') {
        try {
          const normalizedBase = API_BASE_OVERRIDE.endsWith('/') ? API_BASE_OVERRIDE : API_BASE_OVERRIDE + '/';
          return new URL(sanitizedPath, normalizedBase).toString();
        } catch (err) {
          console.warn('API base override inválida:', API_BASE_OVERRIDE, err);
        }
      }

      const origin = window.location.origin;
      const currentPath = window.location.pathname || '';
      const isFileProtocol = !origin || origin === 'null' || origin.startsWith('file:');
      const inCheckoutDir = currentPath.includes('/checkout/');

      if (isFileProtocol) {
        return \`\${inCheckoutDir ? '' : 'checkout/'}\${sanitizedPath}\`;
      }

      if (origin.includes('vercel.app') || origin.includes('tikt-ten.vercel.app')) {
        return \`\${origin}/api/\${sanitizedPath.replace('.php', '.js')}\`;
      }

      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        if (inCheckoutDir) {
          const basePath = currentPath.replace(/\\/[^/]*$/, '');
          return \`\${origin}\${basePath}/\${sanitizedPath}\`;
        }
        return \`\${origin}/api/\${sanitizedPath.replace('.php', '.js')}\`;
      }

      if (/^https?:\\/\\//i.test(sanitizedPath)) {
        return sanitizedPath;
      }

      if (sanitizedPath.startsWith('checkout/')) {
        return \`\${origin}/\${sanitizedPath}\`;
      }

      if (inCheckoutDir) {
        const basePath = currentPath.replace(/\\/[^/]*$/, '');
        return \`\${origin}\${basePath}/\${sanitizedPath}\`;
      }

      return \`\${origin}/api/\${sanitizedPath.replace('.php', '.js')}\`;
    }

    // Verificação automática do pagamento
    setInterval(async () => {
      try {
        const verificaUrl = buildApiUrl("verifica.js?id=${encodeURIComponent(transacao)}");
        const res = await fetch(verificaUrl);
        const data = await res.json();
        if (data.status === "pago" || data.payment_status === "paid") {
          document.getElementById("statusPagamento").innerText = "✅ Pagamento Confirmado!";
          document.getElementById("statusPagamento").style.background = "#28a745";
          mostrarNotificacao("Pagamento confirmado! Redirecionando...", "success");
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
    `;

    // Função para escapar HTML
    function escapeHtml(text) {
        if (typeof text !== 'string') return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    res.status(200).send(html);
}