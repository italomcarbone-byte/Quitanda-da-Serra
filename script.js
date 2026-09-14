// ================================================================
// QUITANDA DA SERRA — FRONTEND
// Tudo nesta camada pode ser alterado pelo programador.
// Para produção, substitua o localStorage por uma API/backend.
// ================================================================

const CONFIG = {
  whatsappEmpresa: "5512999999999", // <-- TROQUE pelo WhatsApp real, com DDI + DDD.
  nomeEmpresa: "Quitanda da Serra",
  endereco: "Rua 15 de Novembro, 521 - São Francisco Xavier - São José dos Campos/SP"
};

const defaultProducts = [
  {id:1,name:"Banana prata",category:"frutas",price:6.90,unit:"kg",emoji:"🍌"},
  {id:2,name:"Maçã",category:"frutas",price:9.90,unit:"kg",emoji:"🍎"},
  {id:3,name:"Laranja",category:"frutas",price:5.90,unit:"kg",emoji:"🍊"},
  {id:4,name:"Alface crespa",category:"verduras",price:3.90,unit:"unidade",emoji:"🥬"},
  {id:5,name:"Couve",category:"verduras",price:4.50,unit:"maço",emoji:"🌿"},
  {id:6,name:"Tomate",category:"legumes",price:8.90,unit:"kg",emoji:"🍅"},
  {id:7,name:"Batata",category:"legumes",price:6.50,unit:"kg",emoji:"🥔"},
  {id:8,name:"Cenoura",category:"legumes",price:5.90,unit:"kg",emoji:"🥕"},
  {id:9,name:"Leite integral",category:"laticinios",price:5.49,unit:"1 L",emoji:"🥛"},
  {id:10,name:"Queijo artesanal",category:"artesanais",price:34.90,unit:"500 g",emoji:"🧀"},
  {id:11,name:"Geleia artesanal",category:"artesanais",price:22.90,unit:"pote",emoji:"🍓"},
  {id:12,name:"Café especial da serra",category:"mercearia",price:29.90,unit:"500 g",emoji:"☕"},
  {id:13,name:"Arroz",category:"mercearia",price:7.99,unit:"5 kg",emoji:"🍚"},
  {id:14,name:"Água mineral",category:"bebidas",price:3.50,unit:"1,5 L",emoji:"💧"}
];

let products = JSON.parse(localStorage.getItem("qs_products") || "null") || defaultProducts;
let cart = JSON.parse(localStorage.getItem("qs_cart") || "[]");
let users = JSON.parse(localStorage.getItem("qs_users") || "[]");
let loggedUser = JSON.parse(localStorage.getItem("qs_loggedUser") || "null");
let currentCategory = "todos";
let authMode = "register";
let salesChart;

const $ = id => document.getElementById(id);
const money = value => value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

document.addEventListener("DOMContentLoaded", () => {
  $("year").textContent = new Date().getFullYear();
  renderProducts();
  updateCartUI();
  updateAuthUI();
  bindEvents();
});

function bindEvents(){
  $("menuToggle").onclick = () => $("mainNav").classList.toggle("open");
  document.querySelectorAll(".main-nav a").forEach(a => a.onclick = () => $("mainNav").classList.remove("open"));

  $("openAuth").onclick = () => openModal("authModal");
  $("loginFromShop").onclick = () => openModal("authModal");
  $("openCart").onclick = () => { renderCart(); openModal("cartModal"); };
  $("openAdmin").onclick = () => openModal("adminModal");

  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.onclick = () => closeModal(btn.dataset.close);
  });
  document.querySelectorAll(".modal-backdrop").forEach(bg => bg.addEventListener("click", e => {
    if(e.target === bg) bg.classList.remove("open");
  }));

  document.querySelectorAll(".category").forEach(btn => btn.onclick = () => {
    document.querySelectorAll(".category").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.category;
    renderProducts();
  });
  $("productSearch").addEventListener("input", renderProducts);

  $("authForm").onsubmit = handleAuth;
  $("authSwitch").querySelector("button").onclick = () => {
    authMode = authMode === "register" ? "login" : "register";
    updateAuthMode();
  };

  $("checkoutBtn").onclick = checkout;

  $("adminLoginForm").onsubmit = e => {
    e.preventDefault();
    if($("adminUser").value === "admin" && $("adminPass").value === "quitanda123"){
      $("adminLogin").classList.add("hidden");
      $("adminPanel").classList.remove("hidden");
      renderAdminProducts();
      renderSalesChart();
    } else toast("Usuário ou senha de demonstração incorretos.");
  };

  document.querySelectorAll(".admin-tab").forEach(btn => btn.onclick = () => {
    document.querySelectorAll(".admin-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const productsTab = btn.dataset.adminTab === "products";
    $("adminProductsTab").classList.toggle("hidden", !productsTab);
    $("adminSalesTab").classList.toggle("hidden", productsTab);
    if(!productsTab) renderSalesChart();
  });

  $("productForm").onsubmit = saveProduct;
  $("cancelEdit").onclick = resetProductForm;
}

