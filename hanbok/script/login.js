const loginCard = document.querySelector(".login-card");
const loginLinks = document.querySelectorAll("[data-go]");
const authViews = document.querySelectorAll(".auth-view");

const findTabs = document.querySelectorAll("[data-find-tab]");
const findPanels = document.querySelectorAll("[data-find-panel]");
const findSteps = document.querySelectorAll("[data-find-step]");
const findIdForm = document.querySelector(".find-id-form");

const pwSteps = document.querySelectorAll("[data-pw-step]");
const pwMethodButtons = document.querySelectorAll("[data-pw-method]");
const pwCodeForm = document.querySelector(".pw-code-form");
const pwResetForm = document.querySelector(".pw-reset-form");

const loginForm = document.querySelector(
  '.auth-view[data-view="login"] .login-form',
);
const passwordInput = document.querySelector("#loginPassword");
const passwordToggle = document.querySelector(".password-toggle");
const passwordClear = document.querySelector(".password-clear");

const resetPasswordInput = document.querySelector(".reset-password-input");
const resetPasswordToggle = document.querySelector(".reset-password-toggle");
const resetPasswordClear = document.querySelector(".reset-password-clear");
const resetPasswordConfirm = document.querySelector(".reset-password-confirm");

const joinNextButton = document.querySelector("[data-join-next]");
const joinForm = document.querySelector(".join-form");
const agreeAll = document.querySelector('input[name="agreeAll"]');
const requiredAgrees = document.querySelectorAll(".required-agree");
const joinPanels = document.querySelectorAll("[data-join-panel]");
const joinStepItems = document.querySelectorAll("[data-join-step-item]");
const goMainButton = document.querySelector("[data-go-main]");

const mypageForm = document.querySelector(".mypage-form");
const mypageCancelButton = document.querySelector("[data-mypage-cancel]");
const mypageEmailDomain = document.querySelector(
  'input[name="mypageEmailDomain"]',
);
const mypageEmailSelect = document.querySelector(
  'select[name="mypageEmailSelect"]',
);

const withdrawModal = document.querySelector(".withdraw-modal");
const withdrawOpenButton = document.querySelector("[data-withdraw-open]");
const withdrawCloseButtons = document.querySelectorAll("[data-withdraw-close]");
const withdrawForm = document.querySelector(".withdraw-form");
const withdrawPassword = document.querySelector("[name='withdrawPassword']");
const withdrawPasswordConfirm = document.querySelector(
  "[name='withdrawPasswordConfirm']",
);
const withdrawAgree = document.querySelector("[name='withdrawAgree']");

const forms = document.querySelectorAll("form");
const phoneInputs = document.querySelectorAll(".phone-input");
const codeInputs = document.querySelectorAll(".code-input");
const mypagePhoneInputs = document.querySelectorAll(
  "[name='mypagePhoneMiddle'], [name='mypagePhoneLast']",
);
const resultLoginButtons = document.querySelectorAll("[data-result-login]");
const resultFindPwButtons = document.querySelectorAll("[data-result-find-pw]");

const MYPAGE_STORAGE_KEY = "hanbokMypageInfo";

const MYPAGE_SAVE_EXCLUDE_NAMES = new Set([
  "mypagePassword",
  "mypagePasswordConfirm",
]);

function showAuthView(viewName) {
  authViews.forEach((view) => {
    view.classList.toggle("is-active", view.dataset.view === viewName);
  });

  loginCard?.classList.toggle("is-join", viewName === "join");
  loginCard?.classList.toggle("is-mypage", viewName === "mypage");

  if (viewName === "login") {
    resetFindState();
    resetJoinState();
    closeWithdrawModal();
  }

  if (viewName === "join") {
    resetJoinState();
    closeWithdrawModal();
  }

  if (viewName === "find") {
    resetJoinState();
    closeWithdrawModal();
  }

  if (viewName === "mypage") {
    loadMypageData();
    syncMypageEmailDomain();
  }

  if (viewName !== "mypage") {
    closeWithdrawModal();
  }
}

function activateFindTab(tabName) {
  findTabs.forEach((tab) => {
    const isActive = tab.dataset.findTab === tabName;

    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  findPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.findPanel === tabName);
  });

  if (tabName === "find-id") {
    resetFindIdState();
  }

  if (tabName === "find-pw") {
    resetPwState();
  }
}

function showFindStep(stepName) {
  findSteps.forEach((step) => {
    step.classList.toggle("is-active", step.dataset.findStep === stepName);
  });
}

function showPwStep(stepName) {
  pwSteps.forEach((step) => {
    step.classList.toggle("is-active", step.dataset.pwStep === stepName);
  });

  clearMessages();
}

