# Roadmap

## Phase 1: Foundation

- pnpm Workspace のモノレポ構成を作る。
- TypeScript、Vitest、ESLint、Prettier の基本設定を用意する。
- アーキテクチャと設計判断を文書化する。

## Phase 2: Engine Design

- Engine の責務と境界を定義する。
- Event と State Machine の設計方針を決める。
- テストしやすい状態遷移モデルを検討する。

## Phase 3: First Game

- 小さなボードゲームを 1 つ選ぶ。
- 実装から必要な抽象化を見極める。
- Rule of Three に従って、汎用化を急がない。

## Phase 4: Adapters

- CLI Adapter で Engine のクライアント非依存性を確認する。
- Discord Adapter を追加する。
- Web Adapter の導入可能性を検討する。
