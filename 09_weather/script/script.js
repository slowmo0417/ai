const API_KEY = "4d5b8db0803e1d10af88435320e8b7c7";
const GEO_BASE_URL = "https://api.openweathermap.org/geo/1.0/direct";
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const AIR_BASE_URL = "https://api.openweathermap.org/data/2.5/air_pollution";

const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const locationBtn = document.getElementById("locationBtn");
const statusText = document.getElementById("statusText");
const suggestionsList = document.getElementById("suggestionsList");

const cityNameEl = document.getElementById("cityName");
const weatherDescEl = document.getElementById("weatherDesc");
const currentTempEl = document.getElementById("currentTemp");
const windSpeedEl = document.getElementById("windSpeed");
const humidityEl = document.getElementById("humidity");
const feelsLikeEl = document.getElementById("feelsLike");
const ozoneEl = document.getElementById("ozone");

let suggestionTimer = null;
let latestKeyword = "";

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.classList.toggle("error", isError);
}

function hideSuggestions() {
  suggestionsList.classList.add("hidden");
  suggestionsList.innerHTML = "";
}

function renderSuggestions(cities) {
  if (!cities.length) {
    hideSuggestions();
    return;
  }

  suggestionsList.innerHTML = cities
    .map((city, index) => {
      const state = city.state ? `${city.state}, ` : "";
      const country = city.country || "";
      const localName =
        city.local_names?.ko || city.local_names?.en || city.name;

      return `
              <li>
                <button type="button" class="suggestion-item" data-index="${index}">
                  <span class="suggestion-city">${localName}</span>
                  <span class="suggestion-meta">${state}${country}</span>
                </button>
              </li>
            `;
    })
    .join("");

  suggestionsList.classList.remove("hidden");
}

function validateApiKey() {
  if (!API_KEY || API_KEY === "YOUR_API_KEY") {
    setStatus("API 키를 먼저 삽입해주세요.", true);
    return false;
  }
  return true;
}

function formatTemp(value) {
  return Math.round(value);
}

function formatNumber(value, digits = 0) {
  return Number(value).toFixed(digits);
}

function translateErrorMessage(message) {
  const errorMap = {
    "city not found": "일치하는 도시를 찾을 수 없습니다.",
    "nothing to geocode": "도시명을 입력해주세요.",
    "invalid api key": "API 키가 올바르지 않습니다.",
    unauthorized: "API 인증에 실패했습니다.",
    "failed to fetch": "네트워크 연결을 확인해주세요.",
  };

  const normalizedMessage = String(message || "")
    .trim()
    .toLowerCase();
  return (
    errorMap[normalizedMessage] ||
    "오류가 발생했습니다. 잠시 후 다시 시도해주세요."
  );
}

function updateWeatherUI(weatherData, airData) {
  const city = weatherData.name;
  const country = weatherData.sys?.country
    ? `, ${weatherData.sys.country}`
    : "";
  const description = weatherData.weather?.[0]?.description || "";
  const temp = formatTemp(weatherData.main.temp);
  const wind = formatNumber(weatherData.wind.speed, 2);
  const humidity = Math.round(weatherData.main.humidity);
  const feelsLike = formatTemp(weatherData.main.feels_like);
  const ozone = airData?.list?.[0]?.components?.o3 ?? 0;

  cityNameEl.textContent = `${city}${country}`;
  weatherDescEl.textContent = description;
  currentTempEl.textContent = temp;
  windSpeedEl.textContent = wind;
  humidityEl.textContent = humidity;
  feelsLikeEl.textContent = feelsLike;
  ozoneEl.textContent = Math.round(ozone);
}

async function fetchAirPollution(lat, lon) {
  const url = `${AIR_BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("대기 정보를 가져오지 못했습니다.");
  }

  return response.json();
}

async function fetchCoordinatesByCity(city) {
  const keyword = city.trim();
  const url = `${GEO_BASE_URL}?q=${encodeURIComponent(keyword)}&limit=1&appid=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("도시 위치 정보를 불러오지 못했습니다.");
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("일치하는 도시를 찾을 수 없습니다.");
  }

  return data[0];
}

async function fetchCitySuggestions(keyword) {
  const url = `${GEO_BASE_URL}?q=${encodeURIComponent(keyword)}&limit=5&appid=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

async function fetchWeatherByCoords(lat, lon) {
  const url = `${WEATHER_BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(translateErrorMessage(data.message));
  }

  return data;
}

async function handleCitySearch(city) {
  if (!validateApiKey()) return;
  if (!city.trim()) {
    setStatus("도시명을 입력해주세요.", true);
    cityInput.focus();
    return;
  }

  try {
    hideSuggestions();
    setStatus("날씨 정보를 불러오는 중입니다...");
    const locationData = await fetchCoordinatesByCity(city.trim());
    const weatherData = await fetchWeatherByCoords(
      locationData.lat,
      locationData.lon,
    );
    const airData = await fetchAirPollution(locationData.lat, locationData.lon);
    updateWeatherUI(weatherData, airData);
    setStatus("");
  } catch (error) {
    setStatus(error.message || "검색 중 오류가 발생했습니다.", true);
  }
}

async function handleCurrentLocation() {
  if (!validateApiKey()) return;

  if (!navigator.geolocation) {
    setStatus("이 브라우저에서는 위치 정보를 지원하지 않습니다.", true);
    return;
  }

  setStatus("현재 위치를 확인하는 중입니다...");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const weatherData = await fetchWeatherByCoords(latitude, longitude);
        const airData = await fetchAirPollution(latitude, longitude);
        updateWeatherUI(weatherData, airData);
        setStatus("");
      } catch (error) {
        setStatus(
          error.message || "현재 위치 날씨를 불러오지 못했습니다.",
          true,
        );
      }
    },
    (error) => {
      let message = "위치 정보를 가져오지 못했습니다.";

      if (error.code === 1) message = "위치 권한이 거부되었습니다.";
      if (error.code === 2) message = "현재 위치를 확인할 수 없습니다.";
      if (error.code === 3) message = "위치 확인 시간이 초과되었습니다.";

      setStatus(message, true);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  );
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleCitySearch(cityInput.value);
});

locationBtn.addEventListener("click", handleCurrentLocation);

suggestionsList.addEventListener("click", (event) => {
  const button = event.target.closest(".suggestion-item");
  if (!button) return;

  cityInput.value = button.querySelector(".suggestion-city").textContent;
  hideSuggestions();
  handleCitySearch(cityInput.value);
});

cityInput.addEventListener("focus", () => {
  cityInput.value = "";
  setStatus("");
});

cityInput.addEventListener("input", () => {
  const keyword = cityInput.value.trim();
  latestKeyword = keyword;

  clearTimeout(suggestionTimer);
  setStatus("");

  if (!API_KEY || API_KEY === "YOUR_API_KEY") {
    hideSuggestions();
    return;
  }

  if (keyword.length < 2) {
    hideSuggestions();
    return;
  }

  suggestionTimer = setTimeout(async () => {
    try {
      const currentKeyword = latestKeyword;
      const cities = await fetchCitySuggestions(currentKeyword);

      if (
        currentKeyword !== latestKeyword ||
        currentKeyword !== cityInput.value.trim()
      ) {
        return;
      }

      renderSuggestions(cities);
    } catch (error) {
      hideSuggestions();
    }
  }, 250);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".search-box")) {
    hideSuggestions();
  }
});

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleCitySearch(cityInput.value);
  }
});
