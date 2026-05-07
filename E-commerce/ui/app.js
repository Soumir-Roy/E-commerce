/* ================================================
   PulAha — app.js
   Real backend only | Pixabay images | Sign Out
   ================================================ */

'use strict';

const API         = 'http://localhost:8080';
const PIXABAY_KEY = '49896451-8fe7a2e40d1c1b4f9f4f8a33c'; // free public key

/* Pixabay image cache per product category */
const PX_IMGS = {
  Electronics: [
    'https://cdn.pixabay.com/photo/2016/11/29/05/08/electronics-1868708_960_720.jpg',
    'https://cdn.pixabay.com/photo/2015/12/09/17/12/smartphone-1085975_960_720.jpg',
    'https://cdn.pixabay.com/photo/2016/01/27/21/19/laptop-1163964_960_720.jpg',
    'https://cdn.pixabay.com/photo/2014/09/25/14/20/music-459700_960_720.jpg',
    'https://cdn.pixabay.com/photo/2018/05/08/08/44/artificial-intelligence-3382507_960_720.jpg',
    'https://cdn.pixabay.com/photo/2016/04/02/10/21/gadget-1302778_960_720.jpg',
  ],
  Clothing: [
    'https://cdn.pixabay.com/photo/2016/03/27/22/22/fashion-1284496_960_720.jpg',
    'https://cdn.pixabay.com/photo/2017/08/01/11/48/woman-2564660_960_720.jpg',
    'https://cdn.pixabay.com/photo/2016/11/22/19/25/man-1850188_960_720.jpg',
    'https://cdn.pixabay.com/photo/2015/07/02/10/29/clothing-828693_960_720.jpg',
    'https://cdn.pixabay.com/photo/2017/10/22/07/56/clothes-2877135_960_720.jpg',
    'https://cdn.pixabay.com/photo/2019/10/20/12/58/fashion-4562630_960_720.jpg',
  ],
  Beauty: [
    'https://cdn.pixabay.com/photo/2019/11/14/06/00/makeup-4625003_960_720.jpg',
    'https://cdn.pixabay.com/photo/2017/02/11/10/00/beauty-2056046_960_720.jpg',
    'https://cdn.pixabay.com/photo/2018/04/06/00/25/perfume-3294843_960_720.jpg',
    'https://cdn.pixabay.com/photo/2016/03/26/22/25/cosmetic-1281581_960_720.jpg',
    'https://cdn.pixabay.com/photo/2020/04/29/07/54/coconut-oil-5107604_960_720.jpg',
    'https://cdn.pixabay.com/photo/2018/12/04/22/48/makeup-3857546_960_720.jpg',
  ],
  Home: [
    'https://cdn.pixabay.com/photo/2017/03/22/17/39/kitchen-2165756_960_720.jpg',
    'https://cdn.pixabay.com/photo/2016/11/21/15/09/furniture-1846070_960_720.jpg',
    'https://cdn.pixabay.com/photo/2018/11/10/12/18/home-3807635_960_720.jpg',
    'https://cdn.pixabay.com/photo/2016/10/30/20/22/sofa-1784916_960_720.jpg',
    'https://cdn.pixabay.com/photo/2020/08/29/14/37/living-room-5527835_960_720.jpg',
    'https://cdn.pixabay.com/photo/2016/08/26/15/06/home-1622401_960_720.jpg',
  ],
  Sports: [
    'https://cdn.pixabay.com/photo/2017/05/25/15/08/jogging-2343558_960_720.jpg',
    'https://cdn.pixabay.com/photo/2016/11/29/02/05/basketball-1867942_960_720.jpg',
    'https://cdn.pixabay.com/photo/2018/03/04/10/50/dumbbells-3196919_960_720.jpg',
    'https://cdn.pixabay.com/photo/2015/06/19/21/24/the-ball-814823_960_720.jpg',
    'https://cdn.pixabay.com/photo/2016/03/16/15/36/yoga-1261375_960_720.jpg',
    'https://cdn.pixabay.com/photo/2015/11/23/14/45/cyclist-1057007_960_720.jpg',
  ],
  Books: [
    'https://cdn.pixabay.com/photo/2015/09/05/21/51/reading-925589_960_720.jpg',
    'https://cdn.pixabay.com/photo/2016/09/10/17/18/book-1659717_960_720.jpg',
    'https://cdn.pixabay.com/photo/2017/07/31/11/21/people-2557396_960_720.jpg',
    'https://cdn.pixabay.com/photo/2015/11/19/21/14/library-1052015_960_720.jpg',
    'https://cdn.pixabay.com/photo/2020/04/26/11/04/books-5095405_960_720.jpg',
    'https://cdn.pixabay.com/photo/2016/09/10/11/11/book-1659717_640.jpg',
  ],
};
const DEFAULT_IMG = 'https://cdn.pixabay.com/photo/2016/11/19/15/46/adventure-1840437_960_720.jpg';

/* ── IMAGE ASSIGNMENT ── */
const _imgCounters = {};
function assignImage(product) {
  if (product.imageUrl) return product.imageUrl;
  const cat = product.category || 'Electronics';
  const imgs = PX_IMGS[cat] || Object.values(PX_IMGS).flat();
  if (!_imgCounters[cat]) _imgCounters[cat] = 0;
  const img = imgs[_imgCounters[cat] % imgs.length];
  _imgCounters[cat]++;
  return img;
}

/* ══════════════════════════════════════
   STATE
══════════════════════════════════════ */
const S = {
  user:      JSON.parse(localStorage.getItem('pulaha_user') || 'null'),
  cart:      JSON.parse(localStorage.getItem('pulaha_cart') || '[]'),
  wishlist:  JSON.parse(localStorage.getItem('pulaha_wl')   || '[]'),
  products:  [],
  filtered:  [],
  activeCat: 'all',
  priceMax:  100000,
  qvProd:    null,
  qvQty:     1,
  drawerOpen:false,
  addresses: [],
  selectedAddressId: null,
  heroIdx:   0,
  heroTimer: null,
  heroProg:  0,
  heroProgT: null,
  dealSecs:  26430,
};

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  initHero();
  initScrollArrows();
  initCartDrawer();
  initQuickView();
  initAuthForms();
  startCountdown();
  renderNav();
  updateCartBadge();
  loadProducts();
});

/* ══════════════════════════════════════
   NAVIGATION
══════════════════════════════════════ */
function goto(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'products') { S.filtered = [...S.products]; renderProductGrid(S.filtered); buildSidebar(); }
  if (page === 'orders')   loadOrders();
  if (page === 'wishlist') renderWishlistPage();
}

