# 0001. Use Monorepo

## Status

Accepted

## Context

Engine、複数の Adapter、将来的なゲーム実装を同じリポジトリで管理したい。

## Decision

pnpm Workspace を使ったモノレポ構成を採用する。

## Consequences

- `packages` に再利用可能なコードを置ける。
- `apps` に CLI、Discord、Web などのクライアントを分けて置ける。
- 依存方向を明確に管理する必要がある。
