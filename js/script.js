"use strict";

window.addEventListener("DOMContentLoaded", () => {
  // Tabs
  const tabs = document.querySelectorAll(".tabheader__item");
  const tabsParent = document.querySelector(".tabheader__items");
  const tabsContent = document.querySelectorAll(".tabcontent");

  function hideTabContent() {
    tabsContent.forEach((item) => {
      item.classList.add("hide");
      item.classList.remove("show", "fade");
    });

    tabs.forEach((item) => {
      item.classList.remove("tabheader__item_active");
      item.style.fontWeight = "normal";
    });
  }

  function showTabContent(i = 0) {
    tabsContent[i].classList.add("show", "fade");
    tabsContent[i].classList.remove("hide");
    tabs[i].classList.add("tabheader__item_active");
    tabs[i].style.fontWeight = "bold";
  }

  hideTabContent();
  showTabContent();

  tabsParent.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.classList.contains("tabheader__item")) {
      tabs.forEach((item, i) => {
        if (target === item) {
          hideTabContent();
          showTabContent(i);
        }
      });
    }
  });

  // Timer
  function getZero(num) {
    return num < 10 ? "0" + num : String(num);
  }

  function getNextPromoDeadline() {
    // По тексту на странице акция заканчивается 14 февраля в 00:00.
    // Делаем дедлайн ближайшего 14 февраля (этого года или следующего, если уже прошло).
    const now = new Date();
    const year = now.getFullYear();

    // Месяцы в JS: 0-январь, 1-февраль
    let deadline = new Date(year, 1, 14, 0, 0, 0);
    if (deadline.getTime() <= now.getTime()) {
      deadline = new Date(year + 1, 1, 14, 0, 0, 0);
    }
    return deadline;
  }

  function countdown(selector, deadlineDate) {
    const timer = document.querySelector(selector);
    if (!timer) return;

    const daysEl = timer.querySelector("#days");
    const hoursEl = timer.querySelector("#hours");
    const minutesEl = timer.querySelector("#minutes");
    const secondsEl = timer.querySelector("#seconds");

    function updateTimer() {
      const t = deadlineDate.getTime() - Date.now();

      if (t <= 0) {
        daysEl.textContent = "00";
        hoursEl.textContent = "00";
        minutesEl.textContent = "00";
        secondsEl.textContent = "00";
        clearInterval(timeInterval);
        return;
      }

      let days = Math.floor(t / (1000 * 60 * 60 * 24));
      const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((t / (1000 * 60)) % 60);
      const seconds = Math.floor((t / 1000) % 60);

      if (days > 99) days = 99; // ограничение верстки

      daysEl.textContent = getZero(days);
      hoursEl.textContent = getZero(hours);
      minutesEl.textContent = getZero(minutes);
      secondsEl.textContent = getZero(seconds);
    }

    updateTimer();
    const timeInterval = setInterval(updateTimer, 1000);
  }

  countdown(".promotion__timer", getNextPromoDeadline());

  // Modal
  const modal = document.querySelector(".modal");
  const modalTrigger = document.querySelector("[data-modal]");
  const modalCloseBtn = document.querySelector("[data-close]");

  let modalShownByScroll = false;
  const modalTimerId = setTimeout(openModal, 5000);

  function openModal() {
    if (!modal) return;
    modal.classList.add("show");
    modal.classList.remove("hide");
    document.body.style.overflow = "hidden";
    clearTimeout(modalTimerId);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add("hide");
    modal.classList.remove("show");
    document.body.style.overflow = "";
  }

  if (modalTrigger) modalTrigger.addEventListener("click", openModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.code === "Escape" && modal && modal.classList.contains("show")) {
      closeModal();
    }
  });

  function showModalByScroll() {
    if (
      !modalShownByScroll &&
      window.pageYOffset + document.documentElement.clientHeight >=
        document.documentElement.scrollHeight - 1
    ) {
      openModal();
      modalShownByScroll = true;
      window.removeEventListener("scroll", showModalByScroll);
    }
  }
  window.addEventListener("scroll", showModalByScroll);

  // Form (простая "заглушка", чтобы кнопка реально работала на статическом сайте)
  function showThanksModal(message) {
    if (!modal) return;

    const prevDialog = modal.querySelector(".modal__dialog");
    if (prevDialog) prevDialog.classList.add("hide");

    openModal();

    const thanksDialog = document.createElement("div");
    thanksDialog.classList.add("modal__dialog");
    thanksDialog.innerHTML = `
      <div class="modal__content">
        <div data-close class="modal__close">&times;</div>
        <div class="modal__title">${message}</div>
      </div>
    `;
    modal.append(thanksDialog);

    thanksDialog.querySelector("[data-close]")?.addEventListener("click", () => {
      thanksDialog.remove();
      prevDialog?.classList.remove("hide");
      closeModal();
    });

    setTimeout(() => {
      thanksDialog.remove();
      prevDialog?.classList.remove("hide");
      closeModal();
    }, 2500);
  }

  const form = document.querySelector("#contactForm");