function openModal(id){ $(id).classList.add("open"); }
function closeModal(id){ $(id).classList.remove("open"); }

function renderProducts(){
  const grid = $("productsGrid");
  const query = $("productSearch").value.trim().toLowerCase();
  const filtered = products.filter(p => 
    (currentCategory === "todos" || p.category === currentCategory) &&
    (!query || p.name.toLowerCase().includes(query))
  );
  if(!filtered.length){
    grid.innerHTML = '<div class="empty">Nenhum produto encontrado.</div>';
    return;
  }
  grid.innerHTML = filtered.map(p => `
    <article class="product-card">
      <div class="product-image">${p.emoji || "🧺"}</div>
      <div class="product-info">
        <span class="product-category">${labelCategory(p.category)}</span>
        <div class="product-name">${escapeHtml(p.name)}</div>
        <div class="product-unit">${escapeHtml(p.unit || "unidade")}</div>
        <div class="product-bottom">
          <span class="product-price">${money(Number(p.price))}</span>
          <button class="add-btn" onclick="addToCart(${p.id})">Adicionar</button>
        </div>
      </div>
    </article>
  `).join("");
}

function labelCategory(cat){
  const labels = {frutas:"Frutas",verduras:"Verduras",legumes:"Legumes",bebidas:"Bebidas",laticinios:"Laticínios",artesanais:"Artesanais",mercearia:"Mercearia"};
  return labels[cat] || cat;
}

function addToCart(id){
  const p = products.find(x => x.id === id);
  if(!p) return;
  const item = cart.find(x => x.id === id);
  if(item) item.qty++;
  else cart.push({id:p.id,qty:1});
  saveCart();
  updateCartUI();
  toast(`${p.name} adicionado ao carrinho.`);
}

function updateCartUI(){
  $("cartCount").textContent = cart.reduce((sum,x)=>sum+x.qty,0);
  $("shopStatus").textContent = loggedUser ? `Olá, ${loggedUser.name.split(" ")[0]}! Você pode finalizar seu pedido.` : "Faça login para finalizar seu pedido.";
}

function saveCart(){ localStorage.setItem("qs_cart", JSON.stringify(cart)); }

function renderCart(){
  const box = $("cartItems");
  if(!cart.length){
    box.innerHTML = '<div class="empty">Seu carrinho está vazio.<br>Escolha alguns produtos para começar.</div>';
    $("cartTotal").textContent = money(0);
    return;
  }
  let total = 0;
  box.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    if(!p) return "";
    const subtotal = p.price * item.qty; total += subtotal;
    return `<div class="cart-row">
      <div><strong>${escapeHtml(p.name)}</strong><small>${money(p.price)} / ${escapeHtml(p.unit)}</small></div>
      <div class="qty"><button onclick="changeQty(${p.id},-1)">−</button><strong>${item.qty}</strong><button onclick="changeQty(${p.id},1)">+</button></div>
      <div><strong>${money(subtotal)}</strong><button class="remove" onclick="removeFromCart(${p.id})">Excluir item</button></div>
    </div>`;
  }).join("");
  $("cartTotal").textContent = money(total);
}

