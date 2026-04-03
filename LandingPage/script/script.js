/* ==========================================
         1. Use Case 렌더링 로직
      ========================================== */
const ucData = [
  {
    icon: "📧",
    title: "이메일 작성",
    tagline: "상황만 설명하면, 정중하고 명확한 이메일을 30초 안에 완성합니다.",
    prompt:
      '"팀장님께 프로젝트 지연을 보고하는 이메일 써줘. 원인은 외부 업체 납품 지연이고, 대안은 2주 후 재일정 조율이야. 정중한 톤으로 작성해줘."',
    result:
      "30초 만에 군더더기 없는 완벽한 보고 이메일 완성. 직접 단어 고르며 고민할 때보다 훨씬 빠르고 퀄리티도 높음.",
  },
  {
    icon: "📊",
    title: "데이터 해석",
    tagline:
      "복잡한 엑셀 숫자를 붙여넣으면, 핵심 인사이트와 요약을 즉시 뽑아냅니다.",
    prompt:
      '"이번 달 매출 로우데이터야. 전월 대비 가장 큰 변화가 있는 3가지 포인트를 분석하고, 팀장님께 보고할 3줄 요약 만들어줘."',
    result:
      "숫자 나열 대신 의미 있는 인사이트로 변환 완료. 보고서 작성 준비 시간이 80% 단축됨.",
  },
  {
    icon: "📋",
    title: "회의 준비",
    tagline: "안건 키워드 몇 줄이면, 회의 흐름과 예상 질문까지 준비됩니다.",
    prompt:
      '"내일 신제품 런칭 전략 회의야. 참석자는 마케팅·영업·기획팀. 논의할 핵심 안건 3가지와 각 팀에서 나올 법한 예상 질문 뽑아줘."',
    result:
      "회의 어젠다, 흐름, 각 부서별 예상 질문과 디펜스 논리까지 정리 완료. 회의 주도권 확보.",
  },
  {
    icon: "🔍",
    title: "리서치 요약",
    tagline: "긴 문서나 기사를 넣으면, 핵심 3줄로 빠르게 파악할 수 있습니다.",
    prompt:
      '"이 20페이지짜리 영문 시장조사 보고서, 우리 회사의 의사결정에 필요한 핵심 내용만 한국어로 3줄 요약해줘."',
    result:
      "30분짜리 독서와 번역을 2분으로 단축. 핵심만 빠르게 파악하고 즉시 의사결정 가능.",
  },
  {
    icon: "✍️",
    title: "기획서 초안",
    tagline:
      "아이디어 메모를 입력하면, 논리적인 구조의 기획서 초안이 완성됩니다.",
    prompt:
      '"사내 AI 교육 프로그램 기획하려고 해. 목적, 교육 대상, 4주차 커리큘럼 구성을 포함해서 기획서 목차와 초안 만들어줘."',
    result:
      "머릿속에 흩어진 아이디어가 논리적인 6페이지 기획서 뼈대로 완성. 빈 화면의 막막함이 사라짐.",
  },
];

const ucListEl = document.getElementById("ucList");
const ucDetailEl = document.getElementById("ucDetail");

function renderList() {
  ucListEl.innerHTML = ucData
    .map(
      (d, i) => `
          <div class="uc-item ${i === 0 ? "active" : ""}" onclick="selectUC(${i})">
            <div class="uc-icon">${d.icon}</div>
            <div>
              <div class="uc-label">${d.title}</div>
              <div class="uc-sub">${d.tagline.substring(0, 25)}...</div>
            </div>
          </div>
        `,
    )
    .join("");
}

function selectUC(idx) {
  document
    .querySelectorAll(".uc-item")
    .forEach((el, i) => el.classList.toggle("active", i === idx));
  const d = ucData[idx];

  ucDetailEl.style.opacity = "0";
  ucDetailEl.style.transform = "translateY(10px)";

  setTimeout(() => {
    ucDetailEl.innerHTML = `
            <div class="uc-detail-head">
              <div class="uc-detail-icon">${d.icon}</div>
              <h3>${d.title}</h3>
            </div>
            <p class="tagline">${d.tagline}</p>
            
            <div class="chat-bubble prompt-box">
              <div class="bubble-label">👩‍💻 프롬프트 (나의 입력)</div>
              <div class="bubble-text">${d.prompt}</div>
            </div>
            
            <div class="arrow-row">↓</div>
            
            <div class="chat-bubble result-box">
              <div class="bubble-label">🤖 AI 결과 및 효과</div>
              <div class="bubble-text">✅ ${d.result}</div>
            </div>
          `;
    ucDetailEl.style.transition = "all 0.4s ease";
    ucDetailEl.style.opacity = "1";
    ucDetailEl.style.transform = "translateY(0)";
  }, 200);
}