function catGo(cat) {
  S.activeCat = cat;
  S.filtered  = S.products.filter(p => p.category === cat);
  goto('products');
  renderProductGrid(S.filtered);
  buildSidebar();
  setCount();
  setChips(cat);
}

function renderNav() {
  const { user } = S;
  const greet       = document.getElementById('nact-greet');
  const dropOut     = document.getElementById('drop-loggedout');
  const dropIn      = document.getElementById('drop-loggedin');
  const dropName    = document.getElementById('drop-username');
  const dropSignout = document.getElementById('drop-signout');

  if (user) {
    greet.textContent = user.name ? user.name.split(' ')[0] : 'Hi!';
    dropOut.style.display   = 'none';
    dropIn.style.display    = '';
    dropName.textContent    = '👤 ' + (user.name || user.email);
    dropSignout.style.display = '';
  } else {
    greet.textContent = 'Sign In';
    dropOut.style.display   = '';
    dropIn.style.display    = 'none';
    dropSignout.style.display = 'none';
  }
  updateWlBadge();
}

function signOut() {
  S.user = null;
  localStorage.removeItem('pulaha_user');
  renderNav();
  goto('home');
  toast('Signed out. See you again! 👋');
}

/* ══════════════════════════════════════
   SEARCH
══════════════════════════════════════ */
function initSearch() {
  document.getElementById('nsb-btn').addEventListener('click', doSearch);
  document.getElementById('nsb-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });
}

function doSearch() {
  const q = document.getElementById('nsb-input').value.trim().toLowerCase();
  if (!q) { toast('Please enter a search term', 'err'); return; }
  S.filtered = S.products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.description || '').toLowerCase().includes(q) ||
    (p.category || '').toLowerCase().includes(q)
  );
  goto('products');
  renderProductGrid(S.filtered);
  document.getElementById('ptb-count').textContent = `${S.filtered.length} results for "${q}"`;
  document.getElementById('ptb-chips').innerHTML =
    `<span class="ptb-chip">${q} <button onclick="clearFilters()">×</button></span>`;
}

/* ══════════════════════════════════════
   HERO CAROUSEL
══════════════════════════════════════ */
function initHero() {
  const slides = document.querySelectorAll('.hslide');
  const dotsEl = document.getElementById('hero-dots');
  const total  = slides.length;

  dotsEl.innerHTML = '';
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'hdot' + (i === 0 ? ' on' : '');
    d.onclick = () => heroGo(i, true);
    dotsEl.appendChild(d);
  });

  document.getElementById('h-prev').onclick = () => heroGo((S.heroIdx - 1 + total) % total, true);
  document.getElementById('h-next').onclick = () => heroGo((S.heroIdx + 1) % total, true);

  // Touch swipe
  let tx = 0;
  const vp = document.getElementById('hero-viewport');
  vp.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  vp.addEventListener('touchend',   e => {
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 45) heroGo(d > 0 ? (S.heroIdx+1)%total : (S.heroIdx-1+total)%total, true);
  });

  vp.addEventListener('mouseenter', stopHeroAuto);
  vp.addEventListener('mouseleave', startHeroAuto);
  startHeroAuto();
}

function heroGo(idx, resetProg) {
  S.heroIdx = idx;
  document.getElementById('hero-track').style.transform = `translateX(-${idx * 100}%)`;
  document.querySelectorAll('.hdot').forEach((d, i) => d.classList.toggle('on', i === idx));
  if (resetProg) { S.heroProg = 0; }
}

function startHeroAuto() {
  stopHeroAuto();
  S.heroProg = 0;
  const total = document.querySelectorAll('.hslide').length;
  const fill  = document.getElementById('hero-prog-fill');
  const step  = 100 / (5000 / 50);
  S.heroProgT = setInterval(() => {
    S.heroProg = Math.min(S.heroProg + step, 100);
    if (fill) fill.style.width = S.heroProg + '%';
    if (S.heroProg >= 100) { S.heroProg = 0; heroGo((S.heroIdx + 1) % total); }
  }, 50);
}

function stopHeroAuto() {
  if (S.heroProgT) { clearInterval(S.heroProgT); S.heroProgT = null; }
  const fill = document.getElementById('hero-prog-fill');
  if (fill) fill.style.width = '0%';
}

/* ══════════════════════════════════════
   SCROLL ROWS
══════════════════════════════════════ */
function initScrollArrows() {
  [
    ['cats-prev',  'cats-next',  'cats-row'],
    ['deals-prev', 'deals-next', 'deals-row'],
    ['feat-prev',  'feat-next',  'feat-row'],
    ['top-prev',   'top-next',   'top-row'],
  ].forEach(([prev, next, rowId]) => {
    const p = document.getElementById(prev);
    const n = document.getElementById(next);
    const r = document.getElementById(rowId);
    if (p && r) p.onclick = () => r.scrollBy({ left: -300, behavior: 'smooth' });
    if (n && r) n.onclick = () => r.scrollBy({ left:  300, behavior: 'smooth' });
  });
}

/* ══════════════════════════════════════
   COUNTDOWN
══════════════════════════════════════ */
function startCountdown() {
  setInterval(() => {
    if (--S.dealSecs < 0) S.dealSecs = 86400;
    const h = Math.floor(S.dealSecs / 3600);
    const m = Math.floor((S.dealSecs % 3600) / 60);
    const s = S.dealSecs % 60;
    const hEl = document.getElementById('cd-h');
    const mEl = document.getElementById('cd-m');
    const sEl = document.getElementById('cd-s');
    if (hEl) hEl.textContent = String(h).padStart(2,'0');
    if (mEl) mEl.textContent = String(m).padStart(2,'0');
    if (sEl) sEl.textContent = String(s).padStart(2,'0');
  }, 1000);
}

/* ══════════════════════════════════════
   LOAD PRODUCTS (backend only)
══════════════════════════════════════ */
async function loadProducts() {
  try {
    const res     = await fetch(`${API}/products`);
    if (!res.ok)  throw new Error('Server error ' + res.status);
    const raw     = await res.json();
    S.products    = raw.map(p => ({ ...p, _img: assignImage(p) }));
    S.filtered    = [...S.products];
    renderDealsRow();
    renderFeaturedRow();
    renderTopRow();
    buildSidebar();
    renderProductGrid(S.products);

    
  } catch (e) {
    // No demo fallback — show proper error states
    showServerError();
  }
}

