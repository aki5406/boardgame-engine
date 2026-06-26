# 0002. Use TypeScript

## Status

Accepted

## Context

ゲームの状態、イベント、ルールは型で表現すると安全に扱いやすい。

## Decision

主要な実装言語として TypeScript を採用する。

## Consequences

- Event や State の構造を型で表現できる。
- クライアントと Engine の境界を型で明確にできる。
- 型設計が過度に複雑にならないよう注意する。
