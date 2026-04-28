lucide.createIcons();

// --- 데이터 전송 및 스크롤 로직 통합 ---
const scriptURL =
  "https://script.google.com/macros/s/AKfycbxMDCMBB3O5JJpE9itPFyPz32cs8R9y7YBkBZ8Hv2BiVlAEZe4xJFIHxCagRZqh2J-i/exec";
const form = document.forms["submit-to-google-sheet"];
const msg = document.getElementById("msg");
const submitBtn = document.getElementById("submit-btn");
const successArea = document.getElementById("successMessage");
const topBtn = document.getElementById("top-btn");
const nav = document.getElementById("main-nav");
const progressBar = document.getElementById("progress-bar");

window.addEventListener("scroll", () => {
  // 헤더 및 진행바
  if (window.scrollY > 50) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
  const winScroll =
    document.body.scrollTop || document.documentElement.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  progressBar.style.width = scrolled + "%";

  // Top 버튼 표시 제어
  if (window.scrollY > 300) {
    topBtn.classList.add("show");
  } else {
    topBtn.classList.remove("show");
  }
});

// Top 버튼 클릭 이벤트
topBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// 신청서 제출
form.addEventListener("submit", (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.innerText = "전송 중...";
  msg.innerHTML = "데이터를 보내는 중입니다...";
  msg.style.color = "#a8a29e";

  fetch(scriptURL, { method: "POST", body: new FormData(form) })
    .then((response) => {
      form.classList.add("hidden");
      successArea.classList.remove("hidden");
      form.reset();
    })
    .catch((error) => {
      msg.innerHTML = "전송 오류가 발생했습니다.";
      msg.style.color = "#ef4444";
      submitBtn.disabled = false;
      submitBtn.innerText = "신청서 제출하기";
    });
});

// 모바일 메뉴 제어
const menuToggle = document.getElementById("menu-toggle");
const menuClose = document.getElementById("menu-close");
const mobileMenu = document.getElementById("mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-link");

const toggleMenu = () => {
  mobileMenu.classList.toggle("open");
  document.body.style.overflow = mobileMenu.classList.contains("open")
    ? "hidden"
    : "";
};

menuToggle.addEventListener("click", toggleMenu);
menuClose.addEventListener("click", toggleMenu);
mobileLinks.forEach((link) =>
  link.addEventListener("click", () => {
    if (mobileMenu.classList.contains("open")) toggleMenu();
  }),
);

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    if (targetId === "#") return;
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) targetElement.scrollIntoView({ behavior: "smooth" });
  });
});
