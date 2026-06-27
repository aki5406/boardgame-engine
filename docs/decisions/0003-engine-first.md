# 0003. Engine First

## Status

Accepted

## Context

このプロジェクトの目的は Discord Bot ではなく、複数のクライアントから利用できるボードゲームエンジンを作ることである。

## Decision

Engine First の方針を採用する。Discord は Engine を利用する Adapter の 1 つとして扱う。

## Consequences

- ゲームロジックは Discord に依存しない。
- CLI や Web など別のクライアントを追加しやすくなる。
- Adapter と Engine の境界を継続的に見直す必要がある。
