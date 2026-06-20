/**
 * 官网 HTML 页面
 * 设计主题：tech_gradient（暗色科技蓝）
 * 布局类型：saas / hero_single_scroll
 * 动画级别：rich（滚动淡入、数字滚动、悬停发光）
 * 兼容 Cloudflare Workers 环境（纯 JS 模板，零外部依赖）
 */

// ==================== 设计令牌 ====================
const TOKENS = {
  '--bg-primary': '#0B0F19',
  '--bg-secondary': '#111827',
  '--bg-card': '#1A2332',
  '--bg-card-hover': '#1E2A3D',
  '--bg-section': '#0F1522',
  '--text-primary': '#F1F5F9',
  '--text-secondary': '#94A3B8',
  '--text-muted': '#64748B',
  '--accent': '#3B82F6',
  '--accent-hover': '#60A5FA',
  '--accent-glow': 'rgba(59,130,246,0.25)',
  '--accent-secondary': '#06B6D4',
  '--border': '#1E293B',
  '--radius-sm': '6px',
  '--radius-md': '12px',
  '--radius-lg': '20px',
  '--shadow-sm': '0 1px 3px rgba(0,0,0,0.3)',
  '--shadow-md': '0 4px 20px rgba(0,0,0,0.4)',
  '--shadow-lg': '0 8px 40px rgba(0,0,0,0.5)',
  '--shadow-glow': '0 0 30px rgba(59,130,246,0.15)',
  '--transition': '0.3s cubic-bezier(0.4,0,0.2,1)',
  '--font-sans': "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans SC','PingFang SC',sans-serif",
  '--font-mono': "'JetBrains Mono','Fira Code',monospace",
}

