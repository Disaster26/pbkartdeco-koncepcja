(function () {
  'use strict';
  var R = [
    ['r01', 'Willa Roberta Nestlera', 'Renowacja elewacji, detalu sztukatorskiego i stolarki'],
    ['r02', 'Pałac Sobańskich w Guzowie', 'Odtworzenie zwieńczenia wieży, pokrycia dachu i lukarn'],
    ['r03', 'Kraków, ul. św. Jana 24', 'Renowacja bramy wejściowej, elewacji, stolarki i polichromii'],
    ['r04', 'Politechnika Gdańska', 'Renowacja okien i drzwi'],
    ['r05', 'Łódź, ul. Piotrkowska 153', 'Balkon z piaskowca, cegła i elementy metalowe, laserunek elewacji'],
    ['r06', 'Pałac Arnolda Stillera', 'Renowacja elewacji i attyki'],
    ['r07', 'ul. Narutowicza 4', 'Renowacja elewacji'],
    ['r08', 'Łódź, ul. Piotrkowska 147', 'Pokrycie dachu, elewacja, sztukateria'],
    ['r09', 'ul. Wysoka 8', 'Renowacja elewacji'],
    ['r10', 'ul. Jaracza 1', 'Renowacja elewacji'],
    ['r11', 'Warszawa, ul. Willowa 8/10', 'Renowacja elewacji'],
    ['r12', 'ul. Piramowicza 6', 'Elewacja, stolarka okienna, balustrada balkonowa'],
    ['r13', 'Łódź, ul. Piotrkowska 143', 'Renowacja stolarki okiennej']
  ];
  var pas = document.getElementById('pas');
  var avail = window.PBK_IMG || R.map(function (r) { return r[0]; });
  var lista = R.filter(function (r) { return avail.indexOf(r[0]) > -1; });

  // karty realizacji
  var html = '';
  lista.forEach(function (r, i) {
    html += '<li><button type="button" class="karta" data-i="' + i + '"><div class="fot"><img data-src="img/' + r[0] + '-600.webp" data-srcset="img/' + r[0] + '-600.webp 600w, img/' + r[0] + '-900.webp 900w" sizes="(max-width:760px) 84vw, (max-width:1279px) 40vw, (max-width:1699px) 30vw, 22vw" width="600" height="450" alt="' + r[1] + ' - ' + r[2].toLowerCase() + '"></div><b>' + r[1] + '</b><span>' + r[2] + '</span></button></li>';
  });
  pas.innerHTML = html;

  var imgs = pas.querySelectorAll('img[data-src]');
  function laduj(img) {
    if (!img.dataset.src) return;
    img.srcset = img.dataset.srcset; img.src = img.dataset.src;
    delete img.dataset.src;
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { laduj(e.target); io.unobserve(e.target); } });
    }, { root: pas, rootMargin: '0px 60% 0px 0px' });
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { imgs.forEach(function (im) { io.observe(im); }); io2.disconnect(); } });
    }, { rootMargin: '400px 0px' });
    io2.observe(pas);
  } else { imgs.forEach(laduj); }

  // strzałki + przeciąganie myszą
  var prev = document.querySelector('.ster .prev'), next = document.querySelector('.ster .next');
  function krok() { var li = pas.querySelector('li'); return li ? li.getBoundingClientRect().width + parseFloat(getComputedStyle(pas).columnGap || 0) : 300; }
  function stan() {
    prev.disabled = pas.scrollLeft < 4;
    next.disabled = pas.scrollLeft + pas.clientWidth > pas.scrollWidth - 4;
  }
  prev.addEventListener('click', function () { pas.scrollBy({ left: -krok(), behavior: 'smooth' }); });
  next.addEventListener('click', function () { pas.scrollBy({ left: krok(), behavior: 'smooth' }); });
  pas.addEventListener('scroll', stan, { passive: true });
  window.addEventListener('resize', stan);
  requestAnimationFrame(function () { setTimeout(stan, 0); });
  var dx = 0, sx = 0, sl = 0, ciag = false, przes = false;
  pas.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    ciag = true; przes = false; sx = e.clientX; sl = pas.scrollLeft;
  });
  window.addEventListener('pointermove', function (e) {
    if (!ciag) return;
    dx = e.clientX - sx;
    if (Math.abs(dx) > 6) { przes = true; pas.classList.add('drag'); }
    if (przes) pas.scrollLeft = sl - dx;
  });
  window.addEventListener('pointerup', function () {
    if (!ciag) return;
    ciag = false;
    if (przes) {
      pas.classList.remove('drag');
      var k = krok(); pas.scrollTo({ left: Math.round(pas.scrollLeft / k) * k, behavior: 'smooth' });
    }
  });

  // lightbox
  var lb = document.getElementById('lb'), lbImg = document.getElementById('lb-img'), lbOp = document.getElementById('lb-op'), cur = 0, ost = null;
  function pokaz(i) {
    cur = (i + lista.length) % lista.length;
    var r = lista[cur];
    lbImg.src = 'img/' + r[0] + '-900.webp';
    lbImg.alt = r[1] + ' - ' + r[2].toLowerCase();
    lbOp.textContent = r[1] + ' - ' + r[2];
    var big = new Image(); big.onload = function () { if (lista[cur] === r) lbImg.src = big.src; };
    setTimeout(function () { big.src = 'img/' + r[0] + '-1600.webp'; }, 180);
  }
  pas.addEventListener('click', function (e) {
    if (przes) { e.preventDefault(); przes = false; return; }
    var b = e.target.closest('.karta'); if (!b) return;
    ost = b; pokaz(+b.dataset.i); lb.classList.add('on'); document.body.style.overflow = 'hidden'; lb.querySelector('.x').focus();
  });
  function zamknij() { lb.classList.remove('on'); document.body.style.overflow = ''; lbImg.removeAttribute('src'); if (ost) ost.focus(); }
  lb.querySelector('.x').addEventListener('click', zamknij);
  lb.querySelector('.pv').addEventListener('click', function () { pokaz(cur - 1); });
  lb.querySelector('.nx').addEventListener('click', function () { pokaz(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) zamknij(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') zamknij();
    if (e.key === 'ArrowLeft') pokaz(cur - 1);
    if (e.key === 'ArrowRight') pokaz(cur + 1);
  });
  var tx = 0;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { var d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) pokaz(cur + (d < 0 ? 1 : -1)); });

  // menu mobilne
  var bg = document.getElementById('burger'), nav = document.getElementById('nav');
  function menu(o) {
    nav.classList.toggle('otw', o); bg.setAttribute('aria-expanded', o ? 'true' : 'false');
    bg.setAttribute('aria-label', o ? 'Zamknij menu' : 'Otwórz menu');
    document.body.style.overflow = o ? 'hidden' : '';
  }
  bg.addEventListener('click', function () { menu(!nav.classList.contains('otw')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) menu(false); });

  // dolny pasek po przewinięciu za przycisk hero
  var mob = document.getElementById('mob'), hb = document.querySelector('.hero .btn');
  if ('IntersectionObserver' in window && hb) {
    new IntersectionObserver(function (es) {
      var e = es[0]; mob.classList.toggle('widac', !e.isIntersecting && e.boundingClientRect.top < 0);
    }).observe(hb);
  }

  // mapa przy przewinięciu
  var mapa = document.getElementById('mapa');
  if ('IntersectionObserver' in window) {
    var mo = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) {
        var f = document.createElement('iframe');
        f.src = mapa.dataset.src; f.title = 'Mapa: ul. Chałubińskiego 33, Łódź'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
        mapa.appendChild(f); mo.disconnect();
      }
    }, { rootMargin: '300px 0px' });
    mo.observe(mapa);
  }

  // formularz pokazowy
  document.getElementById('form').addEventListener('submit', function (e) {
    e.preventDefault(); document.getElementById('ok').hidden = false;
  });

  document.getElementById('rok').textContent = new Date().getFullYear();
})();
