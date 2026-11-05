const products = [
  {
    id: "jordan-red-thunder",
    name: "Air Jordan 4 Retro Red Thunder",
    brand: "Jordan",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    price: 899.90,
    oldPrice: 999.90,
    badge: "DROP 01",
    image: "./Jordan 4s red thunder.jfif",
    alt: "Tênis Jordan 4 preto e vermelho",
    description: "Um clássico de presença marcante. Cabedal robusto, detalhes em vermelho e visual que transforma qualquer combinação.",
    sizes: [37, 38, 39, 40, 41, 42, 43, 44]
  },
  {
    id: "adidas-superstar",
    name: "Superstar Classic",
    brand: "adidas",
    category: "casual",
    categoryLabel: "Casual",
    price: 499.90,
    oldPrice: 599.90,
    badge: "CLÁSSICO",
    image: "./adidas SUPERSTAR.jfif",
    alt: "Tênis adidas Superstar clássico em preto e branco",
    description: "Um ícone que atravessa gerações. Linhas atemporais para usar do seu jeito, em qualquer ocasião.",
    sizes: [36, 37, 38, 39, 40, 41, 42, 43]
  },
  {
    id: "olympikus-dynamic",
    name: "Dynamic — Corrida & Dia a dia",
    brand: "Olympikus",
    category: "corrida",
    categoryLabel: "Corrida",
    price: 249.90,
    oldPrice: 299.90,
    badge: "BEST SELLER",
    image: "./Tênis Olympikus Dynamic Masculino Original.jfif",
    alt: "Tênis de corrida preto com detalhes vermelhos",
    description: "Leveza e conforto para acompanhar sua rotina. Um parceiro versátil para os treinos e para o corre de todo dia.",
    sizes: [37, 38, 39, 40, 41, 42, 43, 44]
  },
  {
    id: "puma-ultra-astronaut",
    name: "Ultra Ultimate FG/AG Astronaut",
    brand: "PUMA",
    category: "futebol",
    categoryLabel: "Futebol",
    price: 799.90,
    oldPrice: null,
    badge: "EM CAMPO",
    image: "./PUMA Ultra Ultimate FG_AG Astronaut - Weiß_Orange_Blazing Blue LIMITED EDITION - Kunstrasen (AG) _ Rasen (FG), Größe 47.jfif",
    alt: "Chuteira Puma branca e laranja para campo",
    description: "Aceleração para chegar primeiro na bola. Travas FG/AG para gramado natural e sintético, com visual inspirado no espaço.",
    sizes: [38, 39, 40, 41, 42, 43, 44]
  },
  {
    id: "jordan-mono",
    name: "Air Jordan 1 Mono",
    brand: "Jordan",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    price: 649.90,
    oldPrice: 749.90,
    badge: "SELEÇÃO DS",
    image: "./Jordan Aesthetic.jfif",
    alt: "Tênis Jordan de cano alto em composição preto e branco",
    description: "Silhueta clássica e atitude de sobra. Um modelo versátil para elevar produções urbanas sem esforço.",
    sizes: [37, 38, 39, 40, 41, 42, 43]
  },
  {
    id: "street-flex",
    name: "Street Flex Knit",
    brand: "Dragonsnikers",
    category: "casual",
    categoryLabel: "Casual",
    price: 189.90,
    oldPrice: 229.90,
    badge: "ATÉ 20% OFF",
    image: "./62,90 R$ tênis masculino.jfif",
    alt: "Tênis casual azul-marinho com detalhes verde-limão",
    description: "Leve, confortável e pronto para acompanhar seu ritmo. Um modelo casual com cabedal flexível e visual esportivo.",
    sizes: [37, 38, 39, 40, 41, 42, 43, 44]
  }
];

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const byId = (id) => document.getElementById(id);
const icon = (name) => '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
const safeRead = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage is optional */ }
};

let cart = safeRead("dragonsnikers-cart", []);
let favorites = safeRead("dragonsnikers-favorites", []);
let selectedCategory = "all";
let searchTerm = "";
let sortMode = "featured";
let favoritesOnly = false;
let saleOnly = false;
let activeProduct = null;
let selectedSize = null;
let toastTimer;
let overlayTimer;

const productGrid = byId("productGrid");
const overlay = byId("overlay");
const cartDrawer = byId("cartDrawer");
const productModal = byId("productModal");
const checkoutModal = byId("checkoutModal");