function showServerError() {
  const errHtml = `
    <div style="grid-column:1/-1;text-align:center;padding:5rem 2rem">
      <div style="font-size:3.5rem;margin-bottom:1rem">🔌</div>
      <h3 style="margin-bottom:.6rem;color:#0f1111">Cannot connect to server</h3>
      <p style="color:#666;margin-bottom:1.5rem;font-size:.9rem">
        Make sure your Spring Boot backend is running on<br/>
        <strong>http://localhost:8080</strong>
      </p>
      <button onclick="loadProducts()" style="
        padding:12px 28px;background:#e8400c;color:#fff;
        border:none;border-radius:30px;font-weight:800;font-size:.9rem;cursor:pointer
      ">🔄 Retry Connection</button>
    </div>`;

  const targets = ['deals-row', 'feat-row', 'top-row', 'prod-grid'];
  targets.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = errHtml;
  });

  toast('Cannot connect to server. Start Spring Boot and retry.', 'err');
}

/* ══════════════════════════════════════
   RENDER HELPERS
══════════════════════════════════════ */
const rndMRP  = p => Math.ceil(p.price * (1.15 + ((p.id * 7) % 40) / 100));
const rndDisc = (price, mrp) => Math.round((1 - price / mrp) * 100);
const rndRating = p => (4 + ((p.id * 3) % 10) / 10).toFixed(1);
const rndReviews= p => 50 + (p.id * 17) % 480;
const rndSold   = p => 20 + (p.id * 11) % 72;
const catEmoji  = { Electronics:'💻', Clothing:'👗', Beauty:'💄', Home:'🏠', Sports:'⚽', Books:'📚' };
const pEmoji    = p => catEmoji[p.category] || '🛍️';

/* Deal card */
function dealCardHTML(p) {
  const mrp  = rndMRP(p);
  const disc = rndDisc(p.price, mrp);
  const sold = rndSold(p);
  return `
    <div class="deal-card" onclick="openQV(${p.id})">
      <div class="dc-img">
        <img src="${p._img}" alt="${p.name}" loading="lazy" onerror="this.src='${DEFAULT_IMG}'"/>
        <span class="dc-disc">${disc}% OFF</span>
      </div>
      <div class="dc-body">
        <div class="dc-name">${p.name}</div>
        <div class="dc-prices">
          <span class="dc-new">₹${p.price.toLocaleString('en-IN')}</span>
          <span class="dc-old">₹${mrp.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div class="dc-progress">
        <div class="dc-bar"><div class="dc-fill" style="width:${sold}%"></div></div>
        <div class="dc-sold">${sold}% already sold!</div>
      </div>
    </div>`;
}

/* Product card */
function prodCardHTML(p) {
  const mrp     = rndMRP(p);
  const disc    = rndDisc(p.price, mrp);
  const stars   = rndRating(p);
  const reviews = rndReviews(p);
  const inWl    = S.wishlist.some(w => w.id === p.id);
  return `
    <div class="pcard" data-id="${p.id}">
      <div class="pcard-img">
        <img src="${p._img}" alt="${p.name}" loading="lazy" onerror="this.src='${DEFAULT_IMG}'"/>
        <span class="pcard-disc">${disc}% off</span>
        <button class="pcard-wl${inWl?' wled':''}" data-wlid="${p.id}" title="Wishlist">
          ${inWl ? '❤️' : '🤍'}
        </button>
        <button class="pcard-qv" data-qvid="${p.id}">Quick View</button>
      </div>
      <div class="pcard-body">
        <div class="pcard-cat">${p.category || 'General'}</div>
        <div class="pcard-name">${p.name}</div>
        <div class="pcard-stars">★ ${stars} <span style="color:#9ca3af;font-size:.7rem">(${reviews})</span></div>
        <div class="pcard-prices">
          <span class="pcard-price">₹${p.price.toLocaleString('en-IN')}</span>
          <span class="pcard-mrp">₹${mrp.toLocaleString('en-IN')}</span>
          <span class="pcard-off">${disc}% off</span>
        </div>
      </div>
      <button class="pcard-add" data-addid="${p.id}">🛒 Add to Cart</button>
    </div>`;
}

function attachEvents(container) {
  container.querySelectorAll('[data-addid]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); addToCart(+btn.dataset.addid); });
  });
  container.querySelectorAll('[data-qvid]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openQV(+btn.dataset.qvid); });
  });
  container.querySelectorAll('[data-wlid]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); toggleWishlist(+btn.dataset.wlid, btn); });
  });
}

function renderDealsRow() {
  const el = document.getElementById('deals-row');
  if (!el || !S.products.length) return;
  const picks = shuffled(S.products).slice(0, 12);
  el.innerHTML = picks.map(dealCardHTML).join('');
}

function renderFeaturedRow() {
  const el = document.getElementById('feat-row');
  if (!el || !S.products.length) return;
  const picks = shuffled(S.products).slice(0, 12);
  el.innerHTML = picks.map(prodCardHTML).join('');
  attachEvents(el);
}

function renderTopRow() {
  const el = document.getElementById('top-row');
  if (!el || !S.products.length) return;
  const picks = shuffled(S.products).slice(0, 12);
  el.innerHTML = picks.map(prodCardHTML).join('');
  attachEvents(el);
}

function renderProductGrid(products) {
  const grid = document.getElementById('prod-grid');
  if (!grid) return;
  if (!products.length) {
    grid.innerHTML = `<div class="grid-load"><p style="color:#9ca3af">No products match your filters.</p></div>`;
    return;
  }
  grid.innerHTML = products.map((p, i) =>
    `<div style="animation-delay:${(i%12)*.04}s;animation:pgIn .38s ease both">${prodCardHTML(p)}</div>`
  ).join('');
  attachEvents(grid);
  setCount();
}

function renderWishlistPage() {
  const grid  = document.getElementById('wl-grid');
  const label = document.getElementById('wl-count-text');
  if (!grid) return;
  if (!S.wishlist.length) {
    grid.innerHTML = `<div class="grid-load" style="grid-column:1/-1">
      <div style="font-size:3rem;opacity:.3">❤️</div>
      <p style="color:#9ca3af">Your wishlist is empty.</p>
    </div>`;
    if (label) label.textContent = '';
    return;
  }
  if (label) label.textContent = `${S.wishlist.length} saved item${S.wishlist.length>1?'s':''}`;
  grid.innerHTML = S.wishlist.map(prodCardHTML).join('');
  attachEvents(grid);
}

