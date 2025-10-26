<?php
/*
 |--------------------------------------------------------------------------
 | CONFIGURAÇÃO TRIBOPAY - INSTRUÇÕES
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
 */

return [
    /*
     |--------------------------------------------------------------------------
     | Token de API da TriboPay
     |--------------------------------------------------------------------------
     | Obtenha este token no painel da TriboPay em: Integrações > API
     | SUBSTITUA o valor abaixo pelo seu token real!
     */
    'api_token' => 'SEU_TOKEN_TRIBOPAY_AQUI',

    /*
     |--------------------------------------------------------------------------
     | Offer e Product Hash padrão
     |--------------------------------------------------------------------------
     | Estes hashes são gerados automaticamente quando você cadastra
     | ofertas e produtos no painel da TriboPay.
     | SUBSTITUA pelos valores reais dos seus produtos!
     */
    'default_offer_hash' => 'SEU_OFFER_HASH_AQUI',
    'default_product_hash' => 'SEU_PRODUCT_HASH_AQUI',

    /*
     |--------------------------------------------------------------------------
     | Mapeamento de Produtos
     |--------------------------------------------------------------------------
     | Mapeie cada produto do seu site para os hashes correspondentes
     | cadastrados no painel da TriboPay.
     |
     | Exemplo de como preencher:
     | 'products' => [
     |     'bare-vanilla' => [
     |         'product_hash' => 'abc123def456',
     |         'offer_hash' => 'xyz789uvw012',
     |         'title' => 'Bare Vanilla Body Lotion',
     |         'cover' => 'https://seusite.com/imagens/bare-vanilla.jpg',
     |     ],
     |     'pure-seduction' => [
     |         'product_hash' => 'ghi345jkl678',
     |         'offer_hash' => 'mno901pqr234',
     |         'title' => 'Pure Seduction Fragrance Mist',
     |         'cover' => 'https://seusite.com/imagens/pure-seduction.jpg',
     |     ],
     | ],
     */
    'products' => [
        // Adicione seus produtos aqui seguindo o exemplo acima
    ],

    /*
     |--------------------------------------------------------------------------
     | Configurações padrão
     |--------------------------------------------------------------------------
     */
    'default_operation_type' => 1,
    'default_tangible' => true,

    /*
     |--------------------------------------------------------------------------
     | URL de Postback (Webhook)
     |--------------------------------------------------------------------------
     | URL que a TriboPay irá chamar para notificar sobre mudanças no status
     | do pagamento. Deve apontar para o arquivo webhook.php
     |
     | Exemplo: https://seusite.com/checkout/webhook.php
     */
    'postback_url' => 'https://seusite.com/checkout/webhook.php',
];