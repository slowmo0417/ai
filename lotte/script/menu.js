const categories = [
  { id: "recommend", label: "추천메뉴" },
  { id: "burger", label: "버거" },
  { id: "chicken", label: "치킨" },
  { id: "side", label: "사이드" },
  { id: "drink", label: "음료" },
  { id: "ice", label: "아이스샷" },
];

const menus = [
  {
    name: "리아불고기",
    price: "5,000",
    image: "./images/menu/img.png",
    category: ["recommend", "burger"],
  },
  {
    name: "리아새우",
    price: "5,000",
    image: "./images/menu/img-02.png",
    category: ["recommend", "burger"],
  },
  {
    name: "모짜렐라인더|버거베이컨",
    price: "8,000",
    image: "./images/menu/img-1.png",
    category: ["recommend", "burger"],
  },
  {
    name: "통다리크리스피치|킨버거(그릭랜치)",
    price: "6,900",
    image: "./images/menu/img-2.png",
    category: ["recommend", "burger", "chicken"],
  },
  {
    name: "통다리크리스피치|킨버거(파이어핫)",
    price: "6,900",
    image: "./images/menu/img-3.png",
    category: ["recommend", "burger", "chicken"],
  },
  {
    name: "모짜렐라버거|토마토바질",
    price: "9,100",
    image: "./images/menu/img-4.png",
    category: ["recommend", "burger"],
  },
  {
    name: "모짜렐라버거|발사믹바질",
    price: "9,100",
    image: "./images/menu/img-5.png",
    category: ["recommend", "burger"],
  },
  {
    name: "전주비빔라이스|버거",
    price: "7,300",
    image: "./images/menu/img-6.png",
    category: ["recommend", "burger"],
  },
  {
    name: "리아새우베이컨",
    price: "6,100",
    image: "./images/menu/img-7.png",
    category: ["recommend", "burger"],
  },
  {
    name: "불고기버거|베이컨",
    price: "6,100",
    image: "./images/menu/img-8.png",
    category: ["recommend", "burger"],
  },
  {
    name: "한우불고기버거",
    price: "9,000",
    image: "./images/menu/img-9.png",
    category: ["recommend", "burger"],
  },
  {
    name: "데리버거",
    price: "3,700",
    image: "./images/menu/img-10.png",
    category: ["burger"],
  },
  {
    name: "리아사각새우|더블",
    price: "6,100",
    image: "./images/menu/img-11.png",
    category: ["burger"],
  },
  {
    name: "핫크리스피|치킨버거",
    price: "6,200",
    image: "./images/menu/img-12.png",
    category: ["burger", "chicken"],
  },
  {
    name: "클래식치즈버거",
    price: "5,400",
    image: "./images/menu/img-13.png",
    category: ["burger"],
  },
  {
    name: "더블엑스투버거",
    price: "6,900",
    image: "./images/menu/img-14.png",
    category: ["burger"],
  },
  {
    name: "화이어윙|4조각",
    price: "5,500",
    image: "./images/menu/img-15.png",
    category: ["chicken", "side"],
  },
  {
    name: "양념감자",
    price: "2,600",
    image: "./images/menu/img-16.png",
    category: ["side"],
  },
  {
    name: "포테이토(R)",
    price: "2,000",
    image: "./images/menu/img-17.png",
    category: ["side"],
  },
  {
    name: "지파이|고소한맛(S)",
    price: "4,500",
    image: "./images/menu/img-18.png",
    category: ["side", "chicken"],
  },
  {
    name: "콜라(R)",
    price: "2,000",
    image: "./images/menu/img-19.png",
    category: ["drink"],
  },
  {
    name: "사이다(R)",
    price: "2,000",
    image: "./images/menu/img-20.png",
    category: ["drink"],
  },
  {
    name: "레몬에이드",
    price: "2,700",
    image: "./images/menu/img-21.png",
    category: ["drink"],
  },
  {
    name: "아메리카노",
    price: "2,500",
    image: "./images/menu/img-22.png",
    category: ["drink"],
  },
  {
    name: "선데 허쉬초코",
    price: "2,300",
    image: "./images/menu/img-23.png",
    category: ["ice"],
  },
  {
    name: "선데 스트로베리",
    price: "2,300",
    image: "./images/menu/img-24.png",
    category: ["ice"],
  },
  {
    name: "토네이도|초코쿠키",
    price: "3,200",
    image: "./images/menu/img-25.png",
    category: ["ice"],
  },
  {
    name: "토네이도|스트로베리",
    price: "3,200",
    image: "./images/menu/img-26.png",
    category: ["ice"],
  },
];

