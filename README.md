# 保険診断アプリ MVP

ライフステージや気になる保障など5つの質問に答えるだけで、優先して考えたい保険カテゴリを診断するWebアプリ。HAKONIWA LAB([[subsidy-checker]]・[[sidejob-checker]]・[[career-checker]]と同じアーキテクチャ)の4本目のツール。ビルドツール不要のVanilla HTML/CSS/JS。

保険マンモス・ベビープラネットという、単価の高い(1件11,000〜15,000円)承認済みA8.net案件を主役として活かすために企画。従来はsubsidy-checkerの脇役(PRリンク)としてのみ使われていた。

## ローカルでの動作確認

```
cd insurance-checker
python -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開く。`index.html` を直接ダブルクリックしても動作する(`js/data.js` にデータを埋め込み済みのため `fetch` は使っていない)。

## ファイル構成

```
insurance-checker/
├─ index.html          … 診断フォーム+結果表示のSPA本体
├─ css/style.css        … 他3アプリと同じCSS変数デザインシステム(コピー)
├─ js/
│   ├─ data.js           … INSURANCES配列(data/insurances.jsonのコピー、グローバル変数として埋め込み)
│   ├─ match.js           … タグベースのスコアリングによるマッチングエンジン(純粋関数、DOM非依存)
│   ├─ quiz.js            … 質問フロー・状態管理・DOM描画
│   └─ render.js          … 結果カードのDOM生成
└─ data/insurances.json … データの原本(人間が編集する場所)
```

## データの更新手順

1. `data/insurances.json` を編集する。
2. 編集後、`js/data.js` を更新する:
   ```
   printf 'const INSURANCES = ' > js/data.js
   cat data/insurances.json >> js/data.js
   printf ';\n' >> js/data.js
   ```
3. `node --check js/data.js` で構文チェック。

### tagsフィールドの語彙

- `concern`: `death_coverage`(死亡保障) / `medical_coverage`(医療保障) / `income_protection`(就業不能) / `cancer_coverage`(がん) / `education_savings`(教育費) / `asset_building`(資産形成)
- `life_stage`: `single` / `married_no_kids` / `raising_kids` / `homeowner`(空配列は制限なし)
- `employment_status`: `employee` / `self_employed` / `homemaker` / `student`(空配列は制限なし)
- `age_range`: `20s` / `30s` / `40s_plus`(空配列は制限なし)

### スコアリングとpriorityの向き

`js/match.js`の`scoreInsurance`は`concern`一致を最重要視(+6、subsidy-checkerで判明した加点バランスの教訓を踏襲)し、`life_stage`/`employment_status`/`age_range`で加点する減点なし方式。ハード除外は無い。同点の場合は`priority`の**小さい数字を優先表示**する(1が最優先、career-checkerと同じ向き)。

## マネタイズ導線

各カテゴリの `related_offers` フィールド(`{label, url, type}`形式のオブジェクト配列)に追加すると、結果カードに「PR」バッジ付きボタンが自動表示される(`js/render.js`の`buildOfferLinks`)。2026-07-31初期実装時点で、subsidy-checkerで既に承認済みのA8.net案件2件(保険マンモス・ベビープラネット)を流用。がん保険専門(baby planet)・資産相談(マネードクター)等、他の候補は審査待ち。

`links_to_subsidy_checker: true`のカテゴリは、結果カードに`subsidy-checker`への相対リンク(`../subsidy-checker/`)を表示する(`js/render.js`の`buildCrossLinkBanner`)。特に`income-protection-insurance`(就業不能保険)で`employment_status`が`self_employed`の場合は、「自営業・フリーランスは傷病手当金が対象外」という具体的な文言に出し分ける。

現時点では他3アプリからinsurance-checkerへの逆方向クロスリンクは未実装(必要になれば追加)。

## デプロイ

`insurance-checker/` フォルダをそのまま `hakoniwa-lab` アカウント配下の新規リポジトリ(`hakoniwa-lab/insurance-checker`)にpushし、GitHub Pages(ブランチ`main`・ルート)を有効化する。git commitのauthor設定は、このリポジトリのローカル`git config`で`hakoniwa-lab <309971408+hakoniwa-lab@users.noreply.github.com>`に設定すること(globalのペルソナ設定を変更しない)。
