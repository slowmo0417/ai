const KAKAO_JAVASCRIPT_KEY = "cc8c124f8a594a01e630a3c43ae4349a";

const LOCATION_CACHE_KEY = "lotteriaUserLocation";
const LOCATION_CACHE_MAX_AGE = 1000 * 60 * 60 * 24;

const MY_MENU_KEY = "myMenuItems";
const CART_ITEMS_KEY = "cartItems";

let heroTrack = null;
let heroSlides = [];
let realHeroSlides = [];
let heroPagination = null;

let currentHeroIndex = 1;
let heroStartX = 0;
let heroMoveX = 0;
let isHeroDragging = false;
let heroAutoTimer = null;
let heroPointerId = null;

/* =========================
   메인 히어로 슬라이더
========================= */
let heroTrack = null;
let heroSlides = [];
let realHeroSlides = [];
let heroPagination = null;

let currentHeroIndex = 1;
let heroStartX = 0;
let heroMoveX = 0;
let isHeroDragging = false;
let isHeroAnimating = false; // [추가] 애니메이션 중 중복 동작 방지 락(Lock)
let heroAutoTimer = null;
let heroPointerId = null;

function initHeroSlider() {
  heroTrack = document.querySelector("#heroTrack");
  heroPagination = document.querySelector("#heroPagination");

  if (!heroTrack || !heroPagination) return;

  realHeroSlides = Array.from(heroTrack.querySelectorAll(".hero-slide"));
  if (!realHeroSlides.length) return;

  if (heroTrack.dataset.heroReady === "true") return;
  heroTrack.dataset.heroReady = "true";

  heroPagination.innerHTML = "";

  if (realHeroSlides.length === 1) {
    currentHeroIndex = 0;
    heroTrack.style.transform = "translateX(0%)";
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-dot is-active";
    dot.setAttribute("aria-label", "1번째 배너 보기");
    heroPagination.appendChild(dot);
    return;
  }

  // 무한 루프를 위한 클론 생성
  const firstClone = realHeroSlides[0].cloneNode(true);
  const lastClone = realHeroSlides[realHeroSlides.length - 1].cloneNode(true);

  firstClone.classList.add("is-clone", "is-clone-first");
  lastClone.classList.add("is-clone", "is-clone-last");

  heroTrack.insertBefore(lastClone, realHeroSlides[0]);
  heroTrack.appendChild(firstClone);

  heroSlides = Array.from(heroTrack.querySelectorAll(".hero-slide"));
  currentHeroIndex = 1;

  // 초기 위치 설정
  heroTrack.style.transition = "none";
  heroTrack.style.transform = `translateX(${-currentHeroIndex * 100}%)`;
  
  // Reflow 강제 실행 (초기 세팅 확정)
  void heroTrack.offsetWidth;

  realHeroSlides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-dot";
    dot.setAttribute("aria-label", `${index + 1}번째 배너 보기`);

    if (index === 0) dot.classList.add("is-active");

    dot.addEventListener("click", () => {
      if (isHeroAnimating) return; // 애니메이션 중 클릭 방지
      moveHero(index + 1);
      restartHeroAutoSlide();
    });

    heroPagination.appendChild(dot);
  });

  // 이벤트 리스너
  heroTrack.addEventListener("pointerdown", startHeroDrag);
  heroTrack.addEventListener("pointermove", moveHeroDrag);
  window.addEventListener("pointerup", endHeroDrag); // 드래그가 밖으로 나갈 때를 대비해 window에 이벤트
  window.addEventListener("pointercancel", endHeroDrag);
  heroTrack.addEventListener("transitionend", fixHeroLoopPosition);

  // 슬라이드 내 버튼/링크 드래그 시 클릭 방지
  heroTrack.addEventListener("click", (e) => {
    if (Math.abs(heroMoveX) > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  startHeroAutoSlide();
}

function startHeroDrag(event) {
  if (!heroTrack || isHeroAnimating) return; // 애니메이션 중 드래그 무시
  
  // 마우스 우클릭 등 방지
  if (event.button !== 0 && event.type === 'pointerdown') return;

  isHeroDragging = true;
  heroPointerId = event.pointerId;
  heroStartX = event.clientX;
  heroMoveX = 0;

  stopHeroAutoSlide();

  heroTrack.classList.add("is-dragging");
  if (typeof heroTrack.setPointerCapture === "function") {
    heroTrack.setPointerCapture(heroPointerId);
  }
  heroTrack.style.transition = "none";
}

function moveHeroDrag(event) {
  if (!isHeroDragging || !heroTrack) return;

  heroMoveX = event.clientX - heroStartX;
  
  // 개별 슬라이드의 너비를 기준으로 비율 계산 (트랙 전체 너비 X)
  const slideWidth = realHeroSlides[0].clientWidth;
  const movePercent = (heroMoveX / slideWidth) * 100;

  // 저항 효과 (끝에 도달했을 때 뻑뻑하게 움직임 - 선택사항)
  heroTrack.style.transform = `translateX(${-(currentHeroIndex * 100) + movePercent}%)`;
}

function endHeroDrag(event) {
  if (!isHeroDragging || !heroTrack) return;

  isHeroDragging = false;

  if (heroPointerId !== null && typeof heroTrack.releasePointerCapture === "function") {
    try { heroTrack.releasePointerCapture(heroPointerId); } catch(e) {}
  }
  heroPointerId = null;

  heroTrack.classList.remove("is-dragging");
  heroTrack.style.transition = "transform 0.35s ease";

  const slideWidth = realHeroSlides[0].clientWidth;
  const threshold = slideWidth * 0.15; // 15% 이상 드래그해야 넘어감

  // 드래그 거리가 임계점을 넘었는지 확인
  if (heroMoveX < -threshold) {
    moveHero(currentHeroIndex + 1); // 다음으로
  } else if (heroMoveX > threshold) {
    moveHero(currentHeroIndex - 1); // 이전으로
  } else {
    moveHero(currentHeroIndex); // 제자리로 복귀
  }

  restartHeroAutoSlide();
}

function moveHero(index) {
  if (!heroTrack || !heroSlides.length) return;

  isHeroAnimating = true; // 트랜지션 락 걸기
  currentHeroIndex = index;
  heroTrack.style.transition = "transform 0.35s ease";
  heroTrack.style.transform = `translateX(${-currentHeroIndex * 100}%)`;

  updateHeroPagination();
}

function fixHeroLoopPosition(event) {
  if (!heroTrack || !realHeroSlides.length) return;
  
  // 자식 요소의 transitionend 이벤트 버블링 방지
  if (event && event.target !== heroTrack) return;

  isHeroAnimating = false; // 트랜지션 락 해제

  // 첫 번째 클론(0번 인덱스)에 도달했을 때 -> 진짜 마지막 슬라이드로 몰래 이동
  if (currentHeroIndex === 0) {
    currentHeroIndex = realHeroSlides.length;
    heroTrack.style.transition = "none"; // 트랜지션 끄기
    heroTrack.style.transform = `translateX(${-currentHeroIndex * 100}%)`;
    void heroTrack.offsetWidth; // 브라우저 Reflow 강제 발생 (핵심)
  }

  // 마지막 클론(length + 1)에 도달했을 때 -> 진짜 첫 번째 슬라이드로 몰래 이동
  if (currentHeroIndex === realHeroSlides.length + 1) {
    currentHeroIndex = 1;
    heroTrack.style.transition = "none";
    heroTrack.style.transform = `translateX(${-currentHeroIndex * 100}%)`;
    void heroTrack.offsetWidth; // 브라우저 Reflow 강제 발생 (핵심)
  }
}

function updateHeroPagination() {
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  if (!dots.length || !realHeroSlides.length) return;

  let realIndex = currentHeroIndex - 1;

  if (currentHeroIndex === 0) {
    realIndex = realHeroSlides.length - 1;
  } else if (currentHeroIndex === realHeroSlides.length + 1) {
    realIndex = 0;
  }

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === realIndex);
  });
}

