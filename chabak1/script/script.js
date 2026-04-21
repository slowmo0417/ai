/* ===============================
   API KEY 입력 영역
================================ */
const GOCAMPING_SERVICE_KEY =
  "70af5d490850a84f63481ed1a416d825de2954376f0f71d628fd03361250da81";
const KAKAO_MAP_JS_KEY = "cc8c124f8a594a01e630a3c43ae4349a";

/* ===============================
   기본 설정
================================ */
const GOCAMPING_BASE_URL = "https://apis.data.go.kr/B551011/GoCamping";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&w=600&q=80";

const RECENT_KEY = "camping_recent_keywords";
const FAVORITE_KEY = "camping_favorites";
const FAVORITE_DATA_KEY = "camping_favorite_data";

const MAP_CACHE_KEY = "camping_map_cache";
const MAP_CACHE_TIME_KEY = "camping_map_cache_time";
const MAP_CACHE_TTL = 1000 * 60 * 60 * 24;

const MAP_BASE_PAGE_COUNT = 8;

const RECOMMEND_KEYWORDS = [
  "경기도",
  "강원",
  "제주",
  "글램핑",
  "카라반",
  "오토캠핑",
  "반려견",
  "계곡",
];

const REGION_INFO = [
  { name: "서울", lat: 37.5665, lng: 126.978, keywords: ["서울"] },
  { name: "부산", lat: 35.1796, lng: 129.0756, keywords: ["부산"] },
  { name: "대구", lat: 35.8714, lng: 128.6014, keywords: ["대구"] },
  { name: "인천", lat: 37.4563, lng: 126.7052, keywords: ["인천"] },
  { name: "광주", lat: 35.1595, lng: 126.8526, keywords: ["광주"] },
  { name: "대전", lat: 36.3504, lng: 127.3845, keywords: ["대전"] },
  { name: "울산", lat: 35.5384, lng: 129.3114, keywords: ["울산"] },
  { name: "세종", lat: 36.4801, lng: 127.289, keywords: ["세종"] },
  {
    name: "경기도",
    lat: 37.4138,
    lng: 127.5183,
    keywords: ["경기도", "경기"],
  },
  {
    name: "강원",
    lat: 37.8228,
    lng: 128.1555,
    keywords: ["강원", "강원도", "강원특별자치도"],
  },
  {
    name: "충청북도",
    lat: 36.8,
    lng: 127.7,
    keywords: ["충청북도", "충북"],
  },
  {
    name: "충청남도",
    lat: 36.5184,
    lng: 126.8,
    keywords: ["충청남도", "충남"],
  },
  {
    name: "전라북도",
    lat: 35.7175,
    lng: 127.153,
    keywords: ["전라북도", "전북"],
  },
  {
    name: "전라남도",
    lat: 34.8679,
    lng: 126.991,
    keywords: ["전라남도", "전남"],
  },
  {
    name: "경상북도",
    lat: 36.4919,
    lng: 128.8889,
    keywords: ["경상북도", "경북"],
  },
  {
    name: "경상남도",
    lat: 35.4606,
    lng: 128.2132,
    keywords: ["경상남도", "경남"],
  },
  { name: "제주", lat: 33.4996, lng: 126.5312, keywords: ["제주"] },
];

let currentResults = [];
let mapResults = [];
let clusterSourceItems = [];
let focusedMarkerItems = [];
let allLoadedItems = [];
let lastScreen = "search";
let activeNavKey = "search";

let kakaoMap = null;
let detailMap = null;
let kakaoMarkers = [];
let kakaoOverlays = [];
let allMapLoaded = false;
let mapZoomHandlerReady = false;
let isClusterMode = false;
let isFocusedMarkerMode = false;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const screens = {
  search: $("#searchScreen"),
  list: $("#listScreen"),
  map: $("#mapScreen"),
  favorites: $("#favoriteScreen"),
  detail: $("#detailScreen"),
};