// ==================== CSS 构建器 ====================
function buildCSS() {
  const vars = Object.entries(TOKENS).map(([k, v]) => `${k}:${v}`).join(';')
  return `:root{${vars}}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--font-sans);background:var(--bg-primary);color:var(--text-primary);line-height:1.7;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-decoration:none;transition:color var(--transition)}
a:hover{color:var(--accent-hover)}
img{max-width:100%}

/* Container */
.container{max-width:1120px;margin:0 auto;padding:0 24px;width:100%}

/* ===== Navigation ===== */
nav{background:rgba(11,15,25,0.85);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border-bottom:1px solid rgba(30,41,59,0.6);position:sticky;top:0;z-index:1000;height:68px}
nav .container{display:flex;align-items:center;justify-content:space-between;height:100%}
nav .logo{display:flex;align-items:center;gap:8px;font-size:22px;font-weight:800;color:var(--text-primary);letter-spacing:-0.5px}
nav .logo svg{width:32px;height:32px}
nav .logo span{color:var(--accent);background:linear-gradient(135deg,var(--accent),var(--accent-secondary));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.nav-links{display:flex;gap:32px;align-items:center}
.nav-links a{color:var(--text-secondary);font-size:14px;font-weight:500;position:relative;padding:4px 0}
.nav-links a::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:2px;background:var(--accent);transition:width var(--transition);border-radius:2px}
.nav-links a:hover::after,.nav-links a.active::after{width:100%}
.nav-links a:hover{color:var(--text-primary)}
.nav-links a.active{color:var(--accent);font-weight:600}
.nav-links .btn-nav{background:linear-gradient(135deg,var(--accent),#2563EB);color:#fff;padding:10px 24px;border-radius:var(--radius-md);font-weight:600;font-size:14px;border:1px solid rgba(59,130,246,0.3);transition:all var(--transition)}
.nav-links .btn-nav:hover{box-shadow:var(--shadow-glow);transform:translateY(-1px);color:#fff}
.nav-links .btn-nav::after{display:none}
.nav-toggle{display:none;cursor:pointer;width:28px;height:20px;position:relative;z-index:1001}
.nav-toggle span{display:block;width:100%;height:2px;background:var(--text-primary);position:absolute;transition:all var(--transition);border-radius:2px}
.nav-toggle span:nth-child(1){top:0}
.nav-toggle span:nth-child(2){top:9px}
.nav-toggle span:nth-child(3){top:18px}
.nav-toggle.open span:nth-child(1){transform:translateY(9px)rotate(45deg)}
.nav-toggle.open span:nth-child(2){opacity:0}
.nav-toggle.open span:nth-child(3){transform:translateY(-9px)rotate(-45deg)}

/* ===== Hero ===== */
.hero{position:relative;padding:120px 0 100px;text-align:center;overflow:hidden;background:var(--bg-primary)}
.hero::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(ellipse 600px 400px at 50% 30%,rgba(59,130,246,0.08),transparent),radial-gradient(ellipse 400px 300px at 70% 60%,rgba(6,182,212,0.06),transparent);pointer-events:none;animation:heroPulse 8s ease-in-out infinite alternate}
@keyframes heroPulse{0%{transform:scale(1)rotate(0deg)}100%{transform:scale(1.05)rotate(2deg)}}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(59,130,246,0.03)1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.03)1px,transparent 1px);background-size:60px 60px;pointer-events:none;mask-image:radial-gradient(ellipse 60% 50% at 50% 30%,black,transparent 70%);-webkit-mask-image:radial-gradient(ellipse 60% 50% at 50% 30%,black,transparent 70%)}
.hero .container{position:relative;z-index:1}
.hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.2);border-radius:20px;padding:6px 16px;font-size:13px;color:var(--accent);margin-bottom:28px}
.hero-badge .dot{width:6px;height:6px;background:#22C55E;border-radius:50%;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
.hero h1{font-size:clamp(36px,5vw,60px);font-weight:800;line-height:1.15;margin-bottom:20px;letter-spacing:-1px}
.hero h1 .gradient{background:linear-gradient(135deg,var(--accent),var(--accent-secondary),var(--accent));background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:gradientShift 4s ease-in-out infinite}
@keyframes gradientShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.hero p{font-size:clamp(16px,1.3vw,19px);color:var(--text-secondary);max-width:600px;margin:0 auto 36px;line-height:1.7}
.hero .btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.hero .btns .primary{background:linear-gradient(135deg,var(--accent),#2563EB);color:#fff;padding:14px 36px;border-radius:var(--radius-md);font-weight:700;font-size:16px;display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(59,130,246,0.3);transition:all var(--transition);box-shadow:0 4px 14px rgba(59,130,246,0.25)}
.hero .btns .primary:hover{box-shadow:0 6px 24px rgba(59,130,246,0.35);transform:translateY(-2px)}
.hero .btns .secondary{background:rgba(255,255,255,0.05);color:var(--text-primary);padding:14px 36px;border-radius:var(--radius-md);font-weight:600;font-size:16px;display:inline-flex;align-items:center;gap:8px;border:1px solid var(--border);transition:all var(--transition)}
.hero .btns .secondary:hover{border-color:var(--accent);color:var(--accent);background:rgba(59,130,246,0.08)}
.hero-stats{display:flex;justify-content:center;gap:48px;margin-top:60px;flex-wrap:wrap}
.hero-stat{text-align:center}
.hero-stat .num{font-size:36px;font-weight:800;background:linear-gradient(135deg,var(--text-primary),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-stat .label{font-size:13px;color:var(--text-muted);margin-top:4px}

/* ===== Fade In Scroll ===== */
.fade-up{opacity:0;transform:translateY(30px);transition:opacity 0.6s ease,transform 0.6s ease}
.fade-up.visible{opacity:1;transform:translateY(0)}
.stagger-1{transition-delay:0.1s!important}
.stagger-2{transition-delay:0.2s!important}
.stagger-3{transition-delay:0.3s!important}
.stagger-4{transition-delay:0.4s!important}

/* ===== Sections ===== */
section{padding:100px 0}
.section-dark{background:var(--bg-secondary)}
.section-alt{background:var(--bg-section)}
.section-title{font-size:clamp(26px,2.8vw,36px);font-weight:800;text-align:center;margin-bottom:12px;letter-spacing:-0.5px}
.section-title .highlight{background:linear-gradient(135deg,var(--accent),var(--accent-secondary));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.section-subtitle{text-align:center;color:var(--text-secondary);font-size:16px;margin-bottom:56px;max-width:600px;margin-left:auto;margin-right:auto;line-height:1.7}

/* ===== Features ===== */
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.feature-card{background:var(--bg-card);border-radius:var(--radius-md);padding:32px;border:1px solid var(--border);transition:all var(--transition);position:relative;overflow:hidden}
.feature-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:0;transition:opacity var(--transition)}
.feature-card:hover{background:var(--bg-card-hover);transform:translateY(-4px);border-color:rgba(59,130,246,0.2);box-shadow:var(--shadow-glow)}
.feature-card:hover::before{opacity:1}
.feature-icon{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:20px;position:relative}
.feature-icon.glow-blue{background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.15)}
.feature-icon.glow-cyan{background:rgba(6,182,212,0.12);border:1px solid rgba(6,182,212,0.15)}
.feature-icon.glow-green{background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.15)}
.feature-icon.glow-purple{background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.15)}
.feature-icon.glow-amber{background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.15)}
.feature-icon.glow-pink{background:rgba(236,72,153,0.12);border:1px solid rgba(236,72,153,0.15)}
.feature-card h3{font-size:18px;font-weight:700;margin-bottom:10px}
.feature-card p{font-size:14px;color:var(--text-secondary);line-height:1.7}

/* ===== Stats Counter ===== */
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
.stat-card{background:var(--bg-card);border-radius:var(--radius-md);padding:36px 24px;text-align:center;border:1px solid var(--border);transition:all var(--transition)}
.stat-card:hover{box-shadow:var(--shadow-glow);border-color:rgba(59,130,246,0.2)}
.stat-card .num{font-size:clamp(32px,3vw,44px);font-weight:800;background:linear-gradient(135deg,var(--text-primary),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px}
.stat-card .label{font-size:14px;color:var(--text-muted)}
.stat-card .suffix{font-size:20px;color:var(--accent);-webkit-text-fill-color:var(--accent)}

/* ===== Pricing ===== */
.pricing-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;align-items:start}
.pricing-card{background:var(--bg-card);border-radius:var(--radius-md);padding:36px 28px;border:1px solid var(--border);transition:all var(--transition);position:relative}
.pricing-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-glow)}
.pricing-card.featured{border-color:var(--accent);background:linear-gradient(135deg,var(--bg-card),rgba(59,130,246,0.06));box-shadow:0 0 40px rgba(59,130,246,0.08)}
.pricing-card.featured::before{content:'推荐';position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--accent),#2563EB);color:#fff;padding:4px 18px;border-radius:12px;font-size:12px;font-weight:700;letter-spacing:0.5px;box-shadow:0 2px 8px rgba(59,130,246,0.3)}
.pricing-card .plan-name{font-size:15px;font-weight:600;color:var(--text-muted);margin-bottom:4px}
.pricing-card .price{font-size:42px;font-weight:800;margin:12px 0 4px;letter-spacing:-1px}
.pricing-card .price .currency{font-size:20px;vertical-align:super}
.pricing-card .price .period{font-size:14px;color:var(--text-muted);font-weight:400}
.pricing-card .price-desc{font-size:13px;color:var(--text-muted);margin-bottom:20px}
.pricing-card ul{list-style:none;padding:0;margin:20px 0 28px}
.pricing-card ul li{padding:10px 0;font-size:14px;color:var(--text-secondary);border-bottom:1px solid rgba(30,41,59,0.5);display:flex;align-items:center;gap:10px}
.pricing-card ul li:last-child{border-bottom:none}
.pricing-card ul li .check{color:#22C55E;font-weight:700}
.pricing-card .btn{display:block;text-align:center;padding:12px;border-radius:var(--radius-md);font-weight:600;font-size:15px;transition:all var(--transition)}
.pricing-card .btn-outline{background:rgba(255,255,255,0.04);border:1px solid var(--border);color:var(--text-primary)}
.pricing-card .btn-outline:hover{background:rgba(59,130,246,0.1);border-color:var(--accent);color:var(--accent)}
.pricing-card.featured .btn-primary{background:linear-gradient(135deg,var(--accent),#2563EB);color:#fff;border:1px solid rgba(59,130,246,0.3);box-shadow:0 4px 14px rgba(59,130,246,0.25)}
.pricing-card.featured .btn-primary:hover{box-shadow:0 6px 24px rgba(59,130,246,0.35);transform:translateY(-1px)}

/* ===== CTA ===== */
.cta-section{position:relative;overflow:hidden;padding:100px 0;text-align:center}
.cta-section::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 800px 400px at 50% 50%,rgba(59,130,246,0.1),transparent);pointer-events:none}
.cta-section .container{position:relative;z-index:1}
.cta-section h2{font-size:clamp(28px,3vw,40px);font-weight:800;margin-bottom:14px}
.cta-section p{color:var(--text-secondary);font-size:16px;margin-bottom:32px;max-width:500px;margin-left:auto;margin-right:auto}
.cta-section .btn-cta{background:linear-gradient(135deg,var(--accent),#2563EB);color:#fff;padding:16px 44px;border-radius:var(--radius-md);font-weight:700;font-size:17px;display:inline-flex;align-items:center;gap:10px;border:1px solid rgba(59,130,246,0.3);box-shadow:0 4px 20px rgba(59,130,246,0.25);transition:all var(--transition)}
.cta-section .btn-cta:hover{box-shadow:0 8px 32px rgba(59,130,246,0.35);transform:translateY(-2px)}

/* ===== Footer ===== */
footer{background:var(--bg-secondary);border-top:1px solid var(--border);padding:60px 0 32px}
footer .grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px}
footer .brand-desc{font-size:14px;color:var(--text-muted);line-height:1.8;margin-top:12px;max-width:300px}
footer h4{color:var(--text-primary);font-size:15px;font-weight:700;margin-bottom:18px;letter-spacing:-0.3px}
footer a{display:block;font-size:14px;color:var(--text-muted);padding:5px 0;transition:color var(--transition)}
footer a:hover{color:var(--accent)}
footer .social{display:flex;gap:12px;margin-top:16px}
footer .social a{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:14px;padding:0;transition:all var(--transition)}
footer .social a:hover{background:rgba(59,130,246,0.1);border-color:var(--accent);color:var(--accent)}
footer .bottom{border-top:1px solid var(--border);margin-top:40px;padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
footer .bottom span{font-size:13px;color:var(--text-muted)}

/* ===== Docs ===== */
.docs-page{padding:60px 0;max-width:860px;margin:0 auto}
.docs-page h1{font-size:clamp(28px,3vw,38px);font-weight:800;margin-bottom:8px;letter-spacing:-0.5px}
.docs-page .lead{color:var(--text-secondary);font-size:16px;margin-bottom:48px}
.docs-page h2{font-size:22px;font-weight:700;margin:40px 0 16px;padding-bottom:10px;border-bottom:1px solid var(--border);color:var(--text-primary)}
.docs-page h3{font-size:17px;font-weight:600;margin:28px 0 10px;color:var(--accent)}
.docs-page p{color:var(--text-secondary);margin-bottom:14px;line-height:1.8;font-size:15px}
.docs-page code{background:rgba(59,130,246,0.08);padding:2px 8px;border-radius:4px;font-size:13px;font-family:var(--font-mono);color:var(--accent)}
.docs-page pre{background:var(--bg-card);color:var(--text-primary);padding:20px 24px;border-radius:var(--radius-md);overflow-x:auto;margin-bottom:20px;font-size:13px;line-height:1.6;font-family:var(--font-mono);border:1px solid var(--border)}
.docs-page .endpoint{display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:10px 16px;background:rgba(59,130,246,0.04);border-radius:var(--radius-sm);border:1px solid var(--border)}
.docs-page .method{background:var(--accent);color:#fff;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;text-transform:uppercase}
.docs-page .method.get{background:#22C55E}
.docs-page .method.post{background:var(--accent)}
.docs-page .method.del{background:#EF4444}
.docs-page .tip-box{background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.15);border-radius:var(--radius-md);padding:20px 24px;margin:32px 0}
.docs-page .tip-box strong{color:var(--accent)}

/* ===== Page Hero ===== */
.page-hero{padding:80px 0 60px;text-align:center;background:var(--bg-primary);border-bottom:1px solid var(--border)}
.page-hero h1{font-size:clamp(28px,3vw,40px);font-weight:800;margin-bottom:8px}
.page-hero p{color:var(--text-secondary);font-size:16px}

/* ===== Feature detail list ===== */
.feature-detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
@media(max-width:768px){.feature-detail-grid{grid-template-columns:1fr}}

/* ===== Responsive ===== */
@media(max-width:768px){
  nav .container{padding:0 16px}
  .nav-links{position:fixed;top:0;right:-280px;width:280px;height:100vh;background:var(--bg-secondary);flex-direction:column;gap:8px;padding:80px 24px 24px;transition:right 0.3s ease;border-left:1px solid var(--border);align-items:stretch}
  .nav-links.open{right:0}
  .nav-toggle{display:block}
  .nav-links .btn-nav{text-align:center;margin-top:8px}
  .hero{padding:80px 0 60px}
  .hero-stats{gap:24px;margin-top:40px}
  .hero-stat .num{font-size:28px}
  .features-grid,.pricing-grid,.stats-row{grid-template-columns:1fr;gap:16px}
  .pricing-grid{grid-template-columns:1fr;max-width:360px;margin:0 auto}
  section{padding:60px 0}
  footer .grid{grid-template-columns:1fr 1fr;gap:24px}
  .docs-page pre{font-size:12px;padding:14px}
  .section-subtitle{margin-bottom:36px}
  .hero h1{font-size:clamp(28px,7vw,36px)}
}
@media(min-width:769px)and(max-width:1024px){
  .features-grid,.stats-row{grid-template-columns:repeat(2,1fr)}
  .pricing-grid{grid-template-columns:repeat(2,1fr);max-width:600px;margin:0 auto}
}`
}

