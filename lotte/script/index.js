const loadingFill = document.querySelector(".loading-fill");
const loadingPercent = document.querySelector(".loading-percent");

const duration = 2500;
const targetUrl = "./onboarding.html";
const startTime = performance.now();

function updateLoading(now) {
  const elapsed = now - startTime;
  const progress = Math.min(elapsed / duration, 1);
  const percent = Math.floor(progress * 100);

  loadingFill.style.width = `${percent}%`;
  loadingPercent.textContent = `${percent}%`;

  if (progress < 1) {
    requestAnimationFrame(updateLoading);
  } else {
    loadingFill.style.width = "100%";
    loadingPercent.textContent = "100%";

    setTimeout(() => {
      window.location.href = targetUrl;
    }, 100);
  }
}

requestAnimationFrame(updateLoading);