const dom = {
  searchForm: $("#searchForm"),
  searchInput: $("#searchInput"),
  recentKeywordsTop: $("#recentKeywordsTop"),
  recentKeywordsBottom: $("#recentKeywordsBottom"),
  clearRecentBtn: $("#clearRecentBtn"),
  resultList: $("#resultList"),
  favoriteList: $("#favoriteList"),
  listLoading: $("#listLoading"),
  listTitle: $("#listTitle"),
  detailContent: $("#detailContent"),
  detailTitle: $("#detailTitle"),
  openMapBtn: $("#openMapBtn"),
  mapToListBtn: $("#mapToListBtn"),
  mapCardWrap: $("#mapCardWrap"),
  mapGuide: $("#mapGuide"),
  clearFavoriteBtn: $("#clearFavoriteBtn"),
  detailBackBtn: $("#detailBackBtn"),
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  renderRecentKeywords();

  if (dom.listLoading) {
    dom.listLoading.style.display = "none";
  }

  dom.searchForm.addEventListener("submit", handleSearchSubmit);
  dom.openMapBtn.addEventListener("click", openClusterMap);
  dom.clearRecentBtn.addEventListener("click", clearRecentKeywords);
  dom.clearFavoriteBtn.addEventListener("click", clearFavorites);

  dom.detailBackBtn.addEventListener("click", () => {
    showScreen(lastScreen, activeNavKey);
  });

  const mapBackBtn = $("#mapScreen .back-btn");

  if (mapBackBtn) {
    mapBackBtn.addEventListener("click", handleMapBackButton);
  }

  dom.mapToListBtn.addEventListener("click", () => {
    const items =
      isFocusedMarkerMode && focusedMarkerItems.length
        ? focusedMarkerItems
        : mapResults;

    dom.listTitle.textContent = "지도 결과";
    currentResults = items;
    renderResultList(items);
    showScreen("list", "search");
  });

  $$(".back-btn[data-back]").forEach((btn) => {
    if (btn.closest("#mapScreen")) return;

    btn.addEventListener("click", () => {
      showScreen(btn.dataset.back, "search");
    });
  });

  $$("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.nav;

      if (target === "map") {
        openClusterMap();
      } else if (target === "favorites") {
        renderFavorites();
      } else if (target === "home") {
        showScreen("search", "home");
      } else if (target === "my") {
        showScreen("search", "my");
      } else {
        showScreen("search", "search");
      }
    });
  });

  dom.searchInput.addEventListener("focus", () => {
    dom.searchInput.value = "";
  });
}

/* ===============================
   화면 전환
================================ */
function showScreen(name, navKey) {
  Object.values(screens).forEach((screen) => {
    screen.classList.remove("active");
  });

  screens[name].classList.add("active");

  if (navKey) {
    activeNavKey = navKey;
  } else if (name !== "detail") {
    activeNavKey = name === "list" ? "search" : name;
  }

  updateBottomNav(activeNavKey);
}

function updateBottomNav(navKey) {
  $$(".bottom-nav [data-nav]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.nav === navKey);
  });
}

function setLastScreen(name) {
  if (name !== "detail") {
    lastScreen = name;
  }
}

/* ===============================
   API
================================ */
async function requestGoCamping(path, params = {}) {
  const query = new URLSearchParams({
    serviceKey: GOCAMPING_SERVICE_KEY,
    MobileOS: "ETC",
    MobileApp: "CampingSearchApp",
    _type: "json",
    ...params,
  });

  const response = await fetch(`${GOCAMPING_BASE_URL}${path}?${query}`);

  if (!response.ok) {
    throw new Error("API 요청 실패");
  }

  return response.json();
}

function normalizeItems(data) {
  const item = data?.response?.body?.items?.item;

  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

/* ===============================
   검색
================================ */
async function handleSearchSubmit(e) {
  e.preventDefault();

  const keyword = normalizeKeyword(dom.searchInput.value);

  if (!keyword) {
    alert("검색어를 입력해주세요.");
    return;
  }

  dom.searchInput.value = keyword;
  saveRecentKeyword(keyword);
  renderRecentKeywords();
  await fetchCampingList(keyword);
}

async function fetchCampingList(keyword) {
  const normalizedKeyword = normalizeKeyword(keyword);

  showScreen("list", "search");
  setLastScreen("list");

  dom.listTitle.textContent = `${normalizedKeyword} 검색 결과`;
  dom.resultList.innerHTML = "";
  dom.listLoading.style.display = "block";
  dom.listLoading.textContent = "캠핑장을 불러오는 중입니다.";

  try {
    const items = await fetchKeywordResults(normalizedKeyword, 80);

    currentResults = items;
    mergeLoadedItems(items);

    dom.listLoading.style.display = "none";
    renderResultList(items);

    if (!items.length) {
      dom.resultList.innerHTML = `
        <div class="empty-result">
          검색 결과가 없습니다.<br />
          다른 지역이나 키워드로 다시 검색해주세요.
        </div>
      `;
    }
  } catch (error) {
    console.error(error);
    dom.listLoading.textContent =
      "데이터를 불러오지 못했습니다. API 키와 네트워크 상태를 확인해주세요.";
  }
}

async function fetchKeywordResults(keyword, rows = 80) {
  const normalizedKeyword = normalizeKeyword(keyword);
  const keywords = getKeywordVariants(normalizedKeyword);

  const searchRequests = keywords.map(async (searchKeyword) => {
    try {
      const data = await requestGoCamping("/searchList", {
        numOfRows: rows,
        pageNo: 1,
        keyword: searchKeyword,
      });

      return normalizeItems(data);
    } catch (error) {
      console.warn(`${searchKeyword} 검색 실패`, error);
      return [];
    }
  });

  const searchSettled = await Promise.allSettled(searchRequests);

  let items = searchSettled
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value);

  const baseItems = await fetchBaseListByKeywords(keywords);
  items = [...items, ...baseItems];

  return dedupeItems(items);
}

