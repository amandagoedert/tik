<?php
return [
    /*
     |--------------------------------------------------------------------------
     | Credenciais TriboPay
     |--------------------------------------------------------------------------
     | Token configurado com credencial real
     */
    'api_token' => 'PEllrmnJPwmxEcghOgzi0RIFVO9JqcBlMBpYrCBtyFEKjPqPVzr9uPL4Ld9e',

    /*
     |--------------------------------------------------------------------------
     | Offer padrão (utilizado quando não for informado por produto)
     |--------------------------------------------------------------------------
     */
    'default_offer_hash' => 'nhexditsut',
    'default_product_hash' => '5wgdgr5njb',

    /*
     |--------------------------------------------------------------------------
     | Configurações de itens do carrinho
     |--------------------------------------------------------------------------
     | Mapeie cada produto do site para os respectivos hashes cadastrados na
     | TriboPay. Utilize o ID interno do produto (ex: products.json) como chave.
     |
     | 'products' => [
     |     'id-do-produto' => [
     |         'product_hash'    => 'hash_unico_do_produto',
     |         'offer_hash'      => 'hash_oferta_opcional', // sobrescreve a padrão
     |         'title'           => 'Nome exibido no checkout',
     |         'cover'           => 'https://url-da-imagem',
     |         'operation_type'  => 1,
     |         'tangible'        => true,
     |     ],
     | ],
     */
    'products' => [],

    'default_operation_type' => 1,
    'default_tangible' => true,

    /*
     |--------------------------------------------------------------------------
     | URL de postback
     |--------------------------------------------------------------------------
     */
    'postback_url' => 'https://cryptopaybrazil.netlify.app/checkout/webhook.php',
];
