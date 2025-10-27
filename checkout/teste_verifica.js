// Redirecionamento para Teste Verifica Node.js - Checkout compatibility layer
export default async function handler(req, res) {
    // Importar e redirecionar para o teste de verificação principal
    const { default: testeVerificaAPI } = await import('../api/teste_verifica.js');
    return testeVerificaAPI(req, res);
}