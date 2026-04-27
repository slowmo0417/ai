const CART_STORAGE_KEY = "cartItems";

const cartList = document.querySelector("#cartList");
const checkoutArea = document.querySelector("#checkoutArea");
const cartEmpty = document.querySelector("#cartEmpty");
const checkoutBtn = document.querySelector("#checkoutBtn");
const checkoutTotalPrice = document.querySelector("#checkoutTotalPrice");
const emptyOrderBtn = document.querySelector("#emptyOrderBtn");
const deleteModal = document.querySelector("#deleteModal");
const deleteMessage = document.querySelector("#deleteMessage");
const deleteCancel = document.querySelector("#deleteCancel");
const deleteConfirm = document.querySelector("#deleteConfirm");

let pendingDeleteCard = null;

function getCartItems() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    const parsedCart = savedCart ? JSON.parse(savedCart) : [];

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    console.warn("장바구니 데이터를 불러오지 못했습니다.", error);
    return [];
  }
}

function saveCartItems(cartItems) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

function formatPrice(price = 0) {
  return `${Number(price).toLocaleString("ko-KR")}원`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getOptionRows(item) {
  if (item.setType === "set") {
    return [
      { label: "버거", value: item.burger || item.originalName || item.name },
      { label: "사이드", value: item.side || "선택 없음" },
      { label: "음료", value: item.drink || "선택 없음" },
    ];
  }

  return [{ label: "단품", value: item.originalName || item.name }];
}

function createCartCard(item) {
  const optionRows = getOptionRows(item)
    .map(
      (option) => `
              <div class="option-row">
                <span class="option-label">${escapeHtml(option.label)}</span>
                <span class="option-value">${escapeHtml(option.value)}</span>
              </div>
            `,
    )
    .join("");

  return `
          <li class="cart-card" data-cart-id="${escapeHtml(item.id)}">
            <label class="cart-check" aria-label="${escapeHtml(item.name)} 선택">
              <input type="checkbox" checked />
              <span class="check-box"></span>
            </label>
            <button type="button" class="delete-btn" aria-label="${escapeHtml(item.name)} 삭제"></button>

            <div class="product-top">
              <div class="product-image">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
              </div>

              <div class="product-info">
                <h2 class="product-name">${escapeHtml(item.name)}</h2>
                <div class="price-row">
                  <strong class="sale-price">${formatPrice(item.price)}</strong>
                </div>
              </div>
            </div>

            <div class="option-list">
              ${optionRows}
              <div class="option-row">
                <span class="option-label">수량</span>
                <span class="option-value">${escapeHtml(item.quantity || 1)}개</span>
              </div>
            </div>
          </li>
        `;
}

function getCheckedTotalPrice() {
  const checkedCards = [
    ...cartList.querySelectorAll(".cart-check input:checked"),
  ]
    .map((check) => check.closest(".cart-card"))
    .filter(Boolean);
  const cartItems = getCartItems();

  return checkedCards.reduce((total, card) => {
    const item = cartItems.find(
      (cartItem) => cartItem.id === card.dataset.cartId,
    );
    if (!item) return total;

    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return total + price * quantity;
  }, 0);
}

function updateCartState() {
  if (!cartList) return;

  const hasItems = cartList.querySelectorAll(".cart-card").length > 0;
  const checkedItems = cartList.querySelectorAll(".cart-check input:checked");
  const totalPrice = getCheckedTotalPrice();

  cartEmpty?.classList.toggle("is-hidden", hasItems);
  checkoutArea?.classList.toggle(
    "is-active",
    hasItems && checkedItems.length > 0,
  );

  if (checkoutTotalPrice) {
    checkoutTotalPrice.textContent = formatPrice(totalPrice);
  }
}

function updateCheckoutButton() {
  updateCartState();
}

function removeCardsByIds(selectedIds) {
  selectedIds.forEach((id) => {
    const card = cartList?.querySelector(
      `.cart-card[data-cart-id="${CSS.escape(id)}"]`,
    );
    if (!card) return;

    card.classList.add("is-removing");

    window.setTimeout(() => {
      card.remove();
      updateCartState();
    }, 220);
  });
}

function renderCart() {
  let cartItems = getCartItems();

  if (!cartList) return;

  cartList.innerHTML = cartItems.map(createCartCard).join("");
  updateCartState();
}

function openDeleteModal(card) {
  const productName =
    card.querySelector(".product-name")?.textContent.trim() || "상품";
  pendingDeleteCard = card;

  if (deleteMessage) {
    deleteMessage.textContent = `${productName}을(를) 장바구니에서 삭제합니다.`;
  }

  deleteModal?.classList.add("is-open");
  deleteModal?.setAttribute("aria-hidden", "false");
}

function closeDeleteModal() {
  pendingDeleteCard = null;
  deleteModal?.classList.remove("is-open");
  deleteModal?.setAttribute("aria-hidden", "true");
}

function deleteCartItem() {
  if (!pendingDeleteCard) return;

  const card = pendingDeleteCard;
  const cartId = card.dataset.cartId;
  const nextCartItems = getCartItems().filter((item) => item.id !== cartId);
  saveCartItems(nextCartItems);
  closeDeleteModal();

  card.classList.add("is-removing");

  window.setTimeout(() => {
    card.remove();
    updateCartState();
  }, 220);
}

if (cartList) {
  cartList.addEventListener("change", (event) => {
    const check = event.target.closest(".cart-check input");
    if (!check) return;

    const card = check.closest(".cart-card");
    if (!card) return;

    card.classList.toggle("is-unchecked", !check.checked);
    updateCartState();
  });

  cartList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".delete-btn");
    if (!deleteButton) return;

    const card = deleteButton.closest(".cart-card");
    if (!card) return;

    openDeleteModal(card);
  });
}

if (deleteCancel) {
  deleteCancel.addEventListener("click", closeDeleteModal);
}

if (deleteConfirm) {
  deleteConfirm.addEventListener("click", deleteCartItem);
}

if (deleteModal) {
  deleteModal.addEventListener("click", (event) => {
    if (event.target === deleteModal) closeDeleteModal();
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDeleteModal();
});

if (emptyOrderBtn) {
  emptyOrderBtn.addEventListener("click", () => {
    window.location.href = "./menu.html";
  });
}

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    const selectedIds = [
      ...document.querySelectorAll(".cart-check input:checked"),
    ]
      .map((check) => check.closest(".cart-card")?.dataset.cartId)
      .filter(Boolean);

    if (selectedIds.length === 0) return;

    const nextCartItems = getCartItems().filter(
      (item) => !selectedIds.includes(item.id),
    );
    saveCartItems(nextCartItems);
    localStorage.removeItem("selectedCartItems");
    removeCardsByIds(selectedIds);
  });
}

renderCart();
