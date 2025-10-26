import { loadProducts } from './products-data.js';

const CART_KEY = 'tiktokShopCart';

function resolveAssetPath(assetPath = '') {
  if (!assetPath) return '';
  if (/^(?:https?:|data:)/i.test(assetPath)) return assetPath;
  const normalized = assetPath.replace(/^\/+/, '');
  const pathname = window.location.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const endsWithSlash = pathname.endsWith('/');
  const depth = endsWithSlash ? segments.length : Math.max(segments.length - 1, 0);
  const prefix = depth ? '../'.repeat(depth) : '';
  return `${prefix}${normalized}`;
}

function resolveLinkPath(pagePath) {
  if (!pagePath) return '#';
  return resolveAssetPath(pagePath);
}

function setTextById(id, value) {
  const el = document.getElementById(id);
  if (el && value != null) {
    el.textContent = value;
    el.style.display = '';
  }
}

function hideIfEmpty(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!value) {
    el.style.display = 'none';
  } else {
    el.textContent = value;
    el.style.display = '';
  }
}

function percentOff(oldPrice, newPrice) {
  try {
    const toNum = (value) => parseFloat((value || '').toString().replace(/[^0-9,\.]/g, '').replace('.', '').replace(',', '.'));
    const oldNum = toNum(oldPrice);
    const newNum = toNum(newPrice);
    if (!oldNum || !newNum || oldNum <= newNum) return null;
    return `-${Math.round((1 - newNum / oldNum) * 100)}%`;
  } catch (error) {
    console.warn('Não foi possível calcular o desconto', error);
    return null;
  }
}

function clearChildren(node) {
  if (!node) return;
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function buildDescription(blocks = []) {
  const container = document.getElementById('product-description-content');
  if (!container) return;
  clearChildren(container);

  blocks.forEach((block) => {
    if (!block || !block.type) return;
    if (block.type === 'paragraph') {
      const p = document.createElement('p');
      p.textContent = block.text || '';
      p.style.marginBottom = '16px';
      container.appendChild(p);
    } else if (block.type === 'heading') {
      const h4 = document.createElement('h4');
      h4.textContent = block.text || '';
      h4.style.marginTop = '20px';
      h4.style.marginBottom = '12px';
      h4.style.fontSize = '16px';
      h4.style.fontWeight = '600';
      container.appendChild(h4);
    } else if (block.type === 'list' && Array.isArray(block.items)) {
      const ul = document.createElement('ul');
      ul.style.lineHeight = '1.6';
      ul.style.color = '#666';
      ul.style.paddingLeft = '20px';
      block.items.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
      });
      container.appendChild(ul);
    }
  });
}

function renderGallery(product) {
  const mainImage = document.getElementById('main-product-image');
  const counter = document.getElementById('image-counter');
  const dotsContainer = document.getElementById('image-dots');
  const thumbnailsContainer = document.getElementById('image-thumbnails');

  const gallery = (product.gallery && product.gallery.length ? product.gallery : [{ src: product.image, alt: product.title }])
    .map((item, index) => ({
      src: resolveAssetPath(item?.src || item),
      alt: item?.alt || `${product.title} ${index + 1}`,
    }));

  window.productGallery = gallery;
  window.currentImageIndex = 0;

  const updateMainImage = (index) => {
    const entry = gallery[index];
    if (!entry) return;
    if (mainImage) {
      mainImage.src = entry.src;
      mainImage.alt = entry.alt;
    }
    if (counter) {
      if (gallery.length > 1) {
        counter.textContent = `${index + 1}/${gallery.length}`;
        counter.style.display = 'block';
      } else {
        counter.textContent = '';
        counter.style.display = 'none';
      }
    }
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.image-dot').forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === index);
        dot.style.background = dotIndex === index ? '#ff2d55' : '#d7d7d7';
      });
    }
    if (thumbnailsContainer) {
      thumbnailsContainer.querySelectorAll('.thumbnail').forEach((thumb, thumbIndex) => {
        thumb.classList.toggle('active', thumbIndex === index);
        thumb.style.outline = thumbIndex === index ? '2px solid #ff2d55' : '2px solid transparent';
        thumb.style.opacity = thumbIndex === index ? '1' : '0.7';
      });
    }
    window.currentImageIndex = index;
  };

  if (mainImage && gallery[0]) {
    mainImage.src = gallery[0].src;
    mainImage.alt = gallery[0].alt;
  }

  clearChildren(dotsContainer);
  clearChildren(thumbnailsContainer);

  gallery.forEach((entry, index) => {
    if (dotsContainer) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'image-dot';
      dot.setAttribute('aria-label', `Ver imagem ${index + 1}`);
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.borderRadius = '50%';
      dot.style.border = 'none';
      dot.style.margin = '0 3px';
      dot.style.background = index === 0 ? '#ff2d55' : '#d7d7d7';
      dot.style.cursor = 'pointer';
      dot.style.padding = '0';
      dot.addEventListener('click', () => updateMainImage(index));
      dotsContainer.appendChild(dot);
    }

    if (thumbnailsContainer) {
      const wrapper = document.createElement('button');
      wrapper.type = 'button';
      wrapper.className = 'thumbnail';
      wrapper.style.border = 'none';
      wrapper.style.padding = '0';
      wrapper.style.marginRight = '6px';
      wrapper.style.borderRadius = '6px';
      wrapper.style.overflow = 'hidden';
      wrapper.style.cursor = 'pointer';
      wrapper.style.width = '60px';
      wrapper.style.height = '60px';
      const img = document.createElement('img');
      img.src = entry.src;
      img.alt = entry.alt;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      wrapper.appendChild(img);
      wrapper.addEventListener('click', () => updateMainImage(index));
      thumbnailsContainer.appendChild(wrapper);
    }
  });

  updateMainImage(0);
}

