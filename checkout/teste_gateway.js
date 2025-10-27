// Redirecionamento para Teste Gateway Node.js - Checkout compatibility layer
export default async function handler(req, res) {
    // Importar e redirecionar para o teste de gateway principal
    const { default: testeGatewayAPI } = await import('../api/teste_gateway.js');
    return testeGatewayAPI(req, res);
}