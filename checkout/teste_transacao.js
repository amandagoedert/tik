// Redirecionamento para Teste Transação Node.js - Checkout compatibility layer
export default async function handler(req, res) {
    // Importar e redirecionar para o teste de transação principal
    const { default: testeTransacaoAPI } = await import('../api/teste_transacao.js');
    return testeTransacaoAPI(req, res);
}