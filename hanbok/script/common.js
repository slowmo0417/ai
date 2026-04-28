const subMenus = {
  intro: {
    title: "협회소개",
    items: ["협회소개", "인사말", "연혁", "조직도", "오시는 길"],
  },
  pr: {
    title: "홍보광장",
    items: ["공지사항", "언론보도", "갤러리", "영상"],
  },
  azalea: {
    title: "아젤리아패션그룹",
    items: [
      "브랜드 소개",
      "아젤리아 드레스",
      "아젤리아 궁중한복",
      "아젤리아 키즈",
      "아젤리아패션쇼 & 어워즈",
      "아젤리아 예술단",
    ],
  },
  global: {
    title: "국제교류체험관",
    items: [
      "아젤리아 매거진",
      "아젤리아 TV 방송",
      "아젤리아 앤터",
      "국내·국제교류 기획 공연 이벤트",
      "국제교류한복체험",
      "전통한문화포럼",
    ],
  },
  share: {
    title: "나눔과기쁨 & 복지관",
    items: ["(사) 나눔과 기쁨"],
  },
  partner: {
    title: "협력기관",
    items: ["협력기관 정보"],
  },
};

function initMobileMenu() {
  const menuButton = document.querySelector(".menu-button");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (!menuButton || !mobileMenu) return;

  const closeButtons = mobileMenu.querySelectorAll("[data-mobile-menu-close]");
  const accordionButtons = mobileMenu.querySelectorAll(".mobile-menu-title");

  function openMobileMenu() {
    mobileMenu.classList.add("is-open");
    document.body.classList.add("is-mobile-menu-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove("is-open");
    document.body.classList.remove("is-mobile-menu-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
  }

  function syncMobileMenuByViewport() {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      closeMobileMenu();
    }
  }

  menuButton.addEventListener("click", () => {
    if (mobileMenu.classList.contains("is-open")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeMobileMenu);
  });

  accordionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.closest(".mobile-menu-group");
      if (!group) return;

      const isOpen = group.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });

  window.addEventListener("resize", syncMobileMenuByViewport);
}

function initTopButton() {
  const topButton = document.querySelector(".top-button");

  topButton?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initSubMenu() {
  const gnbLinks = document.querySelectorAll(".gnb a");
  const subMenu = document.querySelector(".sub-menu");
  const subMenuTitle = document.querySelector(".sub-menu-title");
  const subMenuList = document.querySelector(".sub-menu-list");
  const siteHeader = document.querySelector(".site-header");

  if (
    !gnbLinks.length ||
    !subMenu ||
    !subMenuTitle ||
    !subMenuList ||
    !siteHeader
  ) {
    return;
  }

  function renderSubMenu(menuKey) {
    const menu = subMenus[menuKey];
    if (!menu) return;

    subMenuTitle.textContent = menu.title;
    subMenuList.setAttribute("aria-label", `${menu.title} 하위 메뉴`);
    subMenuList.innerHTML = menu.items
      .map((item) => `<a class="sub-menu-link" href="#">${item}</a>`)
      .join("");
  }

  function openSubMenu(link) {
    const menuKey = link.dataset.menu;

    gnbLinks.forEach((item) => item.classList.remove("is-active"));
    link.classList.add("is-active");

    subMenu.classList.add("is-open");
    renderSubMenu(menuKey);
  }

  function closeSubMenu() {
    subMenu.classList.remove("is-open");
    gnbLinks.forEach((item) => item.classList.remove("is-active"));
  }

  gnbLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => openSubMenu(link));
    link.addEventListener("focus", () => openSubMenu(link));
  });

  siteHeader.addEventListener("mouseleave", closeSubMenu);

  siteHeader.addEventListener("focusout", (event) => {
    if (!siteHeader.contains(event.relatedTarget)) {
      closeSubMenu();
    }
  });
}

function initCommon() {
  initMobileMenu();
  initTopButton();
  initSubMenu();
}

document.addEventListener("DOMContentLoaded", initCommon);
