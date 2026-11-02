/* Neeranjan JK — portfolio. Progressive enhancement only: the page works without this file. */
(function () {
  'use strict';

  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function storedTheme() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }
  function storeTheme(value) {
    try { localStorage.setItem('theme', value); } catch (e) { /* private mode: keep it for this visit only */ }
  }
  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set === 'light' || set === 'dark') return set;
    return media && media.matches ? 'dark' : 'light';
  }

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.querySelector('.theme-toggle');
  function syncThemeButton() {
    if (!themeBtn) return;
    var dark = currentTheme() === 'dark';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    var meta = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < meta.length; i++) {
      if (root.hasAttribute('data-theme')) meta[i].setAttribute('content', dark ? '#0c1410' : '#faf8f2');
    }
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      storeTheme(next);
      syncThemeButton();
    });
    if (media && media.addEventListener) {
      media.addEventListener('change', function () {
        if (!storedTheme()) syncThemeButton();
      });
    }
    syncThemeButton();
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-toggle');
  var navList = document.getElementById('nav-list');
  function closeMenu() {
    if (!menuBtn || !navList) return;
    navList.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }
  if (menuBtn && navList) {
    menuBtn.addEventListener('click', function () {
      var open = navList.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    navList.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navList.classList.contains('is-open')) {
        closeMenu();
        menuBtn.focus();
      }
    });
  }

  /* ---------- Header border after scrolling ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll + active nav link ---------- */
  if ('IntersectionObserver' in window) {
    var revealEls = document.querySelectorAll('[data-reveal]');
    if (reducedMotion) {
      for (var r = 0; r < revealEls.length; r++) revealEls[r].classList.add('is-in');
    } else {
      var revealer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revealer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      for (var k = 0; k < revealEls.length; k++) revealer.observe(revealEls[k]);
    }

    var links = {};
    var navLinks = document.querySelectorAll('.nav-list a[href^="#"]');
    for (var n = 0; n < navLinks.length; n++) links[navLinks[n].getAttribute('href').slice(1)] = navLinks[n];
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = links[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          for (var id in links) links[id].removeAttribute('aria-current');
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  } else {
    var all = document.querySelectorAll('[data-reveal]');
    for (var a = 0; a < all.length; a++) all[a].classList.add('is-in');
  }

  /* ---------- Career chart tooltips (hover + keyboard focus) ---------- */
  var chart = document.querySelector('.career-chart');
  if (chart) {
    var tip = chart.querySelector('.chart-tip');
    var bars = chart.querySelectorAll('.bar');

    for (var b = 0; b < bars.length; b++) {
      bars[b].setAttribute('aria-label', bars[b].getAttribute('data-tip') + ', ' + bars[b].getAttribute('data-dates'));
    }

    function showTip(bar) {
      if (!tip) return;
      tip.innerHTML = '';
      var title = document.createElement('b');
      title.textContent = bar.getAttribute('data-tip');
      var dates = document.createElement('span');
      dates.textContent = bar.getAttribute('data-dates');
      tip.appendChild(title);
      tip.appendChild(dates);

      var box = chart.getBoundingClientRect();
      var rect = bar.getBoundingClientRect();
      tip.classList.add('is-visible');
      var tipW = tip.offsetWidth;
      var tipH = tip.offsetHeight;
      var left = rect.left - box.left + rect.width / 2 - tipW / 2;
      left = Math.max(8, Math.min(left, box.width - tipW - 8));
      var top = rect.top - box.top - tipH - 10;
      if (top < 4) top = rect.bottom - box.top + 10;
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
    }
    function hideTip() {
      if (tip) tip.classList.remove('is-visible');
    }

    chart.addEventListener('mouseover', function (e) {
      var bar = e.target.closest('.bar');
      if (bar) showTip(bar);
    });
    chart.addEventListener('mouseout', function (e) {
      var bar = e.target.closest('.bar');
      if (bar && !bar.contains(e.relatedTarget)) hideTip();
    });
    chart.addEventListener('focusin', function (e) {
      var bar = e.target.closest('.bar');
      if (bar) showTip(bar);
    });
    chart.addEventListener('focusout', hideTip);
    var scroller = chart.querySelector('.chart-scroll');
    if (scroller) {
      // Focusing an off-screen bar scrolls the chart: keep that bar's tip, drop a hover tip.
      scroller.addEventListener('scroll', function () {
        var active = document.activeElement;
        if (active && active.classList && active.classList.contains('bar') && chart.contains(active)) showTip(active);
        else hideTip();
      }, { passive: true });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hideTip();
    });
  }
})();