function renderRelated(product, productsMap) {
  const container = document.getElementById('related-products');
  if (!container) return;
  clearChildren(container);

  const ids = (Array.isArray(product.recommendations) && product.recommendations.length
    ? product.recommendations
    : Object.keys(productsMap))
    .filter((id) => id !== product.id);

  ids.slice(0, 4).forEach((id) => {
    const related = productsMap[id];
    if (!related) return;

    const card = document.createElement('a');
    card.href = resolveLinkPath(related.pagePath || `certo.html?id=${related.id}`);
    card.style.textDecoration = 'none';
    card.style.color = 'inherit';

    const wrapper = document.createElement('div');
    wrapper.style.background = 'white';
    wrapper.style.borderRadius = '8px';
    wrapper.style.overflow = 'hidden';
    wrapper.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';

    const media = document.createElement('div');
    media.style.position = 'relative';
    media.style.width = '100%';
    media.style.height = '140px';
    media.style.overflow = 'hidden';

    const img = document.createElement('img');
    const imageSrc = related.gallery?.[0]?.src || related.image;
    img.src = resolveAssetPath(imageSrc);
    img.alt = related.title || '';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    media.appendChild(img);

    const discountBadge = document.createElement('div');
    const discount = related.discount || related.discountLabel || percentOff(related.oldPrice, related.price);
    if (discount) {
      discountBadge.textContent = discount;
      discountBadge.style.position = 'absolute';
      discountBadge.style.top = '8px';
      discountBadge.style.right = '8px';
      discountBadge.style.background = '#ff2d55';
      discountBadge.style.color = 'white';
      discountBadge.style.padding = '2px 6px';
      discountBadge.style.borderRadius = '10px';
      discountBadge.style.fontSize = '10px';
      discountBadge.style.fontWeight = '600';
      media.appendChild(discountBadge);
    }

    const body = document.createElement('div');
    body.style.padding = '8px';

    const title = document.createElement('p');
    title.style.fontSize = '12px';
    title.style.marginBottom = '6px';
    title.style.lineHeight = '1.3';
    title.style.height = '32px';
    title.style.overflow = 'hidden';
    title.textContent = related.title || '';
    body.appendChild(title);

    const priceRow = document.createElement('div');
    priceRow.style.display = 'flex';
    priceRow.style.alignItems = 'center';
    priceRow.style.gap = '4px';

    if (related.price) {
      const price = document.createElement('span');
      price.style.fontSize = '14px';
      price.style.fontWeight = '600';
      price.style.color = '#ff2d55';
      price.textContent = related.price;
      priceRow.appendChild(price);
    }

    if (related.oldPrice) {
      const old = document.createElement('span');
      old.style.fontSize = '11px';
      old.style.color = '#999';
      old.style.textDecoration = 'line-through';
      old.textContent = related.oldPrice;
      priceRow.appendChild(old);
    }

    body.appendChild(priceRow);

    wrapper.appendChild(media);
    wrapper.appendChild(body);
    card.appendChild(wrapper);
    container.appendChild(card);
  });
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch (error) {
    console.warn('Falha ao ler o carrinho', error);
    return [];
  }
}

function setCart(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Falha ao salvar o carrinho', error);
  }
}

