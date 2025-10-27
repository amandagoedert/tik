// Teste da API Node.js
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simular requisição HTTP
class MockRequest {
    constructor(method, body, query = {}) {
        this.method = method;
        this.body = body;
        this.query = query;
        this.headers = {
            'content-type': 'application/json',
            'origin': 'http://localhost:8000'
        };
    }
}

class MockResponse {
    constructor() {
        this.statusCode = 200;
        this.headers = {};
        this.data = null;
    }

    status(code) {
        this.statusCode = code;
        return this;
    }

    setHeader(key, value) {
        this.headers[key] = value;
    }

    json(data) {
        this.data = data;
        console.log('✅ Resposta:', JSON.stringify(data, null, 2));
    }

    end() {
        console.log('✅ Requisição finalizada');
    }
}

async function testarAPI() {
    console.log('🧪 Testando API Node.js...\n');

    try {
        // Importar a API
        const { default: handler } = await import('../api/api.js');

        // Dados de teste
        const dadosTeste = {
            debtor_name: "Teste Node.js",
            email: "teste@nodejs.com",
            debtor_document_number: "12345678901",
            phone: "11999999999",
            amount: 50.00,
            produtos: [{
                nome: "Produto Teste Node.js",
                preco: 50.00,
                quantidade: 1
            }],
            address_street: "Rua Teste",
            address_number: "123",
            address_neighborhood: "Centro",
            address_city: "São Paulo",
            address_state: "SP",
            address_zipcode: "01234567",
            payment_method: "pix"
        };

        // Criar mocks
        const req = new MockRequest('POST', dadosTeste);
        const res = new MockResponse();

        console.log('📤 Enviando dados:', JSON.stringify(dadosTeste, null, 2));
        console.log('\n⏳ Processando...\n');

        // Chamar a API
        await handler(req, res);

        console.log(`\n📊 Status: ${res.statusCode}`);
        
        if (res.statusCode === 201 && res.data?.success) {
            console.log('🎉 TESTE PASSOU! PIX gerado com sucesso');
            console.log(`🔗 PIX URL: ${res.data.pix_url?.substring(0, 50)}...`);
        } else {
            console.log('❌ TESTE FALHOU!');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        console.error(error.stack);
    }
}

// Executar teste
testarAPI();