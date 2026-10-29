const products = [
  {id:1,name:"Cuddle Cloud Teddy",category:"Plush",price:24.99,emoji:"🧸",badge:"BEST LOVED",rating:"4.9",bg:"#f7dce8",description:"A soft friend for every adventure."},
  {id:2,name:"Rainbow Builder Set",category:"Building",price:18.50,emoji:"🧱",badge:"LITTLE MAKERS",rating:"4.8",bg:"#f9e8b7",description:"Stack, create, and dream big."},
  {id:3,name:"Happy Little Roadster",category:"Vehicles",price:12.99,emoji:"🚗",badge:"ZOOM ZOOM",rating:"4.7",bg:"#d9e9f8",description:"Ready, set, imagine!"}, 
  {id:4,name:"Dreamy Doll Friend",category:"Plush",price:21.00,emoji:"🎎",badge:"NEW FRIEND",rating:"4.9",bg:"#e6def8",description:"A sweet companion for pretend play."},
  {id:5,name:"Tiny Dino Discovery",category:"Learning",price:15.75,emoji:"🦕",badge:"ROAR-SOME",rating:"4.8",bg:"#d8eddf",description:"Big prehistoric fun for curious minds."},
  {id:6,name:"Starry Night Rocket",category:"Vehicles",price:19.99,emoji:"🚀",badge:"BLAST OFF",rating:"4.8",bg:"#d9e2fa",description:"Three, two, one… adventure!"}, 
  {id:7,name:"Color Pop Art Kit",category:"Learning",price:16.50,emoji:"🎨",badge:"MAKE MAGIC",rating:"4.7",bg:"#fde1c9",description:"A little color, a lot of creativity."},
  {id:8,name:"Wiggly Worm Puzzle",category:"Building",price:9.99,emoji:"🐛",badge:"PLAY & LEARN",rating:"4.6",bg:"#f7dce8",description:"A cheerful little brain teaser."}
];
const state = {category:"All",query:"",sort:"featured",cart:[],favorites:new Set()};
const $ = id => document.getElementById(id);
const productGrid = $("productGrid");
const money = value => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(value);