function showJoinPanel(panelName) {
  const order = ["terms", "info", "complete"];
  const activeIndex = order.indexOf(panelName);

  joinPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.joinPanel === panelName);
  });

  joinStepItems.forEach((step) => {
    const stepIndex = order.indexOf(step.dataset.joinStepItem);

    step.classList.toggle("is-active", stepIndex === activeIndex);
    step.classList.toggle("is-done", stepIndex < activeIndex);
  });

  clearMessages();
}

function openInitialViewFromURL() {
  const hash = window.location.hash;

  if (hash === "#join") {
    showAuthView("join");
    return;
  }

  if (hash === "#find-id") {
    showAuthView("find");
    activateFindTab("find-id");
    return;
  }

  if (hash === "#find-pw") {
    showAuthView("find");
    activateFindTab("find-pw");
    return;
  }

  if (hash === "#mypage") {
    showAuthView("mypage");
    return;
  }

  showAuthView("login");
}

function setMessage(name, text) {
  const message = document.querySelector(`[data-message="${name}"]`);
  if (!message) return;

  message.textContent = text;
  message.classList.add("is-active");
}

function clearMessages() {
  document.querySelectorAll(".form-message").forEach((message) => {
    message.textContent = "";
    message.classList.remove("is-active");
  });
}

function clearForm(form) {
  if (!form) return;

  form.reset();

  form.querySelectorAll("input").forEach((input) => {
    if (input.type === "password") {
      input.type = "password";
    }
  });
}

function resetPasswordToolState(input, toggleButton, clearButton) {
  if (!input) return;

  input.type = "password";

  if (toggleButton) {
    toggleButton.classList.remove("is-active");
    toggleButton.setAttribute("aria-pressed", "false");
    toggleButton.setAttribute("aria-label", "비밀번호 보기");
  }

  if (clearButton) {
    clearButton.hidden = true;
  }
}

function resetFindIdState() {
  clearForm(findIdForm);
  showFindStep("find-id-form");
  clearMessages();
}

function resetPwState() {
  clearForm(pwCodeForm);
  clearForm(pwResetForm);

  resetPasswordToolState(
    resetPasswordInput,
    resetPasswordToggle,
    resetPasswordClear,
  );

  showPwStep("pw-method");
  clearMessages();
}

function resetFindState() {
  resetFindIdState();
  resetPwState();
}

function resetJoinState() {
  clearForm(joinForm);

  if (agreeAll) {
    agreeAll.checked = false;
  }

  requiredAgrees.forEach((checkbox) => {
    checkbox.checked = false;
  });

  showJoinPanel("terms");
}

function updatePasswordClearButton(input, clearButton) {
  if (!input || !clearButton) return;

  clearButton.hidden = input.value.length === 0;
}

function bindPasswordTools(input, toggleButton, clearButton) {
  if (input && toggleButton) {
    toggleButton.addEventListener("click", () => {
      const isPassword = input.type === "password";

      input.type = isPassword ? "text" : "password";
      toggleButton.classList.toggle("is-active", isPassword);
      toggleButton.setAttribute("aria-pressed", String(isPassword));
      toggleButton.setAttribute(
        "aria-label",
        isPassword ? "비밀번호 숨기기" : "비밀번호 보기",
      );

      input.focus();
    });
  }

  if (input && clearButton) {
    input.addEventListener("input", () => {
      updatePasswordClearButton(input, clearButton);
    });

    clearButton.addEventListener("click", () => {
      input.value = "";
      updatePasswordClearButton(input, clearButton);
      input.focus();
    });

    updatePasswordClearButton(input, clearButton);
  }
}

function hasFindIdInputValue(form) {
  const name = form.querySelector("[name='findIdName']");
  const middle = form.querySelector("[name='findIdPhoneMiddle']");
  const last = form.querySelector("[name='findIdPhoneLast']");

  return Boolean(
    name?.value.trim() && middle?.value.trim() && last?.value.trim(),
  );
}

function areRequiredTermsChecked() {
  return Array.from(requiredAgrees).every((checkbox) => checkbox.checked);
}

function syncAgreeAllState() {
  if (!agreeAll) return;

  agreeAll.checked = areRequiredTermsChecked();
}

