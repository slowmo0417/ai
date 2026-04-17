const OPEN_WEATHER_API_KEY = "4d5b8db0803e1d10af88435320e8b7c7";
const weatherLocationEl = document.getElementById("weatherLocation");
const weatherTempEl = document.getElementById("weatherTemp");
const weatherIconEl = document.getElementById("weatherIcon");
const weatherStatusEl = document.getElementById("weatherStatus");
const weatherErrorEl = document.getElementById("weatherError");

function showWeatherError(message) {
  weatherStatusEl.style.display = "none";
  weatherErrorEl.style.display = "block";
  weatherErrorEl.textContent = message;
  weatherLocationEl.textContent = "위치 확인 실패";
  weatherTempEl.innerHTML = "--<span>°</span>";
  weatherIconEl.src = "./images/weather-default.png";
  weatherIconEl.alt = "기본 날씨 아이콘";
}

function updateWeatherUI(data) {
  const locationName = data.name || "현재 위치";
  const temp =
    typeof data.main?.temp === "number" ? Math.round(data.main.temp) : "--";
  const weatherIcon = data.weather?.[0]?.icon || "01d";
  const description = data.weather?.[0]?.description || "날씨 정보";

  weatherLocationEl.textContent = locationName;
  weatherTempEl.innerHTML = `${temp}<span>°</span>`;
  weatherIconEl.src = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
  weatherIconEl.alt = description;
  weatherStatusEl.style.display = "none";
  weatherErrorEl.style.display = "none";
}