function visibleProducts(){
  let list = products.filter(p => (state.category==="All" || p.category===state.category) &&
    (p.name.toLowerCase().includes(state.query.toLowerCase()) || p.category.toLowerCase().includes(state.query.toLowerCase())));
  if(state.sort==="low") list.sort((a,b)=>a.price-b.price);
  if(state.sort==="high") list.sort((a,b)=>b.price-a.price);
  return list;
}
function renderProducts(){
  const list = visibleProducts();
  productGrid.innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-visual" style="background:${p.bg}">
        <span class="product-badge">${p.badge}</span>
        <button class="favorite-button ${state.favorites.has(p.id)?"favorited":""}" data-favorite="${p.id}" aria-label="Add ${p.name} to favorites">${state.favorites.has(p.id)?"♥":"♡"}</button>
        <span class="product-emoji" aria-hidden="true">${p.emoji}</span>
      </div>
      <div class="product-info">
        <span class="product-category">${p.category}</span>
        <h3>${p.name}</h3>
        <div class="product-rating">★★★★★ <span>${p.rating} · ${p.description}</span></div>
        <div class="product-bottom"><span class="product-price">${money(p.price)}</span><button class="add-button" data-add="${p.id}">＋ Add to cart</button></div>
      </div>
    </article>`).join("");
  $("emptyState").hidden = list.length !== 0;
  $("showAllButton").textContent = state.category==="All" && !state.query ? "You're seeing all the magic ✦" : "Show all the toys ✦";
}
function addToCart(id){
  const existing = state.cart.find(item=>item.id===id);
  if(existing) existing.qty++; else state.cart.push({id,qty:1});
  renderCart();
  showToast(`${products.find(p=>p.id===id).name} added to your cart! ♡`);
}
function changeQty(id,delta){
  const item = state.cart.find(i=>i.id===id);
  if(!item)return;
  item.qty += delta;
  if(item.qty<=0) state.cart = state.cart.filter(i=>i.id!==id);
  renderCart();
}
function renderCart(){
  const count = state.cart.reduce((sum,item)=>sum+item.qty,0);
  $("cartCount").textContent = count;
  $("cartItems").innerHTML = state.cart.map(item=>{
    const p=products.find(product=>product.id===item.id);
    return `<div class="cart-line"><div class="cart-line-art" style="background:${p.bg}">${p.emoji}</div><div><h3>${p.name}</h3><small>${money(p.price)} each</small><div class="quantity-controls"><button data-qty="${p.id}" data-delta="-1" aria-label="Remove one">−</button><span>${item.qty}</span><button data-qty="${p.id}" data-delta="1" aria-label="Add one">+</button></div></div><span class="cart-line-price">${money(p.price*item.qty)}</span></div>`;
  }).join("");
  const isEmpty = count===0;
  $("cartEmpty").style.display = isEmpty?"block":"none";
  $("cartSummary").style.display = isEmpty?"none":"block";
  $("cartSubtotal").textContent = money(state.cart.reduce((sum,item)=>sum+products.find(p=>p.id===item.id).price*item.qty,0));
}
function openCart(){
  $("cartDrawer").classList.add("open");$("cartBackdrop").classList.add("open");
  $("cartDrawer").setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
}
function closeCart(){
  $("cartDrawer").classList.remove("open");$("cartBackdrop").classList.remove("open");
  $("cartDrawer").setAttribute("aria-hidden","true");document.body.style.overflow="";
}
let toastTimer;
function showToast(message){
  const toast=$("toast");toast.textContent=message;toast.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2400);
}

$("categoryRow").addEventListener("click",event=>{
  const button=event.target.closest("[data-category]");if(!button)return;
  state.category=button.dataset.category;
  document.querySelectorAll(".category-chip").forEach(chip=>chip.classList.toggle("active",chip===button));
  renderProducts();
});
productGrid.addEventListener("click",event=>{
  const add=event.target.closest("[data-add]");
  if(add){addToCart(Number(add.dataset.add));return;}
  const favorite=event.target.closest("[data-favorite]");
  if(favorite){const id=Number(favorite.dataset.favorite);state.favorites.has(id)?state.favorites.delete(id):state.favorites.add(id);renderProducts();showToast(state.favorites.has(id)?"Saved to your favorites ♡":"Removed from favorites");}
});
$("searchInput").addEventListener("input",event=>{state.query=event.target.value;renderProducts();});
$("sortSelect").addEventListener("change",event=>{state.sort=event.target.value;renderProducts();});
$("showAllButton").addEventListener("click",()=>{state.category="All";state.query="";$("searchInput").value="";document.querySelectorAll(".category-chip").forEach(chip=>chip.classList.toggle("active",chip.dataset.category==="All"));renderProducts();});
$("cartToggle").addEventListener("click",openCart);
$("closeCart").addEventListener("click",closeCart);
$("cartBackdrop").addEventListener("click",closeCart);
$("keepShopping").addEventListener("click",()=>{closeCart();$("shop").scrollIntoView({behavior:"smooth"});});
$("cartItems").addEventListener("click",event=>{const button=event.target.closest("[data-qty]");if(button)changeQty(Number(button.dataset.qty),Number(button.dataset.delta));});
$("checkoutButton").addEventListener("click",()=>showToast("This is a demo store — checkout isn't connected yet! 🧸"));
$("newsletterForm").addEventListener("submit",event=>{
  event.preventDefault();
  const email=$("emailInput").value.trim();
  if(!email)return;
  $("newsletterMessage").textContent="You're on the list! Thanks for joining our little fun club. 💌";
  $("newsletterMessage").style.color="#6c8b6e";$("emailInput").value="";
});
$("searchToggle").addEventListener("click",()=>{$("searchInput").focus();$("shop").scrollIntoView({behavior:"smooth"});});
$("menuToggle").addEventListener("click",()=>$("mainNav").classList.toggle("open"));
$("mainNav").addEventListener("click",event=>{if(event.target.closest("a"))$("mainNav").classList.remove("open");});
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeCart();});
renderProducts();renderCart();
