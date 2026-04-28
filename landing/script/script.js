lucide.createIcons();

// 데이터 전송 스크립트
const scriptURL =
  "https://script.google.com/macros/s/AKfycbxMDCMBB3O5JJpE9itPFyPz32cs8R9y7YBkBZ8Hv2BiVlAEZe4xJFIHxCagRZqh2J-i/exec";
const form = document.forms["submit-to-google-sheet"];
const msg = document.getElementById("msg");
const submitBtn = document.getElementById("submit-btn");
const successArea = document.getElementById("successMessage");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.innerText = "전송 중...";
  msg.innerHTML = "데이터를 보내는 중입니다...";
  msg.style.color = "#a8a29e";

  fetch(scriptURL, { method: "POST", body: new FormData(form) })
    .then((response) => {
      msg.innerHTML = "신청이 성공적으로 접수되었습니다.";
      msg.style.color = "#10b981";

      form.classList.add("hidden");
      successArea.classList.remove("hidden");

      form.reset();
      setTimeout(function () {
        msg.innerHTML = "";
      }, 5000);
    })
    .catch((error) => {
      console.error("Error!", error.message);
      msg.innerHTML = "전송 오류가 발생했습니다. 다시 시도해주세요.";
      msg.style.color = "#ef4444";
      submitBtn.disabled = false;
      submitBtn.innerText = "신청서 제출하기";
    });
});

// 네비게이션 및 스크롤 로직
const nav = document.getElementById("main-nav");
const progressBar = document.getElementById("progress-bar");

window.addEventListener("scroll", () => {
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
});

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