/* ══════════════════════════════════════
   FILTER / SORT
══════════════════════════════════════ */
function buildSidebar() {
  const el = document.getElementById('psb-cats');
  if (!el) return;
  const cats = ['all', ...new Set(S.products.map(p => p.category).filter(Boolean))];
  el.innerHTML = cats.map(c => `
    <div class="psb-cat-item${c===S.activeCat?' on':''}" onclick="catGoOrAll('${c}')">
      ${c==='all' ? '🛍️ All Categories' : (catEmoji[c]||'📦')+' '+c}
    </div>`).join('');
}

function catGoOrAll(c) {
  S.activeCat = c;
  S.filtered  = c === 'all' ? [...S.products] : S.products.filter(p => p.category === c);
  buildSidebar();
  renderProductGrid(S.filtered);
  setChips(c);
}

function applyFilters() {
  let list = [...S.products];
  if (S.activeCat !== 'all') list = list.filter(p => p.category === S.activeCat);
  list = list.filter(p => p.price <= S.priceMax);
  const sort = document.getElementById('sort-select')?.value || '';
  if (sort === 'price-asc')  list.sort((a,b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);
  if (sort === 'name')       list.sort((a,b) => a.name.localeCompare(b.name));
  if (sort === 'disc')       list.sort((a,b) => rndDisc(b.price,rndMRP(b)) - rndDisc(a.price,rndMRP(a)));
  S.filtered = list;
  renderProductGrid(list);
}

function onPriceRange(val) {
  S.priceMax = +val;
  const lbl = document.getElementById('prl-val');
  if (lbl) lbl.textContent = (+val).toLocaleString('en-IN');
  applyFilters();
}

function clearFilters() {
  S.activeCat = 'all';
  S.priceMax  = 100000;
  const slider = document.getElementById('price-range');
  if (slider) slider.value = 100000;
  const lbl = document.getElementById('prl-val');
  if (lbl) lbl.textContent = '1,00,000';
  buildSidebar();
  S.filtered = [...S.products];
  renderProductGrid(S.filtered);
  const chips = document.getElementById('ptb-chips');
  if (chips) chips.innerHTML = '';
}

function setCount() {
  const el = document.getElementById('ptb-count');
  if (el) el.textContent = `${S.filtered.length} Products`;
}

function setChips(cat) {
  const el = document.getElementById('ptb-chips');
  if (!el) return;
  el.innerHTML = cat !== 'all'
    ? `<span class="ptb-chip">${cat} <button onclick="clearFilters()">×</button></span>`
    : '';
}

/* ══════════════════════════════════════
   QUICK VIEW
══════════════════════════════════════ */
function initQuickView() {
  document.getElementById('qv-close').onclick = closeQV;
  document.getElementById('qv-bg').addEventListener('click', e => { if (e.target===e.currentTarget) closeQV(); });
  document.getElementById('qv-minus').onclick = () => setQvQty(-1);
  document.getElementById('qv-plus').onclick  = () => setQvQty(+1);
  document.getElementById('qv-add-cart').onclick = () => { if (S.qvProd) { addToCart(S.qvProd.id, S.qvQty); closeQV(); } };
  document.getElementById('qv-buy-now').onclick  = () => { if (S.qvProd) { addToCart(S.qvProd.id, S.qvQty); closeQV(); openDrawer(); } };
  document.getElementById('qv-wl').onclick = () => { if (S.qvProd) toggleWishlist(S.qvProd.id); };
}

function openQV(id) {
  const p = S.products.find(x => x.id === id);
  if (!p) return;
  S.qvProd = p; S.qvQty = 1;

  const mrp  = rndMRP(p);
  const disc = rndDisc(p.price, mrp);
  const rev  = rndReviews(p);

  document.getElementById('qv-cat').textContent       = p.category || 'General';
  document.getElementById('qv-name').textContent      = p.name;
  document.getElementById('qv-rating-count').textContent = `(${rev} reviews)`;
  document.getElementById('qv-price').textContent     = `₹${p.price.toLocaleString('en-IN')}`;
  document.getElementById('qv-mrp').textContent       = `M.R.P: ₹${mrp.toLocaleString('en-IN')}`;
  document.getElementById('qv-disc').textContent      = `(${disc}% off)`;
  document.getElementById('qv-desc').textContent      = p.description || 'Premium quality product with exceptional durability and performance.';
  document.getElementById('qv-qty').textContent       = 1;

  const pane = document.getElementById('qv-img-pane');
  pane.innerHTML = `<img src="${p._img}" alt="${p.name}" onerror="this.src='${DEFAULT_IMG}'"/>`;

  document.getElementById('qv-bg').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQV() {
  document.getElementById('qv-bg').classList.remove('open');
  document.body.style.overflow = '';
}

function setQvQty(d) {
  S.qvQty = Math.max(1, S.qvQty + d);
  document.getElementById('qv-qty').textContent = S.qvQty;
}

/* ══════════════════════════════════════
   CART
══════════════════════════════════════ */
function addToCart(pid, qty = 1) {
  const p = S.products.find(x => x.id === pid);
  if (!p) return;
  const ex = S.cart.find(i => i.id === pid);
  if (ex) ex.qty += qty;
  else S.cart.push({ id: p.id, name: p.name, price: p.price, _img: p._img, qty });
  saveCart();
  toast(`✓ "${p.name.slice(0,28)}" added to cart`, 'ok');
  if (S.drawerOpen) renderDrawer();
  pulseBadge();
}

function saveCart() {
  localStorage.setItem('pulaha_cart', JSON.stringify(S.cart));
  updateCartBadge();
}

function updateCartBadge() {
  const t = S.cart.reduce((s,i) => s+i.qty, 0);
  document.getElementById('cart-count').textContent = t;
  const dc = document.getElementById('cdrw-count');
  if (dc) dc.textContent = `(${t})`;
}

function pulseBadge() {
  const el = document.getElementById('cart-count');
  el.animate([{transform:'scale(1.6)',background:'#fff'},{transform:'scale(1)'}],{duration:350,easing:'ease'});
}

function removeFromCart(id) {
  S.cart = S.cart.filter(i => i.id !== id);
  saveCart();
  renderDrawer();
}

function changeCartQty(id, d) {
  const item = S.cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + d);
  saveCart();
  renderDrawer();
}

function initCartDrawer() {
  document.getElementById('cdrw-close').onclick = closeDrawer;
  document.getElementById('cart-btn').onclick   = openDrawer;
  document.getElementById('drawer-bg').onclick  = closeDrawer;
}

function openDrawer() {
  S.drawerOpen = true;
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('drawer-bg').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderDrawer();
}

function closeDrawer() {
  S.drawerOpen = false;
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('drawer-bg').classList.remove('open');
  document.body.style.overflow = '';
}

function renderDrawer() {
  const body   = document.getElementById('cdrw-body');
  const foot   = document.getElementById('cdrw-foot');
  updateCartBadge();

  if (!S.cart.length) {
    body.innerHTML = `
      <div class="cdrw-empty">
        <div class="cdrw-empty-icon">🛒</div>
        <h4>Your cart is empty</h4>
        <p>Find something amazing!</p>
        <button class="cdrw-shop-btn" onclick="closeDrawer();goto('products')">Shop Now</button>
      </div>`;
    foot.innerHTML = '';
    return;
  }

  body.innerHTML = S.cart.map(item => `
    <div class="cdrw-item">
      <div class="cdrw-img">
        <img src="${item._img}" alt="${item.name}" onerror="this.src='${DEFAULT_IMG}'"/>
      </div>
      <div class="cdrw-info">
        <div class="cdrw-name">${item.name}</div>
        <div class="cdrw-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
        <div class="cdrw-ctrl">
          <button class="cdrw-q" onclick="changeCartQty(${item.id},-1)">−</button>
          <span class="cdrw-qv">${item.qty}</span>
          <button class="cdrw-q" onclick="changeCartQty(${item.id},1)">+</button>
          <button class="cdrw-rm" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
    </div>`).join('');

  const subtotal = S.cart.reduce((s,i) => s + i.price*i.qty, 0);
  const savings  = S.cart.reduce((s,i) => { const m=rndMRP(i); return s + (m-i.price)*i.qty; }, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const total    = subtotal + shipping;

  foot.innerHTML = `
    <div class="cdrw-total-rows">
      <div class="cdrw-trow"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
      <div class="cdrw-trow cdrw-save-row"><span>You save</span><span>− ₹${savings.toLocaleString('en-IN')}</span></div>
      <div class="cdrw-trow"><span>Delivery</span>
        <span style="color:${shipping===0?'#2ea853':'inherit'}">
          ${shipping===0 ? 'FREE 🎉' : '₹'+shipping}
        </span>
      </div>
      <div class="cdrw-grand"><span>Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>
    </div>
    <button class="cdrw-checkout-btn" onclick="checkout()">Proceed to Checkout ⚡</button>
    <button class="cdrw-continue" onclick="closeDrawer()">Continue Shopping</button>`;
}

async function checkout() {
  if (!S.user) {
    toast('Please sign in to place your order', 'err');
    closeDrawer(); goto('auth'); return;
  }
  if (!S.cart.length) { toast('Cart is empty!', 'err'); return; }

  closeDrawer();
  await openAddressModal();
}

/* ══════════════════════════════════════
   WISHLIST
══════════════════════════════════════ */
function toggleWishlist(id, btn) {
  const p   = S.products.find(x => x.id === id);
  if (!p) return;
  const idx = S.wishlist.findIndex(w => w.id === id);
  if (idx >= 0) {
    S.wishlist.splice(idx, 1);
    toast('Removed from wishlist', 'info');
  } else {
    S.wishlist.push(p);
    toast(`❤️ Added to wishlist`, 'ok');
  }
  localStorage.setItem('pulaha_wl', JSON.stringify(S.wishlist));
  updateWlBadge();
  // Refresh all wl buttons for this product
  document.querySelectorAll(`[data-wlid="${id}"]`).forEach(b => {
    const inWl = S.wishlist.some(w => w.id === id);
    b.textContent = inWl ? '❤️' : '🤍';
    b.classList.toggle('wled', inWl);
  });
}

function updateWlBadge() {
  const el = document.getElementById('wl-badge');
  if (el) el.textContent = S.wishlist.length;
}

/* ══════════════════════════════════════
   AUTH
══════════════════════════════════════ */
function switchAuthTab(tab) {
  const isReg = tab === 'register';
  document.getElementById('atab-login').classList.toggle('active', !isReg);
  document.getElementById('atab-register').classList.toggle('active', isReg);
  document.getElementById('atab-ink').classList.toggle('right', isReg);
  document.getElementById('auth-login').classList.toggle('show-form', !isReg);
  document.getElementById('auth-register').classList.toggle('show-form', isReg);
}

function initAuthForms() {
  document.getElementById('li-btn').onclick  = doLogin;
  document.getElementById('ri-btn').onclick  = doRegister;
  ['li-email','li-pw'].forEach(id =>
    document.getElementById(id)?.addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); }));
  ['ri-name','ri-email','ri-pw'].forEach(id =>
    document.getElementById(id)?.addEventListener('keydown', e => { if(e.key==='Enter') doRegister(); }));
}