function getSavedMypageData() {
  try {
    return JSON.parse(localStorage.getItem(MYPAGE_STORAGE_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function saveMypageData() {
  if (!mypageForm) return;

  const formData = new FormData(mypageForm);
  const savedData = {};

  formData.forEach((value, key) => {
    if (MYPAGE_SAVE_EXCLUDE_NAMES.has(key)) return;

    savedData[key] = value;
  });

  localStorage.setItem(MYPAGE_STORAGE_KEY, JSON.stringify(savedData));
}

function loadMypageData() {
  if (!mypageForm) return;

  const savedData = getSavedMypageData();

  Object.entries(savedData).forEach(([name, value]) => {
    const field = mypageForm.querySelector(`[name="${name}"]`);
    if (!field) return;

    if (field.type === "checkbox" || field.type === "radio") {
      field.checked = value === "on" || value === true;
      return;
    }

    field.value = value;
  });
}

function syncMypageEmailDomain() {
  if (!mypageEmailDomain || !mypageEmailSelect) return;

  const selectedDomain = mypageEmailSelect.value;

  if (selectedDomain) {
    mypageEmailDomain.value = selectedDomain;
    mypageEmailDomain.readOnly = true;
    mypageEmailDomain.classList.add("is-disabled");
  } else {
    mypageEmailDomain.readOnly = false;
    mypageEmailDomain.classList.remove("is-disabled");
  }
}

function openWithdrawModal() {
  if (!withdrawModal) return;

  clearForm(withdrawForm);
  clearMessages();
  withdrawModal.hidden = false;
  document.body.classList.add("is-modal-open");
  withdrawPassword?.focus();
}

function closeWithdrawModal() {
  if (!withdrawModal) return;

  withdrawModal.hidden = true;
  document.body.classList.remove("is-modal-open");
  clearForm(withdrawForm);
  clearMessages();
}

loginLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    const target = link.dataset.go;

    if (target === "join") {
      window.location.hash = "join";
      showAuthView("join");
      return;
    }

    if (target === "find-id" || target === "find-pw") {
      window.location.hash = target;
      showAuthView("find");
      activateFindTab(target);
    }
  });
});

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const userId = loginForm.querySelector("[name='userId']");
    const userPassword = loginForm.querySelector("[name='userPassword']");

    clearMessages();

    if (!userId?.value.trim() || !userPassword?.value.trim()) {
      setMessage("login", "아이디 또는 비밀번호를 확인해주세요.");
      (!userId?.value.trim() ? userId : userPassword)?.focus();
      return;
    }

    window.location.hash = "mypage";
    showAuthView("mypage");
  });
}

findTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.findTab;

    window.location.hash = target;
    activateFindTab(target);
  });
});

if (findIdForm) {
  findIdForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (hasFindIdInputValue(findIdForm)) {
      showFindStep("find-id-success");
      return;
    }

    showFindStep("find-id-fail");
  });
}

pwMethodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    clearForm(pwCodeForm);
    clearForm(pwResetForm);

    resetPasswordToolState(
      resetPasswordInput,
      resetPasswordToggle,
      resetPasswordClear,
    );

    showPwStep("pw-code");
  });
});

if (pwCodeForm) {
  pwCodeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const certCodeInput = pwCodeForm.querySelector("[name='certCode']");
    const certCode = certCodeInput?.value.trim();

    clearMessages();

    if (!certCode) {
      setMessage("certCode", "인증번호를 입력해주세요.");
      certCodeInput?.focus();
      return;
    }

    clearForm(pwResetForm);

    resetPasswordToolState(
      resetPasswordInput,
      resetPasswordToggle,
      resetPasswordClear,
    );

    showPwStep("pw-reset");
  });
}

if (pwResetForm) {
  pwResetForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const newPassword = resetPasswordInput?.value.trim();
    const confirmPassword = resetPasswordConfirm?.value.trim();

    clearMessages();

    if (!newPassword || !confirmPassword) {
      setMessage("resetPassword", "비밀번호를 입력해주세요.");
      (!newPassword ? resetPasswordInput : resetPasswordConfirm)?.focus();
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("resetPassword", "비밀번호가 일치하지 않습니다.");
      resetPasswordConfirm?.focus();
      return;
    }

    showPwStep("pw-complete");
  });
}

if (agreeAll) {
  agreeAll.addEventListener("change", () => {
    requiredAgrees.forEach((checkbox) => {
      checkbox.checked = agreeAll.checked;
    });
  });
}

requiredAgrees.forEach((checkbox) => {
  checkbox.addEventListener("change", syncAgreeAllState);
});

if (joinNextButton) {
  joinNextButton.addEventListener("click", () => {
    clearMessages();

    if (!areRequiredTermsChecked()) {
      setMessage("joinTerms", "필수 약관에 동의해주세요.");
      return;
    }

    showJoinPanel("info");
  });
}

