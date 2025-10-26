// JavaScript para funcionalidades do TikTok Shop

document.addEventListener("DOMContentLoaded", function () {
  // Funcionalidade do countdown da oferta relâmpago
  function updateCountdown() {
    const countdownElement = document.querySelector(".countdown");
    if (!countdownElement) return;

    let timeLeft = {
      hours: 0,
      minutes: 5,
      seconds: 0,
    };

    setInterval(() => {
      timeLeft.seconds--;

      if (timeLeft.seconds < 0) {
        timeLeft.seconds = 59;
        timeLeft.minutes--;

        if (timeLeft.minutes < 0) {
          timeLeft.minutes = 59;
          timeLeft.hours--;

          if (timeLeft.hours < 0) {
            timeLeft = { hours: 0, minutes: 0, seconds: 0 };
          }
        }
      }

      const formattedTime = `${String(timeLeft.hours).padStart(
        2,
        "0"
      )}:${String(timeLeft.minutes).padStart(2, "0")}:${String(
        timeLeft.seconds
      ).padStart(2, "0")}`;
      countdownElement.textContent = `Termina em ${formattedTime}`;
    }, 1000);
  }

  // Funcionalidade das abas
  window.showTab = function (tabName) {
    // Remove active class from all tabs and content sections
    document
      .querySelectorAll(".tab")
      .forEach((tab) => tab.classList.remove("active"));
    document
      .querySelectorAll(".content-section")
      .forEach((section) => section.classList.remove("active"));

    // Add active class to clicked tab
    event.target.classList.add("active");

    // Show corresponding content section
    document.getElementById(tabName).classList.add("active");

    // Scroll to top of content
    document.querySelector(".tabs").scrollIntoView({ behavior: "smooth" });
  };

  // Funcionalidade de seleção de opções do produto
  function initProductOptions() {
    const optionItems = document.querySelectorAll(".option-item");

    optionItems.forEach((item) => {
      item.addEventListener("click", function () {
        // Verificar se a opção não está esgotada
        if (this.classList.contains("sold-out")) {
          showNotification("Este item está esgotado!");
          return;
        }

        // Remove selected class from all options
        optionItems.forEach((option) => option.classList.remove("selected"));

        // Add selected class to clicked option
        this.classList.add("selected");

        // Update price based on selection (simulação)
        updatePriceBasedOnSelection(this);
      });
    });
  }

  // Atualizar preço baseado na seleção
  function updatePriceBasedOnSelection(selectedOption) {
    const priceElement = document.querySelector(".price-main");
    const optionText = selectedOption.querySelector("img").alt;

    // Simulação de preços diferentes para cada opção
    const prices = {
      "262 cores": "R$ 33,59",
      "24 cores": "R$ 33,59 - 45,99",
      "36 cores": "R$ 45,59 - 65,99",
      "48 cores": "R$ 55,59 - 78,99",
      "60 cores": "R$ 67,59 - 89,99",
      "80 cores": "R$ 78,59 - 101,99",
    };

    if (prices[optionText]) {
      priceElement.innerHTML = `<span style="text-decoration: line-through; color: #ffccaa; font-size: 24px; margin-right: 8px;">R$ 179,83</span>${prices[optionText]}`;
    }
  }

  // Funcionalidade do rodapé expansível
  function initFooterSections() {
    const footerHeaders = document.querySelectorAll(".footer-header");

    footerHeaders.forEach((header) => {
      header.addEventListener("click", function () {
        const chevron = this.querySelector(".chevron");

        // Rotacionar a seta
        if (chevron.textContent === "⌄") {
          chevron.textContent = "⌃";
          chevron.style.transform = "rotate(180deg)";
        } else {
          chevron.textContent = "⌄";
          chevron.style.transform = "rotate(0deg)";
        }

        // Adicionar feedback visual
        this.style.backgroundColor = "#f8f9fa";
        setTimeout(() => {
          this.style.backgroundColor = "";
        }, 200);
      });
    });
  }

  // Sistema de notificações

  // Funcionalidade dos botões principais
  
    // Botão "Comprar Agora" agora é um link direto, sem JavaScript
  }

  // Animação de carregamento das imagens
  function initImageLoading() {
    const images = document.querySelectorAll("img");

    images.forEach((img) => {
      img.addEventListener("load", function () {
        this.style.opacity = "0";
        this.style.transition = "opacity 0.3s ease-in-out";
        setTimeout(() => {
          this.style.opacity = "1";
        }, 50);
      });
    });
  }

  // Funcionalidade de scroll infinito para reviews (simulação)
  function initInfiniteScroll() {
    let loading = false;

    window.addEventListener("scroll", () => {
      if (loading) return;

      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;

      if (scrollTop + clientHeight >= scrollHeight - 1000) {
        loading = true;

        // Simular carregamento de mais reviews
        setTimeout(() => {
          // addMoreReviews(); // Função que seria implementada
          loading = false;
        }, 1000);
      }
    });
  }

  // Zoom de imagem desabilitado - apenas navegação por swipe
  function initImageZoom() {
    // Funcionalidade de zoom removida para melhor UX mobile
    // As imagens agora só permitem navegação lateral
  }

  // Gestos de swipe para navegação das abas (mobile)
  function initSwipeGestures() {
    let startX = 0;
    let currentTab = 0;
    const tabs = ["overview", "reviews", "description", "recommendations"];

    // Gestos de swipe comentados para evitar conflitos
    // document.addEventListener('touchstart', (e) => {
    //     startX = e.touches[0].clientX;
    // });

    // document.addEventListener('touchend', (e) => {
    //     const endX = e.changedTouches[0].clientX;
    //     const diffX = startX - endX;

    //     // Swipe left (próxima aba)
    //     if (diffX > 50 && currentTab < tabs.length - 1) {
    //         currentTab++;
    //         showTabByIndex(currentTab);
    //     }
    //     // Swipe right (aba anterior)
    //     else if (diffX < -50 && currentTab > 0) {
    //         currentTab--;
    //         showTabByIndex(currentTab);
    //     }
    // });

    function showTabByIndex(index) {
      const tabElements = document.querySelectorAll(".tab");
      const tabElement = tabElements[index];

      // Simular click na aba
      tabElement.click();
    }
  }

  // Cálculo de data de envio baseado na data atual
  function calculateShippingDates() {
    const today = new Date();

    // Adicionar 3-4 dias para envio (3 a 4 dias úteis)
    const minDeliveryDate = new Date(today);
    const maxDeliveryDate = new Date(today);

    minDeliveryDate.setDate(today.getDate() + 3);
    maxDeliveryDate.setDate(today.getDate() + 4);

    // Pular fins de semana se necessário
    while (minDeliveryDate.getDay() === 0 || minDeliveryDate.getDay() === 6) {
      minDeliveryDate.setDate(minDeliveryDate.getDate() + 1);
    }

    while (maxDeliveryDate.getDay() === 0 || maxDeliveryDate.getDay() === 6) {
      maxDeliveryDate.setDate(maxDeliveryDate.getDate() + 1);
    }

    // Formatação das datas em português
    const months = [
      "jan",
      "fev",
      "mar",
      "abr",
      "mai",
      "jun",
      "jul",
      "ago",
      "set",
      "out",
      "nov",
      "dez",
    ];

    const formatDate = (date) => {
      const day = date.getDate();
      const month = months[date.getMonth()];
      return `${day} de ${month}`;
    };

    const minDateStr = formatDate(minDeliveryDate);
    const maxDateStr = formatDate(maxDeliveryDate);

    return `Receba até ${minDateStr} - ${maxDateStr}`;
  }

  
// Função para data de entrega dinâmica (5 dias úteis após a data atual)
function updateShippingDate() {
    console.log('Função updateShippingDate executada!');
    
    const shippingDateElement = document.getElementById('shipping-date');
    if (!shippingDateElement) {
        console.error('Elemento shipping-date não encontrado!');
        return;
    }
    
    const today = new Date();
    
    // Adicionar 5 dias úteis (pulando finais de semana)
    let deliveryDate = new Date(today);
    let daysAdded = 0;
    
    while (daysAdded < 5) {
        deliveryDate.setDate(deliveryDate.getDate() + 1);
        // Se não é sábado (6) nem domingo (0), conta como dia útil
        if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
            daysAdded++;
        }
    }
    
    // Formatar a data em português
    const months = [
        'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
        'jul', 'ago', 'set', 'out', 'nov', 'dez'
    ];
    
    const day = deliveryDate.getDate();
    const month = months[deliveryDate.getMonth()];
    
    shippingDateElement.textContent = `Receba até ${day} de ${month}`;
}