// ==================== 导航组件 ====================
function navComponent(currentPath) {
  const links = [
    { href: '/', label: '首页', exact: true },
    { href: '/features', label: '功能' },
    { href: '/pricing', label: '定价' },
    { href: '/docs', label: '开发文档' },
  ]
  const navLinks = links.map(l => {
    const active = l.exact ? currentPath === '/' : currentPath.startsWith(l.href)
    return `<a href="${l.href}" class="${active ? 'active' : ''}">${l.label}</a>`
  }).join('')

  return `<nav>
  <div class="container">
    <a href="/" class="logo">
      <svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="url(#lg)"/><defs><linearGradient id="lg" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#3B82F6"/><stop offset="1" stop-color="#06B6D4"/></linearGradient></defs><text x="5" y="23" fill="#fff" font-size="20" font-weight="800" font-family="sans-serif">S</text></svg>
      Shou<span>Yin</span>POS
    </a>
    <div class="nav-links" id="navMenu">
      ${navLinks}
      <a href="/admin" class="btn-nav" target="_blank">管理后台 →</a>
    </div>
    <div class="nav-toggle" id="navToggle" onclick="toggleNav()">
      <span></span><span></span><span></span>
    </div>
  </div>
</nav>`
}

// ==================== Footer 组件 ====================
function footerComponent() {
  const year = new Date().getFullYear()
  return `<footer>
  <div class="container">
    <div class="grid">
      <div>
        <h4>ShouYinPOS</h4>
        <p class="brand-desc">专业的店铺收银管理系统。支持多门店、多终端、多支付方式。商品管理、会员营销、库存管理、经营报表一站式覆盖。</p>
        <div class="social">
          <a href="mailto:support@example.com" title="邮箱">✉</a>
          <a href="#" title="微信">💬</a>
          <a href="/docs" title="文档">📄</a>
        </div>
      </div>
      <div>
        <h4>产品</h4>
        <a href="/features">功能特性</a>
        <a href="/pricing">定价方案</a>
        <a href="/docs">开发文档</a>
      </div>
      <div>
        <h4>支持</h4>
        <a href="/docs">API 文档</a>
        <a href="mailto:support@example.com">联系我们</a>
        <a href="#">常见问题</a>
      </div>
      <div>
        <h4>管理</h4>
        <a href="/admin">管理后台</a>
        <a href="/docs#api">API 参考</a>
        <a href="/pricing">定价</a>
      </div>
    </div>
    <div class="bottom">
      <span>© ${year} ShouYinPOS. All rights reserved.</span>
      <span>Built on Cloudflare Workers</span>
    </div>
  </div>
</footer>`
}

