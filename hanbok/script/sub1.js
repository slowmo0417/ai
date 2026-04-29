const aboutTabs = document.querySelectorAll(".about-tab");
const aboutPanels = document.querySelectorAll(".about-panel");
const breadcrumbCurrent = document.querySelector("#breadcrumbCurrent");

const aboutTabNames = {
  intro: "협회 소개",
  chairman: "이사장 인사말",
  president: "총재/명예총재 인사말",
  organization: "조직도",
  history: "연혁",
  brand: "브랜드",
  location: "오시는 길",
};

function setAboutTab(tabName) {
  if (!aboutTabNames[tabName]) {
    tabName = "intro";
  }

  aboutTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.tab === tabName);
  });

  aboutPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === tabName);
  });

  if (breadcrumbCurrent) {
    breadcrumbCurrent.textContent = aboutTabNames[tabName] || "";
  }
}

function getInitialAboutTab() {
  const params = new URLSearchParams(window.location.search);
  const tabFromUrl = params.get("tab");

  if (tabFromUrl && aboutTabNames[tabFromUrl]) {
    return tabFromUrl;
  }

  return "intro";
}

aboutTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabName = tab.dataset.tab;

    setAboutTab(tabName);

    const url = new URL(window.location.href);
    url.searchParams.set("tab", tabName);
    window.history.replaceState(null, "", url);
  });
});

setAboutTab(getInitialAboutTab());