const MY_MENU_KEY = "myMenuItems";
const CART_ITEMS_KEY = "cartItems";

const categoryScroll = document.querySelector("#categoryScroll");
const menuGrid = document.querySelector("#menuGrid");
const optionBackdrop = document.querySelector("#optionBackdrop");
const optionSheet = document.querySelector("#optionSheet");
const optionImage = document.querySelector("#optionImage");
const optionName = document.querySelector("#optionName");
const optionPrice = document.querySelector("#optionPrice");
const qtyMinus = document.querySelector("#qtyMinus");
const qtyPlus = document.querySelector("#qtyPlus");
const qtyNumber = document.querySelector("#qtyNumber");
const totalPrice = document.querySelector("#totalPrice");
const sheetClose = document.querySelector("#sheetClose");
const addCartBtn = document.querySelector("#addCartBtn");
const addMyPickBtn = document.querySelector("#addMyPickBtn");
const cartToast = document.querySelector("#cartToast");
const setDetail = document.querySelector("#setDetail");

const SET_EXTRA_PRICE = 2500;
const SEASONED_POTATO_EXTRA_PRICE = 500;

let selectedCategory = "recommend";
let selectedMenu = null;
let selectedQty = 1;
let selectedSetType = "single";
let selectedSide = "감자튀김";
let selectedDrink = "콜라";
let toastTimer = null;

function textOnly(name) {
  return name.split("|").join(" ");
}

function textWithBreak(name) {
  return name.split("|").join("<br />");
}

function priceToNumber(price) {
  return Number(String(price).replace(/,/g, ""));
}

function numberToPrice(number) {
  return number.toLocaleString("ko-KR") + "원";
}

function createMenuId(menu, setType = "single", side = "", drink = "") {
  const idParts = [textOnly(menu.name), setType];

  if (setType === "set") {
    idParts.push(side || "감자튀김");
    idParts.push(drink || "콜라");
  }

  return idParts.join("-");
}

function getSideImage() {
  if (selectedSide === "양념감자") {
    return "./images/menu/img-16.png";
  }

  return "./images/menu/img-17.png";
}

function getDrinkImage() {
  if (selectedDrink === "사이다") {
    return "./images/menu/img-20.png";
  }

  return "./images/menu/img-19.png";
}

function getSelectedOptionExtraPrice() {
  const setPrice = selectedSetType === "set" ? SET_EXTRA_PRICE : 0;
  const sidePrice =
    selectedSetType === "set" && selectedSide === "양념감자"
      ? SEASONED_POTATO_EXTRA_PRICE
      : 0;

  return setPrice + sidePrice;
}

function getSelectedUnitPrice() {
  if (!selectedMenu) return 0;

  return priceToNumber(selectedMenu.price) + getSelectedOptionExtraPrice();
}

function getSelectedDisplayName() {
  if (!selectedMenu) return "선택 메뉴";

  const originalName = textOnly(selectedMenu.name);

  return selectedSetType === "set" ? `${originalName}세트` : originalName;
}

function getSelectedMenuData() {
  if (!selectedMenu) return null;

  const originalName = textOnly(selectedMenu.name);
  const displayName = getSelectedDisplayName();

  return {
    id: createMenuId(
      selectedMenu,
      selectedSetType,
      selectedSide,
      selectedDrink,
    ),
    name: displayName,
    originalName,
    price: getSelectedUnitPrice(),
    image: selectedMenu.image,
    quantity: 1,
    setType: selectedSetType,
    burger: originalName,
    side: selectedSetType === "set" ? selectedSide : "",
    drink: selectedSetType === "set" ? selectedDrink : "",
    sideImage: selectedSetType === "set" ? getSideImage() : "",
    drinkImage: selectedSetType === "set" ? getDrinkImage() : "",
  };
}

function getMyMenuItems() {
  try {
    const rawData = localStorage.getItem(MY_MENU_KEY);
    const items = rawData ? JSON.parse(rawData) : [];

    return Array.isArray(items) ? items : [];
  } catch (error) {
    localStorage.removeItem(MY_MENU_KEY);
    return [];
  }
}

function saveMyMenuItems(items) {
  localStorage.setItem(MY_MENU_KEY, JSON.stringify(items));
}

function isMyPickAdded(menuData) {
  if (!menuData) return false;

  const myMenuItems = getMyMenuItems();

  return myMenuItems.some((item) => item.id === menuData.id);
}

