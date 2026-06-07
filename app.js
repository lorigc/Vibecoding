const drinks = [
  { id: 1, name: "Espresso", description: "Rich and concentrated shot.", basePrice: 3.0 },
  { id: 2, name: "Latte", description: "Creamy espresso with steamed milk.", basePrice: 4.5 },
  { id: 3, name: "Cappuccino", description: "Velvety foam and bold flavor.", basePrice: 4.75 },
  { id: 4, name: "Cold Brew", description: "Smooth iced coffee, slow steeped.", basePrice: 4.25 },
  { id: 5, name: "Mocha", description: "Coffee with chocolate and milk.", basePrice: 5.0 },
];

const sizes = [
  { label: "Small", multiplier: 1 },
  { label: "Medium", multiplier: 1.3 },
  { label: "Large", multiplier: 1.6 },
];

const milks = [
  { label: "Whole milk", extra: 0 },
  { label: "Oat milk", extra: 0.5 },
  { label: "Almond milk", extra: 0.5 },
  { label: "Coconut milk", extra: 0.6 },
];

const addons = [
  { label: "Extra shot", price: 0.9 },
  { label: "Vanilla syrup", price: 0.5 },
  { label: "Caramel syrup", price: 0.5 },
  { label: "Whipped cream", price: 0.7 },
];

let currentOrder = [];

const menuGrid = document.getElementById("menu-grid");
const drinkSelect = document.getElementById("drink-select");
const sizeSelect = document.getElementById("size-select");
const milkSelect = document.getElementById("milk-select");
const quantityInput = document.getElementById("quantity-input");
const orderSummary = document.getElementById("order-summary");
const addOrderBtn = document.getElementById("add-order-btn");
const placeOrderBtn = document.getElementById("place-order-btn");
const storeSelect = document.getElementById("store-select");
const pickupTime = document.getElementById("pickup-time");
const toast = document.getElementById("toast");
const pickupStatus = document.getElementById("pickup-status");

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

function renderMenu() {
  menuGrid.innerHTML = "";
  drinks.forEach((drink) => {
    const card = document.createElement("article");
    card.className = "menu-card card";
    card.innerHTML = `
      <div>
        <h3>${drink.name}</h3>
        <p>${drink.description}</p>
        <div class="price">${formatCurrency(drink.basePrice)}</div>
      </div>
      <button class="secondary-btn">Customize</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      drinkSelect.value = drink.id;
      showToast(`${drink.name} is ready to customize.`);
    });

    menuGrid.appendChild(card);
  });
}

function populateOptions() {
  drinks.forEach((drink) => {
    const option = document.createElement("option");
    option.value = drink.id;
    option.textContent = drink.name;
    drinkSelect.appendChild(option);
  });

  sizes.forEach((size) => {
    const option = document.createElement("option");
    option.value = size.label;
    option.textContent = `${size.label} (${size.multiplier}x)`;
    sizeSelect.appendChild(option);
  });

  milks.forEach((milk) => {
    const option = document.createElement("option");
    option.value = milk.label;
    option.textContent = `${milk.label}${milk.extra ? ` +${formatCurrency(milk.extra)}` : ""}`;
    milkSelect.appendChild(option);
  });
}

function getSelectedAddons() {
  return Array.from(document.querySelectorAll("input[name='addon']"))
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => {
      const addon = addons.find((item) => item.label === checkbox.value);
      return addon ? { ...addon } : null;
    })
    .filter(Boolean);
}

function calculateItemPrice(item) {
  const drink = drinks.find((drink) => drink.id === parseInt(item.drinkId, 10));
  const size = sizes.find((size) => size.label === item.size);
  const milk = milks.find((milk) => milk.label === item.milk);
  const addonTotal = item.addons.reduce((sum, addon) => sum + addon.price, 0);
  const base = drink.basePrice * size.multiplier + milk.extra + addonTotal;
  return base * item.quantity;
}

function renderOrder() {
  orderSummary.innerHTML = "";
  if (currentOrder.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No items added yet.";
    orderSummary.appendChild(empty);
    return;
  }

  let total = 0;
  currentOrder.forEach((item, index) => {
    const itemTotal = calculateItemPrice(item);
    total += itemTotal;

    const itemBlock = document.createElement("div");
    itemBlock.className = "order-item";
    itemBlock.innerHTML = `
      <div>
        <strong>${item.name}</strong>
      </div>
      <div>${item.size} · ${item.milk} · ${item.quantity}x</div>
      <div>${item.addons.length ? item.addons.map((addon) => addon.label).join(", ") : "No add-ons"}</div>
      <div>${formatCurrency(itemTotal)}</div>
      <button class="secondary-btn remove-btn">Remove</button>
    `;

    itemBlock.querySelector(".remove-btn").addEventListener("click", () => {
      currentOrder.splice(index, 1);
      renderOrder();
      showToast("Item removed from your order.");
    });

    orderSummary.appendChild(itemBlock);
  });

  const totalBlock = document.createElement("div");
  totalBlock.className = "order-total";
  totalBlock.textContent = `Total: ${formatCurrency(total)}`;
  orderSummary.appendChild(totalBlock);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2200);
}

function addToOrder() {
  const drinkId = parseInt(drinkSelect.value, 10);
  const drink = drinks.find((drink) => drink.id === drinkId);
  const size = sizeSelect.value;
  const milk = milkSelect.value;
  const quantity = Math.max(1, Number(quantityInput.value));
  const selectedAddons = getSelectedAddons();

  const orderItem = {
    drinkId,
    name: drink.name,
    size,
    milk,
    quantity,
    addons: selectedAddons,
  };

  currentOrder.push(orderItem);
  renderOrder();
  showToast(`${quantity} ${drink.name}${quantity > 1 ? "s" : ""} added.`);
}

function placeOrder() {
  if (currentOrder.length === 0) {
    showToast("Add a drink before placing an order.");
    return;
  }

  const pickupLocation = storeSelect.value;
  const pickupAt = pickupTime.value || "ASAP";
  currentOrder = [];
  renderOrder();
  pickupStatus.textContent = `Order placed for ${pickupAt} at ${pickupLocation}`;
  showToast("Your order is confirmed! Pick it up in store.");
}

function init() {
  populateOptions();
  renderMenu();
  renderOrder();

  addOrderBtn.addEventListener("click", addToOrder);
  placeOrderBtn.addEventListener("click", placeOrder);
}

init();