// ==================== 客户端 JS ====================
function clientJS() {
  return `<script>
document.addEventListener('DOMContentLoaded',function(){
  /* IntersectionObserver 滚动淡入 */
  var fadeEls=document.querySelectorAll('.fade-up');
  if(fadeEls.length>0&&'IntersectionObserver'in window){
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}})
    },{threshold:0.1});
    fadeEls.forEach(function(el){obs.observe(el)})
  }else{fadeEls.forEach(function(el){el.classList.add('visible')})}
  /* 数字滚动动画 */
  var countEls=document.querySelectorAll('.count-up');
  countEls.forEach(function(el){
    var target=parseInt(el.getAttribute('data-target'))||0;
    var duration=parseInt(el.getAttribute('data-duration'))||2000;
    var start=performance.now();
    function update(now){
      var elapsed=now-start;
      var progress=Math.min(elapsed/duration,1);
      var eased=1-Math.pow(1-progress,3);
      el.textContent=Math.round(eased*target);
      if(progress<1)requestAnimationFrame(update)
    }
    requestAnimationFrame(update)
  })
});
function toggleNav(){
  var menu=document.getElementById('navMenu');
  var toggle=document.getElementById('navToggle');
  if(menu&&toggle){menu.classList.toggle('open');toggle.classList.toggle('open')}
}
document.addEventListener('click',function(e){
  var menu=document.getElementById('navMenu');
  var toggle=document.getElementById('navToggle');
  if(menu&&menu.classList.contains('open')&&!menu.contains(e.target)&&e.target!==toggle&&!toggle.contains(e.target)){
    menu.classList.remove('open');toggle.classList.remove('open')
  }
});
</script>`
}

