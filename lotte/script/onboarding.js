const NAVER_URL = "./login.html";
const AUTO_DELAY = 2500;
const LAST_REDIRECT_DELAY = 3000;

const app = document.getElementById("app");
const track = document.getElementById("track");
const dots = Array.from(document.querySelectorAll(".dot"));
const nextBtn = document.getElementById("nextBtn");
const nextBtnText = document.querySelector(".next-btn-text");
const skipBtn = document.getElementById("skipBtn");

const totalSlides = dots.length;
let currentIndex = 0;
let autoTimer = null;
let redirectTimer = null;
let startX = 0;
let currentX = 0;
let isDragging = false;

function goToNaver() {
  window.location.href = NAVER_URL;
}

function clearTimers() {
  clearTimeout(autoTimer);
  clearTimeout(redirectTimer);
}

function setTrackTranslate(value, unit = "%") {
  const transformValue = `translate3d(${value}${unit}, 0, 0)`;
  track.style.transform = transformValue;
  track.style.webkitTransform = transformValue;
}

function setTrackTransition(value) {
  track.style.transition = value;
  track.style.webkitTransition = value.replace(
    "transform",
    "-webkit-transform",
  );
}

function updateButtonText() {
  const isLast = currentIndex === totalSlides - 1;
  const text = isLast ? "시작하기" : "다음";

  if (nextBtnText) {
    nextBtnText.textContent = text;
    return;
  }

  nextBtn.textContent = text;
}

function updateSlide(index, shouldRestart = true) {
  currentIndex = Math.max(0, Math.min(index, totalSlides - 1));

  setTrackTransition("transform 560ms cubic-bezier(0.22, 0.9, 0.26, 1)");
  setTrackTranslate(-(currentIndex * (100 / totalSlides)));

  dots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === currentIndex;

    dot.classList.toggle("active", isActive);

    if (isActive) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
  });

  app.classList.toggle("is-last", currentIndex === totalSlides - 1);
  updateButtonText();

  if (shouldRestart) {
    startAuto();
  }
}

function startAuto() {
  clearTimers();

  if (currentIndex < totalSlides - 1) {
    autoTimer = setTimeout(() => {
      updateSlide(currentIndex + 1);
    }, AUTO_DELAY);
    return;
  }

  redirectTimer = setTimeout(goToNaver, LAST_REDIRECT_DELAY);
}

nextBtn.addEventListener("click", () => {
  if (currentIndex === totalSlides - 1) {
    goToNaver();
    return;
  }

  updateSlide(currentIndex + 1);
});

skipBtn.addEventListener("click", goToNaver);

track.addEventListener("pointerdown", (event) => {
  isDragging = true;
  startX = event.clientX;
  currentX = event.clientX;

  setTrackTransition("none");
  clearTimers();
});

track.addEventListener("pointermove", (event) => {
  if (!isDragging) return;

  currentX = event.clientX;

  const appWidth = app.clientWidth;
  const baseTranslate = -currentIndex * appWidth;
  const dragDistance = currentX - startX;
  const limitedDistance = dragDistance * 0.35;

  setTrackTranslate(baseTranslate + limitedDistance, "px");
});

function finishDrag() {
  if (!isDragging) return;

  isDragging = false;

  const distance = currentX - startX;
  const threshold = app.clientWidth * 0.16;

  if (distance < -threshold && currentIndex < totalSlides - 1) {
    updateSlide(currentIndex + 1);
    return;
  }

  if (distance > threshold && currentIndex > 0) {
    updateSlide(currentIndex - 1);
    return;
  }

  updateSlide(currentIndex);
}

track.addEventListener("pointerup", finishDrag);
track.addEventListener("pointercancel", finishDrag);
track.addEventListener("pointerleave", finishDrag);

updateSlide(0);