function normalize(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function filteredProducts() {
  let list = products.filter((product) => {
    const searchable = normalize(product.name + " " + product.brand + " " + product.categoryLabel);
    const matchesSearch = searchable.includes(normalize(searchTerm));
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesFavorites = !favoritesOnly || favorites.includes(product.id);
    const matchesSale = !saleOnly || Boolean(product.oldPrice);
    return matchesSearch && matchesCategory && matchesFavorites && matchesSale;
  });

  if (sortMode === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sortMode === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sortMode === "name") list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  return list;
}

function renderProducts() {
  const visibleProducts = filteredProducts();
  byId("resultsCount").textContent = visibleProducts.length + (visibleProducts.length === 1 ? " modelo" : " modelos");
  byId("emptyState").hidden = visibleProducts.length > 0;
  productGrid.hidden = visibleProducts.length === 0;
  byId("clearFilters").hidden = !(searchTerm || selectedCategory !== "all" || favoritesOnly || saleOnly);

  productGrid.innerHTML = visibleProducts.map((product) => {
    const isFavorite = favorites.includes(product.id);
    const price = product.oldPrice
      ? '<span class="product-old-price">' + money.format(product.oldPrice) + '</span>' + money.format(product.price)
      : money.format(product.price);
    return '<article class="product-card">' +
      '<div class="product-image-wrap">' +
        '<span class="product-badge' + (product.oldPrice ? " badge-sale" : "") + '">' + product.badge + '</span>' +
        '<button class="product-heart' + (isFavorite ? " is-favorite" : "") + '" type="button" data-favorite="' + product.id + '" aria-label="' + (isFavorite ? "Remover dos" : "Adicionar aos") + ' favoritos" aria-pressed="' + isFavorite + '">' + icon("heart") + '</button>' +
        '<img class="product-image" src="' + product.image + '" alt="' + product.alt + '" loading="lazy">' +
        '<button class="product-quick" type="button" data-open-product="' + product.id + '">Escolher tamanho ' + icon("arrow") + '</button>' +
      '</div>' +
      '<div class="product-info">' +
        '<span class="product-brand">' + product.brand + '</span>' +
        '<span class="product-name">' + product.name + '</span>' +
        '<span class="product-price">' + price + '</span>' +
        '<span class="product-meta">' + product.categoryLabel + ' · ' + product.sizes.length + ' tamanhos</span>' +
      '</div>' +
    '</article>';
  }).join("");
}

function updateFavoriteCount() {
  byId("favoritesCount").textContent = favorites.length;
  byId("favoritesButton").classList.toggle("is-active", favoritesOnly);
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  byId("cartCount").textContent = count;
  byId("drawerCount").textContent = "(" + count + ")";
  byId("cartButton").setAttribute("aria-label", "Abrir sacola com " + count + (count === 1 ? " item" : " itens"));
}

function renderCart() {
  cart = cart.filter((item) => products.some((product) => product.id === item.id) && item.quantity > 0);
  save("dragonsnikers-cart", cart);
  updateCartCount();

  const itemsRoot = byId("cartItems");
  const empty = cart.length === 0;
  byId("cartEmpty").classList.toggle("is-visible", empty);
  byId("cartSummary").classList.toggle("is-hidden", empty);

  itemsRoot.innerHTML = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return '<div class="cart-line">' +
      '<img class="cart-line-image" src="' + product.image + '" alt="">' +
      '<div class="cart-line-info">' +
        '<span class="cart-line-brand">' + product.brand + '</span>' +
        '<strong class="cart-line-name">' + product.name + '</strong>' +
        '<span class="cart-line-size">Tamanho ' + item.size + '</span>' +
        '<div class="quantity-control"><button type="button" data-quantity="-1" data-item="' + item.id + '" data-size="' + item.size + '" aria-label="Diminuir quantidade">' + icon("minus") + '</button><span>' + item.quantity + '</span><button type="button" data-quantity="1" data-item="' + item.id + '" data-size="' + item.size + '" aria-label="Aumentar quantidade">' + icon("plus") + '</button></div>' +
      '</div>' +
      '<div class="cart-line-side"><strong class="cart-line-price">' + money.format(product.price * item.quantity) + '</strong><button type="button" class="remove-item" data-remove="' + item.id + '" data-size="' + item.size + '">Remover</button></div>' +
    '</div>';
  }).join("");

  const subtotal = cart.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
  byId("cartSubtotal").textContent = money.format(subtotal);
  byId("cartTotal").textContent = money.format(subtotal);
  byId("checkoutTotal").textContent = money.format(subtotal);
}

