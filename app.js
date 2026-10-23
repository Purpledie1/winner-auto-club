/**
 * WINNER AUTO CLUB — Interactive Application Logic
 * Implements: Hero Slider & Scrubber, Catalog Search/Filter/Sort,
 * Interactive Calculator with dual-bar comparison, FAQ Accordion,
 * and Lead Capture Modal with smooth UX.
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initCatalog();
  initCalculator();
  initFaqAccordion();
  initModals();
  initNavigation();
});

/* ==========================================================================
   1. HERO SLIDER & SCRUBBER
   ========================================================================== */
function initHeroSlider() {
  const slides = [
    {
      tag: 'США И ЕВРОПА → ГРУЗИЯ',
      title: 'Мечта — в деталях.<br><span class="hero-subtitle">Выбор — за вами.</span>',
      desc: 'Автомобили из Америки и Европы под заказ. Полное сопровождение: от поиска и проверки на аукционе до доставки и оформления в Рустави.',
      counter: '001 / 121',
      progress: 33.33,
      imgIndex: 1
    },
    {
      tag: '02 / ВЗГЛЯД ГЛУБЖЕ',
      title: 'Ничего лишнего.<br><span class="hero-subtitle">Даже в цене.</span>',
      desc: 'Без скрытых комиссий, наценок и неожиданных расходов. Прозрачный расчёт и фиксированная стоимость под ключ.',
      counter: '064 / 121',
      progress: 66.66,
      imgIndex: 2
    },
    {
      tag: '03 / ВАЖНА КАЖДАЯ ДЕТАЛЬ',
      title: 'Ваш характер.<br><span class="hero-subtitle">Ваш автомобиль.</span>',
      desc: 'Каждый автомобиль проверяется экспертами по 140+ параметрам: кузов, электроника, история страховых случаев и юридическая чистота.',
      counter: '121 / 121',
      progress: 100.0,
      imgIndex: 3
    }
  ];

  let currentSlide = 0;
  let autoPlayTimer = null;

  const heroTag = document.getElementById('heroTag');
  const heroTitle = document.getElementById('heroTitle');
  const heroDesc = document.getElementById('heroDesc');
  const slideCounter = document.getElementById('slideCounter');
  const scrubberProgress = document.getElementById('scrubberProgress');
  const scrubberThumb = document.getElementById('scrubberThumb');
  const scrubberBar = document.getElementById('scrubberBar');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  const dots = document.querySelectorAll('.scrub-dot');
  const heroImgs = [
    document.getElementById('heroImg1'),
    document.getElementById('heroImg2'),
    document.getElementById('heroImg3')
  ];

  function showSlide(index, manual = false) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentSlide = index;

    const data = slides[currentSlide];

    // Fade out text briefly
    heroTitle.style.opacity = '0.4';
    heroDesc.style.opacity = '0.4';
    heroTag.style.opacity = '0.4';

    setTimeout(() => {
      heroTag.textContent = data.tag;
      heroTitle.innerHTML = data.title;
      heroDesc.textContent = data.desc;
      slideCounter.textContent = data.counter;

      heroTitle.style.opacity = '1';
      heroDesc.style.opacity = '1';
      heroTag.style.opacity = '1';
    }, 150);

    // Update scrubber progress & thumb
    if (scrubberProgress) scrubberProgress.style.width = `${data.progress}%`;
    if (scrubberThumb) scrubberThumb.style.left = `${data.progress}%`;

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });

    // Update active hero car image
    heroImgs.forEach((img, i) => {
      if (img) img.classList.toggle('active', i === currentSlide);
    });

    if (manual) resetAutoPlay();
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 7000);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => showSlide(currentSlide - 1, true));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => showSlide(currentSlide + 1, true));
  }

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
      showSlide(idx, true);
    });
  });

  // Click on scrubber bar to jump
  if (scrubberBar) {
    scrubberBar.addEventListener('click', (e) => {
      const rect = scrubberBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));

      if (ratio < 0.35) showSlide(0, true);
      else if (ratio < 0.75) showSlide(1, true);
      else showSlide(2, true);
    });

    // Keyboard navigation
    scrubberBar.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        showSlide(currentSlide + 1, true);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        showSlide(currentSlide - 1, true);
      }
    });
  }

  startAutoPlay();
}

