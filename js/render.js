/*
 * 結果カードのDOM生成。マッチングスコアやタグから見た目を組み立てるだけで、
 * データ取得・状態管理には関与しない。
 */

function starRating(score) {
  if (score >= 9) return "★★★";
  if (score >= 6) return "★★☆";
  return "★☆☆";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function buildOfferLinks(item) {
  const offers = item.related_offers || [];
  if (offers.length === 0) return "";
  return offers
    .map(
      (o) =>
        `<a class="result-card__link result-card__link--offer" href="${escapeHtml(o.url)}" target="_blank" rel="noopener sponsored">${escapeHtml(o.label || "関連サービスを見る")}<span class="badge badge--pr">PR</span></a>`
    )
    .join("");
}

function buildCrossLinkBanner(item, answers) {
  if (!item.links_to_subsidy_checker) return "";
  if (item.id === "income-protection-insurance" && answers && answers.employment_status === "self_employed") {
    return `<a class="cross-link-banner" href="../subsidy-checker/">自営業・フリーランスの方は傷病手当金が対象外です。使える公的制度を給付金・補助金診断で確認する →</a>`;
  }
  return `<a class="cross-link-banner" href="../subsidy-checker/">関連する公的な給付金・助成制度があるかもしれません。給付金・補助金診断で確認する →</a>`;
}

function buildResultCard(item, answers) {
  const badges = [`<span class="badge">${escapeHtml(item.category)}</span>`, `<span class="badge badge--accent">マッチ度 ${starRating(item.score)}</span>`];

  return `
    <article class="result-card">
      <div class="result-card__badges">${badges.join("")}</div>
      <h3 class="result-card__name">${escapeHtml(item.name)}</h3>
      <p class="result-card__benefit">${escapeHtml(item.feature_text)}</p>
      <p class="result-card__org">${escapeHtml(item.fit_text)}</p>
      <p class="result-card__summary">${escapeHtml(item.summary)}</p>
      <p class="result-card__conditions">${escapeHtml(item.conditions_text)}</p>
      <div class="result-card__actions">
        ${buildOfferLinks(item)}
      </div>
      ${buildCrossLinkBanner(item, answers)}
    </article>
  `;
}

/**
 * @param {HTMLElement} summaryEl
 * @param {HTMLElement} listEl
 * @param {{results: Array, relaxed: boolean}} matchResult
 * @param {Object} answers
 */
function renderResults(summaryEl, listEl, matchResult, answers) {
  const { results } = matchResult;

  if (results.length === 0) {
    summaryEl.innerHTML = `
      <p class="result-summary__count">条件に合う保険カテゴリが見つかりませんでした</p>
      <p class="result-summary__note">回答内容を変えて、もう一度お試しください。</p>
    `;
    listEl.innerHTML = `<div class="result-empty">該当するカテゴリがありませんでした。「もう一度診断する」からやり直せます。</div>`;
    return;
  }

  summaryEl.innerHTML = `
    <p class="result-summary__count">あなたに合いそうな保険カテゴリが ${results.length} 件見つかりました</p>
    <p class="result-summary__note">マッチ度が高い順に表示しています。</p>
  `;

  listEl.innerHTML = results.map((i) => buildResultCard(i, answers)).join("");
}
