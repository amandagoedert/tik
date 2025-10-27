// Redirecionamento para a API principal - Node.js version
// Este arquivo redireciona para o api.js principal

export default async function handler(req, res) {
    // Redirecionar para a API principal
    const { default: mainAPI } = await import('./api.js');
    return mainAPI(req, res);
}