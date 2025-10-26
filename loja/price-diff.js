// Atualiza discount-badge com a porcentagem de desconto entre preço antigo e novo
(function () {
  function parseBRLToNumber(str) {
    if (!str) return NaN;
    // Remove R$, espaços e pontos de milhar; troca vírgula por ponto
    return Number(String(str).replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.'));
  }

  function applyRedBadges(container, label, pct, aria) {
    const redBadges = container.querySelectorAll('.badge-red[data-auto-discount]');
    let updated = false;
    redBadges.forEach((badge) => {
      let prefix = badge.dataset.prefix;
      if (prefix === undefined) {
        const base = badge.textContent.replace(/\s*\d.*$/, '').trim();
        prefix = base;
        badge.dataset.prefix = prefix;
      }
      const prefixPart = prefix ? prefix.replace(/\s+$/, '') + ' ' : '';
      badge.textContent = prefixPart + label;
      badge.hidden = false;
      badge.removeAttribute('hidden');
      badge.dataset.discountValue = String(pct);
      if (aria) {
        badge.setAttribute('aria-label', aria);
      } else {
        badge.removeAttribute('aria-label');
      }
      updated = true;
    });
    return updated;
  }

  function clearDiscountBadges(container) {
    const redBadges = container.querySelectorAll('.badge-red[data-auto-discount]');
    redBadges.forEach((badge) => {
      badge.textContent = '';
      badge.hidden = true;
      badge.removeAttribute('aria-label');
      delete badge.dataset.discountValue;
    });

    const badge = container.querySelector('.discount-badge');
    if (badge) {
      badge.textContent = '';
      badge.hidden = true;
      badge.removeAttribute('aria-label');
    }
  }

  function updateBadges(root = document) {
    const rows = root.querySelectorAll('.price-row');
    rows.forEach((row) => {
      const currentEl = row.querySelector('.price-current');
      const oldEl = row.querySelector('.price-old');
      const container = row.closest('.product-card, .rec-card, .card, article, a, div') || row.parentElement || document;

      if (!currentEl || !oldEl) {
        clearDiscountBadges(container);
        return;
      }

      const current = parseBRLToNumber(currentEl.textContent);
      const old = parseBRLToNumber(oldEl.textContent);
      if (!isFinite(current) || !isFinite(old)) {
        clearDiscountBadges(container);
        return;
      }

      const diff = old - current;
      if (diff <= 0 || old <= 0) {
        clearDiscountBadges(container);
        return;
      }
      const pct = Math.round((diff / old) * 100);
      if (!isFinite(pct) || pct <= 0) {
        clearDiscountBadges(container);
        return;
      }

      const label = pct + '% OFF';
      const aria = 'Desconto de ' + pct + '%';
      let updated = applyRedBadges(container, label, pct, aria);

      // Preferir .discount-badge; criar automaticamente se não existir
      let badge = container.querySelector('.discount-badge');
      if (!badge && !updated) {
        badge = document.createElement('span');
        badge.className = 'discount-badge';
        // Inserir no container de badges, se existir; caso contrário, após a linha de preço
        const badgesContainer = container.querySelector('.badges');
        if (badgesContainer) {
          badgesContainer.insertBefore(badge, badgesContainer.firstChild);
        } else {
          row.insertAdjacentElement('afterend', badge);
        }
      }

      if (badge) {
        badge.textContent = label;
        badge.hidden = false;
        badge.removeAttribute('hidden');
        badge.setAttribute('aria-label', aria);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => updateBadges());
  } else {
    updateBadges();
  }
})();
