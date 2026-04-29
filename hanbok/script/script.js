function initNoticeTabs() {
  const noticeTabs = document.querySelectorAll(".notice-tab");
  const noticeCards = document.querySelectorAll(".notice-card");
  const noticeList = document.querySelector(".notice-list");

  if (!noticeList || !noticeTabs.length || !noticeCards.length) return;

  const originalNoticeCards = Array.from(noticeCards);

  function renderNoticeCards(filter = "all") {
    const filteredCards =
      filter === "all"
        ? originalNoticeCards
        : originalNoticeCards.filter(
            (card) => card.dataset.category === filter,
          );

    noticeList.innerHTML = "";

    for (let i = 0; i < filteredCards.length; i += 4) {
      const row = document.createElement("div");
      row.className = "notice-row";

      filteredCards.slice(i, i + 4).forEach((card) => {
        card.style.display = "flex";
        row.appendChild(card);
      });

      noticeList.appendChild(row);
    }
  }

  noticeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      noticeTabs.forEach((item) => item.classList.remove("is-active"));
      tab.classList.add("is-active");
      renderNoticeCards(tab.dataset.filter);
    });
  });
}

function initGallerySlider() {
  const galleryList = document.querySelector(".gallery-list");
  const galleryPrevButton = document.querySelector(".gallery-prev");
  const galleryNextButton = document.querySelector(".gallery-next");

  if (!galleryList) return;
  if (window.matchMedia("(max-width: 1023px)").matches) return;

  const originalSlides = Array.from(
    galleryList.querySelectorAll(".gallery-card"),
  );
  if (originalSlides.length <= 1) return;

  const slideCount = originalSlides.length;
  const copiesBefore = originalSlides.map((slide) => slide.cloneNode(true));
  const copiesAfter = originalSlides.map((slide) => slide.cloneNode(true));

  copiesBefore.forEach((slide) => {
    slide.setAttribute("aria-hidden", "true");
    slide.dataset.clone = "before";
  });

  copiesAfter.forEach((slide) => {
    slide.setAttribute("aria-hidden", "true");
    slide.dataset.clone = "after";
  });

  galleryList.prepend(...copiesBefore);
  galleryList.append(...copiesAfter);

  let slides = Array.from(galleryList.querySelectorAll(".gallery-card"));
  let currentIndex = slideCount;
  let currentX = 0;
  let timerId = null;
  let startX = 0;
  let startTranslate = 0;
  let isDragging = false;
  let isAnimating = false;
  let didDrag = false;

  function refreshSlides() {
    slides = Array.from(galleryList.querySelectorAll(".gallery-card"));
  }

  function getOffset(index) {
    return slides[index]?.offsetLeft || 0;
  }

  function setTransform(x) {
    currentX = x;
    galleryList.style.transform = `translate3d(${x}px, 0, 0)`;
  }

  function moveTo(index, animate = true) {
    currentIndex = index;
    isAnimating = animate;
    galleryList.classList.toggle("is-animating", animate);
    setTransform(-getOffset(currentIndex));
  }

  function normalizeLoop() {
    const firstMiddleIndex = slideCount;
    const lastMiddleIndex = slideCount * 2 - 1;

    if (currentIndex > lastMiddleIndex) {
      currentIndex -= slideCount;
      moveTo(currentIndex, false);
      return;
    }

    if (currentIndex < firstMiddleIndex) {
      currentIndex += slideCount;
      moveTo(currentIndex, false);
    }
  }

  function next() {
    if (isAnimating || isDragging) return;
    moveTo(currentIndex + 1, true);
  }

  function prev() {
    if (isAnimating || isDragging) return;
    moveTo(currentIndex - 1, true);
  }

  function stopAuto() {
    if (!timerId) return;
    window.clearInterval(timerId);
    timerId = null;
  }

  function startAuto() {
    stopAuto();
    timerId = window.setInterval(next, 3000);
  }

  galleryList.addEventListener("transitionend", (event) => {
    if (event.propertyName !== "transform") return;
    isAnimating = false;
    galleryList.classList.remove("is-animating");
    normalizeLoop();
  });

  galleryList.addEventListener("pointerdown", (event) => {
    if (isAnimating) return;

    isDragging = true;
    didDrag = false;
    startX = event.clientX;
    startTranslate = currentX;
    galleryList.classList.remove("is-animating");
    galleryList.classList.add("is-dragging");
    galleryList.setPointerCapture?.(event.pointerId);
    stopAuto();
  });

  galleryList.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const deltaX = event.clientX - startX;
    if (Math.abs(deltaX) > 4) didDrag = true;
    setTransform(startTranslate + deltaX);
  });

  function getClosestIndex() {
    const targetLeft = Math.abs(currentX);
    let closestIndex = currentIndex;
    let closestDistance = Infinity;

    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - targetLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  function endDrag(event) {
    if (!isDragging) return;

    const deltaX = event.clientX - startX;
    const threshold = 56;
    isDragging = false;
    galleryList.classList.remove("is-dragging");
    galleryList.releasePointerCapture?.(event.pointerId);

    if (deltaX < -threshold) {
      moveTo(getClosestIndex() + 1, true);
    } else if (deltaX > threshold) {
      moveTo(getClosestIndex() - 1, true);
    } else {
      moveTo(getClosestIndex(), true);
    }

    startAuto();
  }

  galleryList.addEventListener("click", (event) => {
    if (!didDrag) return;
    event.preventDefault();
    didDrag = false;
  });

  galleryList.addEventListener("pointerup", endDrag);
  galleryList.addEventListener("pointercancel", endDrag);
  galleryList.addEventListener("mouseenter", stopAuto);
  galleryList.addEventListener("mouseleave", startAuto);

  galleryPrevButton?.addEventListener("click", () => {
    stopAuto();
    prev();
    startAuto();
  });

  galleryNextButton?.addEventListener("click", () => {
    stopAuto();
    next();
    startAuto();
  });

  window.addEventListener("resize", () => {
    refreshSlides();
    moveTo(currentIndex, false);
  });

  requestAnimationFrame(() => {
    refreshSlides();
    moveTo(currentIndex, false);
    startAuto();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNoticeTabs();
  initGallerySlider();
});
const heroSwiper = new Swiper(".hero-swiper", {
  loop: true,
  effect: "fade",
  fadeEffect: {
    crossFade: true,
  },
  speed: 900,
  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".hero-pagination",
    clickable: true,
  },
  navigation: {
    prevEl: ".hero-nav-prev",
    nextEl: ".hero-nav-next",
  },
});