function changeQty(id,delta){
  const item = cart.find(x => x.id === id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) cart = cart.filter(x => x.id !== id);
  saveCart(); renderCart(); updateCartUI();
}
function removeFromCart(id){ cart = cart.filter(x => x.id !== id); saveCart(); renderCart(); updateCartUI(); }

function updateAuthMode(){
  const login = authMode === "login";
  $("authTitle").textContent = login ? "Entrar" : "Criar cadastro";
  $("authName").parentElement.classList.toggle("hidden", login);
  $("authPassword").setAttribute("autocomplete", login ? "current-password" : "new-password");
  $("authSubmit").textContent = login ? "Entrar" : "Criar cadastro";
  $("authSwitch").innerHTML = login
    ? 'Ainda não possui cadastro? <button type="button">Criar cadastro</button>'
    : 'Já possui cadastro? <button type="button">Entrar</button>';
  $("authSwitch").querySelector("button").onclick = () => { authMode = login ? "register" : "login"; updateAuthMode(); };
}

function handleAuth(e){
  e.preventDefault();
  const email = $("authEmail").value.trim().toLowerCase();
  const password = $("authPassword").value;
  if(authMode === "register"){
    const name = $("authName").value.trim();
    if(users.some(u=>u.email===email)) return toast("Este e-mail já possui cadastro.");
    const user = {id:Date.now(),name,email,password};
    users.push(user);
    localStorage.setItem("qs_users",JSON.stringify(users));
    loggedUser = user;
    localStorage.setItem("qs_loggedUser",JSON.stringify(loggedUser));
    toast("Cadastro criado com sucesso!");
    closeModal("authModal");
  }else{
    const user = users.find(u=>u.email===email && u.password===password);
    if(!user) return toast("E-mail ou senha inválidos.");
    loggedUser = user;
    localStorage.setItem("qs_loggedUser",JSON.stringify(loggedUser));
    toast("Login realizado.");
    closeModal("authModal");
  }
  updateAuthUI();
}

function updateAuthUI(){
  $("openAuth").textContent = loggedUser ? `Olá, ${loggedUser.name.split(" ")[0]}` : "Entrar";
}

async function checkout(){
  if(!cart.length) return toast("Adicione pelo menos um produto.");
  if(!loggedUser){
    closeModal("cartModal");
    authMode = "login";
    updateAuthMode();
    openModal("authModal");
    return toast("Faça login para finalizar o pedido.");
  }
  const {jsPDF} = window.jspdf || {};
  if(!jsPDF) return toast("Biblioteca de PDF não carregou. Verifique sua conexão.");
  const doc = new jsPDF();
  let y = 20, total = 0;
  doc.setFillColor(41,71,53); doc.rect(0,0,210,28,"F");
  doc.setTextColor(255,255,255); doc.setFontSize(18); doc.text(CONFIG.nomeEmpresa,15,18);
  doc.setFontSize(9); doc.text("Pedido para retirada na loja",15,24);
  doc.setTextColor(38,48,41); doc.setFontSize(11);
  doc.text(`Cliente: ${loggedUser.name}`,15,42);
  doc.text(`E-mail: ${loggedUser.email}`,15,49);
  doc.text(CONFIG.endereco,15,56);
  y=70;
  doc.setFontSize(10); doc.setFont(undefined,"bold");
  doc.text("Produto",15,y); doc.text("Qtd.",135,y); doc.text("Subtotal",165,y);
  doc.setFont(undefined,"normal"); y += 8;
  cart.forEach(item=>{
    const p=products.find(x=>x.id===item.id); if(!p)return;
    const sub=p.price*item.qty; total+=sub;
    doc.text(p.name.substring(0,45),15,y);
    doc.text(String(item.qty),137,y);
    doc.text(money(sub),165,y);
    y+=7;
    if(y>275){doc.addPage();y=20;}
  });
  y+=6; doc.setFont(undefined,"bold"); doc.text(`TOTAL: ${money(total)}`,15,y);
  y+=12; doc.setFont(undefined,"normal"); doc.setFontSize(9);
  doc.text("Pagamento e demais detalhes serão combinados pelo WhatsApp da empresa.",15,y);
  const filename=`pedido-quitanda-da-serra-${Date.now()}.pdf`;
  doc.save(filename);
  recordSale();
  const message = encodeURIComponent(`Olá! Sou ${loggedUser.name}. Acabei de gerar meu pedido em PDF no site da Quitanda da Serra. Vou enviar o PDF por aqui para combinarmos o pagamento e a retirada.`);
  window.open(`https://wa.me/${CONFIG.whatsappEmpresa}?text=${message}`,"_blank");
  toast("PDF gerado. Envie o arquivo na conversa do WhatsApp.");
}

