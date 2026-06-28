# AGENTS.md

このリポジトリで作業するエージェントは、以下の方針を守ってください。

## Working Style

- 人間が WHAT、つまり何を作るかを決める。
- Codex は HOW、つまりどう作るかを提案する。
- アーキテクチャに関する議論を歓迎する。
- 前提には敬意を持って疑問を投げかける。

## Core Rules

- Engine First: まず再利用可能なボードゲームエンジンとして設計する。
- Discord は Adapter として扱う。
- ゲームロジックは Discord に依存しない。
- ゲームは Event + State Machine を基本とする。
- 早すぎる抽象化は避ける。
- Rule of Three を採用する。同じ形の要求が 3 回現れるまでは、過度に一般化しない。
- packages から apps に依存してはいけない。

## Dependency Direction

- `packages/*` はエンジン、必要性が明確な共通型、ユーティリティなどの再利用可能な単位を置く。
- `apps/*` は CLI、Discord、Web などのクライアントやアプリケーションを置く。
- `apps/*` は `packages/*` に依存してよい。
- `packages/*` は `apps/*` に依存してはいけない。

## Implementation Notes

- Discord 固有の入出力、認証、メッセージ処理は Adapter 層に閉じ込める。
- Engine は入力 Event を受け取り、State を遷移させ、結果を返すことを中心に考える。
- 新しい抽象化は、実際のゲームやクライアント実装から必要性が見えた後に導入する。
