// --- Получение элементов со страницы ---
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const endScreen = document.getElementById("end-screen");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const questionCounter = document.getElementById("question-counter");
const progressBarInner = document.getElementById("progress-bar-inner");
const questionImage = document.getElementById("question-image");
const questionText = document.getElementById("question-text");
const optionsGrid = document.getElementById("options-grid");
const finalScore = document.getElementById("final-score");
// --- Переменные состояния игры ---
let allQuestions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
// --- ЗАГРУЗКА ВОПРОСОВ ИЗ ФАЙЛА ---
async function loadQuestions() {
  try {
    const response = await fetch('questions.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    allQuestions = await response.json();
    
    // Включаем кнопку только после загрузки
    startButton.disabled = false;
    startButton.textContent = 'Начать игру!';
  } catch (error) {
    console.error("Не удалось загрузить вопросы:", error);
    startButton.textContent = 'Ошибка загрузки вопросов';
    startButton.disabled = true;
  }
}
// --- Функции ---
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function prepareQuestions() {
  const simpleQuestions = shuffleArray(allQuestions.filter(q => q.difficulty === 'simple')).slice(0, 4);
  const complexQuestions = shuffleArray(allQuestions.filter(q => q.difficulty === 'complex')).slice(0, 2);
  currentQuestions = shuffleArray([...simpleQuestions, ...complexQuestions]);
}
function showQuestion() {
  const question = currentQuestions[currentQuestionIndex];
  
  questionCounter.textContent = `Вопрос ${currentQuestionIndex + 1} из ${currentQuestions.length}`;
  progressBarInner.style.width = `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`;
  if (question.image && question.image.trim() !== "") {
    questionImage.src = `images/${question.image}`;
    questionImage.style.display = 'block';
  } else {
    questionImage.style.display = 'none';
  }
  questionText.textContent = question.text;
  optionsGrid.innerHTML = '';
  
  question.options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option.text;
    button.className = 'option-button';
    button.onclick = () => selectAnswer(option, button);
    optionsGrid.appendChild(button);
  });
}
function selectAnswer(option, clickedButton) {
  const question = currentQuestions[currentQuestionIndex];
  const points = question.difficulty === 'simple' ? 5 : 10;
  
  Array.from(optionsGrid.children).forEach(btn => btn.disabled = true);
  
  if (option.isCorrect) {
    score += points;
    clickedButton.classList.add('correct');
  } else {
    clickedButton.classList.add('incorrect');
    const correctOption = question.options.find(opt => opt.isCorrect);
    const correctButton = Array.from(optionsGrid.children).find(btn => btn.textContent === correctOption.text);
    if (correctButton) {
        correctButton.classList.add('correct');
    }
  }
  
  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
      showQuestion();
    } else {
      showEndScreen();
    }
  }, 1500);
}
function showEndScreen() {
    quizScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    finalScore.textContent = `${score} баллов`;
}
function startGame() {
  score = 0;
  currentQuestionIndex = 0;
  prepareQuestions();
  startScreen.classList.add('hidden');
  endScreen.classList.add('hidden');
  quizScreen.classList.remove('hidden');
  
  showQuestion();
}
// --- Инициализация приложения ---
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
startButton.disabled = true;
startButton.textContent = 'Загрузка вопросов...';
loadQuestions();