async function fetchBaseListByKeywords(keywords) {
  const pageNumbers = [1, 2, 3, 4, 5];

  const requests = pageNumbers.map(async (pageNo) => {
    try {
      const data = await requestGoCamping("/basedList", {
        numOfRows: 100,
        pageNo,
      });

      return normalizeItems(data);
    } catch (error) {
      console.warn(`기본 목록 ${pageNo}페이지 로드 실패`, error);
      return [];
    }
  });

  const settled = await Promise.allSettled(requests);

  const allItems = settled
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value);

  return allItems.filter((item) => {
    const target = searchTarget(item);

    return keywords.some((keyword) =>
      target.includes(String(keyword).toLowerCase()),
    );
  });
}

function searchTarget(item) {
  return [
    item.facltNm,
    item.addr1,
    item.addr2,
    item.doNm,
    item.sigunguNm,
    item.induty,
    item.lctCl,
    item.themaEnvrnCl,
    item.lineIntro,
    item.intro,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function normalizeKeyword(keyword) {
  const value = String(keyword || "").trim();

  if (value === "강원" || value === "강원도" || value === "강원특별자치도") {
    return "강원";
  }

  return value;
}

function getKeywordVariants(keyword) {
  const normalizedKeyword = normalizeKeyword(keyword);

  if (normalizedKeyword === "강원") {
    return ["강원", "강원도", "강원특별자치도"];
  }

  return [normalizedKeyword];
}

/* ===============================
   저장소 / 키워드
================================ */
function getStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getRecentKeywords() {
  return getStorage(RECENT_KEY, []);
}

function saveRecentKeyword(keyword) {
  const normalizedKeyword = normalizeKeyword(keyword);

  const next = [
    normalizedKeyword,
    ...getRecentKeywords().filter((item) => item !== normalizedKeyword),
  ].slice(0, 8);

  setStorage(RECENT_KEY, next);
}

function clearRecentKeywords() {
  localStorage.removeItem(RECENT_KEY);
  renderRecentKeywords();
}

function renderRecentKeywords() {
  const recentKeywords = getRecentKeywords();

  renderKeywordBox(dom.recentKeywordsTop, recentKeywords.slice(0, 5));
  renderKeywordBox(dom.recentKeywordsBottom, RECOMMEND_KEYWORDS);
}

function renderKeywordBox(container, keywords) {
  container.innerHTML = "";

  if (!keywords.length) {
    container.innerHTML = `<p class="empty-keyword">최근 검색어가 없습니다.</p>`;
    return;
  }

  const uniqueKeywords = [...new Set(keywords.map(normalizeKeyword))];

  uniqueKeywords.forEach((keyword) => {
    const normalizedKeyword = normalizeKeyword(keyword);
    const button = document.createElement("button");

    button.type = "button";
    button.className = "keyword-btn";
    button.textContent = normalizedKeyword;

    button.addEventListener("click", () => {
      dom.searchInput.value = normalizedKeyword;
      saveRecentKeyword(normalizedKeyword);
      renderRecentKeywords();
      fetchCampingList(normalizedKeyword);
    });

    container.appendChild(button);
  });
}

/* ===============================
   리스트 / 즐겨찾기
================================ */
function renderResultList(items) {
  dom.resultList.innerHTML = "";

  items.forEach((camp, index) => {
    dom.resultList.appendChild(createResultCard(camp, index, "list"));
  });
}

function createResultCard(camp, index, sourceScreen) {
  const card = document.createElement("article");

  const image = camp.firstImageUrl || camp.firstImageUrl2 || DEFAULT_IMAGE;
  const name = camp.facltNm || "캠핑장 이름 없음";
  const addr = camp.addr1 || "주소 정보 없음";
  const tags = makeTags(camp).slice(0, 2);

  card.className = "result-card";

  card.innerHTML = `
    <div class="result-thumb">
      <img src="${escapeHTML(image)}" alt="${escapeHTML(name)}" />
    </div>

    <div class="result-info">
      <h3>${escapeHTML(name)}</h3>
      <p>${escapeHTML(addr)}</p>

      <div class="result-meta">
        ${tags.map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}
        <span class="distance">${makeDistance(index)}</span>
      </div>
    </div>

    <button type="button" class="bookmark-btn ${isFavorite(camp) ? "active" : ""}" aria-label="즐겨찾기">
      ${bookmarkIcon()}
    </button>
  `;

  card.addEventListener("click", () => {
    setLastScreen(sourceScreen);
    renderDetail(camp);
    showScreen("detail", activeNavKey);
  });

  card.querySelector(".bookmark-btn").addEventListener("click", (e) => {
    e.stopPropagation();

    toggleFavorite(camp);
    e.currentTarget.classList.toggle("active", isFavorite(camp));

    if (sourceScreen === "favorites") {
      renderFavorites(false);
    }
  });

  return card;
}

function renderFavorites(move = true) {
  if (move) showScreen("favorites", "favorites");

  setLastScreen("favorites");
  dom.favoriteList.innerHTML = "";

  const favIds = getFavorites();
  const favItems = getFavoriteItems();

  if (!favIds.length || !favItems.length) {
    dom.favoriteList.innerHTML = `
      <div class="empty-result">
        아직 즐겨찾기한 캠핑장이 없습니다.<br />
        검색 결과나 지도에서 북마크를 눌러 저장해보세요.
      </div>
    `;
    return;
  }

  favItems.forEach((camp, index) => {
    dom.favoriteList.appendChild(createResultCard(camp, index, "favorites"));
  });
}

function clearFavorites() {
  localStorage.removeItem(FAVORITE_KEY);
  localStorage.removeItem(FAVORITE_DATA_KEY);
  renderFavorites();
}

function getFavorites() {
  return getStorage(FAVORITE_KEY, []);
}

function getFavoriteDataMap() {
  return getStorage(FAVORITE_DATA_KEY, {});
}

function getFavoriteItems() {
  const favIds = getFavorites();
  const savedMap = getFavoriteDataMap();

  return favIds
    .map((id) => {
      const loaded = allLoadedItems.find((item) => getCampId(item) === id);
      return loaded || savedMap[id];
    })
    .filter(Boolean);
}

function getCampId(camp) {
  return String(camp.contentId || `${camp.facltNm}-${camp.addr1}`);
}

function isFavorite(camp) {
  return getFavorites().includes(getCampId(camp));
}

function toggleFavorite(camp) {
  const id = getCampId(camp);
  const prev = getFavorites();
  const dataMap = getFavoriteDataMap();

  const next = prev.includes(id)
    ? prev.filter((item) => item !== id)
    : [...prev, id];

  if (next.includes(id)) {
    dataMap[id] = camp;
  } else {
    delete dataMap[id];
  }

  setStorage(FAVORITE_KEY, next);
  setStorage(FAVORITE_DATA_KEY, dataMap);
}

function mergeLoadedItems(items) {
  const map = new Map(allLoadedItems.map((item) => [getCampId(item), item]));

  items.forEach((item) => {
    map.set(getCampId(item), item);
  });

  allLoadedItems = [...map.values()];
}

/* ===============================
   카카오맵 공통
================================ */
function loadKakaoMapScript() {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");

    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_JS_KEY}&autoload=false`;
    script.async = true;

    script.onload = () => window.kakao.maps.load(resolve);
    script.onerror = () => reject(new Error("카카오맵 스크립트 로드 실패"));

    document.head.appendChild(script);
  });
}

function clearMapObjects() {
  kakaoMarkers.forEach((marker) => marker.setMap(null));
  kakaoOverlays.forEach((overlay) => overlay.setMap(null));

  kakaoMarkers = [];
  kakaoOverlays = [];
}

function clearMarkerObjects() {
  kakaoMarkers.forEach((marker) => marker.setMap(null));
  kakaoMarkers = [];
}

function clearOverlayObjects() {
  kakaoOverlays.forEach((overlay) => overlay.setMap(null));
  kakaoOverlays = [];
}

function initEmptyKakaoMap() {
  const mapContainer = $("#kakaoMap");
  const center = new kakao.maps.LatLng(36.4, 127.9);

  if (!kakaoMap) {
    kakaoMap = new kakao.maps.Map(mapContainer, {
      center,
      level: 12,
    });
  } else {
    kakaoMap.relayout();
    kakaoMap.setCenter(center);
    kakaoMap.setLevel(12);
  }

  kakaoMap.relayout();
}

/* ===============================
   지도 뒤로가기
================================ */
function handleMapBackButton(e) {
  if (isFocusedMarkerMode) {
    e.preventDefault();
    e.stopImmediatePropagation();

    clearFocusedMarkerMode();
    return;
  }

  showScreen("search", "search");
}

function clearFocusedMarkerMode() {
  isFocusedMarkerMode = false;
  focusedMarkerItems = [];

  clearMapObjects();
  dom.mapCardWrap.innerHTML = "";

  if (kakaoMap) {
    kakaoMap.setCenter(new kakao.maps.LatLng(36.4, 127.9));
    kakaoMap.setLevel(12);
  }

  showMapGuide("지역 선택을 해제했습니다.", 1200);

  setTimeout(() => {
    renderClusterLevel();
  }, 120);
}

/* ===============================
   전국 지도
================================ */
async function openClusterMap() {
  showScreen("map", "map");
  setLastScreen("map");
  isClusterMode = true;
  isFocusedMarkerMode = false;
  focusedMarkerItems = [];

  dom.mapCardWrap.innerHTML = "";
  showMapGuide("전국 캠핑장 데이터를 불러오는 중입니다.", 0);

  try {
    await loadKakaoMapScript();
    initEmptyKakaoMap();

    if (allMapLoaded && clusterSourceItems.length) {
      initClusterMap();
      return;
    }

    await loadRegionalSamples();
    allMapLoaded = true;

    initClusterMap();
  } catch (error) {
    console.error(error);
    showMapError();
  }
}

async function loadRegionalSamples() {
  const cachedItems = getValidMapCache();

  if (cachedItems.length) {
    clusterSourceItems = cachedItems;
    mapResults = cachedItems;
    mergeLoadedItems(cachedItems);
    return;
  }

  const allItems = await fetchMapBaseListPages(MAP_BASE_PAGE_COUNT);

  clusterSourceItems = allItems
    .filter((item) => item.mapX && item.mapY)
    .map((item) => ({
      ...item,
      regionName: getRegionName(item),
    }))
    .filter((item) =>
      REGION_INFO.some((region) => region.name === item.regionName),
    );

  clusterSourceItems = dedupeItems(clusterSourceItems);
  mapResults = clusterSourceItems;

  setMapCache(clusterSourceItems);
  mergeLoadedItems(clusterSourceItems);
}

async function fetchMapBaseListPages(maxPages = 8) {
  const pageNumbers = Array.from({ length: maxPages }, (_, index) => index + 1);

  const requests = pageNumbers.map(async (pageNo) => {
    try {
      const data = await requestGoCamping("/basedList", {
        numOfRows: 100,
        pageNo,
      });

      return normalizeItems(data);
    } catch (error) {
      console.warn(`지도 목록 ${pageNo}페이지 로드 실패`, error);
      return [];
    }
  });

  const settled = await Promise.allSettled(requests);

  return settled
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value);
}

function getValidMapCache() {
  try {
    const cachedTime = Number(localStorage.getItem(MAP_CACHE_TIME_KEY));
    const cachedItems = JSON.parse(localStorage.getItem(MAP_CACHE_KEY)) || [];

    if (!cachedTime || !cachedItems.length) return [];

    const isValid = Date.now() - cachedTime < MAP_CACHE_TTL;

    return isValid ? cachedItems : [];
  } catch {
    return [];
  }
}

function setMapCache(items) {
  try {
    localStorage.setItem(MAP_CACHE_KEY, JSON.stringify(items));
    localStorage.setItem(MAP_CACHE_TIME_KEY, String(Date.now()));
  } catch {
    console.warn("지도 캐시 저장 실패");
  }
}

function initClusterMap() {
  clearMapObjects();
  initEmptyKakaoMap();

  const source = clusterSourceItems.length ? clusterSourceItems : mapResults;

  if (!source.length) {
    showMapGuide("표시할 캠핑장 좌표가 없습니다.", 2600);

    dom.mapCardWrap.innerHTML = `
      <div class="map-card">
        <div></div>
        <div>
          <h3>지도 정보 없음</h3>
          <p>캠핑장 좌표 데이터를 불러오지 못했습니다.</p>
        </div>
      </div>
    `;
    return;
  }

  hideMapGuide();

  if (!mapZoomHandlerReady) {
    kakao.maps.event.addListener(kakaoMap, "zoom_changed", () => {
      if (isClusterMode) renderClusterLevel();
    });

    kakao.maps.event.addListener(kakaoMap, "dragend", () => {
      if (isClusterMode) renderClusterLevel();
    });

    mapZoomHandlerReady = true;
  }

  renderClusterLevel();
}

function renderClusterLevel() {
  if (!kakaoMap || !window.kakao) return;

  const level = kakaoMap.getLevel();
  const source = clusterSourceItems.length ? clusterSourceItems : mapResults;

  if (isFocusedMarkerMode) {
    clearOverlayObjects();

    if (!kakaoMarkers.length && focusedMarkerItems.length) {
      renderExactMarkers(focusedMarkerItems);
    }

    return;
  }

  clearMapObjects();
  dom.mapCardWrap.innerHTML = "";

  if (level >= 10) {
    renderRegionClusters(source);
    return;
  }

  if (level >= 7) {
    renderAreaClusters(source);
    return;
  }

  renderExactMarkers(source);
}

function renderRegionClusters(items) {
  REGION_INFO.forEach((region) => {
    const group = items.filter((item) => getRegionName(item) === region.name);

    if (!group.length) return;

    addClusterOverlay(
      region.name,
      group.length,
      region.lat,
      region.lng,
      group,
      false,
    );
  });
}

function renderAreaClusters(items) {
  const grid = {};

  items.forEach((item) => {
    const lat = Number(item.mapY);
    const lng = Number(item.mapX);

    if (!lat || !lng) return;

    const key = `${Math.round(lat * 2) / 2}_${Math.round(lng * 2) / 2}`;

    if (!grid[key]) grid[key] = [];
    grid[key].push(item);
  });

  Object.values(grid).forEach((group) => {
    const lat = average(group, "mapY");
    const lng = average(group, "mapX");
    const label = group[0].sigunguNm || getRegionName(group[0]);

    addClusterOverlay(label, group.length, lat, lng, group, true);
  });
}

function addClusterOverlay(label, count, lat, lng, group, small) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = `cluster-marker ${small ? "small" : ""}`;
  button.innerHTML = `<strong>${escapeHTML(label)}</strong><span>${count}곳</span>`;

  button.addEventListener("click", () => {
    if (!group.length) {
      showMapGuide(`${label}에 표시할 캠핑장이 없습니다.`, 2200);
      return;
    }

    showExactMarkerGroup(group, label);
  });

  const overlay = new kakao.maps.CustomOverlay({
    position: new kakao.maps.LatLng(Number(lat), Number(lng)),
    content: button,
    yAnchor: 0.5,
  });

  overlay.setMap(kakaoMap);
  kakaoOverlays.push(overlay);
}

function showExactMarkerGroup(group, label) {
  isFocusedMarkerMode = true;
  focusedMarkerItems = group;

  clearMapObjects();
  dom.mapCardWrap.innerHTML = "";

  renderExactMarkers(group);
  fitGroupBounds(group);

  showMapGuide(
    `${label} 캠핑장 ${group.length}곳을 표시했습니다. 뒤로가기를 누르면 지역 선택이 해제됩니다.`,
    2600,
  );
}

function renderExactMarkers(items) {
  if (!items.length) {
    showMapGuide("표시할 캠핑장이 없습니다.", 1800);
    return;
  }

  clearMarkerObjects();

  items.forEach((camp, index) => {
    const position = new kakao.maps.LatLng(
      Number(camp.mapY),
      Number(camp.mapX),
    );

    const marker = new kakao.maps.Marker({
      position,
      map: kakaoMap,
    });

    kakao.maps.event.addListener(marker, "click", () => {
      kakaoMap.panTo(position);
      renderMapCard(camp, index);
    });

    kakaoMarkers.push(marker);
  });

  renderMapCard(items[0], 0);
}

function fitGroupBounds(items) {
  if (!items.length || !kakaoMap || !window.kakao) return;

  const bounds = new kakao.maps.LatLngBounds();

  items.forEach((item) => {
    if (!item.mapX || !item.mapY) return;

    bounds.extend(new kakao.maps.LatLng(Number(item.mapY), Number(item.mapX)));
  });

  kakaoMap.setBounds(bounds);
}

function renderMapCard(camp, index) {
  const image = camp.firstImageUrl || camp.firstImageUrl2 || DEFAULT_IMAGE;
  const name = camp.facltNm || "캠핑장 이름 없음";
  const addr = camp.addr1 || "주소 정보 없음";
  const tags = makeTags(camp).slice(0, 2);

  dom.mapCardWrap.innerHTML = `
    <article class="map-card">
      <img src="${escapeHTML(image)}" alt="${escapeHTML(name)}" />

      <div>
        <h3>${escapeHTML(name)}</h3>
        <p>${escapeHTML(addr)}</p>

        <div class="tag-row">
          ${tags.map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}
          <span class="distance">${makeDistance(index)}</span>
        </div>
      </div>
    </article>
  `;

  dom.mapCardWrap.querySelector(".map-card").addEventListener("click", () => {
    setLastScreen("map");
    renderDetail(camp);
    showScreen("detail", "map");
  });
}

function showMapGuide(message, duration = 2200) {
  if (!dom.mapGuide) return;

  dom.mapGuide.textContent = message;
  dom.mapGuide.classList.add("show");

  clearTimeout(showMapGuide.timer);

  if (duration > 0) {
    showMapGuide.timer = setTimeout(() => {
      hideMapGuide();
    }, duration);
  }
}

function hideMapGuide() {
  if (!dom.mapGuide) return;

  dom.mapGuide.classList.remove("show");
}

function showMapError() {
  showMapGuide("지도를 불러오지 못했습니다.", 2600);

  dom.mapCardWrap.innerHTML = `
    <div class="map-card">
      <div></div>
      <div>
        <h3>지도를 불러오지 못했습니다</h3>
        <p>API 키와 카카오맵 키를 확인해주세요.</p>
      </div>
    </div>
  `;
}

/* ===============================
   상세 화면
================================ */
function renderDetail(camp) {
  const image = camp.firstImageUrl || camp.firstImageUrl2 || DEFAULT_IMAGE;
  const name = camp.facltNm || "캠핑장 이름 없음";
  const addr = camp.addr1 || "주소 정보 없음";
  const tags = makeTags(camp).slice(0, 7);

  dom.detailTitle.textContent = name;

  dom.detailContent.innerHTML = `
    <div class="detail-hero">
      <img src="${escapeHTML(image)}" alt="${escapeHTML(name)}" />
    </div>

    <section class="detail-main-card">
      <div class="detail-title-row">
        <h2>${escapeHTML(name)}</h2>
        <p class="addr">${escapeHTML(addr)}</p>
      </div>

      <button type="button" class="bookmark-btn detail-bookmark ${isFavorite(camp) ? "active" : ""}" aria-label="즐겨찾기">
        ${bookmarkIcon()}
      </button>

      <div class="detail-action-row single">
        <button type="button" class="detail-action-btn" id="directionBtn">길찾기</button>
      </div>
    </section>

    <section class="detail-section">
      <h3>캠핑장 위치</h3>
      <div class="detail-map-box" id="detailMapBox"></div>
    </section>

    <section class="detail-section">
      <h3>편의시설</h3>
      <div class="facility-list">
        <div class="facility-card"><span>화장실</span><strong>${camp.toiletCo || 0}개</strong></div>
        <div class="facility-card"><span>샤워실</span><strong>${camp.swrmCo || 0}개</strong></div>
        <div class="facility-card"><span>개수대</span><strong>${camp.wtrplCo || 0}개</strong></div>
        <div class="facility-card"><span>전기</span><strong>${camp.sbrsCl && camp.sbrsCl.includes("전기") ? "가능" : "확인"}</strong></div>
      </div>
    </section>

    <section class="detail-section">
      <h3>키워드</h3>
      <div class="keyword-detail">
        ${tags.map((tag) => `<span>#${escapeHTML(tag)}</span>`).join("")}
      </div>
    </section>

    <section class="detail-section">
      <h3>캠핑장 소개</h3>
      <p class="detail-desc">
        ${escapeHTML(camp.intro || camp.lineIntro || camp.featureNm || "등록된 소개 정보가 없습니다.")}
      </p>
    </section>

    <section class="detail-section">
      <h3>이용 정보</h3>
      <p class="detail-desc">
        운영기간 ${escapeHTML(camp.operPdCl || "정보 없음")} · 운영일 ${escapeHTML(camp.operDeCl || "정보 없음")}<br />
        업종 ${escapeHTML(camp.induty || "정보 없음")} · 입지 ${escapeHTML(camp.lctCl || "정보 없음")}
      </p>
    </section>
  `;

  dom.detailContent
    .querySelector(".detail-bookmark")
    .addEventListener("click", (e) => {
      toggleFavorite(camp);
      e.currentTarget.classList.toggle("active", isFavorite(camp));
    });

  $("#directionBtn").addEventListener("click", () => openDirection(camp));

  setTimeout(() => initDetailMap(camp), 80);
}

async function initDetailMap(camp) {
  const box = $("#detailMapBox");

  if (!box) return;

  if (!camp.mapX || !camp.mapY) {
    box.innerHTML = `<div class="empty-result">지도 좌표 정보가 없습니다.</div>`;
    return;
  }

  try {
    await loadKakaoMapScript();

    const position = new kakao.maps.LatLng(
      Number(camp.mapY),
      Number(camp.mapX),
    );

    detailMap = new kakao.maps.Map(box, {
      center: position,
      level: 4,
    });

    new kakao.maps.Marker({
      position,
      map: detailMap,
    });

    detailMap.relayout();
  } catch (error) {
    box.innerHTML = `<div class="empty-result">지도를 불러오지 못했습니다.</div>`;
  }
}

function openDirection(camp) {
  const destinationName = encodeURIComponent(camp.facltNm || "캠핑장");

  if (!camp.mapX || !camp.mapY) {
    window.open(
      `https://map.kakao.com/link/search/${destinationName}`,
      "_blank",
    );
    return;
  }

  if (!navigator.geolocation) {
    openKakaoDirectionWithoutLocation(camp);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const startLat = position.coords.latitude;
      const startLng = position.coords.longitude;
      const endLat = Number(camp.mapY);
      const endLng = Number(camp.mapX);

      const url =
        `https://map.kakao.com/?sName=${encodeURIComponent("내 위치")}` +
        `&sX=${startLng}&sY=${startLat}` +
        `&eName=${destinationName}` +
        `&eX=${endLng}&eY=${endLat}`;

      window.open(url, "_blank");
    },
    () => {
      openKakaoDirectionWithoutLocation(camp);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 60000,
    },
  );
}