function updateMyPickButtonState() {
  if (!addMyPickBtn) return;

  const menuData = getSelectedMenuData();
  const isAdded = isMyPickAdded(menuData);

  addMyPickBtn.classList.toggle("is-added", isAdded);
  addMyPickBtn.textContent = isAdded ? "나의 Pick 추가됨" : "나의 Pick 추가";
}

function updateFavoriteButtonStates() {
  const myMenuItems = getMyMenuItems();

  document.querySelectorAll(".menu-card").forEach((card) => {
    const menuIndex = Number(card.dataset.menuIndex);
    const menu = menus[menuIndex];
    const favoriteButton = card.querySelector(".favorite-btn");

    if (!menu || !favoriteButton) return;

    const menuId = createMenuId(menu, "single");
    const isAdded = myMenuItems.some((item) => item.id === menuId);

    favoriteButton.classList.toggle("is-active", isAdded);
    favoriteButton.setAttribute("aria-pressed", String(isAdded));
  });
}

function addSelectedMenuToMyPick() {
  const menuData = getSelectedMenuData();

  if (!menuData) return;

  const myMenuItems = getMyMenuItems();
  const isAlreadyAdded = myMenuItems.some((item) => item.id === menuData.id);

  if (isAlreadyAdded) {
    showToast("이미 나의 Pick에 추가된 메뉴입니다");
    updateMyPickButtonState();
    return;
  }

  myMenuItems.push(menuData);
  saveMyMenuItems(myMenuItems);

  updateMyPickButtonState();
  updateFavoriteButtonStates();
  showToast("나의 Pick에 추가했습니다");
}

function removeMenuFromMyPick(menuData) {
  if (!menuData) return;

  const myMenuItems = getMyMenuItems();
  const nextItems = myMenuItems.filter((item) => item.id !== menuData.id);

  saveMyMenuItems(nextItems);

  updateMyPickButtonState();
  updateFavoriteButtonStates();
  showToast("나의 Pick에서 삭제했습니다");
}

function getCartItems() {
  try {
    const rawData = localStorage.getItem(CART_ITEMS_KEY);
    const items = rawData ? JSON.parse(rawData) : [];

    return Array.isArray(items) ? items : [];
  } catch (error) {
    localStorage.removeItem(CART_ITEMS_KEY);
    return [];
  }
}

function saveCartItems(items) {
  localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(items));

  if (typeof window.updateCartCountBadge === "function") {
    window.updateCartCountBadge();
  }
}

function createStarButton(menuName) {
  return `
    <button
      type="button"
      class="favorite-btn"
      aria-label="${textOnly(menuName)} 나의 Pick 추가"
      aria-pressed="false"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.4l2.98 6.04 6.67.97-4.82 4.7 1.14 6.64L12 17.62 6.03 20.75l1.14-6.64-4.82-4.7 6.67-.97L12 2.4z" />
      </svg>
    </button>
  `;
}

function renderCategories() {
  categoryScroll.innerHTML = categories
    .map(
      (category) => `
        <button
          type="button"
          class="category-btn ${category.id === selectedCategory ? "is-active" : ""}"
          data-category="${category.id}"
        >${category.label}</button>
      `,
    )
    .join("");
}

function renderMenus() {
  const filteredMenus = menus.filter((menu) =>
    menu.category.includes(selectedCategory),
  );

  menuGrid.innerHTML = filteredMenus
    .map(
      (menu) => `
        <article class="menu-card" data-menu-index="${menus.indexOf(menu)}">
          ${createStarButton(menu.name)}
          <div class="menu-img-box">
            <img class="menu-img" src="${menu.image}" alt="${textOnly(menu.name)}" />
          </div>
          <h2 class="menu-name">${textWithBreak(menu.name)}</h2>
          <p class="menu-price">${menu.price}<span class="won">원~</span></p>
        </article>
      `,
    )
    .join("");

  updateFavoriteButtonStates();
}

function openOptionSheet(menu) {
  selectedMenu = menu;
  selectedQty = 1;
  selectedSetType = "single";
  selectedSide = "감자튀김";
  selectedDrink = "콜라";

  resetChoiceButtons();

  optionImage.src = menu.image;
  optionImage.alt = textOnly(menu.name);
  optionName.innerHTML = textWithBreak(menu.name);
  optionPrice.textContent = numberToPrice(priceToNumber(menu.price)) + "~";

  updateOptionTotal();
  updateMyPickButtonState();

  optionBackdrop.classList.add("is-open");
  optionSheet.classList.add("is-open");
  optionSheet.setAttribute("aria-hidden", "false");
}

