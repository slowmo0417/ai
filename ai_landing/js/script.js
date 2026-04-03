const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzC3c-VLwx5_rk0j0UU7Co-WtDK2Hhv49fV-7_siPqa6ufJjy8wwOzD7xZ6N2n09kzS5g/exec";

/**
 * 밤 10시(22:00)까지 남은 시간을 계산하여 타이머를 업데이트합니다.
 */
function updateTimer() {
  const now = new Date();

  // 목표 시간 설정 (오늘 밤 10시)
  const target = new Date();
  target.setHours(22, 0, 0, 0);

  // 만약 현재 시간이 밤 10시를 넘었다면 다음 날 밤 10시를 목표로 설정
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }

  // 남은 시간 계산 (밀리초 차이)
  const diff = target - now;

  // 시, 분, 초 추출
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // 문자열 변환 (2자리 유지)
  const h = String(hours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");
  const s = String(seconds).padStart(2, "0");

  // DOM 요소 업데이트
  const elements = {
    h1: document.getElementById("h1"),
    h2: document.getElementById("h2"),
    m1: document.getElementById("m1"),
    m2: document.getElementById("m2"),
    s1: document.getElementById("s1"),
    s2: document.getElementById("s2"),
  };

  if (elements.h1) elements.h1.textContent = h[0];
  if (elements.h2) elements.h2.textContent = h[1];
  if (elements.m1) elements.m1.textContent = m[0];
  if (elements.m2) elements.m2.textContent = m[1];
  if (elements.s1) elements.s1.textContent = s[0];
  if (elements.s2) elements.s2.textContent = s[1];
}

// 초기 실행 및 1초마다 반복
updateTimer();
setInterval(updateTimer, 1000);

let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function submitEvent() {
  const selectedPrizeRadio = document.querySelector(
    'input[name="prize"]:checked',
  );
  if (!selectedPrizeRadio) {
    showToast("상품을 선택해 주세요.");
    return;
  }

  const prizeName = selectedPrizeRadio.value;
  document.getElementById("selectedPrizeName").value = prizeName;
  document.getElementById("prizeDisplayName").textContent = prizeName;

  openModal();
}

function openModal() {
  document.getElementById("applicationModal").style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("applicationModal").style.display = "none";
  document.body.style.overflow = "auto";
}

// 구글 시트 폼 전송 핸들러
document
  .getElementById("applyForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById("finalSubmitBtn");
    const quizAnswer = document.querySelector(".answer-input").value.trim();

    const params = new URLSearchParams();
    const formData = new FormData(this);

    for (const [key, value] of formData.entries()) {
      params.append(key, value);
    }

    params.append("QuizAnswer", quizAnswer || "미입력");

    submitBtn.disabled = true;
    submitBtn.textContent = "전송 중...";

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: params,
        mode: "no-cors",
      });

      showToast("응모가 성공적으로 완료되었습니다!");
      this.reset();
      closeModal();
      document.querySelector(".answer-input").value = "";
    } catch (error) {
      console.error("Error:", error);
      showToast("오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "신청 완료하기";
    }
  });

window.onclick = function (event) {
  const modal = document.getElementById("applicationModal");
  if (event.target == modal) {
    closeModal();
  }
};