function showToast(message) {
  byId("toastMessage").textContent = message;
  byId("toast").classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => byId("toast").classList.remove("is-visible"), 2800);
}

function prepareOverlay() {
  window.clearTimeout(overlayTimer);
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("is-visible"));
  document.body.classList.add("modal-open");
}

function closeLayers() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  productModal.classList.remove("is-open");
  productModal.setAttribute("aria-hidden", "true");
  checkoutModal.classList.remove("is-open");
  checkoutModal.setAttribute("aria-hidden", "true");
  overlay.classList.remove("is-visible");
  document.body.classList.remove("modal-open");
  overlayTimer = window.setTimeout(() => { overlay.hidden = true; }, 250);
}

function openCart() {
  closeLayers();
  prepareOverlay();
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  renderCart();
  byId("closeCart").focus();
}

function openProduct(id) {
  const product = products.find((entry) => entry.id === id);
  if (!product) return;
  closeLayers();
  activeProduct = product;
  selectedSize = null;
  prepareOverlay();

  byId("modalImage").src = product.image;
  byId("modalImage").alt = product.alt;
  byId("modalCategory").textContent = product.brand + " · " + product.categoryLabel.toUpperCase();
  byId("modalProductName").textContent = product.name;
  byId("modalPrice").textContent = money.format(product.price);
  byId("modalDescription").textContent = product.description;
  byId("sizeError").hidden = true;
  byId("sizeList").innerHTML = product.sizes.map((size) =>
    '<button class="size-option" type="button" data-size-option="' + size + '" aria-pressed="false">' + size + '</button>'
  ).join("");
  productModal.classList.add("is-open");
  productModal.setAttribute("aria-hidden", "false");
  byId("closeProductModal").focus();
}

function closeProduct() {
  productModal.classList.remove("is-open");
  productModal.setAttribute("aria-hidden", "true");
  overlay.classList.remove("is-visible");
  document.body.classList.remove("modal-open");
  overlayTimer = window.setTimeout(() => { overlay.hidden = true; }, 250);
}

function addToCart(product, size) {
  const existing = cart.find((item) => item.id === product.id && item.size === size);
  if (existing) existing.quantity += 1;
  else cart.push({ id: product.id, size, quantity: 1 });
  save("dragonsnikers-cart", cart);
  renderCart();
  showToast(product.name + " adicionado à sacola");
  closeLayers();
  openCart();
}

function setCategory(category) {
  selectedCategory = category;
  saleOnly = category === "sale";
  if (category === "sale") selectedCategory = "all";
  document.querySelectorAll(".category-chip").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.category === selectedCategory);
  });
  renderProducts();
}

function toggleFavorite(id) {
  favorites = favorites.includes(id) ? favorites.filter((favorite) => favorite !== id) : [...favorites, id];
  save("dragonsnikers-favorites", favorites);
  updateFavoriteCount();
  renderProducts();
  if (favoritesOnly && favorites.length === 0) {
    favoritesOnly = false;
    updateFavoriteCount();
    renderProducts();
  }
  showToast(favorites.includes(id) ? "Adicionado aos favoritos" : "Removido dos favoritos");
}

function closeMobileMenu() {
  byId("mainNav").classList.remove("is-open");
  byId("menuButton").setAttribute("aria-expanded", "false");
}

