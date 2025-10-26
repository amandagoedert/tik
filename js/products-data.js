const productsUrl = new URL('../data/products.json', import.meta.url);
let cachePromise = null;

async function loadProducts() {
  if (!cachePromise) {
    cachePromise = fetch(productsUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Falha ao carregar products.json: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        const list = Array.isArray(json?.products) ? json.products : [];
        const productMap = {};
        for (const entry of list) {
          if (!entry || !entry.id) continue;
          productMap[entry.id] = entry;
        }
        return {
          raw: json,
          products: productMap,
        };
      })
      .catch((error) => {
        console.error('Erro carregando dados dos produtos', error);
        return { raw: { products: [] }, products: {} };
      });
  }
  return cachePromise;
}

async function getProduct(id) {
  const data = await loadProducts();
  return data.products[id] || null;
}

async function getProductsByCollection(collectionName) {
  const data = await loadProducts();
  const list = [];
  for (const product of Object.values(data.products)) {
    if (Array.isArray(product.collections) && product.collections.includes(collectionName)) {
      list.push(product);
    }
  }
  return list;
}

async function getAllProducts() {
  const data = await loadProducts();
  return Object.values(data.products);
}

export { loadProducts, getProduct, getProductsByCollection, getAllProducts };

// Exponha também via window para scripts não-modulares, se necessário.
if (!window.ProductsData) {
  window.ProductsData = {
    loadProducts,
    getProduct,
    getProductsByCollection,
    getAllProducts,
  };
}