renderList();
selectUC(0);

/* ==========================================
         2. Marquee 아이템 복제 (무한 롤링)
      ========================================== */
const track = document.getElementById("marqueeTrack");
track.innerHTML += track.innerHTML;

/* ==========================================
         3. 타이핑 효과 로직
      ========================================== */
const phrases = [
  "나는 AI로 더 창의적으로 일합니다",
  "나는 반복 대신 성장에 투자합니다",
  "나는 도구를 넘어 일하는 방식을 바꿉니다",
  "나는 AI와 함께 앞서갑니다",
];
let pi = 0,
  ci = 0,
  isDeleting = false;
const typedEl = document.getElementById("typed");

function typeEffect() {
  const currentPhrase = phrases[pi];

  if (isDeleting) {
    typedEl.textContent = currentPhrase.substring(0, ci--);
    if (ci < 0) {
      isDeleting = false;
      pi = (pi + 1) % phrases.length;
      setTimeout(typeEffect, 500);
      return;
    }
    setTimeout(typeEffect, 30);
  } else {
    typedEl.textContent = currentPhrase.substring(0, ci++);
    if (ci > currentPhrase.length) {
      isDeleting = true;
      setTimeout(typeEffect, 2500);
      return;
    }
    setTimeout(typeEffect, 80);
  }
}

/* ==========================================
         4. 숫자 카운트 업 애니메이션
      ========================================== */
function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    obj.innerHTML = Math.floor(easeProgress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

/* ==========================================
         5. Intersection Observer (Fade Up & Trigger)
      ========================================== */
let countAnimated = false;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains("fade-up")) {
          entry.target.classList.add("visible");
        }

        if (entry.target.id === "section3") {
          if (typedEl.textContent === "") typeEffect();
        }

        if (entry.target.classList.contains("hero") && !countAnimated) {
          countAnimated = true;
          document.querySelectorAll(".counter").forEach((el) => {
            const target = parseInt(el.getAttribute("data-target"));
            animateValue(el, 0, target, 2000);
          });
        }
      }
    });
  },
  { threshold: 0.15 },
);

document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
observer.observe(document.getElementById("section3"));
observer.observe(document.querySelector(".hero"));

/* ==========================================
         6. Custom Toast 알림
      ========================================== */
function showToast(message) {
  const toast = document.getElementById("toast");
  const msgEl = document.getElementById("toast-msg");
  if (message) {
    msgEl.innerText = message;
  }

  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* ==========================================
         7. Modal 및 구글 시트 폼 연동 로직
      ========================================== */
const applyModal = document.getElementById("applyModal");
const applyForm = document.getElementById("applyForm");
const submitBtn = document.getElementById("submitBtn");

// 모달 열기
function openModal() {
  applyModal.classList.add("active");
  document.body.style.overflow = "hidden"; // 배경 스크롤 방지
}

// 모달 닫기
function closeModal() {
  applyModal.classList.remove("active");
  document.body.style.overflow = ""; // 스크롤 방지 해제
}

// 모달 바깥 영역(어두운 배경) 클릭 시 닫기
applyModal.addEventListener("click", function (e) {
  if (e.target === this) {
    closeModal();
  }
});

// 폼 제출 이벤트 처리 (Google Apps Script로 전송)
applyForm.addEventListener("submit", function (e) {
  e.preventDefault(); // 기본 폼 이동 방지

  // 버튼 상태 변경 (더블 클릭 방지 및 로딩 표시)
  submitBtn.disabled = true;
  submitBtn.innerHTML = "신청 중... ⏳";

  const formData = new FormData(applyForm);
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbzC3c-VLwx5_rk0j0UU7Co-WtDK2Hhv49fV-7_siPqa6ufJjy8wwOzD7xZ6N2n09kzS5g/exec";

  // fetch API를 이용해 데이터 전송 (CORS 문제를 피하기 위해 mode: 'no-cors' 사용)
  fetch(scriptURL, {
    method: "POST",
    mode: "no-cors",
    body: formData,
  })
    .then((response) => {
      // 전송 성공 시
      closeModal();
      showToast("✅ 신청이 성공적으로 완료되었습니다!");
      applyForm.reset(); // 폼 초기화
    })
    .catch((error) => {
      // 전송 에러 시
      console.error("Error!", error.message);
      closeModal();
      showToast("❌ 일시적인 오류가 발생했습니다. 다시 시도해주세요.");
    })
    .finally(() => {
      // 버튼 상태 원상복구
      submitBtn.disabled = false;
      submitBtn.innerHTML = "신청 완료하기";
    });
});
