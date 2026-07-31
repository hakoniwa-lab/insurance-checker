/*
 * マッチングエンジン。DOM・windowの状態には触れない純粋関数のみで構成する
 * (将来React等へ移植する際にロジックだけ持っていけるようにするため)。
 */

function scoreInsurance(item, answers) {
  const tags = item.tags || {};
  let score = 0;

  // 一番気になる保障: 最重要視
  const concernTags = tags.concern || [];
  if (concernTags.includes(answers.concern)) {
    score += 6;
  }

  // ライフステージ: 指定なしのカテゴリは誰にでも加点
  const lifeStageTags = tags.life_stage && tags.life_stage.length > 0 ? tags.life_stage : [];
  if (lifeStageTags.length === 0 || lifeStageTags.includes(answers.life_stage)) {
    score += 3;
  }

  // 働き方: 指定なしのカテゴリは誰にでも加点
  const empTags = tags.employment_status && tags.employment_status.length > 0 ? tags.employment_status : [];
  if (empTags.length === 0 || empTags.includes(answers.employment_status)) {
    score += 2;
  }

  // 年齢層: 指定なしのカテゴリは誰にでも加点
  const ageTags = tags.age_range && tags.age_range.length > 0 ? tags.age_range : [];
  if (ageTags.length === 0 || ageTags.includes(answers.age_range)) {
    score += 1;
  }

  return Object.assign({}, item, { score });
}

/**
 * @param {Array} insurances - data.js の INSURANCES 配列
 * @param {Object} answers - quiz.js が集めた回答オブジェクト
 * @returns {{ results: Array, relaxed: boolean }}
 */
function matchInsurances(insurances, answers) {
  const scored = insurances.map((i) => scoreInsurance(i, answers));
  // priorityは小さい数字ほど優先表示(1が最優先)
  scored.sort((a, b) => b.score - a.score || (a.priority || 99) - (b.priority || 99));
  return { results: scored, relaxed: false };
}