const formError = form?.querySelector(".form__error");
const formSuccess = form?.querySelector(".form__success");
const nameInput = form?.querySelector("#contactName");
const phoneInput = form?.querySelector("#contactPhone");

const normalizePhone = (value) => value.replace(/[^\d+]/g, "");
const isValidPhone = (value) => {
  // Принимаем варианты: +7XXXXXXXXXX, 8XXXXXXXXXX, +380..., и т.д.
  const v = normalizePhone(value);
  return v.length >= 10 && v.length <= 15;
};

const setError = (msg) => {
  if (formError) {
    formError.textContent = msg;
    formError.style.display = "block";
  }
  if (formSuccess) formSuccess.style.display = "none";
};

const clearError = () => {
  if (formError) formError.style.display = "none";
};

const setSuccess = (msg) => {
  if (formSuccess) {
    formSuccess.textContent = msg;
    formSuccess.style.display = "block";
  }
  clearError();
};

const markInvalid = (el, isInvalid) => {
  if (!el) return;
  el.classList.toggle("is-invalid", Boolean(isInvalid));
};

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput?.value?.trim() || "";
    const phone = phoneInput?.value?.trim() || "";

    markInvalid(nameInput, false);
    markInvalid(phoneInput, false);

    if (name.length < 2) {
      markInvalid(nameInput, true);
      setError("Ошибка: имя должно быть минимум 2 символа.");
      return;
    }

    if (!isValidPhone(phone)) {
      markInvalid(phoneInput, true);
      setError("Ошибка: введите корректный номер телефона (10–15 цифр).");
      return;
    }

    // Проект статический — имитируем отправку и сохраняем заявку в localStorage.
    const payload = { name, phone, createdAt: new Date().toISOString() };
    try {
      const key = "foodprod_leads";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      prev.push(payload);
      localStorage.setItem(key, JSON.stringify(prev));
    } catch (_) {}

    form.reset();
    setSuccess("Готово! Заявка отправлена. Мы свяжемся с вами 😊");
    showThanksModal("Спасибо! Мы скоро вам перезвоним.");
  });

  [nameInput, phoneInput].forEach((el) => {
    el?.addEventListener("input", () => {
      markInvalid(el, false);
      clearError();
    });
  });

  phoneInput?.addEventListener("input", () => {
    // Лёгкая нормализация: убираем лишние символы (но оставляем +)
    const v = phoneInput.value;
    phoneInput.value = v.replace(/[^\d+\s()-]/g, "");
  });
}

