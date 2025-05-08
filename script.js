let cart = JSON.parse(localStorage.getItem("cart")) || [];
let orderConfirmed = false;

// Update Cart Display
function updateCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalElement = document.getElementById("cart-total");
  const receiptContainer = document.getElementById("receipt-container");
  const receiptButton = document.getElementById("view-receipt");

  cartItemsContainer.innerHTML = "";

  if (!orderConfirmed) {
    receiptContainer.innerHTML = "";
  }

  let total = 0;
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} - ₱${item.price} x ${item.quantity} = ₱${itemTotal}
      <button onclick="decreaseQuantity(${index})">-</button>
      <button onclick="increaseQuantity(${index})">+</button>
      <button onclick="removeFromCart(${index})">❌</button>
    `;
    cartItemsContainer.appendChild(li);
  });

  cartTotalElement.textContent = total;
  receiptButton.style.display = orderConfirmed ? "block" : "none";

  localStorage.setItem("cart", JSON.stringify(cart));
}

// Cart Functions
function addToCart(name, price) {
  const existingItem = cart.find(item => item.name === name);
  existingItem ? existingItem.quantity++ : cart.push({ name, price, quantity: 1 });
  updateCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function increaseQuantity(index) {
  cart[index].quantity++;
  updateCart();
}

function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    cart.splice(index, 1);
  }
  updateCart();
}

// Toggle receipt visibility
function toggleReceipt() {
  const receipt = document.getElementById("receipt-container");
  receipt.style.display = receipt.style.display === "block" ? "none" : "block";
}

// Confirm Order
function confirmOrder() {
  if (cart.length === 0) {
    alert("Your cart is empty. Add items before confirming your order.");
    return;
  }

  const orderType = document.querySelector('input[name="order-type"]:checked').value;
  const address = document.getElementById("delivery-address").value.trim();
  const packs = document.getElementById("dine-packs")?.value.trim() || "";
  const dineTime = document.getElementById("dine-time")?.value.trim() || "";
  const openTime = 10, closeTime = 21;

  if (orderType === "Delivery" && address === "") {
    alert("Please enter your delivery address.");
    return;
  }

  if (orderType === "Dine-in") {
    if (packs === "" || isNaN(packs) || parseInt(packs) <= 0) {
      alert("Please enter a valid number of packs.");
      return;
    }
    const dineHour = parseInt(dineTime.split(":")[0]);
    if (dineTime === "" || dineHour < openTime || dineHour >= closeTime) {
      alert(`Please select a time between ${openTime}:00 and ${closeTime}:00.`);
      return;
    }
  }

  // Generate receipt
  let receipt = `<h3>🧾 Receipt</h3><ul>`;
  cart.forEach(item => {
    receipt += `<li>${item.name} x ${item.quantity} - ₱${item.price * item.quantity}</li>`;
  });
  receipt += `</ul>`;
  receipt += `<p><strong>Total:</strong> ₱${document.getElementById("cart-total").textContent}</p>`;
  receipt += `<p><strong>Order Type:</strong> ${orderType}</p>`;

  if (orderType === "Delivery") {
    receipt += `<p><strong>Delivery Address:</strong> ${address}</p>`;
  } else {
    receipt += `<p><strong>Packs:</strong> ${packs}</p>`;
    receipt += `<p><strong>Time:</strong> ${dineTime}</p>`;
  }

  document.getElementById("receipt-container").innerHTML = receipt;
  document.getElementById("receipt-container").style.display = "block";

  orderConfirmed = true;
  document.getElementById("view-receipt").style.display = "block";
  document.getElementById("confirm-order").style.display = "none";
  document.getElementById("order-again").style.display = "block";

  cart = [];
  localStorage.removeItem("cart");
  updateCart();
}

// Reset Cart
function resetCart() {
  document.getElementById("receipt-container").style.display = "none";
  document.getElementById("confirm-order").style.display = "block";
  document.getElementById("view-receipt").style.display = "none";
  document.getElementById("order-again").style.display = "none";

  orderConfirmed = false;
  cart = [];
  localStorage.removeItem("cart");
  updateCart();
}

// Radio Button Logic
document.querySelectorAll('input[name="order-type"]').forEach(radio => {
  radio.addEventListener("change", function () {
    const addressContainer = document.getElementById("address-container");
    const dineContainer = document.getElementById("dine-container");

    if (this.value === "Delivery") {
      addressContainer.style.display = "block";
      dineContainer.style.display = "none";
    } else {
      addressContainer.style.display = "none";
      dineContainer.style.display = "block";
    }
  });
});

// Add-to-cart buttons (optional: adjust for your menu layout)
document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", function () {
    const name = this.getAttribute("data-name");
    const price = parseFloat(this.getAttribute("data-price"));
    addToCart(name, price);
  });
});

// Toggle Cart Expand/Collapse
document.getElementById("toggle-cart").addEventListener("click", function () {
  const cartContent = document.getElementById("cart-content");

  if (cartContent.classList.contains("hidden")) {
    cartContent.classList.remove("hidden");
    this.textContent = "➖";
  } else {
    cartContent.classList.add("hidden");
    this.textContent = "➕";
  }
});

// Draggable Cart
const cartContainer = document.getElementById("cart-container");
const cartHeader = document.getElementById("cart-header");
let isDragging = false, shiftX, shiftY;

cartHeader.addEventListener("mousedown", function (event) {
  isDragging = true;
  shiftX = event.clientX - cartContainer.getBoundingClientRect().left;
  shiftY = event.clientY - cartContainer.getBoundingClientRect().top;

  function moveAt(pageX, pageY) {
    cartContainer.style.left = pageX - shiftX + "px";
    cartContainer.style.top = pageY - shiftY + "px";
  }

  function onMouseMove(event) {
    if (isDragging) moveAt(event.pageX, event.pageY);
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
});

cartHeader.ondragstart = () => false;

// Initial render
updateCart();

// Collapse cart on load
document.getElementById("cart-content").classList.add("hidden");
document.getElementById("toggle-cart").textContent = "➕";