function recordSale(){
  // Para a demonstração, cada checkout incrementa os itens do pedido.
  const sales = JSON.parse(localStorage.getItem("qs_sales") || "{}");
  cart.forEach(item => sales[item.id] = (sales[item.id] || 0) + item.qty);
  localStorage.setItem("qs_sales",JSON.stringify(sales));
  cart=[]; saveCart(); updateCartUI(); closeModal("cartModal");
}

function saveProduct(e){
  e.preventDefault();
  const id = Number($("editProductId").value);
  const product = {
    id: id || Date.now(),
    name: $("productName").value.trim(),
    category: $("productCategory").value,
    price: Number($("productPrice").value),
    unit: $("productUnit").value.trim() || "unidade",
    emoji: id ? (products.find(p=>p.id===id)?.emoji || "🧺") : "🧺"
  };
  if(id) products = products.map(p=>p.id===id?product:p);
  else products.push(product);
  localStorage.setItem("qs_products",JSON.stringify(products));
  resetProductForm(); renderProducts(); renderAdminProducts(); toast("Produto salvo.");
}

function resetProductForm(){
  $("productForm").reset();
  $("editProductId").value="";
  $("cancelEdit").classList.add("hidden");
}

function renderAdminProducts(){
  $("adminProductList").innerHTML = products.map(p=>`
    <div class="admin-product-row">
      <strong>${escapeHtml(p.name)}</strong><span>${labelCategory(p.category)}</span><span>${money(Number(p.price))}</span><span>${escapeHtml(p.unit)}</span>
      <span><button onclick="editProduct(${p.id})">Editar</button><button class="delete" onclick="deleteProduct(${p.id})">Excluir</button></span>
    </div>`).join("");
}
function editProduct(id){
  const p=products.find(x=>x.id===id); if(!p)return;
  $("editProductId").value=p.id;$("productName").value=p.name;$("productCategory").value=p.category;$("productPrice").value=p.price;$("productUnit").value=p.unit;$("cancelEdit").classList.remove("hidden");
  document.querySelector(".admin-modal").scrollTo({top:0,behavior:"smooth"});
}
function deleteProduct(id){
  if(!confirm("Excluir este produto?"))return;
  products=products.filter(p=>p.id!==id); localStorage.setItem("qs_products",JSON.stringify(products));
  cart=cart.filter(i=>products.some(p=>p.id===i.id)); saveCart(); updateCartUI(); renderProducts(); renderAdminProducts(); toast("Produto excluído.");
}

function renderSalesChart(){
  const ctx=$("salesChart"); if(!ctx || !window.Chart)return;
  const sales=JSON.parse(localStorage.getItem("qs_sales")||"{}");
  const ranked=products.map(p=>({name:p.name,qty:sales[p.id]||0})).sort((a,b)=>b.qty-a.qty).slice(0,7);
  if(salesChart)salesChart.destroy();
  salesChart=new Chart(ctx,{type:"pie",data:{labels:ranked.map(x=>x.name),datasets:[{data:ranked.map(x=>x.qty)}]},options:{responsive:true,plugins:{legend:{position:"bottom"},title:{display:true,text:"Produtos mais vendidos"}}}});
}

function toast(message){
  const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(window._toast);
  window._toast=setTimeout(()=>el.classList.remove("show"),3200);
}
function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