async function fetchWeatherByCoords(lat, lon) {
  if (!OPEN_WEATHER_API_KEY || OPEN_WEATHER_API_KEY === "YOUR_API_KEY_HERE") {
    throw new Error("OpenWeather API 키를 먼저 입력해주세요.");
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}&units=metric&lang=kr`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("API 키가 올바르지 않거나 아직 활성화되지 않았습니다.");
    }
    if (response.status === 429) {
      throw new Error("요청 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.");
    }
    throw new Error(
      data?.message
        ? `날씨 조회 실패: ${data.message}`
        : "날씨 데이터를 불러오지 못했습니다.",
    );
  }

  updateWeatherUI(data);
}

function getCurrentWeather() {
  const host = window.location.hostname;
  const isLocalhost =
    host === "localhost" || host === "127.0.0.1" || host === "::1";

  if (window.location.protocol === "file:") {
    showWeatherError(
      "HTML 파일을 직접 열지 말고 localhost 또는 127.0.0.1 서버로 실행해주세요.",
    );
    return;
  }

  if (!window.isSecureContext && !isLocalhost) {
    showWeatherError(
      "위치 기능은 HTTPS 또는 localhost(127.0.0.1)에서만 사용할 수 있습니다.",
    );
    return;
  }

  if (!navigator.geolocation) {
    showWeatherError("이 브라우저에서는 위치 서비스를 지원하지 않습니다.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        await fetchWeatherByCoords(latitude, longitude);
      } catch (error) {
        showWeatherError(
          error.message || "날씨 정보를 가져오는 중 오류가 발생했습니다.",
        );
        console.error("weather fetch error:", error);
      }
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        showWeatherError(
          "위치 권한을 허용하면 현재 위치 날씨를 볼 수 있습니다.",
        );
        return;
      }
      if (error.code === error.POSITION_UNAVAILABLE) {
        showWeatherError("현재 위치를 확인할 수 없습니다.");
        return;
      }
      if (error.code === error.TIMEOUT) {
        showWeatherError("위치 확인 시간이 초과되었습니다.");
        return;
      }
      showWeatherError("위치 정보를 가져오지 못했습니다.");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  );
}

getCurrentWeather();

(function initHeroSlider() {
  const slider = document.getElementById("heroSlider");
  const track = document.getElementById("heroTrack");
  const heroPaginationCurrent = document.getElementById(
    "heroPaginationCurrent",
  );
  const heroPaginationTotal = document.getElementById("heroPaginationTotal");
  const originalSlides = Array.from(track.children);

  if (!slider || !track || originalSlides.length === 0) return;

  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);

  track.insertBefore(lastClone, track.firstChild);
  track.appendChild(firstClone);

  let slides = Array.from(track.children);
  let currentIndex = 1;
  let slideWidth = 0;
  let isAnimating = false;
  let autoplayId = null;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  heroPaginationTotal.textContent = String(originalSlides.length);

  function visibleIndex() {
    if (currentIndex === 0) return originalSlides.length;
    if (currentIndex === originalSlides.length + 1) return 1;
    return currentIndex;
  }

  function updatePagination() {
    heroPaginationCurrent.textContent = String(visibleIndex());
  }

  function setSlideSizes() {
    slideWidth = slider.clientWidth;
  }

  function moveTo(index, animate = true) {
    track.style.transition = animate ? "transform 0.5s ease" : "none";
    track.style.transform = `translate3d(${-index * slideWidth}px, 0, 0)`;
    updatePagination();
  }

  function nextSlide() {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex += 1;
    moveTo(currentIndex, true);
  }

  function prevSlide() {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex -= 1;
    moveTo(currentIndex, true);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayId = window.setInterval(nextSlide, 2500);
  }

  function stopAutoplay() {
    if (autoplayId) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  function measure() {
    setSlideSizes();
    moveTo(currentIndex, false);
  }

  track.addEventListener("transitionend", () => {
    isAnimating = false;

    if (currentIndex === originalSlides.length + 1) {
      currentIndex = 1;
      moveTo(currentIndex, false);
    }

    if (currentIndex === 0) {
      currentIndex = originalSlides.length;
      moveTo(currentIndex, false);
    }
  });

  function onTouchStart(clientX) {
    stopAutoplay();
    isDragging = true;
    startX = clientX;
    currentX = clientX;
    track.style.transition = "none";
  }

  function onTouchMove(clientX) {
    if (!isDragging) return;
    currentX = clientX;
    const deltaX = currentX - startX;
    track.style.transform = `translate3d(${-(currentIndex * slideWidth) + deltaX}px, 0, 0)`;
  }

  function onTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    const diff = currentX - startX;
    const threshold = 45;

    if (diff <= -threshold) {
      nextSlide();
    } else if (diff >= threshold) {
      prevSlide();
    } else {
      moveTo(currentIndex, true);
    }

    startAutoplay();
  }

  slider.addEventListener(
    "touchstart",
    (e) => onTouchStart(e.touches[0].clientX),
    { passive: true },
  );
  slider.addEventListener(
    "touchmove",
    (e) => onTouchMove(e.touches[0].clientX),
    { passive: true },
  );
  slider.addEventListener("touchend", onTouchEnd);
  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  window.addEventListener("resize", measure);

  measure();
  startAutoplay();
})();

(function initGuideSlider() {
  const slider = document.getElementById("guideSlider");
  const track = document.getElementById("guideTrack");
  const prevBtn = document.getElementById("guidePrev");
  const nextBtn = document.getElementById("guideNext");
  const originalCards = Array.from(track.children);

  if (!slider || !track || !prevBtn || !nextBtn || originalCards.length === 0)
    return;

  const visibleCount = 2;
  const gap = 14;
  let currentIndex = visibleCount;
  let cardWidth = 0;
  let isAnimating = false;
  let autoplayId = null;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  const prependClones = originalCards
    .slice(-visibleCount)
    .map((card) => card.cloneNode(true));
  const appendClones = originalCards
    .slice(0, visibleCount)
    .map((card) => card.cloneNode(true));

  prependClones.forEach((clone) => track.insertBefore(clone, track.firstChild));
  appendClones.forEach((clone) => track.appendChild(clone));

  function measure() {
    const sliderWidth = slider.clientWidth;
    cardWidth = (sliderWidth - gap) / visibleCount;
    Array.from(track.children).forEach((card) => {
      card.style.flex = `0 0 ${cardWidth}px`;
    });
    moveTo(currentIndex, false);
  }

  function getTranslateX(index) {
    return -index * (cardWidth + gap);
  }

  function moveTo(index, animate = true) {
    track.style.transition = animate ? "transform 0.45s ease" : "none";
    track.style.transform = `translateX(${getTranslateX(index)}px)`;
  }

  function nextSlide() {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex += 1;
    moveTo(currentIndex, true);
  }

  function prevSlide() {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex -= 1;
    moveTo(currentIndex, true);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(nextSlide, 2500);
  }

  function stopAutoplay() {
    if (autoplayId) clearInterval(autoplayId);
  }

  track.addEventListener("transitionend", () => {
    isAnimating = false;

    if (currentIndex >= originalCards.length + visibleCount) {
      currentIndex = visibleCount;
      moveTo(currentIndex, false);
    }

    if (currentIndex < visibleCount) {
      currentIndex = originalCards.length + visibleCount - 1;
      moveTo(currentIndex, false);
    }
  });

  function onTouchStart(clientX) {
    stopAutoplay();
    isDragging = true;
    startX = clientX;
    currentX = clientX;
    track.style.transition = "none";
  }

  function onTouchMove(clientX) {
    if (!isDragging) return;
    currentX = clientX;
    const deltaX = currentX - startX;
    track.style.transform = `translateX(${getTranslateX(currentIndex) + deltaX}px)`;
  }

  function onTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    const diff = currentX - startX;
    const threshold = 45;

    if (diff <= -threshold) {
      nextSlide();
    } else if (diff >= threshold) {
      prevSlide();
    } else {
      moveTo(currentIndex, true);
    }

    startAutoplay();
  }

  prevBtn.addEventListener("click", () => {
    stopAutoplay();
    prevSlide();
    startAutoplay();
  });

  nextBtn.addEventListener("click", () => {
    stopAutoplay();
    nextSlide();
    startAutoplay();
  });

  slider.addEventListener(
    "touchstart",
    (e) => onTouchStart(e.touches[0].clientX),
    { passive: true },
  );
  slider.addEventListener(
    "touchmove",
    (e) => onTouchMove(e.touches[0].clientX),
    { passive: true },
  );
  slider.addEventListener("touchend", onTouchEnd);
  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  window.addEventListener("resize", measure);

  measure();
  startAutoplay();
})();
