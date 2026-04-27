const app = document.querySelector(".app");
const headerTitle = document.querySelector(".header-title");
const backButton = document.querySelector(".header-back");
const orderNavFab = document.querySelector("#orderNavFab");
const orderSheetTriggers = document.querySelectorAll(".order-sheet-trigger");
const navItems = document.querySelectorAll(".bottom-nav .nav-item");

const orderSheet = document.querySelector("#orderSheet");
const orderSheetBackdrop = document.querySelector("#orderSheetBackdrop");
const orderSheetClose = document.querySelector("#orderSheetClose");
const orderSheetOptions = document.querySelectorAll(".sheet-option");

const headerIconButtons = document.querySelectorAll("[data-header-icon]");
const cartCountBadge = document.querySelector("#cartCountBadge");

function setHeaderMode(mode, title = "") {
  if (!app || !headerTitle) return;

  app.classList.remove("is-main", "is-sub", "is-notice", "is-cart");
  app.classList.add(mode === "main" ? "is-main" : "is-sub");

  if (mode === "notice") {
    app.classList.add("is-notice");
  }

  if (mode === "cart") {
    app.classList.add("is-cart");
  }

  headerTitle.textContent = title;
}

function setBottomNavVisibility(shouldShow) {
  if (!app) return;
  app.classList.toggle("no-bottom-nav", !shouldShow);
}

function setActiveNav(navName = "") {
  if (!navItems.length) return;

  navItems.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.nav === navName);
  });
}

function setActiveHeaderIcon(iconName = "") {
  if (!headerIconButtons.length) return;

  headerIconButtons.forEach((button) => {
    button.classList.toggle(
      "is-active",
      iconName && button.dataset.headerIcon === iconName,
    );
  });
}

function applyLayoutConfig() {
  if (!app) return;

  const headerMode = app.dataset.headerMode || "main";
  const headerText = app.dataset.headerTitle || "";
  const showBottomNav = app.dataset.showBottomNav !== "false";
  const activeNav = app.dataset.activeNav || "";
  const activeHeaderIcon = app.dataset.activeHeaderIcon || "";

  setHeaderMode(headerMode, headerText);
  setBottomNavVisibility(showBottomNav);
  setActiveNav(activeNav);
  setActiveHeaderIcon(activeHeaderIcon);
}

function bindBackButton() {
  if (!backButton) return;

  backButton.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "./main.html";
  });
}

function bindHeaderIconLinks() {
  if (!headerIconButtons.length) return;

  headerIconButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const iconName = button.dataset.headerIcon;

      if (iconName === "cart") {
        window.location.href = "./cart.html";
        return;
      }

      if (iconName === "notice") {
        window.location.href = "./notice.html";
        return;
      }

      if (iconName === "home") {
        window.location.href = "./main.html";
        return;
      }
    });
  });
}

/* =========================
   장바구니 수량 배지
========================= */

function getCartItemsFromStorage() {
  const storageKeys = ["cartItems", "cart", "lotteriaCart"];

  for (const key of storageKeys) {
    const savedData = localStorage.getItem(key);

    if (!savedData) continue;

    try {
      const parsedData = JSON.parse(savedData);

      if (Array.isArray(parsedData)) {
        return parsedData;
      }

      if (parsedData && Array.isArray(parsedData.items)) {
        return parsedData.items;
      }
    } catch (error) {
      console.warn("장바구니 데이터를 불러오지 못했습니다.", error);
    }
  }

  return [];
}

function getCartTotalCount() {
  const cartItems = getCartItemsFromStorage();

  return cartItems.reduce((total, item) => {
    const quantity = Number(item.quantity || item.qty || item.count || 1);

    if (Number.isNaN(quantity) || quantity <= 0) {
      return total;
    }

    return total + quantity;
  }, 0);
}

function updateCartCountBadge() {
  if (!cartCountBadge) return;

  const totalCount = getCartTotalCount();

  if (totalCount <= 0) {
    cartCountBadge.textContent = "0";
    cartCountBadge.classList.add("is-hidden");
    return;
  }

  cartCountBadge.textContent = totalCount > 99 ? "99+" : totalCount;
  cartCountBadge.classList.remove("is-hidden");
}

function syncCartBadgeAfterStorageChange() {
  updateCartCountBadge();
}

function openOrderSheet() {
  if (!app || !orderSheet || !orderSheetBackdrop) return;

  if (orderNavFab) {
    orderNavFab.classList.remove("is-logo");
  }

  orderSheet.hidden = false;
  orderSheetBackdrop.hidden = false;

  requestAnimationFrame(() => {
    app.classList.add("is-sheet-open");
    document.body.style.overflow = "hidden";
  });
}

function closeOrderSheet() {
  if (!app || !orderSheet || !orderSheetBackdrop) return;

  app.classList.remove("is-sheet-open");
  document.body.style.overflow = "";

  setTimeout(() => {
    orderSheet.hidden = true;
    orderSheetBackdrop.hidden = true;
  }, 300);
}

function bindOrderSheet() {
  const triggerSet = new Set();

  if (orderNavFab) {
    triggerSet.add(orderNavFab);
  }

  orderSheetTriggers.forEach((trigger) => {
    triggerSet.add(trigger);
  });

  triggerSet.forEach((trigger) => {
    trigger.addEventListener("click", openOrderSheet);
  });

  if (orderSheetBackdrop) {
    orderSheetBackdrop.addEventListener("click", closeOrderSheet);
  }

  if (orderSheetClose) {
    orderSheetClose.addEventListener("click", closeOrderSheet);
  }

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      app &&
      app.classList.contains("is-sheet-open")
    ) {
      closeOrderSheet();
    }
  });
}

function bindOrderSheetOptions() {
  if (!orderSheetOptions.length) return;

  orderSheetOptions.forEach((option) => {
    option.addEventListener("click", () => {
      window.location.href = "./menu.html";
    });
  });
}

function startOrderFabAnimation() {
  if (!orderNavFab) return;

  setInterval(() => {
    if (app && app.classList.contains("is-sheet-open")) return;

    const shouldShowLogo = !orderNavFab.classList.contains("is-logo");
    orderNavFab.classList.toggle("is-logo", shouldShowLogo);
  }, 3000);
}

function initOrderSheetState() {
  if (orderSheet) orderSheet.hidden = true;
  if (orderSheetBackdrop) orderSheetBackdrop.hidden = true;

  if (orderNavFab) {
    orderNavFab.classList.remove("is-logo");
  }
}

function initCommonLayout() {
  applyLayoutConfig();
  bindBackButton();
  bindHeaderIconLinks();
  initOrderSheetState();
  bindOrderSheet();
  bindOrderSheetOptions();
  startOrderFabAnimation();
  updateCartCountBadge();
}

initCommonLayout();

window.addEventListener("storage", syncCartBadgeAfterStorageChange);

window.setHeaderMode = setHeaderMode;
window.setBottomNavVisibility = setBottomNavVisibility;
window.setActiveNav = setActiveNav;
window.setActiveHeaderIcon = setActiveHeaderIcon;
window.applyLayoutConfig = applyLayoutConfig;
window.openOrderSheet = openOrderSheet;
window.closeOrderSheet = closeOrderSheet;
window.getCartItemsFromStorage = getCartItemsFromStorage;
window.getCartTotalCount = getCartTotalCount;
window.updateCartCountBadge = updateCartCountBadge;
