// 모바일 햄버거 메뉴 제어
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");
const navItems = document.querySelectorAll(".nav-item");

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.setAttribute("aria-expanded", "false");
  mobileMenuBtn.setAttribute("aria-controls", "navLinks");

  mobileMenuBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("nav-active");
    mobileMenuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navLinks.classList.remove("nav-active");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

// Scroll Fade-up Observer
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.15,
};
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

// Modal Handling & Accessibility Focus
let lastFocusedElement = null;

document.querySelectorAll("[data-modal-target]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    if (btn.tagName !== "A") e.preventDefault();
    const modalId = btn.getAttribute("data-modal-target");
    const modal = document.getElementById(modalId);
    if (modal) {
      lastFocusedElement = document.activeElement;
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      const closeBtn = modal.querySelector(".modal-close");
      if (closeBtn) closeBtn.focus();
    }
  });
});

function closeModal(overlay) {
  overlay.classList.remove("active");
  document.body.style.overflow = "";
  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  const closeBtns = overlay.querySelectorAll(".modal-close");
  closeBtns.forEach((btn) => {
    btn.addEventListener("click", () => closeModal(overlay));
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeModal(overlay);
    }
  });
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay.active").forEach((overlay) => {
      closeModal(overlay);
    });
  }
});

// Toast Notification Function
function showToast(message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `${message} <span>✔</span>`;
  container.appendChild(toast);

  // 애니메이션 강제 트리거를 위한 reflow
  void toast.offsetWidth;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove());
  }, 2500);
}

// Email Copy API (Modern Clipboard API with Fallback)
document.querySelectorAll(".copy-email-btn").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const emailStr = btn.getAttribute("data-email");

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(emailStr);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = emailStr;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      showToast("이메일 주소가 복사되었습니다!");
    } catch (error) {
      showToast("복사에 실패했습니다. 직접 복사해주세요.");
    }
  });
});

// Scroll to Top
const scrollTopBtn = document.getElementById("scrollTopBtn");
window.addEventListener("scroll", () => {
  if (window.scrollY > 400) {
    scrollTopBtn.classList.add("show");
  } else {
    scrollTopBtn.classList.remove("show");
  }
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Insta Card Horizontal Swipe
const instaScrolls = document.querySelectorAll(".insta-scroll");
instaScrolls.forEach((slider) => {
  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.classList.add("dragging");
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener("mouseleave", () => {
    if (!isDown) return;
    isDown = false;
    slider.classList.remove("dragging");
    snapToNearestCard(slider);
  });

  slider.addEventListener("mouseup", () => {
    if (!isDown) return;
    isDown = false;
    slider.classList.remove("dragging");
    snapToNearestCard(slider);
  });

  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5;
    slider.scrollLeft = scrollLeft - walk;
  });

  function snapToNearestCard(el) {
    const card = el.querySelector(".insta-card");
    if (!card) return;
    const cardWidth = card.offsetWidth + 16;
    const currentScroll = el.scrollLeft;
    const targetIndex = Math.round(currentScroll / cardWidth);
    el.scrollTo({ left: targetIndex * cardWidth, behavior: "smooth" });
  }
});
