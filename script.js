const lensButtons = document.querySelectorAll(".lens-button");
const projectCards = document.querySelectorAll(".project-card");

function setupCarousels() {
  const carousels = document.querySelectorAll(".project-carousel");

  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const slides = Array.from(track.children);
    const prev = carousel.querySelector(".carousel-control.prev");
    const next = carousel.querySelector(".carousel-control.next");
    const indicatorsContainer = carousel.querySelector(".carousel-indicators");
    let currentIndex = 0;

    if (!track || slides.length === 0 || !prev || !next || !indicatorsContainer) {
      return;
    }

    const indicatorButtons = slides.map((_, index) => {
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
    });

    function updateCarousel() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      indicatorButtons.forEach((button, index) => {
        const isActive = index === currentIndex;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-current", isActive ? "true" : "false");
      });
    }

    prev.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateCarousel();
    });

    next.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateCarousel();
    });

    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev.click();
      }
      if (event.key === "ArrowRight") {
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
