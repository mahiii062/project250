function openModal() { 
  document.getElementById("popup").classList.add("active"); 
}

function closeModal() { 
  document.getElementById("popup").classList.remove("active"); 
}

// Personalized greeting
const customerName = localStorage.getItem("customerName") || "Customer";
const hour = new Date().getHours();
let greeting = "Welcome Back";
if(hour < 12) greeting = "Good Morning";
else if(hour < 18) greeting = "Good Afternoon";
else greeting = "Good Evening";
document.getElementById("welcomeMessage").textContent = `${greeting}, ${customerName}!`;

// Example Recommendations
const recommendations = [
  { name: "Bohemian Rug", img: "../images/bohemian.jpg", price: "TK. 12,000" },
  { name: "Modern Lamp", img: "../images/lamp1.jpg", price: "TK. 8,500" },
  { name: "Classic Sofa", img: "../images/singleSofa.jpg", price: "TK. 25,000" },
  { name: "Minimalist Table", img: "../images/minimalist.jpg", price: "TK. 15,000" },
  { name: "Industrial Chair", img: "../images/modern.jpg", price: "TK. 9,500" }
];

const recentItems = JSON.parse(localStorage.getItem("recentItems")) || [
  { name: "Indoor Tree", img: "../images/indoorTree.jpg" },
  { name: "Minimalist Chair", img: "../images/modern.jpg" },
  { name: "Classic Lamp", img: "../images/lamp.jpg" },
  { name: "Bohemian Decor", img: "../images/bohemian.jpg" }
];

const discounts = [
  "🔥 20% off on all Bohemian Furniture this week!",
  "💡 Buy 1 Lamp, Get 1 Free – Limited Time!",
  "🛋 Special Sofa Set Discount: Save up to TK. 5,000!",
  "🎨 Free consultation with top interior designers for orders above TK. 50,000"
];

// Render Recommendations
const recContainer = document.getElementById("recommendations");
recommendations.forEach(item => {
  recContainer.innerHTML += `
    <div class="recommend-card">
      <img src="${item.img}" alt="${item.name}">
      <p><strong>${item.name}</strong></p>
      <p style="color:var(--primary)">${item.price}</p>
    </div>
  `;
});

// Render Recently Viewed
const recentContainer = document.getElementById("recentlyViewed");
recentItems.forEach(item => {
  recentContainer.innerHTML += `
    <div class="recommend-card">
      <img src="${item.img}" alt="${item.name}">
      <p><strong>${item.name}</strong></p>
    </div>
  `;
});

// Render Discounts
const discountsContainer = document.getElementById("discounts");
discounts.forEach(discount => {
  discountsContainer.innerHTML += `<li>${discount}</li>`;
});

// Auto-open modal for first-time visitors
if (!localStorage.getItem("hasVisited")) {
  setTimeout(openModal, 1000);
  localStorage.setItem("hasVisited", "true");
}
