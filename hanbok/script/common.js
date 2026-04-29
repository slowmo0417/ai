const subMenus = {
  intro: {
    title: "협회소개",
    items: [
      { label: "협회소개", href: "./sub1.html?tab=intro" },
      { label: "인사말", href: "./sub1.html?tab=chairman" },
      { label: "연혁", href: "./sub1.html?tab=history" },
      { label: "조직도", href: "./sub1.html?tab=organization" },
      { label: "오시는 길", href: "./sub1.html?tab=location" },
    ],
  },
  pr: {
    title: "홍보광장",
    items: [
      { label: "공지사항", href: "./sub2.html#notice-list" },
      { label: "언론보도", href: "./sub2.html#press-list" },
      { label: "영상", href: "./sub2.html#video-list" },
    ],
  },
  azalea: {
    title: "아젤리아패션그룹",
    items: [
      { label: "브랜드 소개", href: "#" },
      { label: "아젤리아 드레스", href: "#" },
      { label: "아젤리아 궁중한복", href: "#" },
      { label: "아젤리아 키즈", href: "#" },
      { label: "아젤리아패션쇼 & 어워즈", href: "#" },
      { label: "아젤리아 예술단", href: "#" },
    ],
  },
  global: {
    title: "국제교류체험관",
    items: [
      { label: "아젤리아 매거진", href: "#" },
      { label: "아젤리아 TV 방송", href: "#" },
      { label: "아젤리아 앤터", href: "#" },
      { label: "국내·국제교류 기획 공연 이벤트", href: "#" },
      { label: "국제교류한복체험", href: "#" },
      { label: "전통한문화포럼", href: "#" },
    ],
  },
  share: {
    title: "나눔과기쁨 & 복지관",
    items: [{ label: "(사) 나눔과 기쁨", href: "#" }],
  },
  partner: {
    title: "협력기관",
    items: [{ label: "협력기관 정보", href: "#" }],
  },
};

function initMobileMenu() {
  const menuButton = document.querySelector(".menu-button");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (!menuButton || !mobileMenu) return;

  const closeButtons = mobileMenu.querySelectorAll("[data-mobile-menu-close]");
  const accordionButtons = mobileMenu.querySelectorAll(".mobile-menu-title");
  const mobileLinks = mobileMenu.querySelectorAll("a");

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

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      closeMobileMenu();
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
      .map(
        (item) =>
          `<a class="sub-menu-link" href="${item.href}">${item.label}</a>`,
      )
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

  subMenuList.addEventListener("click", (event) => {
    const link = event.target.closest(".sub-menu-link");
    if (!link) return;

    const href = link.getAttribute("href");

    if (!href || href === "#") {
      event.preventDefault();
      return;
    }

    closeSubMenu();
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
