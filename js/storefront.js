import { loadProducts } from './products-data.js';

function resolveAssetPath(assetPath) {
  if (!assetPath) return '';
  if (/^(?:https?:|data:)/i.test(assetPath)) {
    return assetPath;
  }
  const cleaned = assetPath.replace(/^\.\//, '');
  const segments = window.location.pathname.split('/').filter(Boolean);
  const depth = Math.max(segments.length - 1, 0);
  const prefix = depth > 0 ? '../'.repeat(depth) : '';
  return `${prefix}${cleaned}`;
}

function buildProductUrl(productId) {
  const params = new URLSearchParams({ id: productId });
  const segments = window.location.pathname.split('/').filter(Boolean);
  const depth = Math.max(segments.length - 1, 0);
  const prefix = depth > 0 ? '../'.repeat(depth) : '';
  return `${prefix}certo.html?${params.toString()}`;
}

function getRankClass(rank) {
  if (rank === 1) return 'rank-gold';
  if (rank === 2) return 'rank-silver';
  if (rank === 3) return 'rank-bronze';
  return '';
}

function featuredCardTemplate(product, index) {
  const rank = product.featuredRank || index + 1;
  const rankClass = getRankClass(rank);
  const image = resolveAssetPath(product.image);
  const url = buildProductUrl(product.id);
  return `
    <a href="${url}" class="relative w-full rounded-xl border border-gray-200 bg-white p-3">
      <span class="badge-rank ${rankClass}">${rank}</span>
      <div class="product-media rounded-md overflow-hidden flex items-center justify-center">
        <img src="${image}" alt="${product.title}" style="max-width:100%; max-height:100%; object-fit:contain;" loading="lazy" decoding="async" />
      </div>
      <p class="product-title">${product.title}</p>
      <div class="price-row">
        <span class="price-current">${product.price || ''}</span>
        ${product.oldPrice ? `<span class="price-old">${product.oldPrice}</span>` : ''}
      </div>
      ${product.soldText ? `<span class="sold-count">${product.soldText}</span>` : ''}
    </a>`;
}

function badgeTemplate(label) {
  if (!label) return '';
  const normalized = label.toLowerCase();
  if (normalized.includes('frete')) {
    return `<span class="badge-teal">${label}</span>`;
  }
  if (normalized.includes('off')) {
    return `<span class="badge-red">${label}</span>`;
  }
  return `<span class="badge-blue">${label}</span>`;
}

function recommendedCardTemplate(product) {
  const image = resolveAssetPath(product.image);
  const url = buildProductUrl(product.id);
  const badges = Array.isArray(product.badges) ? product.badges.map(badgeTemplate).join('') : '';
  return `
    <a href="${url}" class="rec-card w-full rounded-xl border border-gray-200 bg-white p-3">
      <div class="recom-media img-config-container w-full rounded-md overflow-hidden flex items-center justify-center">
        <img src="${image}" alt="${product.title}" class="recom-img img-config" loading="lazy" decoding="async" />
      </div>
      <p class="title">${product.title}</p>
      <div class="price-row">
        <span class="price-current">${product.price || ''}</span>
        ${product.oldPrice ? `<span class="price-old">${product.oldPrice}</span>` : ''}
      </div>
      ${badges ? `<div class="badges">${badges}</div>` : ''}
      ${product.soldText ? `<span class="sold">${product.soldText}</span>` : ''}
    </a>`;
}

async function renderFeatured(containerSelector) {
  const container = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;
  if (!container) return;
  const data = await loadProducts();
  const products = Object.values(data.products || {})
    .filter((product) => Array.isArray(product.collections) && product.collections.includes('featured'))
    .sort((a, b) => (a.featuredRank || 99) - (b.featuredRank || 99));

  if (!products.length) {
    container.innerHTML = '<p class="text-sm text-gray-500">Nenhum produto em destaque no momento.</p>';
    return;
  }

  container.innerHTML = products.slice(0, 3).map(featuredCardTemplate).join('');
}

async function renderRecommended(containerSelector, limit = 4) {
  const container = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;
  if (!container) return;
  const data = await loadProducts();
  const products = Object.values(data.products || {})
    .filter((product) => Array.isArray(product.collections) && product.collections.includes('recommended'));

  if (!products.length) {
    container.innerHTML = '<p class="text-sm text-gray-500">Nenhuma recomendação disponível.</p>';
    return;
  }

  container.innerHTML = products.slice(0, limit).map(recommendedCardTemplate).join('');
}

export { renderFeatured, renderRecommended };