/* ==========================================================================
   2. CATALOG MANAGER (Filter, Search, Sort)
   ========================================================================== */
function initCatalog() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const searchInput = document.getElementById('catalogSearch');
  const searchClear = document.getElementById('searchClear');
  const sortSelect = document.getElementById('catalogSort');
  const catalogGrid = document.getElementById('catalogGrid');
  const noResults = document.getElementById('noResults');
  const resetBtn = document.getElementById('resetCatalogFilters');

  if (!catalogGrid) return;

  const originalCards = Array.from(catalogGrid.querySelectorAll('.car-card'));

  let activeFilter = 'all';
  let searchTerm = '';
  let activeSort = 'featured';

  function updateCatalog() {
    let visibleCount = 0;

    // Filter & search
    originalCards.forEach(card => {
      const categories = (card.getAttribute('data-category') || '').split(' ');
      const carName = (card.querySelector('.car-name')?.textContent || '').toLowerCase();
      const carSpecs = (card.querySelector('.car-specs')?.textContent || '').toLowerCase();
      const routeBadge = (card.querySelector('.route-badge')?.textContent || '').toLowerCase();

      const matchesFilter = (activeFilter === 'all') || categories.includes(activeFilter);
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query || carName.includes(query) || carSpecs.includes(query) || routeBadge.includes(query);

      if (matchesFilter && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Sort visible cards
    const sorted = [...originalCards].sort((a, b) => {
      const priceA = parseFloat(a.getAttribute('data-price')) || 0;
      const priceB = parseFloat(b.getAttribute('data-price')) || 0;
      const economyA = parseFloat(a.getAttribute('data-economy')) || 0;
      const economyB = parseFloat(b.getAttribute('data-economy')) || 0;
      const yearA = parseInt(a.getAttribute('data-year'), 10) || 0;
      const yearB = parseInt(b.getAttribute('data-year'), 10) || 0;

      if (activeSort === 'price-asc') return priceA - priceB;
      if (activeSort === 'price-desc') return priceB - priceA;
      if (activeSort === 'economy-desc') return economyB - economyA;
      if (activeSort === 'year-desc') return yearB - yearA;
      return 0; // 'featured' keeps dom sequence
    });

    sorted.forEach(card => catalogGrid.appendChild(card));

    // Show/hide no results
    if (noResults) {
      noResults.style.display = (visibleCount === 0) ? 'block' : 'none';
    }
  }

  // Filter tabs click
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter') || 'all';
      updateCatalog();
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      if (searchClear) searchClear.style.display = searchTerm ? 'block' : 'none';
      updateCatalog();
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchTerm = '';
        searchClear.style.display = 'none';
        updateCatalog();
      }
    });
  }

  // Sort select
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      updateCatalog();
    });
  }

  // Reset button in no-results
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeFilter = 'all';
      searchTerm = '';
      activeSort = 'featured';
      if (searchInput) searchInput.value = '';
      if (searchClear) searchClear.style.display = 'none';
      if (sortSelect) sortSelect.value = 'featured';
      filterTabs.forEach((t, i) => t.classList.toggle('active', i === 0));
      updateCatalog();
    });
  }
}

/* ==========================================================================
   3. INTERACTIVE CALCULATOR
   ========================================================================== */
