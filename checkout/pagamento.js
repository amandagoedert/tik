// Redirecionamento para Pagamento Node.js - Checkout compatibility layer
export default async function handler(req, res) {
    // Importar e redirecionar para a interface de pagamento principal
    const { default: pagamentoAPI } = await import('../api/pagamento.js');
    return pagamentoAPI(req, res);
}