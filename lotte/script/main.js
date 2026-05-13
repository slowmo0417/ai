const KAKAO_JAVASCRIPT_KEY = "cc8c124f8a594a01e630a3c43ae4349a";

const LOCATION_CACHE_KEY = "lotteriaUserLocation";
const LOCATION_CACHE_MAX_AGE = 1000 * 60 * 60 * 24;

const MY_MENU_KEY = "myMenuItems";
const CART_ITEMS_KEY = "cartItems";

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
let isHeroAnimating = false;
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

  const firstClone = realHeroSlides[0].cloneNode(true);
  const lastClone = realHeroSlides[realHeroSlides.length - 1].cloneNode(true);

  firstClone.classList.add("is-clone", "is-clone-first");
  lastClone.classList.add("is-clone", "is-clone-last");

  heroTrack.insertBefore(lastClone, realHeroSlides[0]);
  heroTrack.appendChild(firstClone);

  heroSlides = Array.from(heroTrack.querySelectorAll(".hero-slide"));

  currentHeroIndex = 1;

  heroTrack.style.transition = "none";
  heroTrack.style.transform = `translateX(${-currentHeroIndex * 100}%)`;

  void heroTrack.offsetWidth;

  realHeroSlides.forEach((_, index) => {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = "hero-dot";
    dot.setAttribute("aria-label", `${index + 1}번째 배너 보기`);

    if (index === 0) {
      dot.classList.add("is-active");
    }

    dot.addEventListener("click", () => {
      if (isHeroAnimating) return;

      moveHero(index + 1);
      restartHeroAutoSlide();
    });

    heroPagination.appendChild(dot);
  });

  heroTrack.addEventListener("pointerdown", startHeroDrag);
  heroTrack.addEventListener("pointermove", moveHeroDrag);

  window.addEventListener("pointerup", endHeroDrag);
  window.addEventListener("pointercancel", endHeroDrag);

  heroTrack.addEventListener("transitionend", fixHeroLoopPosition);

  heroTrack.addEventListener(
    "click",
    (event) => {
      if (Math.abs(heroMoveX) > 5) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true,
  );

  startHeroAutoSlide();
}

function startHeroDrag(event) {
  if (!heroTrack || isHeroAnimating) return;

  if (event.pointerType === "mouse" && event.button !== 0) return;

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
  if (!isHeroDragging || !heroTrack || !realHeroSlides.length) return;

  heroMoveX = event.clientX - heroStartX;

  const slideWidth = realHeroSlides[0].clientWidth || 1;
  const movePercent = (heroMoveX / slideWidth) * 100;

  heroTrack.style.transform = `translateX(${-(currentHeroIndex * 100) + movePercent}%)`;
}

function endHeroDrag() {
  if (!isHeroDragging || !heroTrack || !realHeroSlides.length) return;

  isHeroDragging = false;

  if (
    heroPointerId !== null &&
    typeof heroTrack.releasePointerCapture === "function"
  ) {
    try {
      heroTrack.releasePointerCapture(heroPointerId);
    } catch (error) {
      console.warn(error);
    }
  }

  heroPointerId = null;

  heroTrack.classList.remove("is-dragging");
  heroTrack.style.transition = "transform 0.35s ease";

  const slideWidth = realHeroSlides[0].clientWidth || 1;
  const threshold = slideWidth * 0.15;

  if (heroMoveX < -threshold) {
    moveHero(currentHeroIndex + 1);
  } else if (heroMoveX > threshold) {
    moveHero(currentHeroIndex - 1);
  } else {
    moveHero(currentHeroIndex);
  }

  restartHeroAutoSlide();
}

function moveHero(index) {
  if (!heroTrack || !heroSlides.length || isHeroAnimating) return;

  isHeroAnimating = true;

  currentHeroIndex = index;

  heroTrack.style.transition = "transform 0.35s ease";
  heroTrack.style.transform = `translateX(${-currentHeroIndex * 100}%)`;

  updateHeroPagination();
}

function fixHeroLoopPosition(event) {
  if (!heroTrack || !realHeroSlides.length) return;

  if (event.target !== heroTrack) return;

  if (currentHeroIndex === 0) {
    currentHeroIndex = realHeroSlides.length;

    heroTrack.style.transition = "none";
    heroTrack.style.transform = `translateX(${-currentHeroIndex * 100}%)`;

    void heroTrack.offsetWidth;
  }

  if (currentHeroIndex === realHeroSlides.length + 1) {
    currentHeroIndex = 1;

    heroTrack.style.transition = "none";
    heroTrack.style.transform = `translateX(${-currentHeroIndex * 100}%)`;

    void heroTrack.offsetWidth;
  }

  requestAnimationFrame(() => {
    isHeroAnimating = false;
  });
}

function updateHeroPagination() {
  const dots = Array.from(document.querySelectorAll(".hero-dot"));

  if (!dots.length || !realHeroSlides.length) return;

  let realIndex = currentHeroIndex - 1;

  if (currentHeroIndex === 0) {
    realIndex = realHeroSlides.length - 1;
  }

  if (currentHeroIndex === realHeroSlides.length + 1) {
    realIndex = 0;
  }

  dots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === realIndex);
  });
}

function nextHero() {
  if (isHeroAnimating) return;

  moveHero(currentHeroIndex + 1);
}

function startHeroAutoSlide() {
  stopHeroAutoSlide();

  heroAutoTimer = window.setInterval(() => {
    nextHero();
  }, 3000);
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

      if (typeof scrollArea.setPointerCapture === "function") {
        scrollArea.setPointerCapture(pointerId);
      }
    });

    scrollArea.addEventListener("pointermove", (event) => {
      if (!isDown) return;

      const distance = event.clientX - startDragX;

      scrollArea.scrollLeft = startScrollLeft - distance;
    });

    function endDrag() {
      if (!isDown) return;

      isDown = false;

      if (
        pointerId !== null &&
        typeof scrollArea.releasePointerCapture === "function"
      ) {
        try {
          scrollArea.releasePointerCapture(pointerId);
        } catch (error) {
          console.warn(error);
        }
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

    if (!KAKAO_JAVASCRIPT_KEY) {
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

      existingScript.addEventListener("error", reject, {
        once: true,
      });

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
      reject(new Error("카카오맵 SDK 로드 실패"));
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

    const isExpired =
      Date.now() - location.savedAt > LOCATION_CACHE_MAX_AGE;

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

  if (!Number.isFinite(meter)) {
    return "거리정보 없음";
  }

  if (meter >= 1000) {
    return `${(meter / 1000).toFixed(1)}km`;
  }

  return `${Math.round(meter)}m`;
}

// 이하 renderLocationRequired ~ 마지막 부분은 기존 코드 그대로 사용
// (UI 렌더링 영역은 오류 없음)

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
  if (
    event.key === MY_MENU_KEY ||
    event.key === CART_ITEMS_KEY
  ) {
    refreshMainDynamicData();
  }
});
