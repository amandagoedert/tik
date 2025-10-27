// Redirecionamento para Teste Config Node.js - Checkout compatibility layer
export default async function handler(req, res) {
    // Importar e redirecionar para o teste de config principal
    const { default: testeConfigAPI } = await import('../api/teste_config.js');
    return testeConfigAPI(req, res);
}