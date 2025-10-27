/*
 |--------------------------------------------------------------------------
 | CONFIGURAÇÃO TRIBOPAY - INSTRUÇÕES - Node.js Version
 |--------------------------------------------------------------------------
 | 
 | Para que a integração funcione, você precisa:
 | 
 | 1. Criar uma conta na TriboPay (https://tribopay.com.br)
 | 2. Obter seu token de API no painel da TriboPay
 | 3. Cadastrar seus produtos no painel da TriboPay
 | 4. Substituir os valores abaixo pelos valores reais
 | 
 | IMPORTANTE: Os valores abaixo são EXEMPLOS e não funcionarão!
 |
 | ATENÇÃO: Copie este arquivo para tribopay_config.js e preencha com seus dados reais!
 |
 */

export default {
    /*
     |--------------------------------------------------------------------------
     | Token de API da TriboPay
     |--------------------------------------------------------------------------
     | Obtenha este token no painel da TriboPay em: Integrações > API
     | SUBSTITUA o valor abaixo pelo seu token real!
     */
    api_token: 'SEU_TOKEN_TRIBOPAY_AQUI',

    /*
     |--------------------------------------------------------------------------
     | URL da API TriboPay
     |--------------------------------------------------------------------------
     | URL base da API da TriboPay (geralmente não precisa alterar)
     */
    api_url: 'https://api.tribopay.com.br/api/public/v1/transactions',

    /*
     |--------------------------------------------------------------------------
     | Offer e Product Hash padrão
     |--------------------------------------------------------------------------
     | Estes hashes são gerados automaticamente quando você cadastra
     | ofertas e produtos no painel da TriboPay.
     | SUBSTITUA pelos valores reais dos seus produtos!
     */
    default_offer_hash: 'SEU_OFFER_HASH_AQUI',
    default_product_hash: 'SEU_PRODUCT_HASH_AQUI',

    /*
     |--------------------------------------------------------------------------
     | Mapeamento de Produtos
     |--------------------------------------------------------------------------
     | Mapeie cada produto do seu site para os hashes correspondentes
     | cadastrados no painel da TriboPay.
     |
     | Exemplo de como preencher:
     */
    products: {
        // 'bare-vanilla': {
        //     product_hash: 'abc123def456',
        //     offer_hash: 'xyz789uvw012',
        //     title: 'Bare Vanilla Body Lotion',
        //     cover: 'https://seusite.com/imagens/bare-vanilla.jpg',
        // },
        // 'pure-seduction': {
        //     product_hash: 'ghi345jkl678',
        //     offer_hash: 'mno901pqr234',
        //     title: 'Pure Seduction Fragrance Mist',
        //     cover: 'https://seusite.com/imagens/pure-seduction.jpg',
        // },
        // 'love-spell': {
        //     product_hash: 'stu567vwx890',
        //     offer_hash: 'abc123def456',
        //     title: 'Love Spell Fragrance Collection',
        //     cover: 'https://seusite.com/imagens/love-spell.jpg',
        // },
        // Adicione seus produtos aqui seguindo o exemplo acima
    },

    /*
     |--------------------------------------------------------------------------
     | Configurações padrão
     |--------------------------------------------------------------------------
     */
    default_operation_type: 1,
    default_tangible: true,

    /*
     |--------------------------------------------------------------------------
     | URL de Postback (Webhook) - Node.js/Vercel
     |--------------------------------------------------------------------------
     | URL que a TriboPay irá chamar para notificar sobre mudanças no status
     | do pagamento. Deve apontar para o endpoint webhook.js
     |
     | Para Vercel: https://seu-projeto.vercel.app/api/webhook
     | Para desenvolvimento local: http://localhost:3000/api/webhook
     */
    postback_url: 'https://tikt-ten.vercel.app/api/webhook',

    /*
     |--------------------------------------------------------------------------
     | Configurações de ambiente
     |--------------------------------------------------------------------------
     */
    environment: 'production', // 'production' ou 'development'
    debug: false, // true para logs detalhados, false para produção

    /*
     |--------------------------------------------------------------------------
     | Configurações de timeout e retry
     |--------------------------------------------------------------------------
     */
    timeout: 30000, // 30 segundos
    retry_attempts: 3,

    /*
     |--------------------------------------------------------------------------
     | Validações
     |--------------------------------------------------------------------------
     */
    validation: {
        min_amount: 5.00, // Valor mínimo em reais para PIX
        max_amount: 50000.00, // Valor máximo em reais
        required_fields: [
            'debtor_name',
            'email', 
            'debtor_document_number',
            'phone',
            'amount',
            'payment_method'
        ]
    },

    /*
     |--------------------------------------------------------------------------
     | Configurações de log
     |--------------------------------------------------------------------------
     */
    logging: {
        enabled: true,
        level: 'info', // 'debug', 'info', 'warn', 'error'
        file: 'checkout/gateway.log',
        max_size: 10 * 1024 * 1024, // 10MB
        rotate: true
    }
};

/*
 |--------------------------------------------------------------------------
 | INSTRUÇÕES DE USO
 |--------------------------------------------------------------------------
 |
 | 1. COPIE este arquivo para 'tribopay_config.js' (sem '_exemplo')
 | 
 | 2. SUBSTITUA os valores de exemplo pelos seus dados reais:
 |    - api_token: Seu token da TriboPay
 |    - default_offer_hash: Hash da sua oferta padrão
 |    - default_product_hash: Hash do seu produto padrão
 |    - postback_url: URL do seu webhook
 | 
 | 3. CONFIGURE os produtos no objeto 'products' com os hashes
 |    correspondentes do painel da TriboPay
 | 
 | 4. AJUSTE a postback_url para seu domínio real
 | 
 | 5. TESTE a configuração executando:
 |    - npm test
 |    - Acesse /api/teste_config.js no browser
 | 
 | 🚀 Depois de configurar, teste com uma transação real!
 |
 | 📚 Documentação completa: https://docs.tribopay.com.br
 | 💬 Suporte: https://tribopay.com.br/contato
 |
 */