function cartItemCount() {
  return getCart().reduce((sum, item) => sum + (item.qty || item.quantity || 0), 0);
}

function updateCartBadge() {
  const total = cartItemCount();
  document.querySelectorAll('#cart-count-header').forEach((el) => {
    el.textContent = total;
  });
  return total;
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.right = '20px';
  toast.style.background = '#00d4aa';
  toast.style.color = '#fff';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '8px';
  toast.style.zIndex = '10000';
  toast.style.fontWeight = '600';
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s';
    setTimeout(() => toast.remove(), 500);
  }, 1800);
}

function addToCart(product, redirectToCart = false) {
  if (!product) return;
  const cart = getCart();
  const displayPrice = product.price;
  const priceValue = typeof product.priceValue === 'number'
    ? product.priceValue
    : (() => {
        try {
          return parseFloat((displayPrice || '').replace(/[^0-9,\.]/g, '').replace('.', '').replace(',', '.')) || 0;
        } catch {
          return 0;
        }
      })();
  const oldPriceLabel = product.oldPriceLabel || product.oldPrice || '';
  const oldPriceValue = typeof product.oldPriceValue === 'number'
    ? product.oldPriceValue
    : (() => {
        try {
          return parseFloat((oldPriceLabel || '').replace(/[^0-9,\.]/g, '').replace('.', '').replace(',', '.')) || 0;
        } catch {
          return 0;
        }
      })();

  const index = cart.findIndex((item) => item.id === product.id);
  if (index >= 0) {
    cart[index].qty = (cart[index].qty || cart[index].quantity || 1) + 1;
    cart[index].price = priceValue;
    cart[index].priceLabel = displayPrice;
    cart[index].oldPrice = oldPriceValue;
    cart[index].oldPriceLabel = oldPriceLabel;
    cart[index].title = product.title;
    cart[index].image = product.image;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: priceValue,
      priceLabel: displayPrice,
      oldPrice: oldPriceValue,
      oldPriceLabel,
      image: product.image,
      qty: 1,
    });
  }
  setCart(cart);
  updateCartBadge();
  showToast('Adicionado ao carrinho');
  if (redirectToCart) {
    setTimeout(() => {
      window.location.href = resolveAssetPath(product.buyPath || 'carrinho/');
    }, 650);
  }
}

async function initProductPage() {
  const body = document.body;
  const paramId = new URLSearchParams(window.location.search).get('id');
  const productId = body?.dataset?.productId || paramId;
  if (!productId) {
    console.warn('Nenhum produto definido para esta página');
    return;
  }

  const data = await loadProducts();
  const productsMap = data.products || {};
  const baseProduct = productsMap[productId];
  if (!baseProduct) {
    console.warn('Produto não encontrado:', productId);
    return;
  }

  const product = {
    ...baseProduct,
    gallery: baseProduct.gallery ? [...baseProduct.gallery] : baseProduct.gallery,
    recommendations: Array.isArray(baseProduct.recommendations)
      ? [...baseProduct.recommendations]
      : baseProduct.recommendations,
  };

  product.image = resolveAssetPath(product.gallery?.[0]?.src || product.image);

  if (product.title) {
    document.title = `Aura Parfum - ${product.title}`;
  }

  hideIfEmpty('price-discount', product.discount || percentOff(product.oldPrice, product.price));
  hideIfEmpty('price-current', product.price);
  hideIfEmpty('price-old', product.oldPrice);
  setTextById('product-title', product.title);
  hideIfEmpty('rating-text', product.ratingText || product.soldText);
  hideIfEmpty('store-sold', product.storeSoldText || product.soldText);
  hideIfEmpty('product-short-description', product.description);

  renderGallery(product);
  buildDescription(product.descriptionBlocks);
  renderRelated(product, productsMap);
  window.productData = product;

  const buyButton = document.getElementById('buy-now-btn');
  if (buyButton) {
    buyButton.href = resolveAssetPath(product.buyPath || 'carrinho/');
  }

  const addBtn = document.getElementById('add-to-cart-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => addToCart(product));
  }

  if (buyButton) {
    buyButton.addEventListener('click', (event) => {
      event.preventDefault();
      addToCart(product, true);
    });
  }

  updateCartBadge();
  window.updateCartCount = updateCartBadge;
  window.addToCart = () => addToCart(product);
  window.addEventListener('focus', updateCartBadge);
  window.addEventListener('pageshow', updateCartBadge);
  window.addEventListener('storage', (event) => {
    if (event.key === CART_KEY) {
      updateCartBadge();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductPage, { once: true });
} else {
  initProductPage();
}
