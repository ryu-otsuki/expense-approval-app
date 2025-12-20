# Expense Approval App (MVP)

経費申請・承認フローを題材にした、Nuxt 3 + TypeScript の学習用MVPアプリです。  
UI実装だけでなく、**ドメインモデル・状態遷移・ロールによる操作制御**を意識した設計を重視しています。

本リポジトリは「完成品」を目的とせず、  
**業務アプリをどう分解し、どう設計して実装するか**が伝わることを目的としています。

---

## 概要
申請者が経費を申請し、承認者が内容を確認・承認／却下する、  
業務アプリでよくある構造を最小構成（MVP）で再現しています。

現在は API や DB は未接続で、  
モックデータを用いた UI 表示・操作確認までを実装しています。

---

## 実装済み機能
- Home ページ（`/`）
- 申請一覧ページ（`/requests`）
- 経費申請のドメインモデル定義
- 申請ステータス管理（draft / submitted / approved / rejected）
- ステータス日本語ラベルの型安全な管理
- ロール（申請者 / 承認者）ごとの操作出し分け（モック）
- Issue / Pull Request ベースの開発フロー

---

## 設計方針

### ドメインと UI の分離
申請の状態・ロール・状態遷移ルールは `app/domain` に集約し、  
UI 側はそれを参照するだけの構成にしています。

```ts
export const STATUS_TRANSITIONS = {
  applicant: {
    draft: ['submitted'],
    submitted: [],
    approved: [],
    rejected: [],
  },
  approver: {
    draft: [],
    submitted: ['approved', 'rejected'],
    approved: [],
    rejected: [],
  },
} as const
```

これにより以下を実現しています。

- 業務ルールが UI に散らばらない
- 状態やロール追加時の影響範囲を限定できる
- UI 実装前に設計を固められる

---

## 状態遷移の扱い（現在はモック）

ロールごとに「次に遷移できる状態」を定義し、  
UI はその定義を元に操作可能なボタンのみを表示しています。

実際の状態更新処理や API 連携は未実装で、  
設計と UI 表現の確認を優先しています。

---

## ディレクトリ構成（抜粋）

```txt
app/
├─ domain/
│  └─ request.ts
├─ mocks/
│  └─ requests.ts
├─ pages/
│  ├─ index.vue
│  └─ requests/
│     └─ index.vue
└─ app.vue
```
## 技術スタック

- Nuxt 3
- Vue 3（Composition API / script setup）
- TypeScript
- GitHub Issues / Pull Requests / Projects

---

## 開発フロー

- Issue を起点にブランチ作成
- 1 Issue = 1 Pull Request を基本
- PR マージ時に Issue をクローズ
- GitHub Projects（Kanban）で進捗管理

---

## 起動方法

```bash
npm install
npm run dev
```
ブラウザで以下にアクセスします。

http://localhost:3000

## 今後の拡張予定

- ステータス更新処理の実装

- ロール切り替え（ログイン想定）

- API / バックエンド連携

- バリデーション

- UI / CSS の整理
