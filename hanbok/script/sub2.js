const viewButtons = document.querySelectorAll("[data-target-view]");
const promoViews = document.querySelectorAll(".promo-view");
const promoTabs = document.querySelectorAll(".promo-tab");

const locationCurrent = document.querySelector("#locationCurrent");
const breadcrumbCategory = document.querySelector("#breadcrumbCategory");
const breadcrumbDetailGroup = document.querySelector("#breadcrumbDetailGroup");

const viewMeta = {
  "notice-list": {
    category: "공지사항",
    tab: "notice-list",
    isDetail: false,
  },
  "notice-detail": {
    category: "공지사항",
    tab: "notice-list",
    isDetail: true,
  },
  "press-list": {
    category: "언론보도",
    tab: "press-list",
    isDetail: false,
  },
  "press-detail": {
    category: "언론보도",
    tab: "press-list",
    isDetail: true,
  },
  "video-list": {
    category: "영상홍보",
    tab: "video-list",
    isDetail: false,
  },
};

function setPromoView(viewName, shouldUpdateHash = true) {
  const meta = viewMeta[viewName];

  if (!meta) {
    viewName = "notice-list";
  }

  const currentMeta = viewMeta[viewName];

  promoViews.forEach((view) => {
    view.classList.toggle("is-active", view.dataset.view === viewName);
  });

  promoTabs.forEach((tab) => {
    tab.classList.toggle(
      "is-active",
      tab.dataset.targetView === currentMeta.tab,
    );
  });

  if (locationCurrent) {
    locationCurrent.textContent = currentMeta.category;
  }

  if (breadcrumbCategory) {
    breadcrumbCategory.textContent = currentMeta.category;
  }

  if (breadcrumbDetailGroup) {
    breadcrumbDetailGroup.hidden = !currentMeta.isDetail;
  }

  if (shouldUpdateHash) {
    history.replaceState(null, "", `#${viewName}`);
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function getInitialPromoView() {
  const hashView = window.location.hash.replace("#", "");

  if (hashView && viewMeta[hashView]) {
    return hashView;
  }

  return "notice-list";
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setPromoView(button.dataset.targetView);
  });
});

window.addEventListener("DOMContentLoaded", () => {
  setPromoView(getInitialPromoView(), false);
});

window.addEventListener("hashchange", () => {
  const hashView = window.location.hash.replace("#", "");

  if (viewMeta[hashView]) {
    setPromoView(hashView, false);
  }
});
