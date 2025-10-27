// Redirecionamento para API Node.js - Checkout compatibility layer
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default async function handler(req, res) {
    // Importar e redirecionar para a API principal
    const { default: mainAPI } = await import('../api/api.js');
    return mainAPI(req, res);
}