async function doLogin() {
  const email = document.getElementById('li-email').value.trim();
  const pw    = document.getElementById('li-pw').value;
  if (!email || !pw) { toast('Fill all fields', 'err'); return; }
  const btn   = document.getElementById('li-btn');
  btnLoad(btn, true);
  try {
    const res  = await fetch(`${API}/Users/login`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, password: pw }),
    });
    const user = await res.json();
    if (!user?.id) { toast('Invalid email or password', 'err'); return; }
    S.user = user;
    localStorage.setItem('pulaha_user', JSON.stringify(user));
    renderNav();
    toast(`Welcome back, ${user.name || 'User'}! 🎉`, 'ok');
    goto('home');
  } catch { toast('Cannot connect to server', 'err'); }
  finally   { btnLoad(btn, false, 'Sign In →'); }
}

async function doRegister() {
  const name  = document.getElementById('ri-name').value.trim();
  const email = document.getElementById('ri-email').value.trim();
  const pw    = document.getElementById('ri-pw').value;
  if (!name || !email || !pw) { toast('Fill all fields', 'err'); return; }
  if (pw.length < 6)          { toast('Password must be 6+ characters', 'err'); return; }
  const btn = document.getElementById('ri-btn');
  btnLoad(btn, true);
  try {
    const res  = await fetch(`${API}/Users/register`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name, email, password: pw }),
    });
    const user = await res.json();
    if (!user?.id) { toast('Registration failed', 'err'); return; }
    S.user = user;
    localStorage.setItem('pulaha_user', JSON.stringify(user));
    renderNav();
    toast(`Welcome to PulAha, ${user.name}! 🎉`, 'ok');
    goto('home');
  } catch { toast('Cannot connect to server', 'err'); }
  finally   { btnLoad(btn, false, 'Create Account →'); }
}