function nextHero() {
  if (!isHeroAnimating) {
    moveHero(currentHeroIndex + 1);
  }
}

function startHeroAutoSlide() {
  stopHeroAutoSlide();
  heroAutoTimer = window.setInterval(nextHero, 3000);
}

function stopHeroAutoSlide() {
  if (!heroAutoTimer) return;
  window.clearInterval(heroAutoTimer);
  heroAutoTimer = null;
}

function restartHeroAutoSlide() {
  stopHeroAutoSlide();
  startHeroAutoSlide();
}

/* =========================
   가로 드래그
========================= */

function enableHorizontalDrag(selector) {
  document.querySelectorAll(selector).forEach((scrollArea) => {
    if (scrollArea.dataset.dragReady === "true") return;
    scrollArea.dataset.dragReady = "true";

    let isDown = false;
    let startDragX = 0;
    let startScrollLeft = 0;
    let pointerId = null;

    scrollArea.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button, a")) return;

      isDown = true;
      pointerId = event.pointerId;
      startDragX = event.clientX;
      startScrollLeft = scrollArea.scrollLeft;

      scrollArea.classList.add("is-dragging");
      scrollArea.setPointerCapture(event.pointerId);
    });

    scrollArea.addEventListener("pointermove", (event) => {
      if (!isDown) return;

      const distance = event.clientX - startDragX;
      scrollArea.scrollLeft = startScrollLeft - distance;
    });

    function endDrag() {
      if (!isDown) return;

      isDown = false;

      if (pointerId !== null && scrollArea.hasPointerCapture(pointerId)) {
        scrollArea.releasePointerCapture(pointerId);
      }

      pointerId = null;
      scrollArea.classList.remove("is-dragging");
    }

    scrollArea.addEventListener("pointerup", endDrag);
    scrollArea.addEventListener("pointercancel", endDrag);
    scrollArea.addEventListener("pointerleave", endDrag);
  });
}

