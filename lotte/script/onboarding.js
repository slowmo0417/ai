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
let startY = 0;
let currentX = 0;
let currentY = 0;
let isDragging = false;
let isTouching = false;
let isHorizontalDrag = false;

const SLIDE_EASE = "560ms cubic-bezier(0.22, 0.9, 0.26, 1)";
const DRAG_LIMIT_RATIO = 0.35;
const SWIPE_THRESHOLD_RATIO = 0.16;
const HORIZONTAL_LOCK_DISTANCE = 8;

function goToNaver() {
  window.location.href = NAVER_URL;
}

function clearTimers() {
  clearTimeout(autoTimer);
  clearTimeout(redirectTimer);

  autoTimer = null;
  redirectTimer = null;
}

function setTrackTranslate(value, unit = "%") {
  if (!track) return;

  const transformValue = `translate3d(${value}${unit}, 0, 0)`;

  track.style.transform = transformValue;
  track.style.webkitTransform = transformValue;
}

function setTrackTransition(enabled) {
  if (!track) return;

  if (!enabled) {
    track.style.transition = "none";
    track.style.webkitTransition = "none";
    return;
  }

  track.style.transition = `transform ${SLIDE_EASE}`;
  track.style.webkitTransition = `-webkit-transform ${SLIDE_EASE}`;
}

function updateButtonText() {
  if (!nextBtn) return;

  const isLast = currentIndex === totalSlides - 1;
  const text = isLast ? "시작하기" : "다음";

  if (nextBtnText) {
    nextBtnText.textContent = text;
    return;
  }

  nextBtn.textContent = text;
}

function updateDots() {
  dots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === currentIndex;

    dot.classList.toggle("active", isActive);

    if (isActive) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
  });
}

function updateSlide(index, shouldRestart = true) {
  if (!app || !track || totalSlides <= 0) return;

  currentIndex = Math.max(0, Math.min(index, totalSlides - 1));

  setTrackTransition(true);
  setTrackTranslate(-(currentIndex * (100 / totalSlides)));

  updateDots();

  app.classList.toggle("is-last", currentIndex === totalSlides - 1);
  updateButtonText();

  if (shouldRestart) {
    startAuto();
  }
}

function startAuto() {
  clearTimers();

  if (totalSlides <= 0) return;

  if (currentIndex < totalSlides - 1) {
    autoTimer = setTimeout(() => {
      updateSlide(currentIndex + 1);
    }, AUTO_DELAY);
    return;
  }

  redirectTimer = setTimeout(goToNaver, LAST_REDIRECT_DELAY);
}

function getPoint(event) {
  const touch =
    event.touches?.[0] || event.changedTouches?.[0] || event.targetTouches?.[0];

  if (touch) {
    return {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  return {
    x: event.clientX,
    y: event.clientY,
  };
}

function startDrag(event) {
  if (!app || !track || totalSlides <= 1) return;

  const point = getPoint(event);

  isDragging = true;
  isHorizontalDrag = false;

  startX = point.x;
  startY = point.y;
  currentX = point.x;
  currentY = point.y;

  setTrackTransition(false);
  clearTimers();

  if (event.pointerId !== undefined && track.setPointerCapture) {
    try {
      track.setPointerCapture(event.pointerId);
    } catch (error) {
      // iOS/Safari 일부 환경에서 setPointerCapture가 실패할 수 있어 무시
    }
  }
}

function moveDrag(event) {
  if (!isDragging || !app || !track) return;

  const point = getPoint(event);

  currentX = point.x;
  currentY = point.y;

  const dragX = currentX - startX;
  const dragY = currentY - startY;

  if (!isHorizontalDrag) {
    isHorizontalDrag =
      Math.abs(dragX) > HORIZONTAL_LOCK_DISTANCE &&
      Math.abs(dragX) > Math.abs(dragY);
  }

  /*
    iOS Safari 대응:
    가로 슬라이드라고 판단된 경우에만 기본 스크롤/제스처를 막음.
    touchmove listener가 passive:false여야 preventDefault가 동작함.
  */
  if (isHorizontalDrag && event.cancelable) {
    event.preventDefault();
  }

  const appWidth = app.clientWidth;
  const baseTranslate = -currentIndex * appWidth;
  const limitedDistance = dragX * DRAG_LIMIT_RATIO;

  setTrackTranslate(baseTranslate + limitedDistance, "px");
}

function finishDrag() {
  if (!isDragging || !app) return;

  isDragging = false;

  const distance = currentX - startX;
  const threshold = app.clientWidth * SWIPE_THRESHOLD_RATIO;

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

function handleTouchStart(event) {
  isTouching = true;
  startDrag(event);
}

function handleTouchMove(event) {
  moveDrag(event);
}

function handleTouchEnd() {
  isTouching = false;
  finishDrag();
}

function handlePointerDown(event) {
  /*
    iOS Safari에서 touch 이벤트와 pointer 이벤트가 중복으로 들어오는 경우 방지
  */
  if (isTouching) return;

  startDrag(event);
}

function handlePointerMove(event) {
  if (isTouching) return;

  moveDrag(event);
}

function handlePointerEnd() {
  if (isTouching) return;

  finishDrag();
}

function bindEvents() {
  if (!track) return;

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentIndex === totalSlides - 1) {
        goToNaver();
        return;
      }

      updateSlide(currentIndex + 1);
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener("click", goToNaver);
  }

  /*
    Safari / iOS Safari 대응:
    PointerEvent 지원 여부와 관계없이 touch 이벤트를 함께 등록.
    기존처럼 if/else로 나누면 iOS에서 PointerEvent만 타고
    touch 대응이 빠질 수 있음.
  */
  track.addEventListener("touchstart", handleTouchStart, { passive: true });
  track.addEventListener("touchmove", handleTouchMove, { passive: false });
  track.addEventListener("touchend", handleTouchEnd);
  track.addEventListener("touchcancel", handleTouchEnd);

  if (window.PointerEvent) {
    track.addEventListener("pointerdown", handlePointerDown);
    track.addEventListener("pointermove", handlePointerMove);
    track.addEventListener("pointerup", handlePointerEnd);
    track.addEventListener("pointercancel", handlePointerEnd);
    track.addEventListener("pointerleave", handlePointerEnd);
  }

  window.addEventListener("blur", () => {
    finishDrag();
    clearTimers();
  });

  window.addEventListener("resize", () => {
    updateSlide(currentIndex, false);
  });
}

bindEvents();
updateSlide(0);
