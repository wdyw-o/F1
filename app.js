/* ===== Шапка при скролле ===== */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
});

/* ===== Мобильное меню ===== */
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  nav.classList.toggle('open');
});
document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
  });
});

/* ===== Появление карточек при скролле ===== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.card').forEach(card => observer.observe(card));

/* ===== Переключение табов ===== */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

/* ===== Симулятор реакции на старт ===== */
const startBtn = document.getElementById('startReaction');
const lights = document.querySelectorAll('.light');
const msg = document.getElementById('reactionMsg');
const result = document.getElementById('reactionResult');

let reactionStart = 0;
let reactionTimeout = null;
let reactionState = 'idle'; // idle | waiting | ready | done

// Сброс огней
function resetLights() {
  lights.forEach(l => {
    l.classList.remove('on', 'off', 'green');
  });
}

startBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // ← важно! не даём клику всплыть до блока

  if (reactionState === 'waiting') return;

  if (reactionState === 'ready') {
    // Фальстарт — клик по кнопке вместо блока
    clearTimeout(reactionTimeout);
    resetLights();
    msg.textContent = '⚠️ ФАЛЬСТАРТ! Нужно кликать по чёрному полю, а не по кнопке.';
    result.textContent = '';
    reactionState = 'idle';
    startBtn.textContent = 'Старт';
    return;
  }

  // Запуск
  reactionState = 'waiting';
  result.textContent = '';
  msg.textContent = 'Жди зелёный свет...';
  startBtn.textContent = 'Жди...';
  resetLights();

  // Включаем красные огни по очереди
  lights.forEach((l, i) => {
    setTimeout(() => l.classList.add('on'), i * 400);
  });

  // Случайная задержка 2-5 секунд, потом зелёный
  const delay = 2000 + Math.random() * 3000;
  reactionTimeout = setTimeout(() => {
    // Гасим красные
    lights.forEach(l => l.classList.remove('on'));
    // Зажигаем все зелёным
    lights.forEach(l => l.classList.add('green'));
    reactionStart = performance.now();
    reactionState = 'ready';
    msg.textContent = '🟢 ЗЕЛЁНЫЙ! КЛИКАЙ ПО ПОЛЮ!';
    startBtn.textContent = 'КЛИК!';
  }, delay);
});

// Клик по блоку реакции
document.querySelector('.reaction-box').addEventListener('click', (e) => {
  // Игнорируем клик по кнопке и её содержимому
  if (e.target.closest('.btn')) return;

  if (reactionState === 'waiting') {
    // Фальстарт — кликнули раньше зелёного
    clearTimeout(reactionTimeout);
    resetLights();
    msg.textContent = '⚠️ ФАЛЬСТАРТ! Слишком рано. Попробуй ещё раз.';
    result.textContent = '';
    reactionState = 'idle';
    startBtn.textContent = 'Старт';
    return;
  }

  if (reactionState !== 'ready') return;

  const time = Math.round(performance.now() - reactionStart);
  reactionState = 'done';

  let verdict = '';
  if (time < 150) verdict = '🤖 Робот? Нереально!';
  else if (time < 250) verdict = '🏆 Уровень гонщика F1!';
  else if (time < 350) verdict = '🔥 Отличная реакция!';
  else if (time < 500) verdict = '👍 Неплохо, но можно лучше';
  else verdict = '🐢 Сонный пилот...';

  result.innerHTML = `${time} мс<br><span style="font-size:20px;color:var(--muted)">${verdict}</span>`;
  msg.textContent = 'Нажми «Старт» чтобы попробовать ещё раз';
  startBtn.textContent = 'Старт';

  setTimeout(resetLights, 1000);
});

/* ===== Квиз ===== */
const quizData = [
  {
    q: 'Кто сыграл главную роль — Сонни Хейса?',
    options: ['Том Круз', 'Брэд Питт', 'Мэтт Деймон', 'Дензел Вашингтон'],
    correct: 1
  },
  {
    q: 'Как называется команда, за которую выступает главный герой?',
    options: ['Mercedes', 'Red Bull', 'APXGP', 'Ferrari'],
    correct: 2
  },
  {
    q: 'Кто режиссёр фильма «F1»?',
    options: ['Кристофер Нолан', 'Джозеф Косински', 'Дени Вильнёв', 'Ридли Скотт'],
    correct: 1
  },
  {
    q: 'На каких реальных трассах проходили съёмки?',
    options: ['Только в Монако', 'Сильверстоун, Монца, Лас-Вегас', 'Только в Абу-Даби', 'Виртуальные трассы'],
    correct: 1
  },
  {
    q: 'Кто выступил консультантом фильма и является 7-кратным чемпионом F1?',
    options: ['Макс Ферстаппен', 'Фернандо Алонсо', 'Льюис Хэмилтон', 'Себастьян Феттель'],
    correct: 2
  }
];

let currentQ = 0;
let score = 0;

const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const quizStep = document.getElementById('quizStep');
const progressFill = document.getElementById('progressFill');
const quizResult = document.getElementById('quizResult');
const restartBtn = document.getElementById('restartQuiz');

function loadQuestion() {
  const q = quizData[currentQ];
  quizQuestion.textContent = q.q;
  quizStep.textContent = `Вопрос ${currentQ + 1} из ${quizData.length}`;
  progressFill.style.width = ((currentQ) / quizData.length * 100) + '%';
  quizOptions.innerHTML = '';

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz__option';
    btn.textContent = opt;
    btn.addEventListener('click', () => selectAnswer(i, btn));
    quizOptions.appendChild(btn);
  });
}

function selectAnswer(index, btn) {
  const q = quizData[currentQ];
  const allBtns = document.querySelectorAll('.quiz__option');
  allBtns.forEach(b => b.classList.add('disabled'));

  if (index === q.correct) {
    btn.classList.add('correct');
    score++;
  } else {
    btn.classList.add('wrong');
    allBtns[q.correct].classList.add('correct');
  }

  setTimeout(() => {
    currentQ++;
    if (currentQ < quizData.length) {
      loadQuestion();
    } else {
      showResult();
    }
  }, 1200);
}

function showResult() {
  progressFill.style.width = '100%';
  quizQuestion.style.display = 'none';
  quizOptions.style.display = 'none';
  quizStep.style.display = 'none';

  let title = '', desc = '';
  if (score === 5) { title = '🏆 Чемпион мира!'; desc = 'Ты знаешь о фильме всё!'; }
  else if (score >= 3) { title = '🥈 Отличный результат!'; desc = 'Хорошие знания, но есть куда расти.'; }
  else { title = '🎬 Пора пересмотреть фильм!'; desc = 'Попробуй ещё раз после просмотра.'; }

  quizResult.innerHTML = `
    <div class="score">${score} / ${quizData.length}</div>
    <h3>${title}</h3>
    <p>${desc}</p>
  `;
  restartBtn.style.display = 'inline-block';
}

restartBtn.addEventListener('click', () => {
  currentQ = 0;
  score = 0;
  quizQuestion.style.display = 'block';
  quizOptions.style.display = 'grid';
  quizStep.style.display = 'block';
  quizResult.innerHTML = '';
  restartBtn.style.display = 'none';
  loadQuestion();
});

loadQuestion();

/* ===== Анимация счётчиков ===== */
const counters = document.querySelectorAll('.fact__num');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = +el.dataset.target;
      const duration = 1800;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

counters.forEach(c => counterObserver.observe(c));

/* ===== Плавная прокрутка с учётом фиксированной шапки ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});