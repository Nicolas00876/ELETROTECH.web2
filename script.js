/**
 * Eletrotech Marechal + OxiLife Fish — Script
 * Handles: service tabs, mobile navigation
 * Refactored: IIFE for scope isolation, modern array methods
 */
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    /* ---- Service Tabs ---- */
    const tabContainer = document.querySelector('.svc-tabs');
    if (tabContainer) {
      tabContainer.addEventListener('click', (e) => {
        const tab = e.target.closest('.svc-tab');
        if (!tab) return;

        const targetPanel = tab.dataset.tab;

        // Modern Array iteration
        Array.from(document.querySelectorAll('.svc-tab')).forEach(t => t.classList.remove('active'));
        Array.from(document.querySelectorAll('.svc-panel')).forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const panel = document.querySelector(`.svc-panel[data-panel="${targetPanel}"]`);
        if (panel) {
          panel.classList.add('active');
          
          const reveals = Array.from(panel.querySelectorAll('.reveal'));
          reveals.forEach(el => el.classList.remove('is-visible'));
          
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              reveals.forEach(el => el.classList.add('is-visible'));
            });
          });
        }
      });
    }

    /* ---- Mobile Navigation ---- */
    const nav = document.querySelector('.nav');
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');

    if (burger && navLinks) {
      const toggleMenu = (open) => {
        const shouldOpen = typeof open === 'boolean' ? open : !navLinks.classList.contains('is-open');
        burger.classList.toggle('is-open', shouldOpen);
        navLinks.classList.toggle('is-open', shouldOpen);
        if (nav) nav.classList.toggle('is-open', shouldOpen);
        document.body.style.overflow = shouldOpen ? 'hidden' : '';
      };

      burger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
      });

      navLinks.addEventListener('click', (e) => {
        if (e.target.closest('a')) toggleMenu(false);
      });

      document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('is-open') && !navLinks.contains(e.target) && !burger.contains(e.target)) {
          toggleMenu(false);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
          toggleMenu(false);
        }
      });
    }

    /* ---- Scroll Reveal (Intersection Observer) ---- */
    const revealOptions = {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, revealOptions);

    Array.from(document.querySelectorAll('.reveal')).forEach(el => {
      revealObserver.observe(el);
    });

    /* ---- Gallery Carousel ---- */
    const carousel = document.querySelector('.gal-carousel');
    if (carousel) {
      const items = Array.from(carousel.querySelectorAll('.gal-item'));
      const prevBtn = document.querySelector('.gal-prev');
      const nextBtn = document.querySelector('.gal-next');
      const dotsContainer = document.querySelector('.gal-dots');
      let isDown = false;
      let startX;
      let scrollLeft;

      // Cria os dots
      items.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('gal-dot');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        
        dot.addEventListener('click', () => {
          const scrollPos = items[i].offsetLeft - carousel.offsetLeft - (carousel.clientWidth / 2) + (items[i].clientWidth / 2);
          carousel.scrollTo({ left: scrollPos, behavior: 'smooth' });
        });
        
        dotsContainer.appendChild(dot);
      });

      const dots = Array.from(dotsContainer.querySelectorAll('.gal-dot'));

      const updateUI = () => {
        const scrollW = carousel.scrollWidth - carousel.clientWidth;
        const currentScroll = carousel.scrollLeft;
        
        // Atualiza botões
        if (prevBtn) prevBtn.disabled = currentScroll <= 10;
        if (nextBtn) nextBtn.disabled = currentScroll >= scrollW - 10;

        // Atualiza dots baseado na intersecção ou posição central
        const center = currentScroll + (carousel.clientWidth / 2);
        let activeIndex = 0;
        let minDiff = Infinity;

        items.forEach((item, i) => {
          const itemCenter = (item.offsetLeft - carousel.offsetLeft) + (item.clientWidth / 2);
          const diff = Math.abs(center - itemCenter);
          if (diff < minDiff) {
            minDiff = diff;
            activeIndex = i;
          }
        });

        dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
      };

      carousel.addEventListener('scroll', () => {
        requestAnimationFrame(updateUI);
      });

      // Setas
      const scrollByItem = (direction) => {
        const itemWidth = items[0].clientWidth + parseInt(window.getComputedStyle(carousel).gap || 0);
        carousel.scrollBy({ left: direction * itemWidth, behavior: 'smooth' });
      };

      if (prevBtn) prevBtn.addEventListener('click', () => scrollByItem(-1));
      if (nextBtn) nextBtn.addEventListener('click', () => scrollByItem(1));

      // Teclado
      carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          scrollByItem(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          scrollByItem(1);
        }
      });

      // Mouse Drag
      carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.style.scrollSnapType = 'none'; // desativa snap suave durante o drag
        carousel.style.scrollBehavior = 'auto'; // instantâneo enquanto arrasta
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
      });
      carousel.addEventListener('mouseleave', () => {
        if(!isDown) return;
        isDown = false;
        carousel.style.scrollSnapType = '';
        carousel.style.scrollBehavior = 'smooth';
      });
      carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.style.scrollSnapType = '';
        carousel.style.scrollBehavior = 'smooth';
        // força o alinhamento com snap após o drag
        requestAnimationFrame(() => {
           carousel.scrollBy({ left: 1, behavior: 'smooth' });
           carousel.scrollBy({ left: -1, behavior: 'smooth' });
        });
      });
      carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2; // multiplicador de velocidade
        carousel.scrollLeft = scrollLeft - walk;
      });

      // Initial state
      setTimeout(updateUI, 100);
      window.addEventListener('resize', updateUI);
    }
  });
})();