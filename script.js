/* ============================================
   LUXE RENTALS — JavaScript
   Animations, Interactions, Filters, Calendar
   Enhanced: Preloader, Particles, Counter,
   Tilt Cards, Text Reveal, Page Transitions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ===== PRELOADER =====
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.classList.add('loaded');
      }, 2800);
    });
    // Fallback: hide after 4s max
    setTimeout(() => {
      preloader.classList.add('hidden');
      document.body.classList.add('loaded');
    }, 4000);
  }

  // ===== ENHANCED SCROLL REVEAL =====
  const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate, .text-reveal, .mask-reveal, .stagger-text';
  const revealElements = document.querySelectorAll(revealSelectors);
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('stagger-text')) {
          const spans = entry.target.querySelectorAll('span');
          spans.forEach((span, index) => {
            span.style.transitionDelay = `${index * 0.1}s`;
          });
        }
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.01, rootMargin: '0px 0px -20px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // ===== SCROLL PROGRESS BAR =====
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = `${progress}%`;
  });

  // ===== COUNTER ANIMATION =====
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
  }

  function animateCounter(el) {
    const target = el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const isFloat = target.includes('.');
    const end = parseFloat(target);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = isFloat
        ? (end * eased).toFixed(1)
        : Math.floor(end * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ===== PARTICLE BACKGROUND =====
  const particlesBg = document.querySelectorAll('.particles-bg');
  particlesBg.forEach(container => {
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.setProperty('--drift-x', (Math.random() * 160 - 80) + 'px');
      p.style.setProperty('--drift-y', (Math.random() * -200 - 50) + 'px');
      p.style.animationDuration = (6 + Math.random() * 6) + 's';
      p.style.animationDelay = (Math.random() * 5) + 's';
      container.appendChild(p);
    }
  });

  // ===== CARD TILT EFFECT =====
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      card.style.setProperty('--tilt-x', rotateX + 'deg');
      card.style.setProperty('--tilt-y', rotateY + 'deg');
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ===== MAGNETIC BUTTON EFFECT =====
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      btn.style.setProperty('--mouse-x', x + '%');
      btn.style.setProperty('--mouse-y', y + '%');
    });
  });

  // ===== PAGE TRANSITION LINKS =====
  const transitionOverlay = document.getElementById('pageTransition');
  if (transitionOverlay) {
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
          e.preventDefault();
          transitionOverlay.classList.add('active');
          setTimeout(() => {
            window.location.href = href;
          }, 300);
        }
      });
    });
  }

  // ===== NAVBAR SCROLL =====
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });

  // ===== MOBILE MENU =====
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      menuToggle.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.classList.remove('active');
      });
    });
  }

  // ===== BACK TO TOP =====
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== PRODUCT FILTERS =====
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      productCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          card.style.animation = 'fadeInUp 0.5s var(--ease-premium) forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ===== CALENDAR (Product Detail Page) =====
  const calendarDays = document.getElementById('calendarDays');
  const calendarMonth = document.getElementById('calendarMonth');

  if (calendarDays) {
    let currentDate = new Date(2026, 2, 1);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const unavailableDates = [3, 4, 5, 12, 13, 19, 20, 26, 27];

    function renderCalendar() {
      calendarDays.innerHTML = '';

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      calendarMonth.textContent = `${monthNames[month]} ${year}`;

      dayLabels.forEach(day => {
        const label = document.createElement('span');
        label.className = 'day-label';
        label.textContent = day;
        calendarDays.appendChild(label);
      });

      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('span');
        empty.className = 'day empty';
        calendarDays.appendChild(empty);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const dayEl = document.createElement('span');
        dayEl.className = 'day';
        dayEl.textContent = d;

        if (unavailableDates.includes(d)) {
          dayEl.classList.add('unavailable');
        } else {
          dayEl.addEventListener('click', function () {
            document.querySelectorAll('.calendar-days .day.selected').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
          });
        }

        calendarDays.appendChild(dayEl);
      }
    }

    window.changeMonth = function (dir) {
      currentDate.setMonth(currentDate.getMonth() + dir);
      renderCalendar();
    };

    renderCalendar();
  }

  // ===== SMOOTH SCROLL for anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  // ===== PARALLAX SUBTLE EFFECT on hero =====
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scroll = window.scrollY;
      heroBg.style.transform = `translateY(${scroll * 0.3}px)`;
    });
  }

  // ===== CURSOR GLOW (desktop only) =====
  if (window.innerWidth > 768) {
    const cursorGlow = document.createElement('div');
    cursorGlow.style.cssText = `
      position: fixed; width: 300px; height: 300px; border-radius: 50%;
      background: radial-gradient(circle, rgba(204,27,27,0.06), rgba(75,0,130,0.04), transparent 70%);
      pointer-events: none; z-index: 0; transform: translate(-50%, -50%);
      transition: left 0.15s ease, top 0.15s ease;
    `;
    document.body.appendChild(cursorGlow);
    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }

});

// ===== PRODUCT DETAIL PAGE FUNCTIONS =====

function changeImage(thumb) {
  const mainImage = document.getElementById('mainImage');
  if (mainImage && thumb) {
    mainImage.style.opacity = '0';
    mainImage.style.transform = 'scale(0.98)';
    setTimeout(() => {
      mainImage.src = thumb.src;
      mainImage.alt = thumb.alt;
      mainImage.style.opacity = '1';
      mainImage.style.transform = 'scale(1)';
    }, 250);

    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
  }
}

function selectDuration(el) {
  document.querySelectorAll('.duration-option').forEach(opt => opt.classList.remove('selected'));
  el.classList.add('selected');

  const price = el.querySelector('.dur-price').textContent;
  const reserveBtn = document.querySelector('.btn-reserve');
  if (reserveBtn) {
    reserveBtn.textContent = `Reserve Now — ${price}`;
  }
}

function toggleWishlist(btn) {
  btn.classList.toggle('wishlisted');
  if (btn.classList.contains('wishlisted')) {
    btn.innerHTML = '♥';
    btn.style.color = '#8B0000';
    btn.style.borderColor = '#8B0000';
    btn.style.background = 'rgba(139,0,0,0.15)';
  } else {
    btn.innerHTML = '♡';
    btn.style.color = '';
    btn.style.borderColor = '';
    btn.style.background = '';
  }
}

function handleReserve() {
  const phoneNumber = '917604811742';
  const message = encodeURIComponent("i would like to reserve this collection");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  window.open(whatsappUrl, '_blank');
}

function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');

  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));

  if (!isOpen) {
    item.classList.add('open');
  }
}