document.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.favorite);
    return;
  }
  const productButton = event.target.closest("[data-open-product]");
  if (productButton) {
    openProduct(productButton.dataset.openProduct);
    return;
  }
  const sizeButton = event.target.closest("[data-size-option]");
  if (sizeButton) {
    selectedSize = Number(sizeButton.dataset.sizeOption);
    document.querySelectorAll(".size-option").forEach((button) => {
      const selected = button === sizeButton;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    byId("sizeError").hidden = true;
    return;
  }
  const quantityButton = event.target.closest("[data-quantity]");
  if (quantityButton) {
    const item = cart.find((entry) => entry.id === quantityButton.dataset.item && entry.size === Number(quantityButton.dataset.size));
    if (item) item.quantity += Number(quantityButton.dataset.quantity);
    cart = cart.filter((entry) => entry.quantity > 0);
    save("dragonsnikers-cart", cart);
    renderCart();
    return;
  }
  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    cart = cart.filter((entry) => !(entry.id === removeButton.dataset.remove && entry.size === Number(removeButton.dataset.size)));
    save("dragonsnikers-cart", cart);
    renderCart();
    return;
  }
  const navCategory = event.target.closest("[data-nav-category]");
  if (navCategory) {
    setCategory(navCategory.dataset.navCategory);
    favoritesOnly = false;
    updateFavoriteCount();
    closeMobileMenu();
  }
  const featureCategory = event.target.closest("[data-feature-category]");
  if (featureCategory) setCategory(featureCategory.dataset.featureCategory);
});

document.querySelectorAll(".category-chip").forEach((button) => {
  button.addEventListener("click", () => {
    favoritesOnly = false;
    updateFavoriteCount();
    setCategory(button.dataset.category);
  });
});

byId("searchForm").addEventListener("submit", (event) => event.preventDefault());
byId("searchForm").addEventListener("click", () => {
  if (window.matchMedia("(max-width: 560px)").matches) byId("searchInput").focus();
});
byId("searchInput").addEventListener("input", (event) => {
  searchTerm = event.target.value.trim();
  renderProducts();
});
byId("sortSelect").addEventListener("change", (event) => {
  sortMode = event.target.value;
  renderProducts();
});
byId("clearFilters").addEventListener("click", () => {
  selectedCategory = "all";
  saleOnly = false;
  favoritesOnly = false;
  searchTerm = "";
  byId("searchInput").value = "";
  byId("sortSelect").value = "featured";
  sortMode = "featured";
  updateFavoriteCount();
  setCategory("all");
});
byId("emptyReset").addEventListener("click", () => byId("clearFilters").click());

byId("favoritesButton").addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  saleOnly = false;
  selectedCategory = "all";
  document.querySelectorAll(".category-chip").forEach((button) => button.classList.toggle("is-active", button.dataset.category === "all"));
  updateFavoriteCount();
  renderProducts();
  byId("colecao").scrollIntoView({ behavior: "smooth" });
});
byId("cartButton").addEventListener("click", openCart);
byId("closeCart").addEventListener("click", closeLayers);
byId("continueShopping").addEventListener("click", closeLayers);
byId("closeProductModal").addEventListener("click", closeProduct);
byId("overlay").addEventListener("click", closeLayers);
byId("closeCheckout").addEventListener("click", closeLayers);
byId("menuButton").addEventListener("click", () => {
  const expanded = byId("menuButton").getAttribute("aria-expanded") === "true";
  byId("mainNav").classList.toggle("is-open", !expanded);
  byId("menuButton").setAttribute("aria-expanded", String(!expanded));
});
byId("modalAddToCart").addEventListener("click", () => {
  if (!activeProduct) return;
  if (!selectedSize) {
    byId("sizeError").hidden = false;
    byId("sizeList").querySelector(".size-option")?.focus();
    return;
  }
  addToCart(activeProduct, selectedSize);
});
byId("sizeGuide").addEventListener("click", () => showToast("Numeração brasileira. Na dúvida, confira a medida do seu pé antes de escolher."));

byId("checkoutButton").addEventListener("click", () => {
  if (!cart.length) return;
  closeLayers();
  prepareOverlay();
  checkoutModal.classList.add("is-open");
  checkoutModal.setAttribute("aria-hidden", "false");
  byId("closeCheckout").focus();
});
byId("checkoutForm").addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("Checkout demonstrativo: conecte um sistema de pedidos para concluir a compra.");
});

byId("newsletterForm").addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("Newsletter ainda não conectada. Seu e-mail não foi enviado.");
  event.currentTarget.reset();
});
byId("checkoutForm").elements.zip.addEventListener("input", (event) => {
  const digits = event.target.value.replace(/\D/g, "").slice(0, 8);
  event.target.value = digits.length > 5 ? digits.slice(0, 5) + "-" + digits.slice(5) : digits;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLayers();
    closeMobileMenu();
  }
  if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    byId("searchInput").focus();
  }
});

renderProducts();
renderCart();
updateFavoriteCount();