function closeOptionSheet() {
  optionBackdrop.classList.remove("is-open");
  optionSheet.classList.remove("is-open");
  optionSheet.setAttribute("aria-hidden", "true");
}

function updateOptionTotal() {
  if (!selectedMenu) return;

  const itemPrice = getSelectedUnitPrice();

  qtyNumber.textContent = selectedQty;
  totalPrice.textContent = numberToPrice(itemPrice * selectedQty);

  updateMyPickButtonState();
}

function resetChoiceButtons() {
  document.querySelectorAll("[data-set-type]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.setType === "single");
  });

  document.querySelectorAll("[data-side-option]").forEach((button) => {
    button.classList.toggle(
      "is-active",
      button.dataset.sideOption === "감자튀김",
    );
  });

  document.querySelectorAll("[data-drink-option]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.drinkOption === "콜라");
  });

  setDetail.classList.remove("is-show");
}

function setActiveChoice(selector, activeButton) {
  document.querySelectorAll(selector).forEach((button) => {
    button.classList.toggle("is-active", button === activeButton);
  });
}

function addSelectedMenuToCart() {
  const menuData = getSelectedMenuData();

  if (!menuData) return;

  const cartItems = getCartItems();
  const sameItem = cartItems.find((item) => item.id === menuData.id);

  if (sameItem) {
    sameItem.quantity += selectedQty;
  } else {
    cartItems.push({
      ...menuData,
      quantity: selectedQty,
    });
  }

  saveCartItems(cartItems);
  closeOptionSheet();
  showToast("장바구니에 담았습니다");
}

function showToast(message = "장바구니에 담았습니다") {
  if (!cartToast) return;

  clearTimeout(toastTimer);

  cartToast.textContent = message;
  cartToast.classList.add("is-show");

  toastTimer = setTimeout(() => {
    cartToast.classList.remove("is-show");
  }, 1400);
}

function bindEvents() {
  categoryScroll.addEventListener("click", (event) => {
    const button = event.target.closest(".category-btn");
    if (!button) return;

    selectedCategory = button.dataset.category;
    renderCategories();
    renderMenus();
  });

  menuGrid.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest(".favorite-btn");
    const card = event.target.closest(".menu-card");

    if (!card) return;

    const menuIndex = Number(card.dataset.menuIndex);
    const menu = menus[menuIndex];

    if (!menu) return;

    if (favoriteButton) {
      event.stopPropagation();

      selectedMenu = menu;
      selectedQty = 1;
      selectedSetType = "single";
      selectedSide = "감자튀김";
      selectedDrink = "콜라";

      const menuData = getSelectedMenuData();

      if (isMyPickAdded(menuData)) {
        removeMenuFromMyPick(menuData);
      } else {
        addSelectedMenuToMyPick();
      }

      return;
    }

    openOptionSheet(menu);
  });

  optionBackdrop.addEventListener("click", closeOptionSheet);
  sheetClose.addEventListener("click", closeOptionSheet);
  addCartBtn.addEventListener("click", addSelectedMenuToCart);

  if (addMyPickBtn) {
    addMyPickBtn.addEventListener("click", addSelectedMenuToMyPick);
  }

  optionSheet.addEventListener("click", (event) => {
    const setTypeButton = event.target.closest("[data-set-type]");
    const sideButton = event.target.closest("[data-side-option]");
    const drinkButton = event.target.closest("[data-drink-option]");

    if (setTypeButton) {
      selectedSetType = setTypeButton.dataset.setType;
      setActiveChoice("[data-set-type]", setTypeButton);
      setDetail.classList.toggle("is-show", selectedSetType === "set");
      updateOptionTotal();
      return;
    }

    if (sideButton) {
      selectedSide = sideButton.dataset.sideOption;
      setActiveChoice("[data-side-option]", sideButton);
      updateOptionTotal();
      return;
    }

    if (drinkButton) {
      selectedDrink = drinkButton.dataset.drinkOption;
      setActiveChoice("[data-drink-option]", drinkButton);
      updateOptionTotal();
    }
  });

  qtyMinus.addEventListener("click", () => {
    selectedQty = Math.max(1, selectedQty - 1);
    updateOptionTotal();
  });

  qtyPlus.addEventListener("click", () => {
    selectedQty += 1;
    updateOptionTotal();
  });
}

renderCategories();
renderMenus();
bindEvents();