if (joinForm) {
  joinForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const joinUserId = joinForm.querySelector("[name='joinUserId']");
    const joinPassword = joinForm.querySelector("[name='joinPassword']");
    const joinPasswordConfirm = joinForm.querySelector(
      "[name='joinPasswordConfirm']",
    );
    const joinName = joinForm.querySelector("[name='joinName']");
    const joinEmail = joinForm.querySelector("[name='joinEmail']");

    clearMessages();

    if (
      !joinUserId?.value.trim() ||
      !joinPassword?.value.trim() ||
      !joinPasswordConfirm?.value.trim() ||
      !joinName?.value.trim() ||
      !joinEmail?.value.trim()
    ) {
      setMessage("joinInfo", "회원정보를 모두 입력해주세요.");
      return;
    }

    if (joinPassword.value.trim() !== joinPasswordConfirm.value.trim()) {
      setMessage("joinInfo", "비밀번호가 일치하지 않습니다.");
      joinPasswordConfirm.focus();
      return;
    }

    showJoinPanel("complete");
  });
}

if (mypageForm) {
  mypageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const password = mypageForm.querySelector("[name='mypagePassword']");
    const passwordConfirm = mypageForm.querySelector(
      "[name='mypagePasswordConfirm']",
    );

    clearMessages();

    if (password.value.trim() || passwordConfirm.value.trim()) {
      if (!password.value.trim() || !passwordConfirm.value.trim()) {
        setMessage("mypage", "비밀번호를 입력해주세요.");
        (!password.value.trim() ? password : passwordConfirm)?.focus();
        return;
      }

      if (password.value.trim() !== passwordConfirm.value.trim()) {
        setMessage("mypage", "비밀번호가 일치하지 않습니다.");
        passwordConfirm.focus();
        return;
      }
    }

    saveMypageData();

    password.value = "";
    passwordConfirm.value = "";

    setMessage("mypage", "기본정보가 저장되었습니다.");
  });
}

mypageCancelButton?.addEventListener("click", () => {
  window.location.hash = "";
  showAuthView("login");
});

withdrawOpenButton?.addEventListener("click", openWithdrawModal);

withdrawCloseButtons.forEach((button) => {
  button.addEventListener("click", closeWithdrawModal);
});

if (withdrawForm) {
  withdrawForm.addEventListener("submit", (event) => {
    event.preventDefault();

    clearMessages();

    const passwordValue = withdrawPassword?.value.trim();
    const confirmValue = withdrawPasswordConfirm?.value.trim();

    if (!passwordValue || !confirmValue) {
      setMessage("withdraw", "비밀번호를 입력해주세요.");
      (!passwordValue ? withdrawPassword : withdrawPasswordConfirm)?.focus();
      return;
    }

    if (passwordValue !== confirmValue) {
      setMessage("withdraw", "비밀번호가 일치하지 않습니다.");
      withdrawPasswordConfirm?.focus();
      return;
    }

    if (!withdrawAgree?.checked) {
      setMessage("withdraw", "탈퇴 동의를 체크해주세요.");
      withdrawAgree?.focus();
      return;
    }

    closeWithdrawModal();
    window.location.hash = "";
    showAuthView("login");
  });
}

goMainButton?.addEventListener("click", () => {
  window.location.href = "./index.html";
});

resultLoginButtons.forEach((button) => {
  button.addEventListener("click", () => {
    window.location.hash = "";
    showAuthView("login");
  });
});

resultFindPwButtons.forEach((button) => {
  button.addEventListener("click", () => {
    window.location.hash = "find-pw";
    showAuthView("find");
    activateFindTab("find-pw");
  });
});

bindPasswordTools(passwordInput, passwordToggle, passwordClear);
bindPasswordTools(resetPasswordInput, resetPasswordToggle, resetPasswordClear);

phoneInputs.forEach((input) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 4);
  });
});

mypagePhoneInputs.forEach((input) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 4);
  });
});

codeInputs.forEach((input) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "");
  });
});

forms.forEach((form) => {
  if (
    form === loginForm ||
    form === findIdForm ||
    form === pwCodeForm ||
    form === pwResetForm ||
    form === joinForm ||
    form === mypageForm ||
    form === withdrawForm
  ) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });
});

mypageEmailSelect?.addEventListener("change", syncMypageEmailDomain);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && withdrawModal && !withdrawModal.hidden) {
    closeWithdrawModal();
  }
});

window.addEventListener("hashchange", openInitialViewFromURL);

window.openInitialViewFromURL = openInitialViewFromURL;

loadMypageData();
syncMypageEmailDomain();
openInitialViewFromURL();
