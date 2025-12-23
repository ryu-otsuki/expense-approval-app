# Expense Approval App (MVP)

経費申請・承認フローを題材にした、Nuxt 3 + TypeScript の学習用 MVP アプリです。

UIの見た目や機能数よりも、  
**業務アプリをどう分解し、どこにルールを置き、どう変更に強く設計するか**  
を重視しています。

本リポジトリは「完成品」ではなく、  
**設計と実装をセットで説明できること**を目的としています（面接・レビュー想定）。

---

## 1. Purpose / Scope（目的とスコープ）

このアプリでは、業務アプリでよくある以下の構造を最小構成で扱います。

- 申請者が経費を作成・提出する
- 承認者が申請を承認／却下する
- 状態やロールによって、可能な操作が変わる

一方で、以下は **意図的にスコープ外** としています。

- 実DBとの接続
- 認証・認可の本実装
- UIデザインの作り込み

まずは  
**「設計 → ドメイン定義 → UI反映」**  
という流れを明確にすることを優先しています。

---

## 2. App Overview（アプリ概要）

- フロントエンドのみで構成された SPA
- API / DB はモック実装
- 状態遷移・権限制御を中心に設計

現在は以下を確認できます。

- 状態に応じて表示される操作が変わる
- ロールによって実行できる操作が変わる
- UI側に業務ルールを持たない構成

---

## 3. Screens & Routing（画面とルーティング）

| 画面     | パス                 | 内容             |
| -------- | -------------------- | ---------------- |
| Home     | `/`                  | アプリ概要       |
| 申請一覧 | `/requests`          | 申請の一覧表示   |
| 申請詳細 | `/requests/:id`      | 内容確認・操作   |
| 申請作成 | `/requests/new`      | 下書き作成       |
| 申請編集 | `/requests/:id/edit` | 下書きのみ編集可 |

画面は **状態を表示するだけ** に留め、  
「何ができるか」の判断はドメイン側に委ねています。

---

## 4. Domain Model（ドメインモデル）

### Request（経費申請）

```ts
type ExpenseRequest = {
  id: string
  title: string
  amountYen: number
  status: RequestStatus
  createdAt: string
}
```

### Role（操作主体）

- applicant：申請者
- approver：承認者

### Status（状態）

- draft
- submitted
- approved
- rejected

## 5. Status Transition（状態遷移設計）

状態遷移は ロール × 現在ステータス で定義しています。

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

### 設計意図

- UI に if 文で業務ルールを書かない
- 状態遷移の全体像を1か所で把握できる
- 将来の状態追加・ロール追加に対応しやすい

UI は「次に遷移できる状態の一覧」を受け取ってボタンを描画するだけの責務にしています。



## アーキテクチャ（レイヤ分離）

このアプリは、業務アプリ開発で重要になる「責務の分離」を学ぶために、以下のレイヤで構成しています。

- **UI（pages/components）**
  - 表示とユーザー操作（クリック、入力、遷移）だけを担当
  - **業務ルールは持たない**
  - **データ取得や更新は composable を経由する**

- **Application Layer（composables）**
  - UI から使われる “窓口”
  - 以下を担当する
    - 状態（state）の保持（`useState`）
    - API 呼び出し（`$fetch` / API client）
    - UI が使いやすい形への整形（例：読み込み保証、エラー正規化）
  - **業務ルール判断（可否判定・遷移判定）は domain/service に寄せる**

- **Domain（domain / domain/services）**
  - 業務の用語（型）とルール（判断）を担当
  - Nuxt / Vue / HTTP / DB などの技術依存を持たない（純TS）
  - 例：
    - Role / Status / Request の定義
    - 状態遷移の可否判定、編集/削除可否の判定

- **API（server/api）**
  - HTTP の入口
  - リクエストを受け、domain/service に判断を委譲し、結果を返す
  - NotFound / Forbidden / Conflict などの HTTP エラーへ変換する

### データフロー（基本）
UI は composable だけを見ることで動きます。

`UI → composable → domain/service → API → (store)`

- UI：ボタン押下・フォーム入力
- composable：state 更新 / API 呼び出し / エラー整形
- domain/service：業務的に正しいかを判断
- API：HTTP として返す（ステータスコード・レスポンス）

### 例（業務ルールは domain/service に閉じる）
- 「このロールでこの状態から遷移できるか？」
- 「draft 以外は編集できない」
- 「承認者は削除できない」

これらは UI/composable に散らさず、domain/service の関数で一元管理します。

## 6. Authorization & Rules（権限・操作ルール）

編集・削除などの操作可否も、ドメイン側の関数として定義しています。

```ts
canEdit(role, status)
canDelete(role, status)
```

これにより、

- UIで権限制御ロジックが散らばらない
- API実装時も同じルールを再利用できる
- テストしやすい構造になる

というメリットがあります。

## 7. Data Flow（データフロー）

```ts
UI (pages)
  ↓
Composable (useRequests)
  ↓
API (server/api)
  ↓
Store (in-memory mock)
```

### ポイント

- UI は API の詳細を知らない
- API を差し替えても UI はほぼ変更不要
- UIを触らずにAPI差し替えできる構成

この構造により、将来的に 実API / DB に移行する前提の設計 になっています。

## 8. Testing & CI（テストとCI）

- 状態遷移ルールはテストで検証
- GitHub Actions で CI 実行
- ルール変更時に破壊的変更を検知可能

## 9. Development Flow（開発フロー）

- Issue 起点で設計・実装
- 1 Issue = 1 Pull Request
- PR マージ時に Issue をクローズ
- GitHub Projects（Kanban）で進捗管理

設計意図が Issue / PR に残ることを重視しています。

## 10. Setup（起動方法）

```ts
npm install
npm run dev
```

http://localhost:3000 にアクセス。

## 11. Lint / Format

```bash
npm run lint
npm run format
```

## 12. Future Improvements（今後の拡張）

- 実API / DB 接続
- 認証・認可の実装
- バリデーション強化
- エラーハンドリング整理
- UI / CSS の整理