/* ══════════════════════════════════════
   ORDERS
══════════════════════════════════════ */
async function loadOrders() {
  const wrap = document.getElementById('orders-wrap');
  if (!wrap) return;

  if (!S.user) {
    wrap.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:4rem;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,.08)">
        <div style="font-size:3rem;margin-bottom:1rem">🔐</div>
        <p style="color:#666;margin-bottom:1.5rem">Sign in to view your orders</p>
        <button onclick="goto('auth')" style="padding:12px 28px;background:#e8400c;color:#fff;border:none;border-radius:30px;font-weight:800;cursor:pointer">Sign In</button>
      </div>`; return;
  }

  wrap.innerHTML = `<div class="grid-load" style="background:#fff;border-radius:16px;min-height:200px"><div class="spin-ring"></div><p>Loading orders…</p></div>`;

  try {
    const res    = await fetch(`${API}/orders/user/${S.user.id}`);
    const orders = await res.json();

    if (!orders.length) {
      wrap.innerHTML = `
        <div style="background:#fff;border-radius:16px;padding:4rem;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,.08)">
          <div style="font-size:3rem;margin-bottom:1rem">📦</div>
          <p style="color:#666;margin-bottom:1.5rem">No orders yet — start shopping!</p>
          <button onclick="goto('products')" style="padding:12px 28px;background:#e8400c;color:#fff;border:none;border-radius:30px;font-weight:800;cursor:pointer">Shop Now</button>
        </div>`; return;
    }

    wrap.innerHTML = orders.slice().reverse().map((o, i) => {
      const date   = new Date(o.orderDate).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'});
      const status = (o.status || 'pending').toLowerCase();
                // ADD THIS ↓
                const statusLabel = {
               'pending':          '🕐 Pending',
               'confirmed':        '✅ Confirmed',
               'success':          '✅ Confirmed',
               'processing':       '⚙️ Processing',
               'delivered':        '📦 Delivered',
               'cancelled':        '❌ Cancelled',
               'return_requested': '🔄 Return Requested',
               'refunded':         '💰 Refunded',
              };
              const displayStatus = statusLabel[status] || o.status;
      return `
        <div class="order-card" style="animation-delay:${i*.06}s">
          <div class="oc-top">
            <div class="oc-meta-row">
              <div class="oc-m">ORDER PLACED<b>${date}</b></div>
              <div class="oc-m">TOTAL<b>₹${o.totalAmount.toLocaleString('en-IN')}</b></div>
              <div class="oc-m">ORDER ID<b>#${o.id}</b></div>
              
            </div>
              <span class="oc-status st-${status}">${displayStatus}</span>
            </div>
          <div class="oc-body">
            ${(o.orderItems||[]).map(it => `
              <div class="oc-row">
               <span>${it.productName || it.name || 'Product'} <span style="color:#9ca3af">× ${it.quantity ?? it.qty ?? 1}</span></span>
<span style="font-weight:700">₹${((it.productPrice ?? it.price ?? 0) * (it.quantity ?? it.qty ?? 1)).toLocaleString('en-IN')}</span>
              </div>`).join('')}
          </div>
          <div class="oc-foot">
            <span class="oc-foot-lbl">Order Total</span>
            <span class="oc-foot-val">₹${o.totalAmount.toLocaleString('en-IN')}</span>
          </div>
          ${['pending','processing','confirmed','success'].includes(status) ? `
          <div class="oc-actions">
            <button class="oc-cancel-btn" onclick="cancelOrder(${o.id}, this)">✕ Cancel Order</button>
          </div>` : ''}
          ${status === 'delivered' ? `
          <div class="oc-actions">
            <button class="oc-return-btn" onclick="openReturnModal(${o.id}, ${o.totalAmount}, '${o.razorpayPaymentId || ''}')">🔄 Return & Refund</button>
          </div>` : ''}
          ${status === 'return_requested' ? `
          <div class="oc-actions">
            <span class="oc-return-pending">⏳ Return Requested — Awaiting Refund</span>
          </div>` : ''}
          ${status === 'refunded' ? `
          <div class="oc-actions">
            <span class="oc-refunded-badge">✅ Refunded to Original Payment Method</span>
          </div>` : ''}
        </div>`;
    }).join('');
  } catch {
    wrap.innerHTML = `<p style="text-align:center;padding:3rem;background:#fff;border-radius:16px">Could not load orders. Check server connection.</p>`;
  }
}

async function cancelOrder(orderId, btn) {
  if (!confirm('Are you sure you want to cancel this order?')) return;

  btn.disabled = true;
  btn.textContent = 'Cancelling…';

  try {
    const res = await fetch(`${API}/orders/cancel/${orderId}/user/${S.user.id}`, { method: 'PUT' });
    if (!res.ok) throw new Error('Cancel failed');

    toast('✅ Order cancelled successfully', 'ok');
    loadOrders();
  } catch (err) {
    toast('❌ ' + err.message, 'err');
    btn.disabled = false;
    btn.textContent = 'Cancel Order';
  }
}

/* ══════════════════════════════════════
   RETURN & REFUND
══════════════════════════════════════ */
function openReturnModal(orderId, amount, paymentId) {
  document.getElementById('return-modal-bg')?.remove();

  const html = `
  <div id="return-modal-bg" class="addr-modal-bg open" onclick="if(event.target===this)closeReturnModal()">
    <div class="addr-modal" style="max-width:480px">

      <div class="addr-modal-header">
        <div class="addr-modal-title">
          <span class="addr-modal-icon">🔄</span>
          <div>
            <h3>Return Order #${orderId}</h3>
            <p>Tell us why you want to return</p>
          </div>
        </div>
        <button class="addr-close-btn" onclick="closeReturnModal()">✕</button>
      </div>

      <div style="padding:1.5rem 1.5rem 0">
        <label style="font-weight:600;font-size:14px;display:block;margin-bottom:.5rem;color:#374151">Reason for Return *</label>
        <select id="return-reason"
          style="width:100%;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;outline:none;background:#fff;color:#374151;cursor:pointer">
          <option value="">— Select a reason —</option>
          <option value="Wrong item received">Wrong item received</option>
          <option value="Item damaged or defective">Item damaged or defective</option>
          <option value="Item not as described">Item not as described</option>
          <option value="Changed my mind">Changed my mind</option>
          <option value="Size or fit issue">Size or fit issue</option>
          <option value="Other">Other</option>
        </select>

        <label style="font-weight:600;font-size:14px;display:block;margin:1rem 0 .5rem;color:#374151">Additional Comments</label>
        <textarea id="return-comments" rows="3"
          style="width:100%;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;resize:vertical;outline:none;font-family:inherit;color:#374151"
          placeholder="Optional — describe the issue in detail…"></textarea>

        <div style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:12px;padding:14px 16px;margin:1rem 0;font-size:13px;color:#92400e;line-height:1.6">
          💰 <strong>Refund of ₹${amount.toLocaleString('en-IN')}</strong> will be credited to your original payment method within <strong>5–7 business days</strong> after the return is approved.
        </div>
      </div>

      <div style="padding:0 1.5rem 1.5rem;display:flex;gap:10px;flex-wrap:wrap">
        <button id="return-submit-btn"
          onclick="submitReturn(${orderId}, ${amount}, '${paymentId}')"
          style="flex:1;min-width:180px;padding:13px;background:#e8400c;color:#fff;border:none;border-radius:30px;font-weight:800;cursor:pointer;font-size:15px;transition:opacity .2s">
          Confirm Return & Refund
        </button>
        <button onclick="closeReturnModal()"
          style="padding:13px 22px;background:#f3f4f6;color:#374151;border:none;border-radius:30px;font-weight:600;cursor:pointer;font-size:15px">
          Cancel
        </button>
      </div>

    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  document.body.style.overflow = 'hidden';
}

