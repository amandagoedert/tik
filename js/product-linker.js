(function () {
  const cards = Array.from(document.querySelectorAll('.product-card'));
  if (!cards.length) return;

  const normalizeText = (value) => {
    if (value == null) return '';
    try {
      return value
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    } catch (error) {
      return value.toString().toLowerCase().trim();
    }
  };

  const extractFileName = (input) => {
    if (!input) return '';
    try {
      const url = new URL(input, window.location.href);
      const pathname = url.pathname || '';
      return pathname.split('/').pop()?.toLowerCase() || '';
    } catch (error) {
      const clean = input.split('?')[0];
      return clean.split('/').pop()?.toLowerCase() || '';
    }
  };

  const computePrefix = () => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length) segments.pop();
    return segments.length ? '../'.repeat(segments.length) : '';
  };

  const prefix = computePrefix();

  const resolveHref = (target) => {
    if (!target) return null;
    if (/^(?:https?:|data:|mailto:)/i.test(target)) return target;
    if (target.startsWith('../') || target.startsWith('./') || target.startsWith('/')) return target;
    return `${prefix}${target.replace(/^\.?\/*/, '')}`;
  };

  const ensureLink = (card, href, titleText) => {
    if (!href) return;
    const safeHref = resolveHref(href);
    if (!safeHref) return;

    const img = card.querySelector('img');
    const titleEl = card.querySelector('.title');
    const label = titleText || titleEl?.textContent?.trim() || 'Ver produto';

    if (img) {
      const existingAnchor = img.closest('a[data-product-link="image"]') || img.closest('a');
      if (existingAnchor) {
        existingAnchor.href = safeHref;
        existingAnchor.setAttribute('aria-label', label);
      } else {
        const anchor = document.createElement('a');
        anchor.href = safeHref;
        anchor.setAttribute('aria-label', label);
        anchor.style.display = 'inline-block';
        anchor.setAttribute('data-product-link', 'image');
        const parent = img.parentNode;
        if (parent) {
          parent.insertBefore(anchor, img);
          anchor.appendChild(img);
        }
      }
    }

    if (titleEl) {
      const existingLink = titleEl.querySelector('a[data-product-link="title"]') || titleEl.querySelector('a');
      if (existingLink) {
        existingLink.href = safeHref;
        if (!existingLink.textContent.trim()) {
          existingLink.textContent = label;
        }
      } else {
        const anchor = document.createElement('a');
        anchor.href = safeHref;
        anchor.textContent = label;
        anchor.style.color = 'inherit';
        anchor.style.textDecoration = 'none';
        anchor.setAttribute('data-product-link', 'title');
        anchor.setAttribute('aria-label', label);
        titleEl.textContent = '';
        titleEl.appendChild(anchor);
      }
    }

    card.setAttribute('data-product-url', safeHref);
  };

  const directHrefForCard = (card) => {
    const datasetUrl = card.getAttribute('data-product-url');
    if (datasetUrl) return datasetUrl;

    const buyLink = card.querySelector('.btn-buy[href]');
    if (buyLink) return buyLink.getAttribute('href');

    const datasetId = card.getAttribute('data-product-id') || card.dataset.productId;
    if (datasetId) {
      return `${prefix}certo.html?id=${encodeURIComponent(datasetId)}`;
    }
    return null;
  };

  const pendingCards = [];

  cards.forEach((card) => {
    const titleEl = card.querySelector('.title');
    const titleText = titleEl?.textContent?.trim() || '';
    const directHref = directHrefForCard(card);
    if (directHref) {
      ensureLink(card, directHref, titleText);
    } else {
      pendingCards.push(card);
    }
  });

  if (!pendingCards.length) return;

  const buildDataPath = () => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length) segments.pop();
    const prefixPath = segments.length ? '../'.repeat(segments.length) : '';
    return `${prefixPath}data/products.json`;
  };

  const dataPath = buildDataPath();

  fetch(dataPath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then((json) => {
      const products = Array.isArray(json?.products) ? json.products : [];
      if (!products.length) return;

      const productById = new Map();
      const productByImage = new Map();
      const productByTitle = new Map();

      const registerImage = (image, product) => {
        const name = extractFileName(image);
        if (name) productByImage.set(name, product);
      };

      products.forEach((product) => {
        if (!product?.id) return;
        productById.set(product.id, product);
        if (product.image) registerImage(product.image, product);
        if (Array.isArray(product.gallery)) {
          product.gallery.forEach((entry) => {
            if (typeof entry === 'string') {
              registerImage(entry, product);
            } else if (entry && typeof entry === 'object') {
              registerImage(entry.src || entry.url, product);
            }
          });
        }

        const normalizedTitle = normalizeText(product.title);
        if (normalizedTitle) productByTitle.set(normalizedTitle, product);
      });

      const buildHrefFromProduct = (product) => {
        if (!product) return null;
        if (product.pagePath) return product.pagePath;
        return `certo.html?id=${encodeURIComponent(product.id)}`;
      };

      pendingCards.forEach((card) => {
        if (card.getAttribute('data-product-url')) return;

        const titleEl = card.querySelector('.title');
        const titleText = titleEl?.textContent?.trim() || '';
        const img = card.querySelector('img');
        const datasetId = card.getAttribute('data-product-id') || card.dataset.productId;

        let product = datasetId ? productById.get(datasetId) : null;
        if (!product && img) {
          product = productByImage.get(extractFileName(img.getAttribute('src')));
        }
        if (!product && titleText) {
          product = productByTitle.get(normalizeText(titleText));
        }

        const href = buildHrefFromProduct(product);
        if (!href) return;

        if (product && !card.getAttribute('data-product-id')) {
          card.setAttribute('data-product-id', product.id);
        }

        ensureLink(card, href, titleText);
      });
    })
    .catch((error) => {
      console.warn('Não foi possível carregar dados de produtos para os links', error);
    });
})();