function openKakaoDirectionWithoutLocation(camp) {
  const destinationName = encodeURIComponent(camp.facltNm || "캠핑장");

  window.open(
    `https://map.kakao.com/link/to/${destinationName},${camp.mapY},${camp.mapX}`,
    "_blank",
  );
}

/* ===============================
   유틸
================================ */
function makeTags(camp) {
  const raw = [camp.induty, camp.lctCl, camp.themaEnvrnCl]
    .filter(Boolean)
    .join(",");

  const tags = raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (!tags.length) return ["차크닉", "캠핑"];
  return [...new Set(tags)];
}

function makeDistance(index) {
  return ["11.1km", "8.4km", "6.7km", "13.2km", "3.8km"][index % 5];
}

function average(items, key) {
  return items.reduce((sum, item) => sum + Number(item[key]), 0) / items.length;
}

function getRegionName(item) {
  if (item.regionName) return item.regionName;

  const text = [item.doNm, item.addr1].join(" ");

  if (text.includes("서울")) return "서울";
  if (text.includes("부산")) return "부산";
  if (text.includes("대구")) return "대구";
  if (text.includes("인천")) return "인천";
  if (text.includes("광주")) return "광주";
  if (text.includes("대전")) return "대전";
  if (text.includes("울산")) return "울산";
  if (text.includes("세종")) return "세종";
  if (text.includes("경기")) return "경기도";
  if (text.includes("강원")) return "강원";
  if (text.includes("충북") || text.includes("충청북도")) return "충청북도";
  if (text.includes("충남") || text.includes("충청남도")) return "충청남도";
  if (text.includes("전북") || text.includes("전라북도")) return "전라북도";
  if (text.includes("전남") || text.includes("전라남도")) return "전라남도";
  if (text.includes("경북") || text.includes("경상북도")) return "경상북도";
  if (text.includes("경남") || text.includes("경상남도")) return "경상남도";
  if (text.includes("제주")) return "제주";

  return "경기도";
}

function dedupeItems(items) {
  const map = new Map();

  items.forEach((item) => {
    map.set(getCampId(item), item);
  });

  return [...map.values()];
}

function bookmarkIcon() {
  return `
    <svg class="bookmark-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 4.5C6 3.7 6.7 3 7.5 3H16.5C17.3 3 18 3.7 18 4.5V21L12 17.5L6 21V4.5Z" />
    </svg>
  `;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
