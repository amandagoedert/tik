# Manual de Configuração TriboPay

## ❌ Problema Identificado

A integração com TriboPay já está implementada, mas **não está funcionando** porque as configurações estão com valores de exemplo/placeholder.

## ✅ Solução Completa

### Passo 1: Configurar Credenciais

1. **Copie o arquivo de exemplo:**
   ```bash
   cp tribopay_config_exemplo.php tribopay_config.php
   ```

2. **Abra o arquivo `tribopay_config.php` e substitua:**
   - `'SEU_TOKEN_TRIBOPAY_AQUI'` → Seu token real da TriboPay
   - `'SEU_OFFER_HASH_AQUI'` → Hash da sua oferta na TriboPay  
   - `'SEU_PRODUCT_HASH_AQUI'` → Hash do seu produto na TriboPay

### Passo 2: Obter Credenciais na TriboPay

1. **Acesse:** https://tribopay.com.br
2. **Faça login** no painel administrativo
3. **Vá em:** Integrações → API
4. **Copie seu Token de API**
5. **Vá em:** Produtos → [Seu Produto]
6. **Copie o Product Hash**
7. **Vá em:** Ofertas → [Sua Oferta] 
8. **Copie o Offer Hash**

### Passo 3: Testar Configuração

1. **Acesse:** `https://seusite.com/checkout/teste_config.php`
2. **Verifique** se todos os itens estão ✅
3. **Corrija** qualquer item com ❌

### Passo 4: Configurar Webhook (Opcional)

No arquivo `tribopay_config.php`, altere:
```php
'postback_url' => 'https://seusite.com/checkout/webhook.php',
```

### Passo 5: Testar Transação

1. **Adicione produtos** no carrinho
2. **Vá para checkout**
3. **Preencha os dados**
4. **Finalize a compra**
5. **Verifique** se o PIX é gerado

### Passo 6: Executar o checkout localmente

Quando rodar o projeto em ambiente local, certifique-se de que o backend PHP esteja ativo e acessível pelo navegador:

1. **Suba um servidor PHP** apontando para a pasta `checkout`:
   ```bash
   php -S 127.0.0.1:8000 -t checkout
   ```
2. **Ajuste o front-end** caso o checkout esteja sendo aberto em outra origem (ex.: `127.0.0.1:5500`).  
   Defina a variável global antes de carregar o script do checkout:
   ```html
   <script>
     window.CHECKOUT_API_BASE_URL = "http://127.0.0.1:8000/checkout/";
   </script>
   ```
   ou adicione no `<body>`:
   ```html
   <body data-api-base="http://127.0.0.1:8000/checkout/">
   ```
   Assim as chamadas à API serão enviadas para o servidor PHP correto. Se estiver hospedado em produção, a variável não precisa ser definida.

## 🔧 Arquivos da Integração

- **api.php** → Cria transações na TriboPay
- **tribopay_config.php** → Configurações e credenciais
- **webhook.php** → Recebe notificações de pagamento
- **verifica.php** → Consulta status de pagamento
- **pagamento.php** → Exibe PIX para o cliente
- **teste_config.php** → Testa se está configurado

## 🚨 Erros Comuns

### "Token da API não configurado"
- **Causa:** Arquivo tribopay_config.php com valores de exemplo
- **Solução:** Substituir por credenciais reais

### "Erro na API (HTTP 401)"
- **Causa:** Token inválido ou expirado
- **Solução:** Gerar novo token no painel TriboPay

### "Product Hash não configurado"
- **Causa:** Hash do produto não preenchido
- **Solução:** Cadastrar produto na TriboPay e copiar hash

### "QR Code não disponível"
- **Causa:** API não retornou dados do PIX
- **Solução:** Verificar logs em tribopay_log.php (gateway.log)

## 📋 Checklist Final

- [ ] Token da API configurado
- [ ] Offer Hash configurado  
- [ ] Product Hash configurado
- [ ] Teste de configuração OK
- [ ] Transação de teste funcionando
- [ ] Webhook configurado (opcional)

## 🆘 Suporte

Se ainda não funcionar:

1. **Verifique os logs** em `tribopay_log.php` (arquivo `gateway.log`)
2. **Execute** `teste_config.php` novamente
3. **Consulte** a documentação TriboPay
4. **Contate** o suporte da TriboPay

---

**Status Atual:** ❌ Configuração incompleta  
**Depois de seguir os passos:** ✅ Integração funcionando
