// Redirecionamento para Teste Simples Node.js - Checkout compatibility layer
export default async function handler(req, res) {
    // Importar e redirecionar para o teste simples principal
    const { default: testAPI } = await import('../api/test.js');
    return testAPI(req, res);
}