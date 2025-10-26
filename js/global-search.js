(function () {
  const forms = document.querySelectorAll('[data-search-form]');
  if (!forms.length) return;

  const normalizeTerm = (value) => (value == null ? '' : value.toString().trim());

  forms.forEach((form) => {
    const input = form.querySelector('[data-search-input]');
    if (!input) return;

    const target = form.dataset.searchTarget || 'loja/produtos.html';

    const navigate = (rawTerm) => {
      const term = normalizeTerm(rawTerm);
      if (!term) {
        input.focus();
        return;
      }
      try {
        const url = new URL(target, window.location.href);
        url.searchParams.set('q', term);
        window.location.href = url.href;
      } catch (error) {
        console.warn('Não foi possível navegar para a página de busca', error);
      }
    };

    const submitHandler = (event) => {
      event.preventDefault();
      navigate(input.value);
    };

    form.addEventListener('submit', submitHandler);

    const submitButton = form.querySelector('[data-search-submit]');
    if (submitButton) {
      submitButton.addEventListener('click', (event) => {
        event.preventDefault();
        navigate(input.value);
      });
    }

    form.addEventListener('click', (event) => {
      if (event.target === form) {
        input.focus();
      }
    });
  });
})();