function initCalculator() {
  const inputs = {
    market: document.getElementById('inputMarketPrice'),
    buy: document.getElementById('inputBuyPrice'),
    shipping: document.getElementById('inputShipping'),
    customs: document.getElementById('inputCustoms'),
    service: document.getElementById('inputService'),
    repair: document.getElementById('inputRepair')
  };

  const valDisplays = {
    market: document.getElementById('valMarket'),
    buy: document.getElementById('valBuy'),
    shipping: document.getElementById('valShipping'),
    customs: document.getElementById('valCustoms'),
    service: document.getElementById('valService'),
    repair: document.getElementById('valRepair')
  };

  const barMarketTotal = document.getElementById('barMarketTotal');
  const barClubTotal = document.getElementById('barClubTotal');
  const barMarketFill = document.getElementById('barMarketFill');
  const segBuy = document.getElementById('segBuy');
  const segLogistics = document.getElementById('segLogistics');
  const segService = document.getElementById('segService');
  const savingsAmount = document.getElementById('savingsAmount');
  const savingsPercent = document.getElementById('savingsPercent');
  const btnReset = document.getElementById('calcReset');
  const btnDiscuss = document.getElementById('btnDiscussCalc');

  const defaultValues = {
    market: 30000,
    buy: 18000,
    shipping: 2500,
    customs: 1500,
    service: 1000,
    repair: 0
  };

  function formatDollar(val) {
    return '$' + Math.round(val).toLocaleString('ru-RU').replace(/\s/g, ' ');
  }

  function calculate() {
    const market = parseFloat(inputs.market?.value || 30000);
    const buy = parseFloat(inputs.buy?.value || 18000);
    const shipping = parseFloat(inputs.shipping?.value || 2500);
    const customs = parseFloat(inputs.customs?.value || 1500);
    const service = parseFloat(inputs.service?.value || 1000);
    const repair = parseFloat(inputs.repair?.value || 0);

    // Update labels above sliders
    if (valDisplays.market) valDisplays.market.textContent = formatDollar(market);
    if (valDisplays.buy) valDisplays.buy.textContent = formatDollar(buy);
    if (valDisplays.shipping) valDisplays.shipping.textContent = formatDollar(shipping);
    if (valDisplays.customs) valDisplays.customs.textContent = formatDollar(customs);
    if (valDisplays.service) valDisplays.service.textContent = formatDollar(service);
    if (valDisplays.repair) valDisplays.repair.textContent = formatDollar(repair);

    const logisticsTotal = shipping + customs + repair;
    const clubTotal = buy + logisticsTotal + service;
    const diff = market - clubTotal;
    const percent = market > 0 ? (diff / market) * 100 : 0;

    // Totals on bars
    if (barMarketTotal) barMarketTotal.textContent = formatDollar(market);
    if (barClubTotal) barClubTotal.textContent = formatDollar(clubTotal);

    // Dynamic width comparison
    const maxVal = Math.max(market, clubTotal, 1);
    const marketWidth = (market / maxVal) * 100;
    const clubWidth = (clubTotal / maxVal) * 100;

    if (barMarketFill) barMarketFill.style.width = `${marketWidth}%`;

    // Segment widths inside Club Bar (relative to clubTotal)
    if (clubTotal > 0) {
      const buyPct = (buy / clubTotal) * 100;
      const logPct = (logisticsTotal / clubTotal) * 100;
      const srvPct = (service / clubTotal) * 100;

      if (segBuy) segBuy.style.width = `${buyPct}%`;
      if (segLogistics) segLogistics.style.width = `${logPct}%`;
      if (segService) segService.style.width = `${srvPct}%`;
    }

    // Savings KPI
    if (savingsAmount) {
      if (diff >= 0) {
        savingsAmount.textContent = formatDollar(diff);
        savingsAmount.style.color = 'var(--accent-green)';
      } else {
        savingsAmount.textContent = '- ' + formatDollar(Math.abs(diff));
        savingsAmount.style.color = 'var(--accent-red)';
      }
    }

    if (savingsPercent) {
      if (percent >= 0) {
        savingsPercent.textContent = `-${percent.toFixed(1)}%`;
        savingsPercent.style.color = 'var(--accent-green)';
        savingsPercent.style.backgroundColor = 'var(--accent-green-bg)';
      } else {
        savingsPercent.textContent = `+${Math.abs(percent).toFixed(1)}%`;
        savingsPercent.style.color = 'var(--accent-red)';
        savingsPercent.style.backgroundColor = 'rgba(212, 59, 54, 0.1)';
      }
    }

    // Update discuss button subject
    if (btnDiscuss) {
      btnDiscuss.setAttribute(
        'data-subject',
        `Калькулятор: Аналог $${market} vs Клуб $${clubTotal} (Экономия ${formatDollar(diff)})`
      );
    }
  }

  // Attach input events
  Object.values(inputs).forEach(input => {
    if (input) input.addEventListener('input', calculate);
  });

  // Reset button
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      Object.keys(defaultValues).forEach(key => {
        if (inputs[key]) inputs[key].value = defaultValues[key];
      });
      calculate();
    });
  }

  // Initial calculation run
  calculate();
}

