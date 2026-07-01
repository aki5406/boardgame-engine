# boardgame-engine

boardgame-engine は、複数のクライアントから利用できるボードゲームエンジンを育てるための TypeScript monorepo です。

このプロジェクトの目的は Discord Bot そのものを作ることではありません。Discord、CLI、Web などのクライアントは Adapter として扱い、ゲームルールと状態遷移はクライアント非依存の package に閉じ込めます。

## Vision

ゲームのルール、Event、State、Reducer、Game 定義を UI や実行環境から分離し、同じ Engine と game package を複数の Adapter から利用できる構成を目指します。

現在は Engine、ITO game package、ITO CLI Playground があり、Discord Adapter へ進む前に CLI から最小フローを確認できる状態です。

## Goals

- TypeScript で型安全なボードゲーム Engine の基盤を作る。
- Event Driven な State Machine としてゲーム進行を表現する。
- Reducer を純粋関数として保ち、外部入力やランダム性を Reducer の外に置く。
- ゲームロジックを Discord、CLI、Web などの Adapter から分離する。
- pnpm Workspace による monorepo 構成で `apps/*` と `packages/*` の責務を分ける。
- 小さな PR を積み重ね、実ゲームから Engine API を検証する。

## Non Goals

- Discord 専用 Engine にすること。
- UI、Discord、CLI の都合を Engine や game package に持ち込むこと。
- 初期段階から Lobby、SessionManager、Persistence、Scheduler などの大きな基盤を作ること。
- 本格的な CLI UX、Web UI、Discord Bot をこの段階で完成させること。
- npm publish 設定や配布用 package 整備を行うこと。

## Package Structure

現在の workspace 構成は次の通りです。

```text
boardgame-engine

apps/
  ito-cli          # ITO の固定シナリオを CLI から実行する Playground

packages/
  engine           # クライアント非依存の Engine core
  game-ito         # ITO 固有の Event / State / Reducer / Game
  counter-sample   # Engine API 検証用の最小サンプルゲーム

docs/
  decisions/       # ADR
```

## Dependency Direction

依存方向は `apps -> packages -> engine` を基本にします。

```text
@boardgame/ito-cli
        |
        v
@boardgame/game-ito
        |
        v
@boardgame/engine
```

`apps/*` は実行環境や Adapter の責務を持ちます。`packages/*` は再利用可能な Engine や game package の責務を持ちます。

`@boardgame/engine` は CLI、Discord、Web、ITO 固有ルールに依存しません。`@boardgame/game-ito` は Engine に依存しますが、CLI や Discord には依存しません。`@boardgame/ito-cli` は Adapter として `@boardgame/game-ito` を利用します。

## Development Philosophy

- Engine First: Engine はゲーム進行の最小共通基盤として扱う。
- Event Driven: ゲーム進行は Event と State の遷移として表現する。
- Pure Reducer: Reducer は State と Event から次の State を返す純粋な処理に寄せる。
- UI Independent: CLI、Discord、Web の都合を Engine や game package に入れない。
- Adapter Boundary: 入出力、表示、ユーザー操作、外部サービス連携は `apps/*` に置く。
- YAGNI: 今必要な最小構成に留める。
- Small PR: 設計を一度に大きく進めず、小さな PR で検証する。
- Game Driven Validation: Counter Sample や ITO を通じて Engine API の使い心地を確認する。

## Current Status

- `@boardgame/engine` は Event を受け取り Reducer を適用して State を更新できます。
- `@boardgame/game-ito` は ITO の最小 Event / State / Reducer / Game と helper を持ちます。
- `@boardgame/ito-cli` は固定シナリオを使って ITO の最小フローを CLI から実行できます。

CLI Playground は次のコマンドで実行できます。

```sh
pnpm ito:playground
```

## Roadmap

1. ITO CLI Playground で Engine / game-ito API の使い心地を検証する。
2. 必要な不足が見えた場合のみ、小さな PR で Engine または game-ito を改善する。
3. Discord Adapter を追加し、Discord から同じ game-ito を利用できるか確認する。
4. 必要に応じて Web Adapter や他ゲームへの展開を検討する。
