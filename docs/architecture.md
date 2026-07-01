# Architecture

boardgame-engine は、Engine core、game package、Adapter app を分けることで、複数のクライアントから同じゲームロジックを利用できる構成を目指します。

## Overview

現在の主要構成は次の通りです。

```text
apps/
  ito-cli

packages/
  engine
  game-ito
  counter-sample
```

`packages/engine` はクライアント非依存の最小 Engine core です。`packages/game-ito` は ITO 固有の Event、State、Reducer、Game 定義を持ちます。`apps/ito-cli` は `game-ito` を CLI から試すための Playground Adapter です。

## Principles

- Engine は Event を受け取り、Reducer を適用し、State を更新する。
- Game package はゲーム固有の Event、State、Reducer、helper を持つ。
- Adapter app は外部入力、表示、実行環境との接続を扱う。
- Reducer は純粋関数として保ち、ランダム性や外部 I/O を入れない。
- Discord、CLI、Web は Adapter であり、Engine の依存先ではない。
- クライアント固有の都合を Engine や game package に持ち込まない。

## Repository Layout

- `apps/*`: CLI、Discord、Web などの実行可能な Adapter app。
- `packages/engine`: Engine core。
- `packages/game-ito`: ITO 固有の game package。
- `packages/counter-sample`: Engine API 検証用の最小サンプル。
- `docs/*`: アーキテクチャ、ロードマップ、設計判断、AI review 方針。

## Dependency Direction

依存方向は上位の Adapter から下位の reusable package へ向けます。

```text
@boardgame/ito-cli
        |
        v
@boardgame/game-ito
        |
        v
@boardgame/engine
```

`packages/*` から `apps/*` へ依存してはいけません。`@boardgame/engine` は ITO、CLI、Discord、Web を知りません。`@boardgame/game-ito` は Engine を利用しますが、CLI や Discord を知りません。

## Runtime Flow

現在の最小フローは次の形です。

```text
EngineEvent
    |
    v
EngineReducer
    |
    v
EngineState
```

ITO では `ItoEvent`、`ItoState`、`ItoReducer` がこの Engine の shape に接続されます。CLI Playground は固定シナリオから ITO Event を作り、Engine に順番に適用し、最終 State を JSON として表示します。

## Current Packages

### @boardgame/engine

- Engine core。
- `EngineEvent`、`EngineState`、`EngineReducer`、`EngineGame`、`EngineGameSession` を提供する。
- Client、Discord、CLI、Web、ITO 固有ルールには依存しない。

### @boardgame/game-ito

- ITO 固有の game package。
- ITO Event、State、Reducer、Game 定義、theme / number assignment / judge helper を提供する。
- Reducer は Event payload を State に反映し、phase を進める。
- ランダム生成、UI、Discord、CLI には依存しない。

### @boardgame/counter-sample

- Engine API を検証するための最小サンプルゲーム。
- Counter の状態遷移を通じて Engine の使い心地を確認する。

### @boardgame/ito-cli

- ITO を CLI から試す Playground Adapter。
- 固定シナリオを Engine に流し、最終 State を表示する。
- 対話式入力、ランダム生成、Discord 連携、本格的な CLI UX はまだ持たない。

## Documentation Notes

README とこのドキュメントは、将来構想ではなく現在の実装を説明します。未実装の Adapter や基盤は Roadmap または今後検討事項として扱い、実装済みのようには書きません。

Discord Adapter の設計案は [Discord Adapter Architecture](./discord-adapter-architecture.md) に記録しています。