// Slider
  const slides = document.querySelectorAll(".offer__slide");
  const prev = document.querySelector(".offer__slider-prev");
  const next = document.querySelector(".offer__slider-next");
  const current = document.querySelector("#current");
  const total = document.querySelector("#total");

  let slideIndex = 1;

  if (total) total.textContent = slides.length < 10 ? `0${slides.length}` : String(slides.length);

  function showSlide(n) {
    if (!slides.length) return;

    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;

    slides.forEach((slide) => (slide.style.display = "none"));
    slides[slideIndex - 1].style.display = "block";

    if (current) current.textContent = slideIndex < 10 ? `0${slideIndex}` : String(slideIndex);
  }

  function nextSlide() {
    showSlide(++slideIndex);
  }

  function prevSlide() {
    showSlide(--slideIndex);
  }

  next?.addEventListener("click", nextSlide);
  prev?.addEventListener("click", prevSlide);

  showSlide(slideIndex);

  // Calculator
  const result = document.querySelector(".calculating__result span");

  let gender, height, weight, age, activity;

  gender = localStorage.getItem("gender") || "Женщина";
  localStorage.setItem("gender", gender);

  activity = localStorage.getItem("activity") || "small";
  localStorage.setItem("activity", activity);

  function calcTotal() {
    if (!result) return;

    if (!gender || !height || !weight || !age || !activity) {
      result.textContent = "____";
      return;
    }

    let bmr;
    if (gender === "Женщина") {
      bmr = 447.6 + 9.2 * weight + 3.1 * height - 4.3 * age;
    } else {
      bmr = 88.36 + 13.4 * weight + 4.8 * height - 5.7 * age;
    }

    const activityRatio = {
      low: 1.2,
      small: 1.375,
      medium: 1.55,
      high: 1.725,
    };

    result.textContent = String(Math.round(bmr * activityRatio[activity]));
  }

  function initLocalSettings(selector, activeClass) {
    const elements = document.querySelectorAll(selector);

    elements.forEach((elem) => {
      elem.classList.remove(activeClass);

      if (elem.textContent === gender || elem.id === activity) {
        elem.classList.add(activeClass);
      }
    });
  }

  initLocalSettings("#gender div", "calculating__choose-item_active");
  initLocalSettings(".calculating__choose_big div", "calculating__choose-item_active");

  function getStaticInformation(parentSelector, activeClass) {
    const elements = document.querySelectorAll(`${parentSelector} div`);

    elements.forEach((elem) => {
      elem.addEventListener("click", (e) => {
        const target = e.target;

        if (target.parentNode && target.parentNode.id === "gender") {
          gender = target.textContent;
          localStorage.setItem("gender", gender);
        } else {
          activity = target.id;
          localStorage.setItem("activity", activity);
        }

        elements.forEach((el) => el.classList.remove(activeClass));
        target.classList.add(activeClass);

        calcTotal();
      });
    });
  }

  getStaticInformation("#gender", "calculating__choose-item_active");
  getStaticInformation(".calculating__choose_big", "calculating__choose-item_active");

  function getDynamicInformation(selector) {
    const input = document.querySelector(selector);
    if (!input) return;

    input.addEventListener("input", () => {
      if (input.value.match(/\D/g)) {
        input.style.border = "2px solid red";
      } else {
        input.style.border = "none";
      }

      switch (input.id) {
        case "height":
          height = +input.value;
          break;
        case "weight":
          weight = +input.value;
          break;
        case "age":
          age = +input.value;
          break;
      }

      calcTotal();
    });
  }

  getDynamicInformation("#height");
  getDynamicInformation("#weight");
  getDynamicInformation("#age");

  calcTotal();
});



// Complex animation: particles network in the hero block
function initParticles() {
  const canvas = document.getElementById("heroParticles");
  const preview = document.querySelector(".preview");
  if (!canvas || !preview) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  let w = 0, h = 0;
  let particles = [];
  let rafId = null;

  const rand = (min, max) => Math.random() * (max - min) + min;

  function resize() {
    const rect = preview.getBoundingClientRect();
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticles() {
    const count = Math.min(90, Math.max(45, Math.floor((w * h) / 18000)));
    particles = Array.from({ length: count }).map(() => ({
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.35, 0.35),
      vy: rand(-0.35, 0.35),
      r: rand(1.2, 2.6)
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        const maxDist = 110;

        if (dist < maxDist) {
          const a = 1 - dist / maxDist;
          ctx.strokeStyle = `rgba(255,255,255,${0.22 * a})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    rafId = requestAnimationFrame(step);
  }

  function start() {
    cancelAnimationFrame(rafId);
    resize();
    makeParticles();
    step();
  }

  start();
  window.addEventListener("resize", start, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      start();
    }
  });
}

initParticles();
