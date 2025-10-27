# 🚀 TikTok PIX API - Node.js Version

## ✅ Conversão Completa PHP → Node.js

O projeto foi **totalmente convertido** de PHP para **Node.js** para melhor compatibilidade com Vercel e deployment moderno.

## 📁 Estrutura dos Arquivos

### 🆕 **Arquivos Node.js (Novos)**
```
api/
├── api.js              # 🟢 API principal (era api.php)
├── verifica.js         # 🟢 Verificação de pagamento (era verifica.php)  
├── tribopay_config.js  # 🟢 Configurações (era tribopay_config.php)
├── tribopay_log.js     # 🟢 Sistema de logs (era tribopay_log.php)
└── webhook.js          # 🟢 Webhook TriboPay (novo)

test/
└── test-api.js         # 🧪 Testes automatizados

package.json            # 📦 Dependências Node.js
vercel.json             # ⚙️ Configuração Vercel (atualizada)
```

### 🔄 **Redirecionamentos Automáticos**
- `checkout/api.php` → `api/api.js`
- `checkout/verifica.php` → `api/verifica.js`
- `api/api.php` → `api/api.js`

## 🚀 Deploy no Vercel

### 1. **Commit e Push**
```bash
git add .
git commit -m "🔄 Convert PHP to Node.js for Vercel compatibility"
git push origin main
```

### 2. **Vercel fará deploy automático**
- ✅ Runtime: Node.js 20
- ✅ Serverless Functions
- ✅ Redirecionamentos configurados

## 🧪 Testar Localmente

### 1. **Instalar dependências**
```bash
npm install
```

### 2. **Rodar teste**
```bash
npm test
```

### 3. **Testar no navegador**
Abra: `http://localhost:8000/checkout/index.html`

## 🔧 Principais Melhorias

### ✅ **Compatibilidade**
- ✅ Vercel Serverless Functions
- ✅ Runtime Node.js 20 (mais estável)
- ✅ CORS configurado corretamente
- ✅ Logs preservados

### ✅ **Funcionalidades Mantidas**
- ✅ Integração TriboPay completa
- ✅ Validação valor mínimo R$ 5,00
- ✅ Conversão centavos/reais
- ✅ Sistema de logs detalhado
- ✅ Verificação de status
- ✅ Configurações flexíveis

### ✅ **Código Limpo**
- ✅ ES6 Modules
- ✅ Async/Await
- ✅ Error handling robusto
- ✅ Tipagem implícita

## 🌐 URLs de Produção

Após o deploy:
- **API PIX**: `https://tikt-ten.vercel.app/api/api.js`
- **Verificação**: `https://tikt-ten.vercel.app/api/verifica.js`
- **Checkout**: `https://tikt-ten.vercel.app/checkout/index.html`

## 🎯 Vantagens da Conversão

1. **🚀 Performance**: Serverless functions são mais rápidas
2. **💰 Custo**: Vercel tem melhor pricing para Node.js
3. **🔧 Manutenção**: JavaScript no front e backend
4. **📦 Deploy**: Mais simples e automático
5. **🔍 Debug**: Logs mais claros e estruturados

## ⚡ Status

- ✅ **Conversão**: 100% completa
- ✅ **Testes**: Funcionando
- ✅ **Compatibilidade**: Vercel ready
- ✅ **Funcionalidades**: Todas preservadas
- 🚀 **Pronto para deploy!**