function closeReturnModal() {
  document.getElementById('return-modal-bg')?.remove();
  document.body.style.overflow = '';
}

async function submitReturn(orderId, amount, paymentId) {
  const reason   = document.getElementById('return-reason').value.trim();
  const comments = document.getElementById('return-comments').value.trim();

  if (!reason) {
    toast('Please select a return reason', 'err');
    return;
  }

  const btn = document.getElementById('return-submit-btn');
  if (btn) btnLoad(btn, true);

  try {
    const res = await fetch(`${API}/orders/return/${orderId}?userId=${S.user.id}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId:    S.user.id,
        orderId,
        reason,
        comments,
        paymentId,
        amount,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Return request failed');
    }

    closeReturnModal();
    toast('✅ Return requested! Refund will be processed within 5–7 business days.', 'ok');
    loadOrders();

  } catch (err) {
    console.error('Return error:', err);
    toast('❌ Could not submit return: ' + err.message, 'err');
    if (btn) btnLoad(btn, false, 'Confirm Return & Refund');
  }
}

/* ══════════════════════════════════════
   UTILITIES
══════════════════════════════════════ */
function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = `toast${type?' '+type:''}`;
  el.textContent = msg;
  document.getElementById('toast-box').appendChild(el);
  setTimeout(() => {
    el.style.transition = 'all .3s';
    el.style.opacity = '0';
    el.style.transform = 'translateX(28px)';
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

function btnLoad(btn, on, label) {
  btn.disabled  = on;
  btn.innerHTML = on
    ? '<span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle;margin-right:6px"></span>Please wait…'
    : (label || btn.textContent);
}

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
/* ══════════════════════════════════════
   DELIVERY ADDRESS MODAL
══════════════════════════════════════ */

async function openAddressModal() {
  try {
    const res = await fetch(`${API}/address/user/${S.user.id}`);
    S.addresses = await res.json();
  } catch {
    S.addresses = [];
  }

   document.getElementById('addr-modal-bg')?.remove(); 
    document.body.insertAdjacentHTML('beforeend', addressModalHTML());
  

  S.selectedAddressId = null;
  renderAddressList();
  document.getElementById('addr-modal-bg').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAddressModal() {
  const bg = document.getElementById('addr-modal-bg');
  if (bg) bg.remove();
  document.body.style.overflow = '';
  //showAddressForm(false);
}

function renderAddressList() {
  const list = document.getElementById('addr-list');
  if (!list) return;

  if (!S.addresses.length) {
    list.innerHTML = `<p style="color:#9ca3af;text-align:center;padding:1rem 0">No saved addresses. Add one below.</p>`;
    showAddressForm(true);
    return;
  }

  list.innerHTML = S.addresses.map(a => `
    <div class="addr-card ${S.selectedAddressId === a.id ? 'selected' : ''}"
         onclick="selectAddress(${a.id})">
      <div class="addr-radio">${S.selectedAddressId === a.id ? '🔵' : '⚪'}</div>
      <div class="addr-details">
        <div class="addr-name">${a.fullName} <span class="addr-phone">${a.phone}</span></div>
        <div class="addr-line">${a.addressLine1}${a.addressLine2 ? ', ' + a.addressLine2 : ''}</div>
        <div class="addr-line">${a.city}, ${a.state} — ${a.pincode}</div>
        <div class="addr-line">${a.country}</div>
      </div>
      <button class="addr-del-btn" onclick="deleteAddress(event,${a.id})" title="Remove">🗑️</button>
    </div>`).join('');
}

function selectAddress(id) {
  S.selectedAddressId = id;
  renderAddressList();
}

async function deleteAddress(e, id) {
  e.stopPropagation();
  try {
    await fetch(`${API}/address/${id}`, { method: 'DELETE' });
    S.addresses = S.addresses.filter(a => a.id !== id);
    if (S.selectedAddressId === id) S.selectedAddressId = null;
    renderAddressList();
    toast('Address removed', 'info');
  } catch {
    toast('Failed to delete address', 'err');
  }
}

function showAddressForm(show) {
  const form = document.getElementById('addr-form-wrap');
  const btn  = document.getElementById('addr-add-new-btn');
  if (form) form.style.display = show ? 'block' : 'none';
  if (btn)  btn.style.display  = show ? 'none'  : 'flex';
}

async function saveNewAddress() {
  const get = id => document.getElementById(id)?.value.trim();
  const addr = {
    fullName:     get('af-name'),
    phone:        get('af-phone'),
    addressLine1: get('af-line1'),
    addressLine2: get('af-line2'),
    city:         get('af-city'),
    state:        get('af-state'),
    pincode:      get('af-pin'),
    country:      get('af-country') || 'India',
  };

  if (!addr.fullName || !addr.phone || !addr.addressLine1 || !addr.city || !addr.state || !addr.pincode) {
    toast('Please fill all required fields *', 'err'); return;
  }

  try {
    const res   = await fetch(`${API}/address/add/${S.user.id}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(addr),
    });
    const saved = await res.json();
    S.addresses.push(saved);
    S.selectedAddressId = saved.id;
    showAddressForm(false);
    renderAddressList();
    toast('Address saved ✅', 'ok');
  } catch {
    toast('Failed to save address', 'err');
  }
}

