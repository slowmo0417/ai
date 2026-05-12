const loginForm = document.querySelector(".login-form");
const userIdInput = document.querySelector("#userId");
const userPasswordInput = document.querySelector("#userPassword");
const errorMessage = document.querySelector(".error-message");

function showError() {
  errorMessage.textContent = "아이디 또는 비밀번호를 확인해주세요.";
  errorMessage.classList.add("is-active");
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.classList.remove("is-active");
}

function handleLogin() {
  const userId = userIdInput.value.trim();
  const userPassword = userPasswordInput.value.trim();

  if (!userId || !userPassword) {
    showError();

    if (!userId) {
      userIdInput.focus();
    } else {
      userPasswordInput.focus();
    }

    return;
  }

  clearError();
  window.location.replace("./main.html");
}

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();
  handleLogin();
});

[userIdInput, userPasswordInput].forEach(function (input) {
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLogin();
    }
  });
});

[userIdInput, userPasswordInput].forEach(function (input) {
  input.addEventListener("focus", function () {
    setTimeout(function () {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  });
});
