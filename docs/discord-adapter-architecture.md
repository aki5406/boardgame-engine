# Discord Adapter Architecture

このドキュメントは、ITO を Discord から利用するための Adapter 設計メモです。

目的は Discord Bot を実装することではなく、Discord 固有の都合を `@boardgame/engine` や `@boardgame/game-ito` に持ち込まず、Discord 操作を ITO Event と Engine 実行へ変換する境界を整理することです。

## Architecture Proposal

Discord Adapter は `apps/ito-discord` として追加する案を基本とします。

```text
apps/
  ito-cli
  ito-discord

packages/
  engine
  game-ito
  counter-sample
```

`ito-discord` は executable app / adapter として扱います。Discord API、token、interaction、message 表示、Discord user mapping はこの app に閉じ込めます。

`@boardgame/game-ito` は ITO の Event、State、Reducer、Game、helper を提供する game package のままにします。Discord の command や UI component を知りません。

## Dependency Direction

依存方向は次の形を守ります。

```text
@boardgame/ito-discord
          |
          v
@boardgame/game-ito
          |
          v
@boardgame/engine
```

禁止する依存方向:

- `@boardgame/engine -> @boardgame/ito-discord`
- `@boardgame/game-ito -> @boardgame/ito-discord`
- `packages/* -> apps/*`
- Engine / game package から Discord type、Discord user、message、interaction、token を参照すること

## Responsibility Boundary

### Discord Adapter

Discord Adapter は Discord と Engine の間の入出力変換を担当します。

- Slash Command を受け取る。
- Button / Modal などの interaction を受け取る。
- Discord message、embed、ephemeral response、DM を表示する。
- Discord user と Engine player id を対応付ける。
- Discord interaction を `ItoEvent` に変換する。
- Engine session を作成し、Event を適用する。
- 現在の `ItoState` を Discord 表示へ変換する。
- 一時的な in-memory session store を持つ。

### @boardgame/game-ito

`@boardgame/game-ito` は ITO 固有のゲームロジックを担当します。

- ITO Event
- ITO State
- ITO Reducer
- ITO Game definition
- Theme selected event helper
- Number assignment helper
- Order judge helper
- Phase transition

`@boardgame/game-ito` は Discord command、Discord user、message 表示、DM 配布、token、permission を扱いません。

### @boardgame/engine

`@boardgame/engine` はゲームに依存しない最小の実行境界を担当します。

- Game session を開始する。
- Event を reducer に渡す。
- 次の State を返す。

Engine は Discord、ITO 固有 UI、永続化、network、scheduler を扱いません。

## Event Flow

Discord 操作は Adapter で ITO Event に変換してから Engine に渡します。

```text
Discord Interaction
        |
        v
Discord Adapter
        |
        v
ItoEvent
        |
        v
Engine
        |
        v
ItoState
        |
        v
Discord Adapter
        |
        v
Discord Message / DM / Component
```

変換例:

- `/ito start` -> Engine session 作成
- `/ito theme text:...` -> `createItoThemeSelectedEvent(theme)`
- `/ito assign` -> Adapter が数字を用意し、`ito.numbersAssigned`
- Button: discussion start -> `ito.discussionStarted`
- Modal: hint submit -> `ito.hintSubmitted`
- Button: order submission start -> `ito.orderSubmissionStarted`
- Modal / select: order submit -> `ito.orderSubmitted`
- Judge action -> `judgeItoOrder(...)` が返す `ito.resultRevealed`

Reducer は Discord interaction を直接受け取りません。Reducer が受け取るのは常に `ItoEvent` です。

## Session Strategy

現時点では永続化を追加しません。Discord Adapter は in-memory session store を持つ案を基本とします。

想定 key:

- Discord guild id
- Discord channel id
- optional thread id

最小方針:

- 1 channel に 1 active ITO session を置く。
- Adapter が Discord user id と Engine player id の対応表を持つ。
- process restart で session は失われてもよい。
- Database、Redis、Persistence、Scheduler は導入しない。

将来、複数 session、restart recovery、履歴保存が必要になった時点で persistence を検討します。

## Discord UI Boundary

Discord の表示は `ItoState` から Adapter が組み立てます。

- public channel: phase、theme、hints、submitted order、result
- DM: 各 player の assigned number
- ephemeral response: command 実行結果や操作エラー

private information の表示制御は Adapter の責務です。Engine と `game-ito` は Discord の visibility model を知りません。

## Design Decisions

- Discord Adapter は `apps/ito-discord` として追加する案を採用します。
- Discord 固有 type は `apps/ito-discord` 内に閉じ込めます。
- Adapter は Discord interaction を `ItoEvent` に変換する境界になります。
- 最初の session 管理は in-memory に留めます。
- 永続化、Lobby、Matchmaking、Scheduler はこの段階では導入しません。

## Engine / game-ito Feedback

現時点では、Discord Adapter 設計のために Engine または `game-ito` の即時変更は不要です。

### 現状

- Engine は session を開始し、Event を reducer に適用できます。
- `game-ito` は ITO Event、State、Reducer、Game、helper を提供しています。
- CLI Playground で固定シナリオを Engine に流せています。

### 改善案

Discord Adapter 実装で必要性が見えた場合のみ、以下を検討します。

- `EngineGame<State, Event>` や `EngineReducer<State, Event>` の generics。
- Adapter 向けの phase-specific view helper。
- session lookup / update を扱う app-local utility。

### メリット

- 実際の Adapter の圧力を見てから Engine API を拡張できる。
- YAGNI を守り、Engine が Discord 都合で太ることを避けられる。

### デメリット

- Discord 実装初期は Adapter 側で型 narrowing や表示変換を書く必要がある。
- session 管理 helper がないため、最初は app-local な実装が増える可能性がある。

## 今回決めたこと

- Discord Adapter は `apps/ito-discord` に置く案を基本とする。
- 依存方向は `@boardgame/ito-discord -> @boardgame/game-ito -> @boardgame/engine` とする。
- Discord interaction は Adapter で `ItoEvent` に変換する。
- 最初の session 管理は in-memory とし、永続化は入れない。

## 今回決めなかったこと

- discord.js を導入するかどうか。
- Slash Command の具体的な command 名と登録方法。
- Button / Modal / Select menu の詳細 UI。
- Token 管理と deployment 方法。
- Database、Redis、永続化の方式。
- 複数 guild / 複数 channel での session policy の詳細。

## 今後検討すること

- Discord Adapter 実装 PR での最小 command scope。
- assigned number を DM で送る時の失敗時 handling。
- Discord user と Engine player id の安定した mapping。
- private information を安全に表示する Adapter-level view model。
- 実装後に Engine / game-ito API の不足が見えた場合の小さな改善 PR。

## ADR Update

- 更新なし
