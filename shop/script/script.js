// Product data
const products = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd29tYW4lMjBkZXNpZ25lciUyMGNvYXQlMjBtaW5pbWFsfGVufDF8fHx8MTc3NDkyNjkwNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    name: "Cashmere Blend Coat",
    price: "₩428,000",
    tag: "NEW",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1762331974989-417a274b2c2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwd29tYW4lMjBibGF6ZXIlMjBlbGVnYW50fGVufDF8fHx8MTc3NDkyNjkwNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    name: "Tailored Wool Blazer",
    price: "₩368,000",
    tag: "NEW",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1585672275656-4433fc0668e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwd29tYW4lMjBkcmVzcyUyMHdoaXRlfGVufDF8fHx8MTc3NDkyNjkwNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    name: "Minimal Slip Dress",
    price: "₩248,000",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1759229874914-c1ffdb3ebd0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGVsZWdhbnQlMjBzd2VhdGVyJTIwbmV1dHJhbHxlbnwxfHx8fDE3NzQ5MjY5MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    name: "Merino Wool Knit",
    price: "₩198,000",
  },
];

// Lookbook data
const lookbooks = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1700575306910-b7016feddcd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwZWRpdG9yaWFsJTIwd29tYW4lMjBsb29rYm9va3xlbnwxfHx8fDE3NzQ5MjY5MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Spring Editorial",
    subtitle: "2026 Season Collection",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1709920668708-90df0211e4d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMHdvbWFuJTIwc3R5bGUlMjBtaW5pbWFsfGVufDF8fHx8MTc3NDkyNjkwN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Urban Minimal",
    subtitle: "City Chic Style",
  },
];

// Render products
function renderProducts() {
  const productGrid = document.getElementById("productGrid");

  productGrid.innerHTML = products
    .map(
      (product) => `
    <div class="product-card">
      <div class="product-image-wrapper">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        ${product.tag ? `<div class="product-tag">${product.tag}</div>` : ""}
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${product.price}</p>
      </div>
    </div>
  `,
    )
    .join("");
}

// Render lookbooks
function renderLookbooks() {
  const lookbookGrid = document.getElementById("lookbookGrid");

  lookbookGrid.innerHTML = lookbooks
    .map(
      (lookbook) => `
    <div class="lookbook-card">
      <div class="lookbook-image-wrapper">
        <img src="${lookbook.image}" alt="${lookbook.title}" class="lookbook-image">
      </div>
      <div class="lookbook-overlay"></div>
      <div class="lookbook-content">
        <h3 class="lookbook-title">${lookbook.title}</h3>
        <p class="lookbook-subtitle">${lookbook.subtitle}</p>
      </div>
    </div>
  `,
    )
    .join("");
}

// Category filter
const categoryButtons = document.querySelectorAll(".category-btn");
categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    categoryButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
  });
});

// Tab navigation
const tabButtons = document.querySelectorAll(".tab-item");
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
  });
});

// Initialize
renderProducts();
renderLookbooks();
