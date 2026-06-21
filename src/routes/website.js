/**
 * ShouYinPOS 官网页面
 * Design: Premium B2B — Plus Jakarta Sans, desaturated palette, tinted shadows, asymmetric layouts
 */

// ==================== Design Tokens ====================
const TOKENS = {
  '--bg': '#f5f6f8',
  '--bg-alt': '#eceef2',
  '--bg-card': '#ffffff',
  '--text': '#1b1f2b',
  '--text-2': '#555b6e',
  '--text-3': '#8b92a5',
  '--accent': '#4361a8',
  '--accent-hover': '#334d8a',
  '--accent-light': '#edf1fa',
  '--accent-emerald': '#2d8a5e',
  '--border': '#dde1e8',
  '--border-subtle': '#eceef2',
  '--radius': '10px',
  '--radius-sm': '6px',
  '--radius-lg': '16px',
  '--radius-xl': '24px',
  '--shadow-sm': '0 1px 3px rgba(67,97,168,0.06)',
  '--shadow-md': '0 4px 20px rgba(67,97,168,0.08)',
  '--shadow-lg': '0 16px 48px rgba(67,97,168,0.12)',
  '--transition': 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
  '--font': '"Plus Jakarta Sans",system-ui,sans-serif',
}

function buildCSS() {
  const vars = Object.entries(TOKENS).map(([k, v]) => `${k}:${v}`).join(';')
  return `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root{${vars}}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--font);background:var(--bg);color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased;font-feature-settings:'cv11','ss01'}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}

.skip-link{position:absolute;top:-100%;left:16px;z-index:9999;padding:10px 20px;background:var(--accent);color:#fff;border-radius:var(--radius-sm);font-size:14px;font-weight:600;transition:top 0.2s}
.skip-link:focus{top:16px}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

.wrap{max-width:1200px;margin:0 auto;padding:0 24px}

/* ==================== Navigation ==================== */
.nav{position:sticky;top:0;z-index:100;background:rgba(245,246,248,0.88);backdrop-filter:blur(16px) saturate(1.2);border-bottom:1px solid var(--border)}
.nav .wrap{display:flex;align-items:center;justify-content:space-between;height:64px}
.logo{display:flex;align-items:center;gap:10px;font-size:18px;font-weight:800;color:var(--text);letter-spacing:-0.3px}
.logo svg{width:28px;height:28px}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-links a{color:var(--text-2);font-size:14px;font-weight:500;transition:color 0.2s}
.nav-links a:hover{color:var(--text)}
.nav-links a.on{color:var(--accent);font-weight:600}
.nav-btn{background:var(--accent);color:#fff!important;padding:8px 20px;border-radius:var(--radius-sm);font-weight:600;font-size:13px;transition:var(--transition)}
.nav-btn:hover{background:var(--accent-hover);transform:translateY(-1px)}
.nav-btn:active{transform:scale(0.97)}
.nav-mob{display:none;cursor:pointer;width:24px;height:18px;position:relative}
.nav-mob span{display:block;width:100%;height:2px;background:var(--text);position:absolute;transition:0.25s;border-radius:1px}
.nav-mob span:nth-child(1){top:0}
.nav-mob span:nth-child(2){top:8px}
.nav-mob span:nth-child(3){top:16px}
.nav-mob.open span:nth-child(1){transform:translateY(8px)rotate(45deg)}
.nav-mob.open span:nth-child(2){opacity:0}
.nav-mob.open span:nth-child(3){transform:translateY(-8px)rotate(-45deg)}

/* ==================== Hero ==================== */
.hero{position:relative;min-height:85dvh;display:flex;align-items:center;overflow:hidden;background:linear-gradient(135deg,#f0f2f5 0%,#e8ecf2 100%)}
.hero .wrap{position:relative;z-index:2;width:100%;max-width:1200px;margin:0 auto;padding:80px 24px;display:grid;grid-template-columns:0.45fr 0.55fr;gap:48px;align-items:center}
.hero-carousel{position:relative;z-index:1}
.hero-carousel .carousel{border-radius:var(--radius-xl);overflow:hidden;box-shadow:0 24px 64px rgba(67,97,168,0.15),0 8px 24px rgba(67,97,168,0.08);border:1px solid rgba(255,255,255,0.8)}
.hero-carousel .carousel-slide{width:100%;aspect-ratio:2879/1565}
.hero-carousel .carousel-slide img{width:100%;height:100%;object-fit:contain;display:block;background:#fff}
.hero-content{position:relative;z-index:2}
.hero h1{font-size:clamp(36px,4.5vw,54px);font-weight:800;line-height:1.05;letter-spacing:-2.5px;margin-bottom:20px;color:var(--text);text-wrap:balance}
.hero p{font-size:17px;color:var(--text-2);line-height:1.75;margin-bottom:36px;max-width:420px}
.hero-btns{display:flex;gap:14px;flex-wrap:wrap}

/* ==================== Buttons ==================== */
.btn{display:inline-flex;align-items:center;gap:8px;padding:13px 30px;border-radius:var(--radius-sm);font-weight:600;font-size:14px;transition:var(--transition);border:none;cursor:pointer;font-family:var(--font);white-space:nowrap}
.btn:active{transform:scale(0.97)!important}
.btn-primary{background:var(--accent);color:#fff;box-shadow:0 2px 8px rgba(67,97,168,0.2)}
.btn-primary:hover{background:var(--accent-hover);transform:translateY(-1px);box-shadow:0 4px 16px rgba(67,97,168,0.25)}
.btn-outline{background:transparent;color:var(--text);border:1.5px solid var(--border)}
.btn-outline:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-light)}
.btn-ghost{background:transparent;color:var(--accent);padding:8px 0}
.btn-ghost:hover{color:var(--accent-hover)}
.btn-full{width:100%;justify-content:center}

/* ==================== Carousel ==================== */
.carousel{position:relative;border-radius:var(--radius-xl);overflow:hidden;box-shadow:0 24px 64px rgba(67,97,168,0.15),0 8px 24px rgba(67,97,168,0.08);border:1px solid rgba(255,255,255,0.8)}
.carousel-track{position:relative;width:100%}
.carousel-slide{width:100%;aspect-ratio:2879/1565;display:none}
.carousel-slide.active{display:block}
.carousel-slide img{width:100%;height:100%;object-fit:contain;display:block;background:#fff}
.carousel-nav{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:10px;z-index:10}
.carousel-dot{width:8px;height:8px;border-radius:100px;background:rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s;border:none;padding:0}
.carousel-dot.active{background:var(--text);width:28px}
.carousel-btn{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.92);border:none;color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:var(--transition);z-index:10;box-shadow:0 4px 16px rgba(0,0,0,0.1)}
.carousel-btn:hover{background:#fff;box-shadow:0 6px 24px rgba(0,0,0,0.15);transform:translateY(-50%) scale(1.08)}
.carousel-btn:active{transform:translateY(-50%) scale(0.95)}
.carousel-btn.prev{left:16px}
.carousel-btn.next{right:16px}

/* ==================== Section Header ==================== */
.section-header{margin-bottom:56px}
.section-header h2{font-size:clamp(28px,3.5vw,40px);font-weight:800;letter-spacing:-1.2px;color:var(--text);margin-bottom:12px;text-wrap:balance}
.section-header p{color:var(--text-2);font-size:16px;max-width:480px;line-height:1.7}
.section-header.center{text-align:center}
.section-header.center p{margin:0 auto}

/* ==================== Features ==================== */
.features{padding:120px 0}
.feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.feature-card{background:var(--bg-card);border-radius:var(--radius-lg);padding:36px;transition:var(--transition);border:1px solid transparent}
.feature-card:hover{border-color:var(--border);box-shadow:var(--shadow-md);transform:translateY(-2px)}
.feature-card.featured{grid-column:span 2;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;padding:48px}
.feature-icon{width:48px;height:48px;border-radius:var(--radius);background:var(--accent-light);display:flex;align-items:center;justify-content:center;margin-bottom:20px}
.feature-icon svg{width:24px;height:24px;color:var(--accent)}
.feature-card h3{font-size:18px;font-weight:700;margin-bottom:8px;letter-spacing:-0.3px}
.feature-card p{font-size:14px;color:var(--text-2);line-height:1.75}

/* ==================== Stats ==================== */
.stats{padding:100px 0;background:var(--bg-alt)}
.stats .wrap{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}
.stats-head .big{font-size:clamp(52px,7vw,80px);font-weight:800;letter-spacing:-4px;line-height:1;color:var(--text);font-variant-numeric:tabular-nums}
.stats-head .big span{color:var(--accent)}
.stats-head .sub{font-size:16px;color:var(--text-2);margin-top:12px;line-height:1.6}
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.stat-card{background:var(--bg-card);border-radius:var(--radius);padding:28px;border:1px solid var(--border);transition:var(--transition)}
.stat-card:hover{box-shadow:var(--shadow-sm);border-color:transparent}
.stat-card .num{font-size:32px;font-weight:800;letter-spacing:-1.5px;font-variant-numeric:tabular-nums;color:var(--text)}
.stat-card .num em{font-style:normal;color:var(--accent)}
.stat-card .lbl{font-size:13px;color:var(--text-3);margin-top:6px}

/* ==================== Pricing ==================== */
.pricing{padding:120px 0}
.pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1020px;margin:0 auto;align-items:start}
.price-card{background:var(--bg-card);border-radius:var(--radius-lg);padding:40px 32px;text-align:center;transition:var(--transition);border:1.5px solid var(--border)}
.price-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg)}
.price-card.pop{border-color:var(--accent);position:relative;transform:scale(1.05);z-index:2;box-shadow:var(--shadow-lg)}
.price-card.pop::before{content:'';position:absolute;top:-1px;left:0;right:0;height:3px;background:var(--accent);border-radius:var(--radius-lg) var(--radius-lg) 0 0}
.price-card.pop:hover{transform:scale(1.05) translateY(-4px)}
.price-card .name{font-size:13px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px}
.price-card .price{font-size:48px;font-weight:800;letter-spacing:-2.5px;color:var(--text);font-variant-numeric:tabular-nums}
.price-card .price span{font-size:14px;color:var(--text-3);font-weight:400;letter-spacing:0}
.price-card .desc{font-size:14px;color:var(--text-2);margin:8px 0 28px}
.price-card ul{list-style:none;text-align:left;margin-bottom:32px}
.price-card li{padding:10px 0;font-size:14px;color:var(--text-2);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px}
.price-card li:last-child{border-bottom:none}
.price-card .ck{color:var(--accent-emerald);font-weight:700;font-size:13px;flex-shrink:0}
.price-card .btn{width:100%;justify-content:center}
.price-card.pop .btn{background:var(--accent);color:#fff;box-shadow:0 2px 8px rgba(67,97,168,0.2)}
.price-card.pop .btn:hover{background:var(--accent-hover)}

/* ==================== CTA ==================== */
.cta{padding:120px 0;text-align:center;background:linear-gradient(135deg,var(--accent-light) 0%,#f0f2f5 100%);position:relative;overflow:hidden}
.cta::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234361a8' fill-opacity='0.03'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")}
.cta h2{font-size:clamp(28px,3.5vw,40px);font-weight:800;margin-bottom:16px;letter-spacing:-1.2px;position:relative;text-wrap:balance}
.cta p{color:var(--text-2);font-size:16px;margin-bottom:36px;position:relative}
.cta .btn{position:relative}

/* ==================== Footer ==================== */
.footer{border-top:1px solid var(--border);padding:56px 0 24px;background:var(--bg)}
.footer .wrap{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px}
.footer h4{font-size:12px;font-weight:700;margin-bottom:14px;color:var(--text);text-transform:uppercase;letter-spacing:0.06em}
.footer a{display:block;font-size:13px;color:var(--text-2);padding:4px 0;transition:color 0.2s}
.footer a:hover{color:var(--accent)}
.footer .copy{border-top:1px solid var(--border);margin-top:36px;padding-top:16px;display:flex;justify-content:space-between;font-size:12px;color:var(--text-3)}

/* ==================== Auth ==================== */
.auth{min-height:100dvh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:24px}
.auth-box{background:var(--bg-card);border-radius:var(--radius-xl);padding:44px;width:100%;max-width:420px;box-shadow:var(--shadow-lg);border:1px solid var(--border)}
.auth-box h1{font-size:26px;font-weight:800;margin-bottom:6px;letter-spacing:-0.5px}
.auth-box .sub{color:var(--text-2);font-size:14px;margin-bottom:28px}
.fg{margin-bottom:18px}
.fg label{display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:var(--text)}
.fg input{width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:14px;font-family:var(--font);outline:none;transition:var(--transition);background:var(--bg-card)}
.fg input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-light)}
.fg .hint{font-size:12px;color:var(--text-3);margin-top:4px}
.err{color:#c9302c;font-size:13px;margin-bottom:12px;font-weight:500}
.auth-foot{margin-top:20px;display:flex;justify-content:space-between;font-size:13px;color:var(--text-3)}
.auth-foot a{color:var(--accent);font-weight:500}

/* ==================== User Pages ==================== */
.user{min-height:calc(100dvh - 64px);display:flex;background:var(--bg)}
.user-wrap{max-width:1200px;width:100%;display:flex;margin:0 auto}
.user-side{width:240px;border-right:1px solid var(--border);background:var(--bg-card);padding:24px 0;flex-shrink:0}
.user-side h3{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.08em;padding:0 20px;margin-bottom:8px}
.user-side a{display:flex;align-items:center;gap:10px;padding:8px 20px;font-size:13px;color:var(--text-2);transition:var(--transition);border-left:2px solid transparent;margin:0 12px;border-radius:0 var(--radius-sm) var(--radius-sm) 0;font-weight:500}
.user-side a:hover{color:var(--text);background:var(--bg-alt)}
.user-side a.on{color:var(--accent);border-left-color:var(--accent);background:var(--accent-light);font-weight:600}
.user-side a svg{width:16px;height:16px;opacity:0.5}
.user-side a.on svg{opacity:1}
.user-side .div{height:1px;background:var(--border);margin:12px 20px}
.user-main{flex:1;padding:32px;min-width:0}
.user-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px}
.user-head h1{font-size:22px;font-weight:800;letter-spacing:-0.5px}
.user-head .sub{color:var(--text-2);font-size:14px;margin-top:4px}
.user-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px}
.user-stat{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;transition:var(--transition)}
.user-stat:hover{box-shadow:var(--shadow-sm);border-color:transparent}
.user-stat .icon{width:36px;height:36px;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;margin-bottom:12px}
.user-stat .icon svg{width:18px;height:18px}
.user-stat .icon.blue{background:var(--accent-light);color:var(--accent)}
.user-stat .icon.green{background:rgba(45,138,94,0.1);color:var(--accent-emerald)}
.user-stat .icon.amber{background:rgba(196,125,26,0.1);color:#c47d1a}
.user-stat .icon.purple{background:rgba(120,90,200,0.1);color:#785ac8}
.user-stat .val{font-size:24px;font-weight:800;color:var(--text);letter-spacing:-0.5px;font-variant-numeric:tabular-nums}
.user-stat .lbl{font-size:12px;color:var(--text-2);margin-top:4px}
.sec{margin-bottom:28px}
.sec-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.sec-head h2{font-size:15px;font-weight:700}
.sec-head a{font-size:13px;color:var(--accent);font-weight:500}
.list{display:flex;flex-direction:column;gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
.item{display:flex;justify-content:space-between;align-items:center;background:var(--bg-card);padding:14px 16px;transition:background 0.15s;cursor:pointer}
.item:hover{background:var(--bg-alt)}
.item-t{font-weight:600;font-size:14px}
.item-m{font-size:12px;color:var(--text-3);margin-top:2px}
.item-r{text-align:right}
.badge{font-size:11px;padding:3px 10px;border-radius:100px;font-weight:600}
.badge-ok{background:rgba(45,138,94,0.1);color:var(--accent-emerald)}
.badge-no{background:rgba(201,48,44,0.1);color:#c9302c}
.badge-wait{background:rgba(196,125,26,0.1);color:#c47d1a}
.empty{text-align:center;padding:40px;color:var(--text-3);background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius)}
.empty a{color:var(--accent);font-weight:500}
.tabs{display:flex;gap:4px;margin-bottom:16px;background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--radius-sm);padding:3px;width:fit-content}
.tabs button{padding:6px 16px;border:none;border-radius:5px;font-size:13px;cursor:pointer;color:var(--text-2);background:transparent;transition:var(--transition);font-family:var(--font);font-weight:500}
.tabs button.on{background:var(--bg-card);color:var(--text);box-shadow:var(--shadow-sm);font-weight:600}
.tabs button:hover:not(.on){color:var(--text)}
.license-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
.lic{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;transition:var(--transition);cursor:pointer}
.lic:hover{border-color:var(--accent);box-shadow:var(--shadow-sm)}
.lic-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.lic-name{font-weight:700;font-size:15px}
.lic-key{font-family:"SF Mono",ui-monospace,monospace;font-size:12px;background:var(--bg-alt);padding:8px 12px;border-radius:6px;border:1px solid var(--border);margin-bottom:12px;color:var(--text-2);letter-spacing:0.02em}
.lic-foot{display:flex;justify-content:space-between;font-size:12px;color:var(--text-3)}
.quick-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px}
.quick-btn{display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);text-decoration:none;color:var(--text);transition:var(--transition)}
.quick-btn:hover{border-color:var(--accent);box-shadow:var(--shadow-sm);transform:translateY(-1px)}
.quick-btn:active{transform:scale(0.98)}
.quick-btn svg{width:24px;height:24px;color:var(--accent)}
.quick-btn span{font-size:13px;font-weight:600}

/* ==================== Docs ==================== */
.docs{padding:80px 0}
.docs .wrap{max-width:760px}
.docs h1{font-size:clamp(24px,3vw,32px);font-weight:800;margin-bottom:6px;letter-spacing:-0.5px}
.docs .sub{color:var(--text-2);font-size:14px;margin-bottom:36px}
.docs h2{font-size:18px;font-weight:700;margin:32px 0 12px;padding-bottom:10px;border-bottom:1px solid var(--border);letter-spacing:-0.3px}
.docs p{color:var(--text-2);font-size:14px;margin-bottom:14px;line-height:1.7}
.docs h3{font-size:14px;font-weight:700;margin:24px 0 10px;color:var(--accent)}
.docs .endpoint{display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:8px 14px;background:var(--bg-alt);border-radius:var(--radius-sm);border:1px solid var(--border)}
.docs .method{padding:3px 8px;border-radius:4px;font-size:10px;font-weight:800;color:#fff;letter-spacing:0.03em}
.docs .method.post{background:var(--accent)}
.docs .method.get{background:var(--accent-emerald)}
.docs code{font-size:13px;font-family:"SF Mono",ui-monospace,monospace;color:var(--text)}
.docs pre{background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--radius);padding:16px;font-size:12px;overflow-x:auto;margin-bottom:18px;font-family:"SF Mono",ui-monospace,monospace;line-height:1.6}

/* ==================== Animations ==================== */
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.anim{animation:fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both}
.anim-d1{animation-delay:0.08s}
.anim-d2{animation-delay:0.16s}
.anim-d3{animation-delay:0.24s}
.anim-d4{animation-delay:0.32s}
.anim-d5{animation-delay:0.40s}
.anim-d6{animation-delay:0.48s}

/* ==================== Noise Overlay ==================== */
body::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9998;opacity:0.018;background:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

/* ==================== Spotlight Border ==================== */
.spotlight{position:relative}
.spotlight::before{content:'';position:absolute;inset:-1px;border-radius:inherit;background:radial-gradient(600px circle at var(--mx,50%) var(--my,50%),rgba(67,97,168,0.15),transparent 40%);opacity:0;transition:opacity 0.4s;z-index:0;pointer-events:none}
.spotlight:hover::before{opacity:1}
.spotlight>*{position:relative;z-index:1}

/* ==================== Feature Cards (borderless) ==================== */
.feature-card{background:var(--bg-card);border-radius:var(--radius-lg);padding:36px;transition:var(--transition);border:none;box-shadow:0 1px 3px rgba(67,97,168,0.04)}
.feature-card:hover{box-shadow:0 8px 32px rgba(67,97,168,0.1);transform:translateY(-3px)}

/* ==================== Pricing (pinned buttons) ==================== */
.price-card{display:flex;flex-direction:column}
.price-card .btn{margin-top:auto}

/* ==================== CTA (deeper) ==================== */
.cta{padding:120px 0;text-align:center;background:var(--text);position:relative;overflow:hidden;color:#fff}
.cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(67,97,168,0.3),transparent)}
.cta::after{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");opacity:0.04}
.cta h2{font-size:clamp(28px,3.5vw,40px);font-weight:800;margin-bottom:16px;letter-spacing:-1.2px;position:relative;z-index:1;text-wrap:balance;color:#fff}
.cta p{color:rgba(255,255,255,0.65);font-size:16px;margin-bottom:36px;position:relative;z-index:1}
.cta .btn{position:relative;z-index:1}
.cta .btn-primary{background:#fff;color:var(--text);box-shadow:0 2px 12px rgba(0,0,0,0.2)}
.cta .btn-primary:hover{background:#f0f0f0;transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,0,0,0.25)}

/* ==================== Stat Cards (borderless) ==================== */
.stat-card{background:var(--bg-card);border-radius:var(--radius);padding:28px;border:none;box-shadow:0 1px 3px rgba(67,97,168,0.04);transition:var(--transition)}
.stat-card:hover{box-shadow:0 4px 16px rgba(67,97,168,0.08);transform:translateY(-2px)}

/* ==================== Responsive ==================== */
@media(max-width:768px){
  .nav-links{position:fixed;top:0;right:-300px;width:280px;height:100dvh;background:var(--bg-card);flex-direction:column;gap:4px;padding:80px 20px;transition:right 0.3s;border-left:1px solid var(--border);align-items:stretch;box-shadow:-4px 0 24px rgba(0,0,0,0.1)}
  .nav-links.open{right:0}
  .nav-mob{display:block}
  .hero .wrap{grid-template-columns:1fr;gap:40px;padding:60px 24px}
  .hero-content{max-width:100%}
  .hero-carousel{order:-1}
  .feature-grid{grid-template-columns:1fr}
  .feature-card.featured{grid-column:span 1;grid-template-columns:1fr}
  .stats .wrap{grid-template-columns:1fr;gap:40px}
  .pricing-grid{grid-template-columns:1fr;max-width:380px;margin:0 auto}
  .price-card.pop{transform:none}
  .price-card.pop:hover{transform:translateY(-4px)}
  .footer .wrap{grid-template-columns:1fr 1fr;gap:24px}
  .user{flex-direction:column}
  .user-side{width:100%;height:auto;position:static;border-right:none;border-bottom:1px solid var(--border);padding:12px 0;display:flex;overflow-x:auto}
  .user-side h3{display:none}
  .user-side a{padding:8px 16px;white-space:nowrap;border-left:none;border-bottom:2px solid transparent;margin:0}
  .user-side a.on{border-bottom-color:var(--accent);border-left:none}
  .user-side .div{display:none}
  .user-main{padding:20px 16px}
  .user-stats{grid-template-columns:repeat(2,1fr)}
  .quick-actions{grid-template-columns:1fr}
  .license-grid{grid-template-columns:1fr}
}`
}

