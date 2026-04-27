(() => {
  function getCouponElements() {
    return {
      tabs: document.querySelectorAll(".coupon-tab"),
      cards: document.querySelectorAll(".coupon-card"),
      empty: document.querySelector("#couponEmpty"),
      count: document.querySelector("#availableCouponCount"),
    };
  }

  function filterCoupons(filterName = "all") {
    const { cards, empty, count } = getCouponElements();
    let visibleCount = 0;

    cards.forEach((card) => {
      const statusList = (card.dataset.status || "")
        .trim()
        .split(" ")
        .filter(Boolean);

      const shouldShow =
        filterName === "all" || statusList.includes(filterName);

      card.style.display = shouldShow ? "" : "none";

      if (shouldShow) visibleCount += 1;
    });

    if (empty) {
      empty.classList.toggle("is-show", visibleCount === 0);
    }

    if (count) {
      count.textContent = visibleCount;
    }
  }

  function setActiveTab(activeTab) {
    const { tabs } = getCouponElements();

    tabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab === activeTab);
    });
  }

  document.addEventListener("click", (event) => {
    const tab = event.target.closest(".coupon-tab");
    if (!tab) return;

    event.preventDefault();

    const filterName = tab.dataset.filter || "all";
    setActiveTab(tab);
    filterCoupons(filterName);
  });

  window.initCouponFilter = filterCoupons;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => filterCoupons("all"));
  } else {
    filterCoupons("all");
  }
})();
