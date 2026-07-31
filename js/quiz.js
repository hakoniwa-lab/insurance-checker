/*
 * 質問フロー・状態管理・DOM描画。マッチングは match.js、結果描画は render.js に委譲する。
 */

const QUESTIONS = [
  {
    id: "life_stage",
    title: "今のライフステージは？",
    options: [
      { value: "single", label: "独身" },
      { value: "married_no_kids", label: "既婚(子どもなし)" },
      { value: "raising_kids", label: "妊娠中・子育て中" },
      { value: "homeowner", label: "持ち家がある・検討中" },
    ],
  },
  {
    id: "concern",
    title: "一番気になる保障は？",
    options: [
      { value: "death_coverage", label: "万が一の時の家族の生活" },
      { value: "medical_coverage", label: "病気・入院の備え" },
      { value: "income_protection", label: "働けなくなった時の収入" },
      { value: "cancer_coverage", label: "がんへの備え" },
      { value: "education_savings", label: "子どもの教育費" },
      { value: "asset_building", label: "将来の資産形成" },
    ],
  },
  {
    id: "employment_status",
    title: "今の働き方は？",
    options: [
      { value: "employee", label: "会社員" },
      { value: "self_employed", label: "自営業・フリーランス" },
      { value: "homemaker", label: "専業主婦(主夫)" },
      { value: "student", label: "学生" },
    ],
  },
  {
    id: "age_range",
    title: "年齢層は？",
    options: [
      { value: "20s", label: "20代" },
      { value: "30s", label: "30代" },
      { value: "40s_plus", label: "40代以上" },
    ],
  },
  {
    id: "insurance_status",
    title: "今の保険の加入状況は？",
    options: [
      { value: "none", label: "何も入っていない" },
      { value: "unclear", label: "入っているが内容をよく分かっていない" },
      { value: "reviewing", label: "見直したいと思っている" },
    ],
  },
];

const state = { index: 0, answers: {} };

const screens = {
  intro: document.getElementById("screen-intro"),
  quiz: document.getElementById("screen-quiz"),
  result: document.getElementById("screen-result"),
};
const quizCard = document.getElementById("quiz-card");
const progressBar = document.getElementById("progress-bar");
const progressLabel = document.getElementById("progress-label");
const backBtn = document.getElementById("btn-back");
const resultSummaryEl = document.getElementById("result-summary");
const resultListEl = document.getElementById("result-list");

function showScreen(name) {
  Object.keys(screens).forEach((key) => {
    screens[key].hidden = key !== name;
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function renderQuestion() {
  const q = QUESTIONS[state.index];
  progressLabel.textContent = `質問 ${state.index + 1} / ${QUESTIONS.length}`;
  progressBar.style.width = `${Math.round((state.index / QUESTIONS.length) * 100)}%`;
  backBtn.hidden = state.index === 0;

  let html = `<p class="quiz-question">${escapeHtml(q.title)}</p>`;
  html += `<div class="quiz-options">${q.options
    .map((o) => `<button type="button" class="quiz-option" data-value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</button>`)
    .join("")}</div>`;

  quizCard.innerHTML = html;

  quizCard.querySelectorAll(".quiz-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.answers[q.id] = btn.dataset.value;
      goNext();
    });
  });
}

function goNext() {
  if (state.index < QUESTIONS.length - 1) {
    state.index += 1;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function goBack() {
  if (state.index > 0) {
    state.index -= 1;
    renderQuestion();
  }
}

function finishQuiz() {
  progressBar.style.width = "100%";
  const matchResult = matchInsurances(INSURANCES, state.answers);
  renderResults(resultSummaryEl, resultListEl, matchResult, state.answers);
  showScreen("result");
}

function startQuiz() {
  state.index = 0;
  state.answers = {};
  showScreen("quiz");
  renderQuestion();
}

function restartQuiz() {
  showScreen("intro");
}

document.getElementById("btn-start").addEventListener("click", startQuiz);
document.getElementById("btn-back").addEventListener("click", goBack);
document.getElementById("btn-restart").addEventListener("click", restartQuiz);

showScreen("intro");
