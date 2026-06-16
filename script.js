const lensButtons = document.querySelectorAll(".lens-button");
const projectCards = document.querySelectorAll(".project-card");

function setupCarousels() {
  const carousels = document.querySelectorAll(".project-carousel");

  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const slides = track ? Array.from(track.children) : [];
    const prev = carousel.querySelector(".carousel-control.prev");
    const next = carousel.querySelector(".carousel-control.next");
    const indicatorsContainer = carousel.querySelector(".carousel-indicators");
    let currentIndex = 0;

    if (!track || slides.length === 0) {
      return;
    }

    const hasControls = Boolean(prev && next);
    const hasIndicators = Boolean(indicatorsContainer);

    if (slides.length === 1) {
      if (prev) prev.style.display = "none";
      if (next) next.style.display = "none";
      if (indicatorsContainer) indicatorsContainer.style.display = "none";
    }

    const indicatorButtons = hasIndicators
      ? slides.map((_, index) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "carousel-indicator";
          button.setAttribute("aria-label", `Go to slide ${index + 1}`);
          button.addEventListener("click", () => {
            currentIndex = index;
            updateCarousel();
          });
          indicatorsContainer.appendChild(button);
          return button;
        })
      : [];

    function updateCarousel() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      if (hasIndicators) {
        indicatorButtons.forEach((button, index) => {
          const isActive = index === currentIndex;
          button.classList.toggle("is-active", isActive);
          button.setAttribute("aria-current", isActive ? "true" : "false");
        });
      }
    }

    if (hasControls) {
      prev.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateCarousel();
      });

      next.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateCarousel();
      });
    }

    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" && hasControls) {
        event.preventDefault();
        prev.click();
      }
      if (event.key === "ArrowRight" && hasControls) {
        event.preventDefault();
        next.click();
      }
    });

    carousel.setAttribute("tabindex", "0");
    updateCarousel();
  });
}

lensButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    lensButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    projectCards.forEach((card) => {
      const tags = card.dataset.tags.split(" ");
      const shouldShow = filter === "all" || tags.includes(filter);
      card.classList.toggle("is-hidden", !shouldShow);
      card.setAttribute("aria-hidden", String(!shouldShow));
    });
  });
});

setupCarousels();

/* Cursor-follow tooltip and modal project viewer */
(function () {
  const tooltip = document.getElementById('cursor-tooltip');
  const modal = document.getElementById('project-modal');
  const modalOverlay = modal.querySelector('.modal-overlay');
  const modalContent = modal.querySelector('.modal-content');
  const modalTrack = modal.querySelector('.modal-track');
  const modalIndicators = modal.querySelector('.modal-indicators');
  const btnPrev = modal.querySelector('.modal-prev');
  const btnNext = modal.querySelector('.modal-next');
  const btnClose = modal.querySelector('.modal-close');
  let currentIndex = 0;
  let slides = [];

  function showTooltip() {
    tooltip.classList.add('is-visible');
    tooltip.setAttribute('aria-hidden', 'false');
  }
  function hideTooltip() {
    tooltip.classList.remove('is-visible');
    tooltip.setAttribute('aria-hidden', 'true');
  }

  // move tooltip near cursor
  document.addEventListener('mousemove', (e) => {
    if (!tooltip.classList.contains('is-visible')) return;
    const x = e.clientX + 14;
    const y = e.clientY + 14;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  });

  // bind thumbnail hover/click
  document.querySelectorAll('.project-visual').forEach((thumb) => {
    thumb.addEventListener('mouseenter', () => showTooltip());
    thumb.addEventListener('mouseleave', () => hideTooltip());
    thumb.addEventListener('click', (e) => {
      const carousel = thumb.querySelector('.carousel-track');
      if (!carousel) return;
      const imgs = Array.from(carousel.querySelectorAll('img'));
      openModalWithImages(imgs.map((img) => ({ src: img.src, alt: img.alt || '' })));
    });
  });

  function openModalWithImages(items) {
    slides = items;
    currentIndex = 0;
    renderModalSlides();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modalContent.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function renderModalSlides() {
    modalTrack.innerHTML = '';
    modalIndicators.innerHTML = '';

    slides.forEach((s, i) => {
      const img = document.createElement('img');
      img.src = s.src;
      img.alt = s.alt || '';
      img.loading = 'lazy';
      const wrapper = document.createElement('div');
      wrapper.style.minWidth = '100%';
      wrapper.appendChild(img);
      modalTrack.appendChild(wrapper);

      const dot = document.createElement('button');
      dot.type = 'button';
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateModalPosition();
      });
      modalIndicators.appendChild(dot);
    });

    if (slides.length <= 1) {
      btnPrev.style.display = 'none';
      btnNext.style.display = 'none';
      modalIndicators.style.display = 'none';
    } else {
      btnPrev.style.display = '';
      btnNext.style.display = '';
      modalIndicators.style.display = 'flex';
    }

    updateModalPosition();
  }

  function updateModalPosition() {
    modalTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
    const dots = Array.from(modalIndicators.children);
    dots.forEach((d, i) => d.classList.toggle('is-active', i === currentIndex));
  }

  btnPrev.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateModalPosition();
  });
  btnNext.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateModalPosition();
  });

  let touchStartX = 0;
  let touchStartY = 0;

  function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }

  function handleTouchEnd(event) {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      } else {
        currentIndex = (currentIndex + 1) % slides.length;
      }
      updateModalPosition();
    }
  }

  const modalCarousel = modal.querySelector('.modal-carousel');
  if (modalCarousel) {
    modalCarousel.addEventListener('touchstart', handleTouchStart, { passive: true });
    modalCarousel.addEventListener('touchend', handleTouchEnd, { passive: true });
  }

  [btnClose, modalOverlay].forEach((el) => el.addEventListener('click', closeModal));

  document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('is-open')) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') btnPrev.click();
      if (e.key === 'ArrowRight') btnNext.click();
    }
  });
})();