async function proceedToPayment() {
  if (!S.selectedAddressId) {
    toast('Please select a delivery address', 'err'); return;
  }
  closeAddressModal();

  const total             = S.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const productQuantities = {};
  S.cart.forEach(i => productQuantities[i.id] = i.qty);

  try {
    const res  = await fetch(`${API}/orders/create-payment`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ totalAmount: total }),
    });
    const data = await res.json();

    const options = {
      key:         "rzp_test_ScpqkediqGqyBJ",
      amount:      data.amount,
      currency:    "INR",
      order_id:    data.id,
      name:        "PulAha Store",
      description: "Order Payment",

      method:{
        upi: true
      },

      // ✅ explicitly enable UPI + all methods
      config: {
        display: {
          blocks: {
            upi: {
              name: "Pay via UPI",
              instruments: [
                { method: "upi", flows: ["collect", "intent", "qr","id"] }
              ]
            }
          },
          sequence: ["block.upi", "netbanking", "card", "emi", "wallet"],
          preferences: { show_default_blocks: true }
        }
      },

      handler: async function (response) {
        await fetch(`${API}/orders/verify-and-place/${S.user.id}`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            razorpayOrderId:   response.razorpay_order_id,
            paymentId:         response.razorpay_payment_id,
            signature:         response.razorpay_signature,
            productQuantities,
            totalAmount:       total,
            deliveryAddressId: S.selectedAddressId,
          }),
        });
        S.cart = []; saveCart();
        toast('🎉 Payment successful & order placed!', 'ok');
        goto('orders');
      },

      // ✅ contact is required for UPI collect (enter UPI ID) to appear
      prefill: {
        name:    S.user.name  || '',
        email:   S.user.email || '',
        contact: S.user.phone || '9999999999',
      },
      theme: { color: "#E8671B" },
      modal: { ondismiss: function () { console.log('Payment modal closed'); } }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', async function (response) {
      await fetch(
        `${API}/orders/update-payment?razorpayOrderId=${response.error.metadata.order_id}&paymentId=${response.error.metadata.payment_id}&status=FAILED`,
        { method: 'POST' }
      );
      toast('❌ Payment failed: ' + response.error.description, 'err');
    });
    rzp.open();

  } catch (err) {
    console.error(err);
    toast('Payment failed. Try again.', 'err');
  }
}

async function proceedCOD() {
  if (!S.selectedAddressId) {
    toast('Please select a delivery address', 'err'); return;
  }

  const btn = document.querySelector('.addr-pay-cod');
  if (btn) btnLoad(btn, true);

 // closeAddressModal();

  const total             = S.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const productQuantities = {};
  S.cart.forEach(i => productQuantities[i.id] = i.qty);

  try {
    const res = await fetch(`${API}/orders/place/${S.user.id}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalAmount:       total,
        productQuantities,
        deliveryAddressId: S.selectedAddressId,
        paymentMethod:     'COD',
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    S.cart = []; saveCart();
    closeAddressModal();
    toast('🎉 Order placed! Pay on delivery.', 'ok');
    goto('orders');

  } catch (err) {
    console.error('COD error:', err);
    toast('❌ Could not place order: ' + err.message, 'err');
    if (btn) btnLoad(btn, false, `
      <span class="addr-pay-icon">💵</span>
      <span class="addr-pay-text">
        <b>Cash on Delivery</b>
        <small>Pay when delivered</small>
      </span>`);
  }
}

function addressModalHTML() {
  return `
  <div id="addr-modal-bg" class="addr-modal-bg" onclick="if(event.target===this)closeAddressModal()">
    <div class="addr-modal">

      <div class="addr-modal-header">
        <div class="addr-modal-title">
          <span class="addr-modal-icon">🏠</span>
          <div>
            <h3>Delivery Address</h3>
            <p>Where should we deliver your order?</p>
          </div>
        </div>
        <button class="addr-close-btn" onclick="closeAddressModal()">✕</button>
      </div>

      <div id="addr-list" class="addr-list"></div>

      <button id="addr-add-new-btn" class="addr-add-new-btn" onclick="showAddressForm(true)">
        <span>＋</span> Add New Address
      </button>

      <div id="addr-form-wrap" class="addr-form-wrap" style="display:none">
        <h4 class="af-title">📍 New Address</h4>
        <div class="af-grid">
          <div class="af-field">
            <label>Full Name *</label>
            <input id="af-name" class="af-inp" placeholder="e.g. Rahul Sharma" />
          </div>
          <div class="af-field">
            <label>Phone Number *</label>
            <input id="af-phone" class="af-inp" placeholder="e.g. 9876543210" />
          </div>
          <div class="af-field af-full">
            <label>Address Line 1 *</label>
            <input id="af-line1" class="af-inp" placeholder="Flat / House No., Street, Area" />
          </div>
          <div class="af-field af-full">
            <label>Address Line 2</label>
            <input id="af-line2" class="af-inp" placeholder="Landmark, Near... (optional)" />
          </div>
          <div class="af-field">
            <label>City *</label>
            <input id="af-city" class="af-inp" placeholder="e.g. Kolkata" />
          </div>
          <div class="af-field">
            <label>State *</label>
            <input id="af-state" class="af-inp" placeholder="e.g. West Bengal" />
          </div>
          <div class="af-field">
            <label>Pincode *</label>
            <input id="af-pin" class="af-inp" placeholder="e.g. 700001" />
          </div>
          <div class="af-field">
            <label>Country</label>
            <input id="af-country" class="af-inp" value="India" />
          </div>
        </div>
        <div class="af-actions">
          <button class="af-save-btn" onclick="saveNewAddress()">💾 Save Address</button>
          <button class="af-cancel-btn" onclick="showAddressForm(false)">Cancel</button>
        </div>
      </div>

      <div class="addr-pay-methods">
        <p class="addr-pay-label">Choose Payment Method</p>
        <div class="addr-pay-btns">
          <button class="addr-pay-btn addr-pay-online" onclick="proceedToPayment()">
            <span class="addr-pay-icon">💳</span>
            <span class="addr-pay-text">
              <b>Pay Online</b>
              <small>UPI · Card · Netbanking</small>
            </span>
          </button>
          <button class="addr-pay-btn addr-pay-cod" onclick="proceedCOD()">
            <span class="addr-pay-icon">💵</span>
            <span class="addr-pay-text">
              <b>Cash on Delivery</b>
              <small>Pay when delivered</small>
            </span>
          </button>
        </div>
      </div>

    </div>
  </div>`;
}