// Global variables
let flags = [];
let currentQuestion = 0;
let score = 0;              
const total_questions = 20; // Number of questions per round

//  Elements
const quizContainer = document.querySelector(".quiz-container");
const flagImg = document.getElementById("flag-img");
const optionsContainer = document.getElementById("options-container");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const scoreDisplay = document.getElementById("score");
const questionCount = document.getElementById("question-count");
const instructions = document.getElementById("instructions");
const title = document.getElementById("title");

// Fetch flags - with HTTP check
async function fetchFlags() {
  try {
    const res = await fetch("https://restcountries.com/v3.1/all?fields=name,flags");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    flags = data
      .filter(c => c?.name?.common && (c?.flags?.svg || c?.flags?.png))
      .map(c => ({ country: c.name.common, image: c.flags.svg || c.flags.png }))
      .sort(() => Math.random() - 0.5)
      .slice(0, total_questions);

    // Reset UI 
    currentQuestion = 0;
    score = 0;
    scoreDisplay.textContent = "Score: 0";
    scoreDisplay.style.display = "block";
    feedback.textContent = "";
    feedback.classList.remove("feedback-visible");
    flagImg.style.display = "block";
    restartBtn.style.display = "none";
    if (title) title.style.display = "block";
    nextBtn.classList.remove("show");

    if (instructions) {
      instructions.textContent = "Select the correct answer according to the flag";
      instructions.classList.remove("final-result");
      instructions.style.display = "block";
    }
    // --------------------

    loadQuestion();
  } catch (error) {
    feedback.textContent = "⚠️ Failed to load flags. Try refreshing.";
    feedback.classList.add("feedback-visible");
    console.error("Error fetching data:", error);
  }
}

// Helpers
function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

// Load questions
function loadQuestion() {
  feedback.textContent = "";
  feedback.classList.remove("feedback-visible");
  nextBtn.classList.remove("show");
  optionsContainer.innerHTML = "";
  flagImg.style.display = "block";
  restartBtn.style.display = "none";

  questionCount.textContent = `Question ${currentQuestion + 1} of ${flags.length}`;

  const question = flags[currentQuestion];
  flagImg.src = question.image;
  flagImg.alt = "Flag of a country";

  const wrongAnswers = flags
    .filter(f => f.country !== question.country)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const allOptions = shuffle([question, ...wrongAnswers]);

  allOptions.forEach(option => {
    const button = document.createElement("button");
    button.textContent = option.country;
    button.onclick = () => checkAnswer(option.country, question.country);
    optionsContainer.appendChild(button);
  });
}

// Check the answer
function checkAnswer(selected, correct) {
  const buttons = optionsContainer.querySelectorAll("button");

  buttons.forEach(btn => {
    const isCorrect = btn.textContent === correct;
    if (btn.textContent === selected && !isCorrect) btn.classList.add("wrong");
    if (isCorrect) btn.classList.add("correct");
    btn.disabled = true;
  });

  feedback.textContent = selected === correct
    ? "✅ Correct!"
    : `❌ Incorrect! It was ${correct}.`;

  setTimeout(() => feedback.classList.add("feedback-visible"), 10);

  if (selected === correct) {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
  }

  nextBtn.classList.add("show"); // reveal without layout jump
}

// Next button
nextBtn.onclick = () => {
  currentQuestion++;
  if (currentQuestion < flags.length) {
    loadQuestion();
  } else {
    // End screen
    feedback.textContent = `🎉 Quiz finished! Final score: ${score}/${flags.length}`;
    feedback.classList.add("feedback-visible");
    nextBtn.classList.remove("show");
    optionsContainer.innerHTML = "";
    flagImg.style.display = "none";
    questionCount.textContent = "";
    restartBtn.style.display = "inline-block";
    if (title) title.style.display = "none";

    if (instructions) {
      instructions.textContent = `🎉 Quiz finished! You scored ${score}/${flags.length} 🎉`;
      instructions.classList.add("final-result");
      instructions.style.display = "block";
    }

    scoreDisplay.style.display = "none";
  }
};

// Restart quiz
restartBtn.onclick = () => fetchFlags();

//  Start quiz
fetchFlags();