// ==================== Page Shell ====================
function shell(opts) {
  const siteName = opts.env?.SITE_NAME || 'ShouYinPOS'
  const css = buildCSS()
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${opts.title} - ${siteName}</title>
<meta name="description" content="${opts.description}">
<style>${css}</style>
</head>
<body>
${navComponent(opts.currentPath)}
${opts.content}
${footerComponent()}
${clientJS()}
</body>
</html>`
}

// ==================== 首页 ====================
export function homePage(env) {
  const content = `
<section class="hero">
  <div class="hero-grid"></div>
  <div class="container">
    <div class="hero-badge fade-up"><span class="dot"></span> v2.0 — 全新 Cloudflare 原生架构</div>
    <h1 class="fade-up stagger-1">轻盈高效的<br><span class="gradient">店铺收银管理系统</span></h1>
    <p class="fade-up stagger-2">支持多门店、多终端、多支付方式。提供商品管理、会员营销、库存管理、经营报表等完整功能。基于 Cloudflare Workers 构建，全球加速。</p>
    <div class="btns fade-up stagger-3">
      <a href="/pricing" class="primary">查看定价 <span>→</span></a>
      <a href="/features" class="secondary">了解更多</a>
    </div>
    <div class="hero-stats fade-up stagger-4">
      <div class="hero-stat"><div class="num count-up" data-target="4" data-duration="1000">0</div><div class="label">产品版本</div></div>
      <div class="hero-stat"><div class="num count-up" data-target="50000" data-duration="2000">0</div><div class="label">最大商品数</div></div>
      <div class="hero-stat"><div class="num count-up" data-target="99" data-duration="1500">0</div><div class="label">% 正常运行</div></div>
      <div class="hero-stat"><div class="num count-up" data-target="10" data-duration="1000">0</div><div class="label">毫秒响应</div></div>
    </div>
  </div>
</section>

<section class="section-dark">
  <div class="container">
    <h2 class="section-title fade-up">核心<span class="highlight">功能</span></h2>
    <p class="section-subtitle fade-up">覆盖店铺经营的每一个环节，从收银到管理全链路覆盖</p>
    <div class="features-grid">
      <div class="feature-card fade-up stagger-1"><div class="feature-icon glow-blue">🛒</div><h3>快速收银</h3><p>支持扫码枪、搜索、分类浏览等多种商品查找方式，混合支付一单完成。</p></div>
      <div class="feature-card fade-up stagger-1"><div class="feature-icon glow-cyan">🏷️</div><h3>商品管理</h3><p>完整的商品信息管理，支持多规格 SKU、组合商品、计重商品、服务类商品。</p></div>
      <div class="feature-card fade-up stagger-2"><div class="feature-icon glow-green">💳</div><h3>会员系统</h3><p>会员等级、积分、余额、优惠券、营销活动一站式管理，提升复购率。</p></div>
      <div class="feature-card fade-up stagger-2"><div class="feature-icon glow-purple">📊</div><h3>经营报表</h3><p>销售额趋势、商品排行、分类分析、利润统计，数据驱动经营决策。</p></div>
      <div class="feature-card fade-up stagger-3"><div class="feature-icon glow-amber">📦</div><h3>库存管理</h3><p>采购入库、库存盘点、保质期预警、多仓库管理，库存数据实时更新。</p></div>
      <div class="feature-card fade-up stagger-3"><div class="feature-icon glow-pink">🔗</div><h3>多终端同步</h3><p>支持多台收银终端同时运行，数据实时同步。后台可远程管理所有终端。</p></div>
    </div>
  </div>
</section>

<section>
  <div class="container">
    <h2 class="section-title fade-up">值得<span class="highlight">信赖</span></h2>
    <p class="section-subtitle fade-up">全球加速部署，毫秒级响应</p>
    <div class="stats-row">
      <div class="stat-card fade-up"><div class="num count-up" data-target="99.9" data-duration="2000">0</div><div class="label">SLA 保障</div></div>
      <div class="stat-card fade-up stagger-1"><div class="num"><span class="count-up" data-target="100" data-duration="1500">0</span><span class="suffix">k+</span></div><div class="label">日均请求处理</div></div>
      <div class="stat-card fade-up stagger-2"><div class="num"><span class="count-up" data-target="50" data-duration="1000">0</span><span class="suffix">+</span></div><div class="label">全球边缘节点</div></div>
      <div class="stat-card fade-up stagger-3"><div class="num"><span class="count-up" data-target="10" data-duration="1000">0</span><span class="suffix">ms</span></div><div class="label">平均响应时间</div></div>
    </div>
  </div>
</section>

<section class="section-dark">
  <div class="container">
    <h2 class="section-title fade-up">选择<span class="highlight">方案</span></h2>
    <p class="section-subtitle fade-up">灵活定价，按需选择，免费入门</p>
    <div class="pricing-grid">
      <div class="pricing-card fade-up">
        <div class="plan-name">基础版</div>
        <div class="price"><span class="currency">¥</span>0</div>
        <div class="price-desc">免费使用</div>
        <ul>
          <li><span class="check">✓</span> 1 台收银终端</li>
          <li><span class="check">✓</span> 5,000 商品管理</li>
          <li><span class="check">✓</span> 2,000 会员</li>
          <li><span class="check">✓</span> 基础收银功能</li>
          <li><span class="check">✓</span> 基础经营报表</li>
        </ul>
        <a href="/admin" class="btn btn-outline">免费开始</a>
      </div>
      <div class="pricing-card featured fade-up stagger-1">
        <div class="plan-name">标准版</div>
        <div class="price"><span class="currency">¥</span>99<span class="period">/月</span></div>
        <div class="price-desc">适合成长型店铺</div>
        <ul>
          <li><span class="check">✓</span> 3 台收银终端</li>
          <li><span class="check">✓</span> 10,000 商品管理</li>
          <li><span class="check">✓</span> 5,000 会员</li>
          <li><span class="check">✓</span> 会员 + 营销功能</li>
          <li><span class="check">✓</span> 优惠券系统</li>
        </ul>
        <a href="/admin" class="btn btn-primary">立即订阅</a>
      </div>
      <div class="pricing-card fade-up stagger-2">
        <div class="plan-name">高级版</div>
        <div class="price"><span class="currency">¥</span>299<span class="period">/月</span></div>
        <div class="price-desc">适合大规模运营</div>
        <ul>
          <li><span class="check">✓</span> 10 台收银终端</li>
          <li><span class="check">✓</span> 50,000 商品管理</li>
          <li><span class="check">✓</span> 20,000 会员</li>
          <li><span class="check">✓</span> 全部功能解锁</li>
          <li><span class="check">✓</span> 库存 + 供应商管理</li>
        </ul>
        <a href="/admin" class="btn btn-outline">立即订阅</a>
      </div>
      <div class="pricing-card fade-up stagger-3">
        <div class="plan-name">企业版</div>
        <div class="price">定制</div>
        <div class="price-desc">专属解决方案</div>
        <ul>
          <li><span class="check">✓</span> 不限终端数量</li>
          <li><span class="check">✓</span> 不限商品数量</li>
          <li><span class="check">✓</span> 不限会员数量</li>
          <li><span class="check">✓</span> 全部高级功能</li>
          <li><span class="check">✓</span> 专属技术支持</li>
        </ul>
        <a href="mailto:support@example.com" class="btn btn-outline">联系我们</a>
      </div>
    </div>
  </div>
</section>

<section class="cta-section section-dark" style="border-top:1px solid var(--border)">
  <div class="container">
    <h2 class="fade-up">准备好开始了吗？</h2>
    <p class="fade-up stagger-1">免费试用，无需信用卡。基于 Cloudflare Workers 架构，全球加速部署。</p>
    <div class="fade-up stagger-2"><a href="/admin" class="btn-cta">进入管理后台 <span>→</span></a></div>
  </div>
</section>`
  return shell({ title: '首页', description: '专业的店铺收银管理系统 - 基于 Cloudflare Workers 构建，支持多门店、多终端、多支付方式', content, env, currentPath: '/' })
}

// ==================== 功能特性 ====================
export function featuresPage(env) {
  const content = `
<section class="page-hero">
  <div class="container">
    <h1 class="fade-up">完整<span class="gradient">功能特性</span></h1>
    <p class="fade-up stagger-1">从收银到管理，覆盖店铺运营全场景</p>
  </div>
</section>

<section>
  <div class="container">
    <h2 class="section-title fade-up"><span class="highlight">收银</span>功能</h2>
    <p class="section-subtitle fade-up">收银环节的高效与准确</p>
    <div class="features-grid">
      <div class="feature-card fade-up"><div class="feature-icon glow-blue">📷</div><h3>快速扫码</h3><p>支持条码/二维码扫码枪，即扫即售，无需手动输入。</p></div>
      <div class="feature-card fade-up stagger-1"><div class="feature-icon glow-cyan">💳</div><h3>混合支付</h3><p>现金、微信、支付宝、会员余额、优惠券自由组合支付。</p></div>
      <div class="feature-card fade-up stagger-1"><div class="feature-icon glow-green">📋</div><h3>挂单/取单</h3><p>临时挂起当前订单，处理完其他顾客后再取单继续。</p></div>
      <div class="feature-card fade-up stagger-2"><div class="feature-icon glow-purple">🎨</div><h3>多规格商品</h3><p>支持颜色、尺码等多规格 SKU，自动匹配价格和库存。</p></div>
      <div class="feature-card fade-up stagger-2"><div class="feature-icon glow-amber">⚖️</div><h3>计重商品</h3><p>支持电子秤输入，按重量计价，适用于散装/称重商品。</p></div>
      <div class="feature-card fade-up stagger-3"><div class="feature-icon glow-pink">↩</div><h3>退款处理</h3><p>支持整单退款和部分退款，自动回滚库存和统计数据。</p></div>
    </div>
  </div>
</section>

<section class="section-dark">
  <div class="container">
    <h2 class="section-title fade-up"><span class="highlight">管理</span>功能</h2>
    <p class="section-subtitle fade-up">后台管理，运筹帷幄</p>
    <div class="features-grid">
      <div class="feature-card fade-up"><div class="feature-icon glow-blue">🏷️</div><h3>商品管理</h3><p>商品分类、品牌、标签、图片管理，支持批量导入导出。</p></div>
      <div class="feature-card fade-up stagger-1"><div class="feature-icon glow-cyan">🎯</div><h3>会员营销</h3><p>等级体系、积分规则、优惠券生成、满减活动灵活配置。</p></div>
      <div class="feature-card fade-up stagger-1"><div class="feature-icon glow-green">⚠️</div><h3>库存预警</h3><p>设置安全库存，自动预警，防止缺货影响销售。</p></div>
      <div class="feature-card fade-up stagger-2"><div class="feature-icon glow-purple">📈</div><h3>经营报表</h3><p>日/周/月报，利润分析，商品排行，趋势图表直观展示。</p></div>
      <div class="feature-card fade-up stagger-2"><div class="feature-icon glow-amber">👥</div><h3>员工管理</h3><p>角色权限、员工账号、PIN 码登录、班次管理一应俱全。</p></div>
      <div class="feature-card fade-up stagger-3"><div class="feature-icon glow-pink">📦</div><h3>采购管理</h3><p>采购订单、供应商管理、入库验收完整闭环。</p></div>
    </div>
  </div>
</section>`
  return shell({ title: '功能特性', description: '店铺收银系统的完整功能列表 - 收银 / 商品 / 会员 / 库存 / 报表', content, env, currentPath: '/features' })
}

// ==================== 定价 ====================
export function pricingPage(env) {
  const content = `
<section class="page-hero">
  <div class="container">
    <h1 class="fade-up">选择<span class="gradient">适合您的方案</span></h1>
    <p class="fade-up stagger-1">灵活定价，按需选择，从免费开始</p>
  </div>
</section>

<section class="section-dark">
  <div class="container">
    <h2 class="section-title fade-up">定价<span class="highlight">方案</span></h2>
    <p class="section-subtitle fade-up">透明定价，无隐性费用</p>
    <div class="pricing-grid">
      <div class="pricing-card fade-up">
        <div class="plan-name">基础版</div>
        <div class="price"><span class="currency">¥</span>0</div>
        <div class="price-desc">适合小型店铺</div>
        <ul>
          <li><span class="check">✓</span> 1 台收银终端</li>
          <li><span class="check">✓</span> 5,000 商品</li>
          <li><span class="check">✓</span> 2,000 会员</li>
          <li><span class="check">✓</span> 基础收银 + 报表</li>
        </ul>
        <a href="/admin" class="btn btn-outline">免费使用</a>
      </div>
      <div class="pricing-card featured fade-up stagger-1">
        <div class="plan-name">标准版</div>
        <div class="price"><span class="currency">¥</span>99<span class="period">/月</span></div>
        <div class="price-desc">适合成长型店铺</div>
        <ul>
          <li><span class="check">✓</span> 3 台收银终端</li>
          <li><span class="check">✓</span> 10,000 商品</li>
          <li><span class="check">✓</span> 5,000 会员</li>
          <li><span class="check">✓</span> 会员 + 营销 + 优惠券</li>
        </ul>
        <a href="/admin" class="btn btn-primary">立即订阅</a>
      </div>
      <div class="pricing-card fade-up stagger-2">
        <div class="plan-name">高级版</div>
        <div class="price"><span class="currency">¥</span>299<span class="period">/月</span></div>
        <div class="price-desc">适合大规模运营</div>
        <ul>
          <li><span class="check">✓</span> 10 台收银终端</li>
          <li><span class="check">✓</span> 50,000 商品</li>
          <li><span class="check">✓</span> 20,000 会员</li>
          <li><span class="check">✓</span> 全部功能 + 库存管理</li>
        </ul>
        <a href="/admin" class="btn btn-outline">立即订阅</a>
      </div>
      <div class="pricing-card fade-up stagger-3">
        <div class="plan-name">企业版</div>
        <div class="price">联系</div>
        <div class="price-desc">专属定制</div>
        <ul>
          <li><span class="check">✓</span> 不限终端</li>
          <li><span class="check">✓</span> 不限商品 + 会员</li>
          <li><span class="check">✓</span> 全部高级功能</li>
          <li><span class="check">✓</span> 专属技术支持</li>
        </ul>
        <a href="mailto:support@example.com" class="btn btn-outline">联系我们</a>
      </div>
    </div>
  </div>
</section>`
  return shell({ title: '定价方案', description: '选择适合您店铺的定价方案 - 免费基础版 / 标准版 ¥99/月 / 高级版 ¥299/月', content, env, currentPath: '/pricing' })
}

// ==================== 开发文档 ====================
export function docsPage(env) {
  const content = `
<div class="docs-page">
  <h1 class="fade-up">开发<span class="gradient">文档</span></h1>
  <p class="lead fade-up stagger-1">收银系统授权 API 接入文档</p>

  <h2>授权 API</h2>
  <p>收银系统通过以下 API 与授权系统通信，完成激活和心跳检测。所有请求 Content-Type 为 <code>application/json</code>。</p>

  <h3>在线激活</h3>
  <p>使用授权码和硬件指纹完成首次激活，返回实例 ID 和授权信息。</p>
  <div class="endpoint"><span class="method post">POST</span><code>/api/v1/activate</code></div>
  <pre>{
  "license_key": "POS-XXXX-XXXX-XXXX-XXXX",
  "hardware_fingerprint": "sha256_fingerprint",
  "store_name": "店铺名称",
  "fingerprint_detail": { ... }
}</pre>

  <h3>心跳上报</h3>
  <p>定期上报心跳，维持授权有效性。建议间隔 5-10 分钟。</p>
  <div class="endpoint"><span class="method post">POST</span><code>/api/v1/heartbeat</code></div>
  <pre>{
  "instance_id": "uuid_v4",
  "hardware_fingerprint": "sha256_fingerprint"
}</pre>

  <h3 id="api">查询实例状态</h3>
  <p>查询指定实例的授权状态。</p>
  <div class="endpoint"><span class="method get">GET</span><code>/api/v1/status/:instanceId</code></div>

  <h2>管理 API</h2>
  <p>管理后台 API 需要 JWT 认证，在请求头中携带 <code>Authorization: Bearer &lt;token&gt;</code>。</p>

  <h3>管理员登录</h3>
  <div class="endpoint"><span class="method post">POST</span><code>/api/auth/login</code></div>
  <pre>{
  "username": "admin",
  "password": "your_password"
}</pre>

  <h3>创建授权码</h3>
  <div class="endpoint"><span class="method post">POST</span><code>/api/licenses</code></div>
  <pre>{
  "product_edition": "standard",
  "valid_days": 365,
  "customer_name": "客户名称",
  "note": "备注"
}</pre>

  <h3>获取授权码列表</h3>
  <div class="endpoint"><span class="method get">GET</span><code>/api/licenses?page=1&pageSize=20</code></div>

  <h3>吊销授权码</h3>
  <div class="endpoint"><span class="method post">POST</span><code>/api/licenses/:id/revoke</code></div>

  <div class="tip-box">
    <strong>💡 提示：</strong> 所有管理 API 需要在请求头中携带 <code>Authorization: Bearer &lt;token&gt;</code>。Token 有效期为 8 小时，过期需重新登录。
  </div>
</div>`
  return shell({ title: '开发文档', description: '授权系统 API 开发文档 - 在线激活 / 心跳上报 / 授权码管理', content, env, currentPath: '/docs' })
}