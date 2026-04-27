const orderButton = document.querySelector(".order-button");

function getCartItems() {
  try {
    const savedItems = JSON.parse(localStorage.getItem("cartItems"));
    return Array.isArray(savedItems) ? savedItems : [];
  } catch (error) {
    return [];
  }
}

function saveCartItems(items) {
  localStorage.setItem("cartItems", JSON.stringify(items));

  if (typeof window.updateCartCountBadge === "function") {
    window.updateCartCountBadge();
  }
}

function addCouponItemToCart() {
  const cartItem = {
    id: "리아불고기세트-set-감자튀김-콜라",
    name: "리아불고기세트",
    originalName: "리아불고기",
    price: 6300,
    image: "./images/menu/img.png",
    quantity: 1,
    setType: "set",
    burger: "리아불고기",
    side: "감자튀김",
    drink: "콜라",
    sideImage: "./images/menu/img-17.png",
    drinkImage: "./images/menu/img-19.png",
  };

  const cartItems = getCartItems();
  const sameItemIndex = cartItems.findIndex((item) => {
    return item.id === cartItem.id;
  });

  if (sameItemIndex > -1) {
    cartItems[sameItemIndex].quantity += cartItem.quantity;
  } else {
    cartItems.push(cartItem);
  }

  saveCartItems(cartItems);
  window.location.href = "cart.html";
}

orderButton?.addEventListener("click", addCouponItemToCart);
