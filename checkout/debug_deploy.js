// Redirecionamento para Debug Deploy Node.js - Checkout compatibility layer
export default async function handler(req, res) {
    // Importar e redirecionar para o debug de deploy principal
    const { default: debugDeployAPI } = await import('../api/debug_deploy.js');
    return debugDeployAPI(req, res);
}