// Redirecionamento para Webhook Node.js - Checkout compatibility layer
export default async function handler(req, res) {
    // Importar e redirecionar para o webhook principal
    const { default: webhookAPI } = await import('../api/webhook.js');
    return webhookAPI(req, res);
}