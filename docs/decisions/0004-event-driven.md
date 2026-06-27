# 0004. Event Driven

## Status

Accepted

## Context

ボードゲームでは、プレイヤーの行動、ターン進行、判定結果を再現可能な形で扱いたい。

## Decision

ゲームは Event + State Machine を基本として設計する。

## Consequences

- 状態遷移をテストしやすくなる。
- ゲーム進行の履歴を追いやすくなる。
- Event や State Machine の実装は、必要性が明確になってから行う。