// Atualiza a data quando a página carregar
document.addEventListener('DOMContentLoaded', updateShippingDate);

  // Adicionar animações CSS dinamicamente
  function addAnimationStyles() {
    const style = document.createElement("style");
    style.textContent = `
            @keyframes slideDown {
                from { transform: translate(-50%, -20px); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translate(-50%, 0); opacity: 1; }
                to { transform: translate(-50%, -20px); opacity: 0; }
            }
            
            @keyframes buttonPress {
                0% { transform: scale(1); }
                50% { transform: scale(0.95); }
                100% { transform: scale(1); }
            }
            
            .button-pressed {
                animation: buttonPress 0.2s ease-out;
            }
        `;
    document.head.appendChild(style);
  }

  // Sistema de navegação de imagens
  let currentImageIndex = 0;
  const imageExtensions = ["png", "jpg", "jpeg", "webp"];

  // Lista de imagens disponíveis
  const productImages = [
    "./images/body2.png",
  ];
  const hasMultipleImages = productImages.length > 1;

  function changeImage(direction) {
    const mainImage = document.getElementById("main-product-image");
    const imageCounter = document.getElementById("image-counter");
    const prevBtn = document.getElementById("prev-image");
    const nextBtn = document.getElementById("next-image");
    const loadingIndicator = document.getElementById("image-loading");

    if (!hasMultipleImages) {
      if (imageCounter) {
        imageCounter.textContent = "";
        imageCounter.style.display = "none";
      }
      return;
    }

    // Adicionar animação de transição
    mainImage.style.transition = "transform 0.5s ease, opacity 0.5s ease";
    mainImage.style.opacity = "0.3";
    mainImage.style.transform = `translateX(${direction * 50}px)`;

    // Atualizar índice após um pequeno delay para a animação
    setTimeout(() => {
        currentImageIndex += direction;

        // Controlar limites
        if (currentImageIndex < 0) {
            currentImageIndex = productImages.length - 1;
        } else if (currentImageIndex >= productImages.length) {
            currentImageIndex = 0;
        }

        // Atualizar imagem principal com indicador de carregamento
        mainImage.style.opacity = "0";
        loadingIndicator.classList.add("show");

        // Criar uma nova imagem para verificar se carregou
        const newImg = new Image();
        newImg.onload = () => {
            mainImage.src = productImages[currentImageIndex];
            
            // Pequeno delay para garantir que a imagem foi carregada
            setTimeout(() => {
                mainImage.style.opacity = "1";
                mainImage.style.transform = "translateX(0)";
                loadingIndicator.classList.remove("show");
                
                // Remover a transição após a animação
                setTimeout(() => {
                    mainImage.style.transition = "";
                }, 500);
            }, 50);
        };
        newImg.onerror = () => {
            // Fallback se a imagem não carregar
            mainImage.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f8f9fa'/%3E%3Ctext x='200' y='200' text-anchor='middle' font-family='Arial' font-size='16' fill='%23999'%3EImagem ${currentImageIndex + 1} não encontrada%3C/text%3E%3C/svg%3E`;
            mainImage.style.opacity = "1";
            mainImage.style.transform = "translateX(0)";
            loadingIndicator.classList.remove("show");
        };
        newImg.src = productImages[currentImageIndex];

        if (imageCounter) {
          imageCounter.textContent = hasMultipleImages ? `${currentImageIndex + 1}/${productImages.length}` : "";
          imageCounter.style.display = hasMultipleImages ? "block" : "none";
        }

        // Atualizar thumbnails ativas
        updateActiveThumbnail();

        // Navegação circular - botões sempre habilitados
        prevBtn.classList.remove("disabled");
        nextBtn.classList.remove("disabled");
    }, 300); // Delay para a animação de saída
}

  function goToImage(index) {
    if (!hasMultipleImages) {
      return;
    }

    const mainImage = document.getElementById("main-product-image");
    const imageCounter = document.getElementById("image-counter");
    const loadingIndicator = document.getElementById("image-loading");

    currentImageIndex = index;

    // Atualizar imagem principal com indicador de carregamento
    mainImage.style.opacity = "0";
    loadingIndicator.classList.add("show");

    // Criar uma nova imagem para verificar se carregou
    const newImg = new Image();
    newImg.onload = () => {
      mainImage.src = productImages[currentImageIndex];
      mainImage.style.opacity = "1";
      loadingIndicator.classList.remove("show");
    };
    newImg.onerror = () => {
      // Fallback se a imagem não carregar
      mainImage.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f8f9fa'/%3E%3Ctext x='200' y='200' text-anchor='middle' font-family='Arial' font-size='16' fill='%23999'%3EImagem ${
        currentImageIndex + 1
      } não encontrada%3C/text%3E%3C/svg%3E`;
      mainImage.style.opacity = "1";
      loadingIndicator.classList.remove("show");
    };
    newImg.src = productImages[currentImageIndex];

    // Atualizar contador
    imageCounter.textContent = hasMultipleImages ? `${currentImageIndex + 1}/${productImages.length}` : "";
    imageCounter.style.display = hasMultipleImages ? "block" : "none";

    // Atualizar thumbnails ativas
    updateActiveThumbnail();
  }

  function updateActiveThumbnail() {
    if (!hasMultipleImages) {
      return;
    }

    const thumbnails = document.querySelectorAll(".thumbnail");
    const dots = document.querySelectorAll(".dot");

    thumbnails.forEach((thumb, index) => {
      thumb.classList.toggle("active", index === currentImageIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentImageIndex);
    });
  }

  function initImageGallery() {
    const thumbnailsContainer = document.getElementById("image-thumbnails");
    const dotsContainer = document.getElementById("image-dots");
    const mainImage = document.getElementById("main-product-image");
    const leftIndicator = document.querySelector('.swipe-indicator.left');
    const rightIndicator = document.querySelector('.swipe-indicator.right');
    const imageCounter = document.getElementById("image-counter");

    if (!hasMultipleImages) {
      if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = "";
        thumbnailsContainer.style.display = "none";
      }
      if (dotsContainer) {
        dotsContainer.innerHTML = "";
        dotsContainer.style.display = "none";
      }
      if (leftIndicator) {
        leftIndicator.style.display = "none";
      }
      if (rightIndicator) {
        rightIndicator.style.display = "none";
      }
      if (imageCounter) {
        imageCounter.textContent = "";
        imageCounter.style.display = "none";
      }
      return;
    }

    // Pré-carregar todas as imagens
    productImages.forEach((imageSrc) => {
        const preloadImg = new Image();
        preloadImg.src = imageSrc;
    });

    // Criar pontos indicadores
    productImages.forEach((imageSrc, index) => {
        const dot = document.createElement("div");
        dot.className = `dot ${index === 0 ? "active" : ""}`;
        dot.onclick = () => goToImage(index);
        dotsContainer.appendChild(dot);
    });

    // Configurar navegação por teclado
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
            changeImage(-1);
        } else if (e.key === "ArrowRight") {
            changeImage(1);
        }
    });

    // Configurar swipe para mobile com animação
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const imageContainer = document.querySelector(".image-container");

    imageContainer.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        currentX = startX;
        isDragging = true;
        mainImage.classList.add("image-dragging");
    });

    imageContainer.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        
        currentX = e.touches[0].clientX;
        const diffX = currentX - startX;
        
        // Mostrar seta indicadora
        if (diffX > 30) {
            leftIndicator.classList.add("visible");
            rightIndicator.classList.remove("visible");
        } else if (diffX < -30) {
            rightIndicator.classList.add("visible");
            leftIndicator.classList.remove("visible");
        } else {
            leftIndicator.classList.remove("visible");
            rightIndicator.classList.remove("visible");
        }
        
        // Mover ligeiramente a imagem durante o arrasto
        mainImage.style.transform = `translateX(${diffX * 0.3}px)`;
    });

    imageContainer.addEventListener("touchend", (e) => {
        if (!isDragging) return;
        
        isDragging = false;
        mainImage.classList.remove("image-dragging");
        mainImage.style.transform = "";
        
        // Esconder setas indicadoras
        leftIndicator.classList.remove("visible");
        rightIndicator.classList.remove("visible");
        
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;

        // Swipe left (próxima imagem) - limite de 50px
        if (diffX > 50) {
            changeImage(1);
        }
        // Swipe right (imagem anterior) - limite de 50px
        else if (diffX < -50) {
            changeImage(-1);
        }
    });

    // Prevenir scroll horizontal acidental durante o arraste
    imageContainer.addEventListener("touchmove", (e) => {
        if (isDragging) {
            e.preventDefault();
        }
    }, { passive: false });
}

  // Inicializar todas as funcionalidades
function init() {
    updateCountdown();
    updateShippingDate();
    initProductOptions();
    initMainButtons();
    initImageLoading();
    initInfiniteScroll();
    initImageZoom();
    initSwipeGestures();
    initFooterSections();
    initImageGallery();
    addAnimationStyles();

    const firstOption = document.querySelector(".option-item");
    if (firstOption) {
      firstOption.click();
    }
}

  // Expor funções globalmente para uso nos botões HTML
  window.changeImage = changeImage;
  window.goToImage = goToImage;

  // Executar inicialização
  init();
});

// Função para alternar tema (modo escuro/claro) - funcionalidade extra
function toggleTheme() {
  document.body.classList.toggle("dark-theme");

  const isDark = document.body.classList.contains("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

// Carregar tema salvo
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark-theme");
}

function showNotification(message) {
  // Criar elemento de notificação
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 70px;
        left: 50%;
        transform: translateX(-50%);
        background: #28a745;
        color: white;
        padding: 12px 24px;
        border-radius: 24px;
        font-size: 14px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideDown 0.3s ease-out;
    `;
  notification.textContent = message;

  // Adicionar ao DOM
  document.body.appendChild(notification);

  // Remover após 3 segundos
  setTimeout(() => {
    notification.style.animation = "slideUp 0.3s ease-out";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function closeShareSection() {
  const shareSection = document.getElementById("share-section");
  const shareOverlay = document.getElementById("share-overlay");
  if (shareSection && shareOverlay) {
    shareOverlay.classList.remove("active");
    shareSection.classList.remove("active");

    setTimeout(() => {
      shareOverlay.style.display = "none";
      shareSection.style.display = "none";
    }, 300);

    // Restore body scroll
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
  }
}

function closeComplaintSection() {
  const complaintSection = document.getElementById("complaint-section");
  const complaintOverlay = document.getElementById("complaint-overlay");
  if (complaintSection && complaintOverlay) {
    complaintOverlay.classList.remove("active");
    complaintSection.classList.remove("active");

    setTimeout(() => {
      complaintOverlay.style.display = "none";
      complaintSection.style.display = "none";
    }, 300);

    // Restore body scroll
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    const copyBtn = document.getElementById("copy-link-btn");
    if (copyBtn) {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "Link copiado!";
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 1500);
    }
    showNotification("Link copiado para a área de transferência!");
  } catch (e) {
    // Fallback para navegadores mais antigos
    const tempInput = document.createElement("input");
    const url = window.location.href;
    document.body.appendChild(tempInput);
    tempInput.value = url;
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    showNotification("Link copiado para a área de transferência!");
  }

  closeShareSection();
  closeComplaintSection();
}

function handleOpenComplaintSection() {
  const complaintSection = document.getElementById("complaint-section");
  const complaintOverlay = document.getElementById("complaint-overlay");
  if (complaintSection && complaintOverlay) {
    complaintOverlay.style.display = "block";
    complaintSection.style.display = "block";

    // Prevent touch events from propagating
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    setTimeout(() => {
      complaintOverlay.classList.add("active");
      complaintSection.classList.add("active");
    }, 10);
  }
}

function handleOpenShareSection() {
  const shareSection = document.getElementById("share-section");
  const shareOverlay = document.getElementById("share-overlay");
  if (shareSection && shareOverlay) {
    shareOverlay.style.display = "block";
    shareSection.style.display = "block";

    // Prevent touch events from propagating
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    setTimeout(() => {
      shareOverlay.classList.add("active");
      shareSection.classList.add("active");
    }, 10);
  }
}

function preventHorizontalSwipe(e) {
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;

    const handleTouchMove = (moveEvent) => {
      const moveTouch = moveEvent.touches[0];
      const deltaX = Math.abs(moveTouch.clientX - startX);
      const deltaY = Math.abs(moveTouch.clientY - startY);

      // If horizontal movement is greater than vertical, prevent it
      if (deltaX > deltaY && deltaX > 10) {
        moveEvent.preventDefault();
      }
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener(
      "touchend",
      () => {
        document.removeEventListener("touchmove", handleTouchMove);
      },
      { once: true }
    );
  }
}
