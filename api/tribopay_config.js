// Configuração TriboPay - Node.js version
export default {
    // Credenciais TriboPay
    api_token: 'PEllrmnJPwmxEcghOgzi0RIFVO9JqcBlMBpYrCBtyFEKjPqPVzr9uPL4Ld9e',

    // Offer padrão (utilizado quando não for informado por produto)
    default_offer_hash: 'nhexditsut',
    default_product_hash: '5wgdgr5njb',

    // Configurações de itens do carrinho
    products: {},

    default_operation_type: 1,
    default_tangible: true,

    // URL de postback
    postback_url: 'https://tikt-ten.vercel.app/api/webhook'
};