/* =========================
   카카오 위치 / 매장
========================= */

function loadKakaoMapSdk() {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps?.services) {
      resolve();
      return;
    }

    if (
      !KAKAO_JAVASCRIPT_KEY ||
      KAKAO_JAVASCRIPT_KEY === "여기에_카카오_JavaScript_KEY_입력"
    ) {
      reject(new Error("카카오 JavaScript 키가 설정되지 않았습니다."));
      return;
    }

    const existingScript = document.querySelector("#kakaoMapSdk");

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => {
          window.kakao.maps.load(resolve);
        },
        { once: true },
      );

      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");

    script.id = "kakaoMapSdk";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&libraries=services&autoload=false`;

    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(new Error("카카오맵 객체를 찾을 수 없습니다."));
        return;
      }

      window.kakao.maps.load(() => {
        if (!window.kakao?.maps?.services) {
          reject(new Error("카카오 Places 서비스를 찾을 수 없습니다."));
          return;
        }

        resolve();
      });
    };

    script.onerror = () => {
      reject(new Error("카카오맵 SDK 로드에 실패했습니다."));
    };

    document.head.appendChild(script);
  });
}

function saveLocationCache(latitude, longitude) {
  localStorage.setItem(
    LOCATION_CACHE_KEY,
    JSON.stringify({
      latitude,
      longitude,
      savedAt: Date.now(),
    }),
  );
}

function getLocationCache() {
  try {
    const rawData = localStorage.getItem(LOCATION_CACHE_KEY);

    if (!rawData) return null;

    const location = JSON.parse(rawData);

    if (
      !Number.isFinite(location.latitude) ||
      !Number.isFinite(location.longitude) ||
      !Number.isFinite(location.savedAt)
    ) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }

    const isExpired = Date.now() - location.savedAt > LOCATION_CACHE_MAX_AGE;

    if (isExpired) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }

    return location;
  } catch (error) {
    localStorage.removeItem(LOCATION_CACHE_KEY);
    return null;
  }
}

function formatDistance(distance) {
  const meter = Number(distance);

  if (!Number.isFinite(meter)) return "거리정보 없음";
  if (meter >= 1000) return `${(meter / 1000).toFixed(1)}km`;

  return `${Math.round(meter)}m`;
}

function renderLocationRequired() {
  const storeList = document.querySelector("#storeList");
  if (!storeList) return;

  storeList.innerHTML = `
    <article class="store-state-card is-disabled">
      <div class="store-state-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.5C8.3 2.5 5.3 5.5 5.3 9.2C5.3 14.15 12 21.5 12 21.5C12 21.5 18.7 14.15 18.7 9.2C18.7 5.5 15.7 2.5 12 2.5ZM12 11.65C10.65 11.65 9.55 10.55 9.55 9.2C9.55 7.85 10.65 6.75 12 6.75C13.35 6.75 14.45 7.85 14.45 9.2C14.45 10.55 13.35 11.65 12 11.65Z" />
        </svg>
      </div>

      <div class="store-state-text">
        <h3 class="store-name">위치 정보 승인이 필요해요</h3>
        <p class="store-address">내 위치 기준 가까운 매장 2개를 확인할 수 있어요.</p>
      </div>

      <button type="button" class="primary-pill location-allow-btn" id="locationAllowButton">
        위치 승인
      </button>
    </article>
  `;
}

function renderStoreLoading() {
  const storeList = document.querySelector("#storeList");
  if (!storeList) return;

  storeList.innerHTML = `
    <article class="store-state-card is-disabled">
      <div class="store-state-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.5C8.3 2.5 5.3 5.5 5.3 9.2C5.3 14.15 12 21.5 12 21.5C12 21.5 18.7 14.15 18.7 9.2C18.7 5.5 15.7 2.5 12 2.5ZM12 11.65C10.65 11.65 9.55 10.55 9.55 9.2C9.55 7.85 10.65 6.75 12 6.75C13.35 6.75 14.45 7.85 14.45 9.2C14.45 10.55 13.35 11.65 12 11.65Z" />
        </svg>
      </div>

      <div class="store-state-text">
        <h3 class="store-name">가까운 매장을 찾는 중이에요</h3>
        <p class="store-address">현재 위치 기준으로 롯데리아 매장을 검색하고 있어요.</p>
      </div>

      <button type="button" class="primary-pill location-allow-btn" disabled>
        검색중
      </button>
    </article>
  `;
}

function renderStoreSearchFailed() {
  const storeList = document.querySelector("#storeList");
  if (!storeList) return;

  storeList.innerHTML = `
    <article class="store-state-card is-disabled">
      <div class="store-state-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 17H13V15H11V17ZM11 13H13V7H11V13ZM12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22Z" />
        </svg>
      </div>

      <div class="store-state-text">
        <h3 class="store-name">가까운 매장을 찾지 못했어요</h3>
        <p class="store-address">잠시 후 다시 시도하거나 위치 권한을 확인해주세요.</p>
      </div>

      <button type="button" class="primary-pill location-allow-btn" id="locationAllowButton">
        재시도
      </button>
    </article>
  `;
}

function renderStores(stores) {
  const storeList = document.querySelector("#storeList");
  if (!storeList) return;

  storeList.innerHTML = stores
    .slice(0, 2)
    .map((store) => {
      const name = (store.place_name || "롯데리아").replace(/^롯데리아\s*/, "");
      const address =
        store.road_address_name || store.address_name || "주소 정보 없음";
      const distance = formatDistance(store.distance);

      return `
        <article class="store-card">
          <div class="store-top">
            <h3 class="store-name">${name}</h3>
            <span class="store-badge">주문가능</span>
          </div>

          <p class="store-address">${address}</p>
          <p class="store-distance">${distance}</p>

          <button type="button" class="store-star" aria-label="즐겨찾기" aria-pressed="false">
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 2.8L14.85 8.55L21.2 9.47L16.6 13.95L17.68 20.28L12 17.3L6.32 20.28L7.4 13.95L2.8 9.47L9.15 8.55L12 2.8Z" />
            </svg>
          </button>

          <button type="button" class="primary-pill store-order">
            주문하기
          </button>
        </article>
      `;
    })
    .join("");
}

async function searchNearbyLotteriaStores(latitude, longitude) {
  try {
    await loadKakaoMapSdk();
  } catch (error) {
    console.error(error);
    renderStoreSearchFailed();
    return;
  }

  const places = new window.kakao.maps.services.Places();
  const location = new window.kakao.maps.LatLng(latitude, longitude);

  places.keywordSearch(
    "롯데리아",
    (data, status) => {
      if (status !== window.kakao.maps.services.Status.OK || !data.length) {
        console.warn("롯데리아 검색 실패:", status, data);
        renderStoreSearchFailed();
        return;
      }

      const stores = data
        .filter((place) => place.place_name.includes("롯데리아"))
        .slice(0, 2);

      if (!stores.length) {
        renderStoreSearchFailed();
        return;
      }

      renderStores(stores);
    },
    {
      location,
      radius: 20000,
      size: 15,
      sort: window.kakao.maps.services.SortBy.DISTANCE,
    },
  );
}

function initNearbyStores() {
  if (!navigator.geolocation) {
    renderLocationRequired();
    return;
  }

  const cachedLocation = getLocationCache();

  if (cachedLocation) {
    renderStoreLoading();

    searchNearbyLotteriaStores(
      cachedLocation.latitude,
      cachedLocation.longitude,
    );

    return;
  }

  renderStoreLoading();

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      saveLocationCache(latitude, longitude);
      searchNearbyLotteriaStores(latitude, longitude);
    },
    (error) => {
      console.warn("위치 권한 또는 위치 조회 실패:", error);
      renderLocationRequired();
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000 * 60 * 5,
    },
  );
}

function initStoreEvents() {
  if (document.body.dataset.storeEventsReady === "true") return;
  document.body.dataset.storeEventsReady = "true";

  document.addEventListener("click", (event) => {
    const locationButton = event.target.closest("#locationAllowButton");

    if (locationButton) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      initNearbyStores();
      return;
    }

    const starButton = event.target.closest(".store-star");

    if (!starButton) return;

    starButton.classList.toggle("is-active");

    const isActive = starButton.classList.contains("is-active");
    starButton.setAttribute("aria-pressed", String(isActive));
  });
}

/* =========================
   나만의 메뉴 / 장바구니
========================= */

function getMyMenuItems() {
  try {
    const rawData = localStorage.getItem(MY_MENU_KEY);
    const items = rawData ? JSON.parse(rawData) : [];

    return Array.isArray(items) ? items : [];
  } catch (error) {
    localStorage.removeItem(MY_MENU_KEY);
    return [];
  }
}

function saveMyMenuItems(items) {
  localStorage.setItem(MY_MENU_KEY, JSON.stringify(items));
}

function getCartItems() {
  try {
    const rawData = localStorage.getItem(CART_ITEMS_KEY);
    const items = rawData ? JSON.parse(rawData) : [];

    return Array.isArray(items) ? items : [];
  } catch (error) {
    localStorage.removeItem(CART_ITEMS_KEY);
    return [];
  }
}

function saveCartItems(items) {
  localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(items));

  if (typeof window.updateCartCountBadge === "function") {
    window.updateCartCountBadge();
  }
}

function createCartItemFromMyMenu(menu) {
  const menuName = menu.name || "선택 메뉴";
  const originalName = menu.originalName || menu.burger || menuName;
  const setType = menu.setType || "single";

  return {
    id: `${menu.id || menuName}-${Date.now()}`,
    menuId: menu.id || "",
    name: menuName,
    originalName,
    price: Number(menu.price) || 0,
    image: menu.image || "",
    quantity: 1,

    setType,
    burger: menu.burger || originalName,
    side: menu.side || "",
    drink: menu.drink || "",
    sideImage: menu.sideImage || "",
    drinkImage: menu.drinkImage || "",
  };
}

function addMyMenuToCart(menu) {
  const cartItems = getCartItems();
  const cartItem = createCartItemFromMyMenu(menu);

  cartItems.push(cartItem);
  saveCartItems(cartItems);

  window.location.href = "./cart.html";
}

function removeMyMenuItem(menuId) {
  const myMenuItems = getMyMenuItems();
  const nextItems = myMenuItems.filter((item) => item.id !== menuId);

  saveMyMenuItems(nextItems);
  renderMyPickItems();
}

function createDefaultMyMenuCard() {
  return `
    <div class="pick-card my-menu-empty-card">
      <span class="pick-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3C7.04 3 3 7.04 3 12C3 16.96 7.04 21 12 21C16.96 21 21 16.96 21 12C21 7.04 16.96 3 12 3ZM16.4 12.9H12.9V16.4H11.1V12.9H7.6V11.1H11.1V7.6H12.9V11.1H16.4V12.9Z" />
        </svg>
      </span>

      <p class="pick-desc">
        나만의 메뉴를 등록해<br>빠르게 주문해보세요!
      </p>

      <button type="button" class="primary-pill" data-menu-link>
        등록하기
      </button>
    </div>
  `;
}

function renderMyPickItems() {
  const myPickList = document.querySelector("#myPickList");

  if (!myPickList) return;

  const myMenuItems = getMyMenuItems();

  myPickList.querySelectorAll(".my-menu-card").forEach((card) => {
    card.remove();
  });

  const emptyCard = myPickList.querySelector(".my-menu-empty-card");

  if (!myMenuItems.length) {
    if (emptyCard) {
      emptyCard.style.display = "";
    } else {
      myPickList.insertAdjacentHTML("beforeend", createDefaultMyMenuCard());
    }

    return;
  }

  if (emptyCard) emptyCard.style.display = "none";

  myMenuItems.forEach((menu) => {
    const card = document.createElement("div");
    card.className = "pick-card my-menu-card";

    const image = menu.image || "./images/img.png";
    const name = menu.name || "선택 메뉴";
    const price = Number(menu.price || 0).toLocaleString();

    card.innerHTML = `
      <button type="button" class="my-menu-delete" aria-label="${name} 나만의 메뉴 삭제">
        ×
      </button>

      <div class="my-menu-thumb">
        <img src="${image}" alt="${name}">
      </div>

      <p class="pick-desc my-menu-desc">
        <span class="my-menu-name">${name}</span>
        <strong>${price}원</strong>
      </p>

      <button type="button" class="primary-pill my-menu-order-btn">
        주문하기
      </button>
    `;

    const orderButton = card.querySelector(".my-menu-order-btn");
    const deleteButton = card.querySelector(".my-menu-delete");

    orderButton.addEventListener("click", () => {
      addMyMenuToCart(menu);
    });

    deleteButton.addEventListener("click", () => {
      removeMyMenuItem(menu.id);
    });

    myPickList.appendChild(card);
  });
}

function initMenuLinkButton() {
  if (document.body.dataset.menuLinkReady === "true") return;
  document.body.dataset.menuLinkReady = "true";

  document.addEventListener("click", (event) => {
    const menuLinkButton = event.target.closest("[data-menu-link]");

    if (!menuLinkButton) return;

    window.location.href = "./menu.html";
  });
}

/* =========================
   초기 실행
========================= */

function refreshMainDynamicData() {
  renderMyPickItems();

  if (typeof window.updateCartCountBadge === "function") {
    window.updateCartCountBadge();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initHeroSlider();

  enableHorizontalDrag(".pick-grid");
  enableHorizontalDrag(".store-list");
  enableHorizontalDrag(".horizontal-scroll");

  initStoreEvents();
  initMenuLinkButton();
  refreshMainDynamicData();

  const cachedLocation = getLocationCache();

  if (cachedLocation) {
    initNearbyStores();
  } else {
    renderLocationRequired();
  }
});

window.addEventListener("pageshow", () => {
  refreshMainDynamicData();
});

window.addEventListener("storage", (event) => {
  if (event.key === MY_MENU_KEY || event.key === CART_ITEMS_KEY) {
    refreshMainDynamicData();
  }
});
