/* 阅读进度、章节高亮、回到顶部 —— 无依赖 */
(function () {
  'use strict';

  var progress = document.getElementById('progress');
  var totop = document.getElementById('totop');
  var links = Array.prototype.slice.call(document.querySelectorAll('.navlinks a'));
  var sections = links
    .map(function (a) {
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      return el ? { link: a, el: el } : null;
    })
    .filter(Boolean);

  /* 显示真实地址，避免与部署地址不一致 */
  var urlEl = document.getElementById('pageurl');
  if (urlEl && location.protocol.indexOf('http') === 0) {
    urlEl.textContent = location.origin + location.pathname;
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var y = window.pageYOffset || doc.scrollTop;
      var pct = max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0;
      if (progress) progress.style.width = pct + '%';

      if (totop) {
        if (y > window.innerHeight * 1.2) totop.classList.add('on');
        else totop.classList.remove('on');
      }

      /* 当前章节：最后一个已经滚过一屏 1/3 的 section */
      var current = null;
      for (var i = 0; i < sections.length; i++) {
        var top = sections[i].el.getBoundingClientRect().top;
        if (top - 90 <= 0) current = sections[i];
      }
      for (var j = 0; j < sections.length; j++) {
        sections[j].link.classList.toggle('active', current === sections[j]);
      }
      if (current) {
        /* 让高亮项在可横向滚动的导航里可见 */
        var nav = current.link.parentNode;
        if (nav && nav.scrollWidth > nav.clientWidth) {
          var r = current.link.getBoundingClientRect();
          var nr = nav.getBoundingClientRect();
          if (r.left < nr.left || r.right > nr.right) {
            nav.scrollLeft += r.left - nr.left - 24;
          }
        }
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  if (totop) {
    totop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* 外部链接在新窗口打开 */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="http"]'), function (a) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
})();
