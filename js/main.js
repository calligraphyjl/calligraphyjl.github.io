/* ==========================================================================
   蜀地拾遗 · v2 交互脚本（原生 JS，无依赖）
   1) 主题切换（深蓝 / 米白，localStorage 记忆）
   2) 手机抽屉菜单、导航滚动状态
   3) 滚动淡入、导航高亮
   4) 项目代码 / README 切换
   5) 诗词展开、小说弹窗、相册灯箱
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  // 标记 JS 可用：滚动淡入只在此时启用，避免无 JS 时内容不可见
  root.classList.add('js');

  /* ------------------------------------------------------------------
     0. 进入页面的欢迎弹窗（点击任意处进入）
     ------------------------------------------------------------------ */
  var entryMask = $('#entryMask');

  function closeEntry() {
    if (!entryMask || entryMask.hidden) return;
    entryMask.hidden = true;
    document.body.classList.remove('no-scroll');
  }

  if (entryMask) {
    document.body.classList.add('no-scroll');  // 进入前锁住背景
    entryMask.addEventListener('click', closeEntry);
  }

  /* ------------------------------------------------------------------
     1. 主题切换
     ------------------------------------------------------------------ */
  var themeBtn = $('#themeBtn');
  var THEME_KEY = 'shudi-theme';

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* 隐私模式下忽略 */ }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', theme === 'navy' ? '#0a192f' : '#faf8f3');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'navy' ? 'paper' : 'navy');
    });
  }

  /* ------------------------------------------------------------------
     2. 手机抽屉菜单
     ------------------------------------------------------------------ */
  var menuBtn = $('#menuBtn');
  var mobileMenu = $('#mobileMenu');

  function setMenu(open) {
    if (!menuBtn || !mobileMenu) return;
    mobileMenu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    document.body.classList.toggle('no-scroll', open);
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
  }

  if (mobileMenu) {
    // 点击菜单里的链接后自动收起
    $$('a', mobileMenu).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }

  /* 导航滚动时的分隔线 / 阴影 */
  var nav = $('#siteNav');
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     3. 滚动淡入 + 导航高亮
     ------------------------------------------------------------------ */
  var revealItems = $$('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // 老浏览器直接显示
    revealItems.forEach(function (el) { el.classList.add('is-in'); });
  }

  // 导航高亮：进入视口中部的板块对应链接加 is-active
  var navLinks = $$('.nav-links a[data-nav]');
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.dataset.nav); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.dataset.nav === entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ------------------------------------------------------------------
     4. 项目：代码 / README 切换
     ------------------------------------------------------------------ */
  $$('.code-tabs .tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var tabs = tab.parentElement;
      $$('.tab', tabs).forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });

      var card = tab.closest('.project-card') || document;
      $$('.tab-panel', card).forEach(function (panel) {
        panel.classList.toggle('is-active', panel.dataset.panel === tab.dataset.tab);
      });
    });
  });

  /* ------------------------------------------------------------------
     4.1 词作配图轮播（多图淡入淡出，鼠标悬停暂停）
     ------------------------------------------------------------------ */
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $$('[data-slideshow]').forEach(function (wrap) {
    var imgs = $$('.poem-cover', wrap);
    if (imgs.length < 2 || reduceMotion) return;

    var index = 0;
    var paused = false;

    // 提前加载，避免切换瞬间空白
    imgs.forEach(function (img) { img.loading = 'eager'; });

    window.setInterval(function () {
      if (paused || document.hidden) return;
      imgs[index].classList.remove('is-active');
      index = (index + 1) % imgs.length;
      imgs[index].classList.add('is-active');
    }, 4600);

    wrap.addEventListener('mouseenter', function () { paused = true; });
    wrap.addEventListener('mouseleave', function () { paused = false; });
  });

  /* ------------------------------------------------------------------
     5.1 诗词展开 / 收起
     ------------------------------------------------------------------ */
  function expand(el) {
    el.style.maxHeight = el.scrollHeight + 'px';
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');

    var onEnd = function (e) {
      if (e.propertyName !== 'max-height') return;
      el.style.maxHeight = 'none';
      el.removeEventListener('transitionend', onEnd);
    };
    el.addEventListener('transitionend', onEnd);
  }

  function collapse(el) {
    el.style.maxHeight = el.scrollHeight + 'px';
    void el.offsetHeight;
    window.requestAnimationFrame(function () { el.style.maxHeight = '0px'; });
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
  }

  $$('.poem-card').forEach(function (card) {
    var btn = $('.btn-more', card);
    var full = $('.poem-full', card);
    if (!btn || !full) return;

    btn.addEventListener('click', function () {
      var willOpen = !card.classList.contains('is-open');
      card.classList.toggle('is-open', willOpen);
      if (willOpen) { expand(full); } else { collapse(full); }
      btn.setAttribute('aria-expanded', String(willOpen));
      btn.textContent = willOpen ? '收起' : '点击查看更多';
    });
  });

  /* ------------------------------------------------------------------
     5.2 小说阅读弹窗
     ------------------------------------------------------------------ */
  var novelMask  = $('#novelModal');
  var novelTitle = $('#novelModalTitle');
  var novelBody  = $('#novelContent');
  var novelClose = $('#novelCloseBtn');
  var lastFocused = null;

  function openNovel(title, templateId) {
    var tpl = document.getElementById(templateId);
    if (!tpl || !novelMask) return;

    novelTitle.textContent = title;
    novelBody.innerHTML = tpl.innerHTML;
    novelBody.scrollTop = 0;

    lastFocused = document.activeElement;
    novelMask.hidden = false;
    document.body.classList.add('no-scroll');
    novelClose.focus();
  }

  function closeNovel() {
    if (!novelMask || novelMask.hidden) return;
    novelMask.hidden = true;
    document.body.classList.remove('no-scroll');
    novelBody.innerHTML = '';
    if (lastFocused) lastFocused.focus();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.btn-novel') : null;
    if (!btn) return;
    openNovel(btn.dataset.novelTitle || '阅读', btn.dataset.novelTarget);
  });

  if (novelClose) novelClose.addEventListener('click', closeNovel);

  if (novelMask) {
    novelMask.addEventListener('click', function (e) {
      if (e.target === novelMask) closeNovel();
    });
  }

  /* ------------------------------------------------------------------
     5.3 相册灯箱
     ------------------------------------------------------------------ */
  var lightbox    = $('#lightbox');
  var lightboxImg = $('#lightboxImg');
  var lightboxBtn = $('#lightboxCloseBtn');
  var lastFocusedImg = null;

  function openLightbox(src, alt) {
    if (!lightbox) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lastFocusedImg = document.activeElement;
    lightbox.hidden = false;
    document.body.classList.add('no-scroll');
    lightboxBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove('no-scroll');
    lightboxImg.src = '';
    if (lastFocusedImg) lastFocusedImg.focus();
  }

  $$('.gallery-item, .callig-item, .callig-wide').forEach(function (item) {
    var img = $('img', item);
    if (!img) return;

    item.addEventListener('click', function () {
      openLightbox(img.getAttribute('src'), img.getAttribute('alt'));
    });

    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(img.getAttribute('src'), img.getAttribute('alt'));
      }
    });
  });

  if (lightboxBtn) lightboxBtn.addEventListener('click', closeLightbox);

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  /* ------------------------------------------------------------------
     6. 键盘：Esc 关闭弹层
     ------------------------------------------------------------------ */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeEntry();
    closeNovel();
    closeLightbox();
    setMenu(false);
  });
})();