function carouselJS(){return `<script>var slideIdx=0,slideCount=2,slideTimer;function moveSlide(d){slideIdx=(slideIdx+d+slideCount)%slideCount;updSlide()}function goSlide(n){slideIdx=n;updSlide()}function updSlide(){var slides=document.querySelectorAll(".carousel-slide");slides.forEach(function(s,i){s.classList.toggle("active",i===slideIdx)});document.querySelectorAll(".carousel-dot").forEach(function(d,i){d.classList.toggle("active",i===slideIdx)});clearInterval(slideTimer);slideTimer=setInterval(function(){moveSlide(1)},5000)}window.addEventListener("load",function(){updSlide()})</script>`}

function toggleNav(){var m=document.getElementById('nm'),t=document.getElementById('nt');if(m&&t){m.classList.toggle('open');t.classList.toggle('open')}}
function handleLogout(){localStorage.removeItem('token');localStorage.removeItem('user');window.location.href='/'}

// Shell
function shell(o) {
  const css = buildCSS()
  const noNav = ['/login','/register','/forgot'].includes(o.path)
  const isUser = ['/dashboard','/licenses','/orders','/profile'].includes(o.path)
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${o.title} - ShouYinPOS</title><meta name="description" content="${o.desc}"><meta property="og:title" content="${o.title} - ShouYinPOS"><meta property="og:description" content="${o.desc}"><meta property="og:type" content="website"><link rel="icon" href="data:image/svg+xml,<svg viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'><rect width='28' height='28' rx='6' fill='%231b1f2b'/><text x='6' y='19' fill='fff' font-size='15' font-weight='700' font-family='system-ui'>S</text></svg>"><style>${css}</style></head><body><a href="#main" class="skip-link">跳转到主要内容</a>${noNav?'':isUser?userNav():nav(o.path)}<main id="main">${o.html}</main>${noNav?'':footer()}<script>
document.addEventListener('click',function(e){var m=document.getElementById('nm'),t=document.getElementById('nt');if(m&&m.classList.contains('open')&&!m.contains(e.target)&&e.target!==t){m.classList.remove('open');t.classList.remove('open')}});
function toggleNav(){var m=document.getElementById('nm'),t=document.getElementById('nt');if(m&&t){m.classList.toggle('open');t.classList.toggle('open')}}
function handleLogout(){localStorage.removeItem('token');localStorage.removeItem('user');window.location.href='/'}
document.querySelectorAll('.spotlight').forEach(function(el){el.addEventListener('mousemove',function(e){var r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px')})});
</script>${o.extra||''}</body></html>`
}

function nav(path) {
  const links = [{href:'/',label:'首页',exact:true},{href:'/pricing',label:'定价'},{href:'/features',label:'功能'},{href:'/docs',label:'文档'}]
  const items = links.map(l => `<a href="${l.href}" class="${(l.exact?path===l.href:path.startsWith(l.href))?'on':''}">${l.label}</a>`).join('')
  return `<nav class="nav"><div class="wrap"><a href="/" class="logo"><svg viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="6" fill="#1b1f2b"/><text x="6" y="19" fill="#fff" font-size="15" font-weight="700" font-family="system-ui">S</text></svg>ShouYinPOS</a><div class="nav-links" id="nm">${items}<a href="/login" class="nav-btn">登录</a></div><div class="nav-mob" id="nt" onclick="toggleNav()"><span></span><span></span><span></span></div></div></nav>`
}

function userNav() {
  return `<nav class="nav"><div class="wrap"><a href="/" class="logo"><svg viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="6" fill="#1b1f2b"/><text x="6" y="19" fill="#fff" font-size="15" font-weight="700" font-family="system-ui">S</text></svg>ShouYinPOS</a><div class="nav-links" id="nm"><a href="/">首页</a><a href="/pricing">定价</a><a href="/dashboard">控制台</a><a href="#" onclick="handleLogout();return false" class="nav-btn">退出</a></div><div class="nav-mob" id="nt" onclick="toggleNav()"><span></span><span></span><span></span></div></div></nav>`
}

function footer() {
  const y = new Date().getFullYear()
  return `<footer class="footer"><div class="wrap"><div><h4>ShouYinPOS</h4><p style="font-size:13px;color:var(--text-2);line-height:1.7;max-width:260px">专业的店铺收银管理系统，支持多门店、多终端、多支付方式。</p></div><div><h4>产品</h4><a href="/features">功能特性</a><a href="/pricing">定价方案</a><a href="/docs">开发文档</a></div><div><h4>支持</h4><a href="mailto:support@shouyinpos.com">联系我们</a><a href="/docs">帮助中心</a></div><div><h4>法律</h4><a href="#">隐私政策</a><a href="#">服务条款</a><a href="#">Cookie 设置</a></div></div><div class="wrap"><div class="copy"><span>&copy; ${y} ShouYinPOS</span><span>Powered by Cloudflare Workers</span></div></div></footer>`
}

// ==================== PAGES ====================

export function homePage(env) {
  const html = `
<section class="hero">
  <div class="wrap">
    <div class="hero-content">
      <h1 class="anim">让每一笔收银都快人一步</h1>
      <p class="anim anim-d1">多门店、多终端、全场景收银管理。全球 50+ 边缘节点加速，10ms 内响应，让店铺经营更高效。</p>
      <div class="hero-btns anim anim-d2">
        <a href="/register" class="btn btn-primary">免费开始</a>
        <a href="/features" class="btn btn-outline">了解功能</a>
      </div>
    </div>
    <div class="hero-carousel anim anim-d1">
      <div class="carousel" id="heroCarousel">
        <div class="carousel-slide active"><img src="https://master.shouquan-assets.pages.dev/syt.png" alt="ShouYinPOS 收银系统界面展示" /></div>
        <div class="carousel-slide"><img src="https://master.shouquan-assets.pages.dev/ht.png" alt="ShouYinPOS 管理后台界面展示" /></div>
        <button class="carousel-btn prev" onclick="moveSlide(-1)" aria-label="上一张"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>
        <button class="carousel-btn next" onclick="moveSlide(1)" aria-label="下一张"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button>
        <div class="carousel-nav"><button class="carousel-dot active" onclick="goSlide(0)" aria-label="第 1 张"></button><button class="carousel-dot" onclick="goSlide(1)" aria-label="第 2 张"></button></div>
      </div>
    </div>
  </div>
</section>

<section class="features">
  <div class="wrap">
    <div class="section-header anim"><h2>为零售场景打造的功能</h2><p>从收银到库存，从会员到报表，一个系统覆盖店铺经营全链路。</p></div>
    <div class="feature-grid">
      <div class="feature-card featured spotlight anim anim-d1"><div><div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></div><h3>快速收银</h3><p>支持扫码枪、搜索、分类浏览等多种商品查找方式，混合支付一单完成。微信、支付宝、现金、银行卡全渠道覆盖。</p></div><div style="background:var(--bg-alt);border-radius:var(--radius);height:200px;display:flex;align-items:center;justify-content:center;color:var(--text-3);font-size:13px">收银界面预览</div></div>
      <div class="feature-card spotlight anim anim-d2"><div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></div><h3>商品管理</h3><p>多规格 SKU、计重商品、批量导入导出，轻松管理海量商品数据。</p></div>
      <div class="feature-card spotlight anim anim-d3"><div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div><h3>会员系统</h3><p>等级、积分、余额、优惠券，精细化运营每一位顾客。</p></div>
      <div class="feature-card spotlight anim anim-d2"><div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div><h3>经营报表</h3><p>销售趋势、商品排行、利润统计，用数据驱动决策。</p></div>
      <div class="feature-card spotlight anim anim-d3"><div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div><h3>库存管理</h3><p>采购入库、盘点、保质期预警、多仓库调拨，库存尽在掌控。</p></div>
      <div class="feature-card spotlight anim anim-d4"><div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div><h3>多终端同步</h3><p>多台终端同时运行，数据实时同步，门店之间无缝协作。</p></div>
    </div>
  </div>
</section>

<section class="stats">
  <div class="wrap">
    <div class="stats-head anim">
      <div class="big">99.97<span>%</span></div>
      <div class="sub">服务可用性保障<br>全球 50+ 边缘节点，平均响应时间 &lt;10ms</div>
    </div>
    <div class="stats-grid">
      <div class="stat-card spotlight anim anim-d1"><div class="num">127<span>ms</span></div><div class="lbl">平均响应时间</div></div>
      <div class="stat-card spotlight anim anim-d2"><div class="num">50<span>+</span></div><div class="lbl">全球边缘节点</div></div>
      <div class="stat-card spotlight anim anim-d3"><div class="num">2.4<span>M</span></div><div class="lbl">月处理交易数</div></div>
      <div class="stat-card spotlight anim anim-d4"><div class="num">98<span>%</span></div><div class="lbl">客户续费率</div></div>
    </div>
  </div>
</section>

<section class="pricing">
  <div class="wrap">
    <div class="section-header center anim"><h2>简单透明的定价</h2><p>按年付费，无隐藏费用。所有方案均含基础收银、商品管理、会员系统。</p></div>
    <div class="pricing-grid">
      <div class="price-card spotlight anim anim-d1"><div class="name">基础版</div><div class="price">¥99<span>/年</span></div><div class="desc">适合单店小型商户</div><ul><li><span class="ck">&#10003;</span>1 个门店</li><li><span class="ck">&#10003;</span>1 台终端</li><li><span class="ck">&#10003;</span>5,000 商品</li><li><span class="ck">&#10003;</span>2,000 会员</li></ul><a href="/register" class="btn btn-outline">开始使用</a></div>
      <div class="price-card pop spotlight anim anim-d2"><div class="name">专业版</div><div class="price">¥299<span>/年</span></div><div class="desc">适合连锁门店</div><ul><li><span class="ck">&#10003;</span>3 个门店</li><li><span class="ck">&#10003;</span>5 台终端</li><li><span class="ck">&#10003;</span>20,000 商品</li><li><span class="ck">&#10003;</span>10,000 会员</li></ul><a href="/register" class="btn">立即购买</a></div>
      <div class="price-card spotlight anim anim-d3"><div class="name">企业版</div><div class="price">¥999<span>/年</span></div><div class="desc">适合大型连锁企业</div><ul><li><span class="ck">&#10003;</span>10 个门店</li><li><span class="ck">&#10003;</span>20 台终端</li><li><span class="ck">&#10003;</span>100,000 商品</li><li><span class="ck">&#10003;</span>专属客服支持</li></ul><a href="/register" class="btn btn-outline">联系我们</a></div>
    </div>
  </div>
</section>

<section class="cta">
  <div class="wrap">
    <h2>开始管理你的店铺</h2>
    <p>注册即享免费试用，无需信用卡，随时可取消。</p>
    <a href="/register" class="btn btn-primary">免费注册</a>
  </div>
</section>`
  return shell({ title: '首页', desc: '专业的店铺收银管理系统 — 多门店、多终端、全场景收银管理', html, path: '/', extra: carouselJS() })
}

export function featuresPage(env) {
  const html = `
<section class="features" style="padding-top:80px">
  <div class="wrap">
    <div class="section-header"><h2>功能特性</h2><p>全方位覆盖店铺经营需求，从收银到管理，一个系统搞定。</p></div>
    <div class="feature-grid">
      <div class="feature-card"><div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div><h3>多支付方式</h3><p>现金、微信、支付宝、银行卡，混合支付一单完成。</p></div>
      <div class="feature-card"><div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></div><h3>商品管理</h3><p>多规格 SKU、计重商品、批量导入导出，轻松管理海量商品。</p></div>
      <div class="feature-card"><div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><h3>会员系统</h3><p>等级、积分、余额、优惠券、营销活动，精细化运营每一位顾客。</p></div>
      <div class="feature-card"><div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div><h3>经营报表</h3><p>销售趋势、商品排行、利润统计，用数据驱动每一项决策。</p></div>
      <div class="feature-card"><div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div><h3>库存管理</h3><p>采购入库、盘点、保质期预警、多仓库调拨，库存尽在掌控。</p></div>
      <div class="feature-card"><div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div><h3>多终端同步</h3><p>多台终端同时运行，数据实时同步，门店之间无缝协作。</p></div>
    </div>
  </div>
</section>`
  return shell({ title: '功能特性', desc: 'ShouYinPOS 功能特性 — 全方位覆盖店铺经营需求', html, path: '/features' })
}

export function pricingPage(env) {
  const html = `
<section class="pricing" style="min-height:80dvh;display:flex;align-items:center">
  <div class="wrap" style="width:100%">
    <div class="section-header center"><h2>选择适合你的方案</h2><p>所有方案均含基础收银、商品管理、会员系统。按年付费，无隐藏费用。</p></div>
    <div class="pricing-grid">
      <div class="price-card"><div class="name">基础版</div><div class="price">¥99<span>/年</span></div><div class="desc">适合单店小型商户</div><ul><li><span class="ck">&#10003;</span>1 个门店</li><li><span class="ck">&#10003;</span>1 台终端</li><li><span class="ck">&#10003;</span>5,000 商品</li><li><span class="ck">&#10003;</span>2,000 会员</li></ul><a href="/register" class="btn btn-outline">开始使用</a></div>
      <div class="price-card pop"><div class="name">专业版</div><div class="price">¥299<span>/年</span></div><div class="desc">适合连锁门店</div><ul><li><span class="ck">&#10003;</span>3 个门店</li><li><span class="ck">&#10003;</span>5 台终端</li><li><span class="ck">&#10003;</span>20,000 商品</li><li><span class="ck">&#10003;</span>10,000 会员</li></ul><a href="/register" class="btn">立即购买</a></div>
      <div class="price-card"><div class="name">企业版</div><div class="price">¥999<span>/年</span></div><div class="desc">适合大型连锁企业</div><ul><li><span class="ck">&#10003;</span>10 个门店</li><li><span class="ck">&#10003;</span>20 台终端</li><li><span class="ck">&#10003;</span>100,000 商品</li><li><span class="ck">&#10003;</span>专属客服支持</li></ul><a href="/register" class="btn btn-outline">联系我们</a></div>
    </div>
  </div>
</section>`
  return shell({ title: '定价方案', desc: 'ShouYinPOS 定价方案 — 简单透明，按需选择', html, path: '/pricing' })
}

export function docsPage(env) {
  const html = `
<section class="docs">
  <div class="wrap">
    <h1>开发文档</h1>
    <p class="sub">收银系统授权 API 接入文档</p>
    <h2>授权 API</h2>
    <p>收银系统通过以下 API 完成激活和心跳检测。</p>
    <h3>在线激活</h3>
    <div class="endpoint"><span class="method post">POST</span><code>/api/v1/activate</code></div>
    <pre>{"license_key":"POS-XXXX-XXXX-XXXX","hardware_fingerprint":"sha256...","store_name":"店铺名称"}</pre>
    <h3>心跳上报</h3>
    <div class="endpoint"><span class="method post">POST</span><code>/api/v1/heartbeat</code></div>
    <pre>{"instance_id":"uuid_v4","hardware_fingerprint":"sha256..."}</pre>
    <h3>查询状态</h3>
    <div class="endpoint"><span class="method get">GET</span><code>/api/v1/status/:instanceId</code></div>
  </div>
</section>`
  return shell({ title: '开发文档', desc: 'ShouYinPOS API 文档 — 授权系统接入指南', html, path: '/docs' })
}

export function loginPage(env) {
  const apiBase = (env.SITE_URL || 'https://www.lequ.pw') + '/api'
  const html = `<div class="auth"><div class="auth-box"><h1>登录</h1><p class="sub">登录你的 ShouYinPOS 账号</p><form onsubmit="return doLogin(event)"><div class="fg"><label>邮箱 / 手机号</label><input id="la" placeholder="请输入邮箱或手机号" required></div><div class="fg"><label>密码</label><input type="password" id="lp" placeholder="请输入密码" required></div><div class="err" id="le"></div><button type="submit" class="btn btn-primary btn-full" id="lb">登录</button></form><div class="auth-foot"><a href="/forgot">忘记密码？</a><span>还没有账号？<a href="/register">立即注册</a></span></div></div></div>`
  return shell({ title: '登录', desc: '登录 ShouYinPOS 账号', html, path: '/login', extra: `<script>var A='${apiBase}';function doLogin(e){e.preventDefault();var b=document.getElementById('lb'),er=document.getElementById('le'),a=document.getElementById('la').value,p=document.getElementById('lp').value;if(!a||!p){er.textContent='请输入账号和密码';return false}b.disabled=true;b.textContent='登录中...';er.textContent='';fetch(A+'/user/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({account:a,password:p})}).then(function(r){return r.json()}).then(function(d){if(d.code){er.textContent=d.message;b.disabled=false;b.textContent='登录';return}localStorage.setItem('token',d.data.token);localStorage.setItem('user',JSON.stringify(d.data.user));window.location.href='/dashboard'}).catch(function(){er.textContent='网络错误，请重试';b.disabled=false;b.textContent='登录'});return false}</script>` })
}

export function registerPage(env) {
  const apiBase = (env.SITE_URL || 'https://www.lequ.pw') + '/api'
  const html = `<div class="auth"><div class="auth-box"><h1>注册</h1><p class="sub">创建你的 ShouYinPOS 账号</p><form onsubmit="return doReg(event)"><div class="fg"><label>邮箱</label><input type="email" id="re" placeholder="请输入邮箱" required></div><div class="fg"><label>密码</label><input type="password" id="rp" placeholder="至少 6 位" required minlength="6"></div><div class="fg"><label>昵称</label><input id="rn" placeholder="选填"></div><div class="fg"><label>公司名称</label><input id="rc" placeholder="选填"></div><div class="err" id="rr"></div><button type="submit" class="btn btn-primary btn-full" id="rb">注册</button></form><div class="auth-foot"><span>已有账号？<a href="/login">立即登录</a></span></div></div></div>`
  return shell({ title: '注册', desc: '注册 ShouYinPOS 账号', html, path: '/register', extra: `<script>var A='${apiBase}';function doReg(e){e.preventDefault();var b=document.getElementById('rb'),er=document.getElementById('rr'),em=document.getElementById('re').value,pw=document.getElementById('rp').value,ni=document.getElementById('rn').value,co=document.getElementById('rc').value;if(!em||!pw){er.textContent='请输入邮箱和密码';return false}b.disabled=true;b.textContent='注册中...';er.textContent='';fetch(A+'/user/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:em,password:pw,nickname:ni,company:co})}).then(function(r){return r.json()}).then(function(d){if(d.code){er.textContent=d.message;b.disabled=false;b.textContent='注册';return}localStorage.setItem('token',d.data.token);localStorage.setItem('user',JSON.stringify(d.data.user));window.location.href='/dashboard'}).catch(function(){er.textContent='网络错误，请重试';b.disabled=false;b.textContent='注册'});return false}</script>` })
}

export function dashboardPage(env) {
  const apiBase = (env.SITE_URL || 'https://www.lequ.pw') + '/api'
  const html = `<div class="user"><div class="user-wrap">${userSide('/dashboard')}<div class="user-main"><div class="user-head"><div><h1>控制台</h1><p class="sub">欢迎回来，<span id="un">用户</span></p></div><a href="/profile" class="btn btn-outline" style="font-size:13px;padding:6px 14px">设置</a></div><div class="user-stats"><div class="user-stat"><div class="icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="val" id="s1">0</div><div class="lbl">授权数量</div></div><div class="user-stat"><div class="icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div><div class="val" id="s2">0</div><div class="lbl">激活实例</div></div><div class="user-stat"><div class="icon amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></div><div class="val" id="s3">0</div><div class="lbl">待支付</div></div><div class="user-stat"><div class="icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div class="val" id="s4">0</div><div class="lbl">总消费</div></div></div><div class="quick-actions"><a href="/pricing" class="quick-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>购买授权</span></a><a href="/licenses" class="quick-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>我的授权</span></a><a href="/orders" class="quick-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><span>我的订单</span></a></div><div class="sec"><div class="sec-head"><h2>最近授权</h2><a href="/licenses">查看全部</a></div><div id="ll" class="list"><div class="empty">加载中...</div></div></div><div class="sec"><div class="sec-head"><h2>最近订单</h2><a href="/orders">查看全部</a></div><div id="ol" class="list"><div class="empty">加载中...</div></div></div></div></div></div>`
  return shell({ title: '控制台', desc: 'ShouYinPOS 用户控制台', html, path: '/dashboard', extra: dashboardJS(apiBase) })
}

export function licensesPage(env) {
  const apiBase = (env.SITE_URL || 'https://www.lequ.pw') + '/api'
  const html = `<div class="user"><div class="user-wrap">${userSide('/licenses')}<div class="user-main"><div class="user-head"><div><h1>我的授权</h1><p class="sub">管理你的授权码和激活实例</p></div><a href="/pricing" class="btn btn-primary" style="font-size:13px;padding:6px 14px">购买新授权</a></div><div id="lg" class="license-grid"><div class="empty">加载中...</div></div></div></div></div>`
  return shell({ title: '我的授权', desc: '查看授权列表', html, path: '/licenses', extra: licensesJS(apiBase) })
}

export function ordersPage(env) {
  const apiBase = (env.SITE_URL || 'https://www.lequ.pw') + '/api'
  const html = `<div class="user"><div class="user-wrap">${userSide('/orders')}<div class="user-main"><div class="user-head"><div><h1>我的订单</h1><p class="sub">查看所有订单记录</p></div></div><div class="tabs" id="ot"><button class="on" data-s="">全部</button><button data-s="pending">待支付</button><button data-s="paid">已支付</button><button data-s="cancelled">已取消</button></div><div id="ol" class="list"><div class="empty">加载中...</div></div></div></div></div>`
  return shell({ title: '我的订单', desc: '查看订单列表', html, path: '/orders', extra: ordersJS(apiBase) })
}

export function profilePage(env) {
  const apiBase = (env.SITE_URL || 'https://www.lequ.pw') + '/api'
  const html = `<div class="user"><div class="user-wrap">${userSide('/profile')}<div class="user-main"><div class="user-head"><div><h1>个人设置</h1><p class="sub">管理你的账户信息</p></div></div><div style="max-width:480px"><div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:28px"><form onsubmit="return saveProfile(event)"><div class="fg"><label>邮箱</label><input id="pe" disabled style="background:var(--bg-alt);color:var(--text-3)"><span class="hint">邮箱不可修改</span></div><div class="fg"><label>昵称</label><input id="pn" placeholder="请输入昵称"></div><div class="fg"><label>公司名称</label><input id="pc" placeholder="请输入公司名称"></div><div class="fg"><label>手机号</label><input id="pp" placeholder="请输入手机号"></div><div class="err" id="pr"></div><div id="ps" style="color:var(--accent-emerald);font-size:13px;margin-bottom:10px"></div><button type="submit" class="btn btn-primary btn-full">保存修改</button></form></div></div></div></div></div>`
  return shell({ title: '个人设置', desc: '修改个人信息', html, path: '/profile', extra: profileJS(apiBase) })
}

function userSide(current) {
  const items = [
    {href:'/dashboard',label:'控制台',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>'},
    {href:'/licenses',label:'我的授权',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'},
    {href:'/orders',label:'我的订单',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>'}
  ]
  const bottom = [{href:'/profile',label:'个人设置',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'}]
  return `<div class="user-side"><h3>导航</h3>${items.map(i=>`<a href="${i.href}" class="${current===i.href?'on':''}">${i.icon}${i.label}</a>`).join('')}<div class="div"></div><h3>账户</h3>${bottom.map(i=>`<a href="${i.href}" class="${current===i.href?'on':''}">${i.icon}${i.label}</a>`).join('')}</div>`
}

function dashboardJS(apiBase){return `<script>var A='${apiBase}';(function(){var t=localStorage.getItem('token');if(!t){location.href='/login';return}var u=JSON.parse(localStorage.getItem('user')||'{}');document.getElementById('un').textContent=u.nickname||u.email||'用户';fetch(A+'/my/licenses',{headers:{Authorization:'Bearer '+t}}).then(function(r){return r.json()}).then(function(d){var l=d.data||[];document.getElementById('s1').textContent=l.length;document.getElementById('s2').textContent=l.reduce(function(s,i){return s+(i.active_instances||0)},0);var el=document.getElementById('ll');if(!l.length){el.innerHTML='<div class="empty">暂无授权 <a href="/pricing">购买授权</a></div>';return}el.innerHTML=l.slice(0,3).map(function(i){return '<div class="item" onclick="location.href=\\'/licenses/'+i.id+'\\'"><div><div class="item-t">'+i.license_key+'</div><div class="item-m">'+{basic:'基础版',pro:'专业版',enterprise:'企业版'}[i.product_edition]+' · '+i.max_stores+' 门店</div></div><div class="item-r"><span class="badge '+(i.status==='active'?'badge-ok':'badge-no')+'">'+(i.status==='active'?'有效':'过期')+'</span></div></div>'}).join('')});fetch(A+'/orders?pageSize=3',{headers:{Authorization:'Bearer '+t}}).then(function(r){return r.json()}).then(function(d){var l=(d.data&&d.data.list)||[];var total=l.reduce(function(s,o){return s+(o.status==='paid'?o.amount:0)},0);document.getElementById('s4').textContent='\\u00a5'+(total/100).toFixed(0);document.getElementById('s3').textContent=l.filter(function(o){return o.status==='pending'}).length;var el=document.getElementById('ol');if(!l.length){el.innerHTML='<div class="empty">暂无订单</div>';return}el.innerHTML=l.map(function(o){return '<div class="item" onclick="location.href=\\'/orders/'+o.order_no+'\\'"><div><div class="item-t">'+o.order_no+'</div><div class="item-m">'+o.plan_name+' · '+new Date(o.created_at).toLocaleDateString()+'</div></div><div class="item-r"><div style="font-weight:600;font-size:14px;margin-bottom:2px">\\u00a5'+(o.amount/100).toFixed(2)+'</div><span class="badge '+(o.status==='paid'?'badge-ok':o.status==='pending'?'badge-wait':'badge-no')+'">'+({pending:'待支付',paid:'已支付',cancelled:'已取消'})[o.status]+'</span></div></div>'}).join('')})})();</script>`}

function licensesJS(apiBase){return `<script>var A='${apiBase}';(function(){var t=localStorage.getItem('token');if(!t){location.href='/login';return}fetch(A+'/my/licenses',{headers:{Authorization:'Bearer '+t}}).then(function(r){return r.json()}).then(function(d){var l=d.data||[],g=document.getElementById('lg'),m={basic:'基础版',pro:'专业版',enterprise:'企业版'};if(!l.length){g.innerHTML='<div class="empty">暂无授权 <a href="/pricing">购买授权</a></div>';return}g.innerHTML=l.map(function(i){return '<div class="lic" onclick="location.href=\\'/licenses/'+i.id+'\\'"><div class="lic-top"><span class="lic-name">'+(m[i.product_edition]||i.product_edition)+'</span><span class="badge '+(i.status==='active'?'badge-ok':'badge-no')+'">'+(i.status==='active'?'有效':'过期')+'</span></div><div class="lic-key">'+i.license_key+'</div><div class="lic-foot"><span>'+(i.active_instances||0)+'/'+i.max_stores+' 门店</span><span>到期 '+new Date(i.valid_until).toLocaleDateString()+'</span></div></div>'}).join('')})})();</script>`}

function ordersJS(apiBase){return `<script>var A='${apiBase}',cs='';function load(){var t=localStorage.getItem('token');if(!t){location.href='/login';return}fetch(A+'/orders'+(cs?'?status='+cs:''),{headers:{Authorization:'Bearer '+t}}).then(function(r){return r.json()}).then(function(d){var l=(d.data&&d.data.list)||[],el=document.getElementById('ol');if(!l.length){el.innerHTML='<div class="empty">暂无订单</div>';return}el.innerHTML=l.map(function(o){return '<div class="item" onclick="location.href=\\'/orders/'+o.order_no+'\\'"><div><div class="item-t">'+o.order_no+'</div><div class="item-m">'+o.plan_name+' · '+new Date(o.created_at).toLocaleDateString()+'</div></div><div class="item-r"><div style="font-weight:600;font-size:14px;margin-bottom:2px">\\u00a5'+(o.amount/100).toFixed(2)+'</div><span class="badge '+(o.status==='paid'?'badge-ok':o.status==='pending'?'badge-wait':'badge-no')+'">'+({pending:'待支付',paid:'已支付',cancelled:'已取消'})[o.status]+'</span></div></div>'}).join('')})}document.getElementById('ot').onclick=function(e){if(e.target.tagName!=='BUTTON')return;document.querySelectorAll('#ot button').forEach(function(b){b.classList.remove('on')});e.target.classList.add('on');cs=e.target.dataset.s;load()};load();</script>`}

function profileJS(apiBase){return `<script>var A='${apiBase}';(function(){var t=localStorage.getItem('token');if(!t){location.href='/login';return}var u=JSON.parse(localStorage.getItem('user')||'{}');document.getElementById('pe').value=u.email||'';document.getElementById('pn').value=u.nickname||'';document.getElementById('pc').value=u.company||'';document.getElementById('pp').value=u.phone||''})();function saveProfile(e){e.preventDefault();var t=localStorage.getItem('token'),er=document.getElementById('pr'),ok=document.getElementById('ps');er.textContent='';ok.textContent='';var d={nickname:document.getElementById('pn').value,company:document.getElementById('pc').value,phone:document.getElementById('pp').value};fetch(A+'/user/me',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:'Bearer '+t},body:JSON.stringify(d)}).then(function(r){return r.json()}).then(function(d){if(d.code){er.textContent=d.message;return}ok.textContent='修改成功';fetch(A+'/user/me',{headers:{Authorization:'Bearer '+t}}).then(function(r){return r.json()}).then(function(d){if(d.data)localStorage.setItem('user',JSON.stringify(d.data))})});return false}</script>`}