/* ==========================================================================
   4. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (btn && answer) {
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Close others for clean editorial look
        items.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-question');
            const otherAns = other.querySelector('.faq-answer');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherAns) otherAns.style.maxHeight = '0px';
          }
        });

        // Toggle clicked
        if (isOpen) {
          item.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = '0px';
        } else {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = `${answer.scrollHeight + 30}px`;
        }
      });
    }
  });
}

/* ==========================================================================
   5. MODALS & LEAD CAPTURE
   ========================================================================== */
function initModals() {
  const modal = document.getElementById('leadModal');
  const modalClose = document.getElementById('modalClose');
  const leadForm = document.getElementById('leadForm');
  const formContainer = document.getElementById('modalFormContainer');
  const successContainer = document.getElementById('modalSuccess');
  const successClose = document.getElementById('modalSuccessClose');
  const formSubject = document.getElementById('formSubject');
  const modalTitle = document.getElementById('modalTitle');
  const userModel = document.getElementById('userModel');

  if (!modal) return;

  function openModal(subject = 'Заявка на консультацию') {
    if (formSubject) formSubject.value = subject;
    if (modalTitle) {
      if (subject.includes('Porsche') || subject.includes('BMW') || subject.includes('Mercedes') || subject.includes('Tesla') || subject.includes('Honda')) {
        modalTitle.textContent = 'Заказ автомобиля';
        if (userModel) userModel.value = subject.replace(/[\(\$\)]/g, '').trim();
      } else if (subject.includes('Калькулятор')) {
        modalTitle.textContent = 'Обсудить расчёт';
        if (userModel) userModel.value = 'Обсуждение бюджета доставки';
      } else {
        modalTitle.textContent = 'Подбор автомобиля';
        if (userModel) userModel.value = '';
      }
    }

    if (formContainer) formContainer.style.display = 'block';
    if (successContainer) successContainer.style.display = 'none';

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus name input
    const firstInput = document.getElementById('userName');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Trigger buttons
  document.querySelectorAll('[data-modal="consult"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const subject = btn.getAttribute('data-subject') || 'Подбор авто';
      openModal(subject);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (successClose) successClose.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Form submission handling
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('userName')?.value;
      const phone = document.getElementById('userPhone')?.value;

      if (!name || !phone) return;

      // Simulate instantaneous submission feedback
      if (formContainer) formContainer.style.display = 'none';
      if (successContainer) successContainer.style.display = 'block';

      // Reset form fields
      leadForm.reset();
    });
  }
}

/* ==========================================================================
   6. NAVIGATION & SCROLL SPY
   ========================================================================== */
function initNavigation() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const backToTop = document.getElementById('backToTop');
  const navLinks = document.querySelectorAll('.nav-link');

  // Mobile navigation toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Close mobile menu when clicking any nav link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // Back to top button
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Scroll spy for navigation
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  });
}
