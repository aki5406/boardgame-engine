# boardgame-engine

boardgame-engine は、複数のクライアントから利用できるボードゲームエンジンを開発するためのプロジェクトです。

Discord Bot を作ること自体が目的ではありません。Discord は最初のクライアントであり、将来的には CLI や Web からも同じエンジンを利用できる構成を目指します。

## Vision

ゲームのルール、状態遷移、プレイヤー操作をクライアントから独立した Engine として表現し、さまざまな UI や実行環境から同じゲーム体験を提供できるようにします。

## Goals

- TypeScript で型安全なボードゲームエンジンの基盤を作る。
- ゲームロジックを Discord、CLI、Web などのクライアントから分離する。
- Event + State Machine を中心に、再現性とテスト容易性の高い設計にする。
- pnpm Workspace によるモノレポ構成で、apps と packages の責務を分ける。
- Vitest、ESLint、Prettier を使って品質を保つ。

## Non Goals

- Discord Bot 専用の実装にすること。
- 初期段階から過度に汎用的なフレームワークを作ること。
- 今回のセットアップで Engine、Event、Reducer、Game クラスを実装すること。
- 今回のセットアップで discord.js を導入すること。

## Roadmap

1. モノレポとドキュメントの土台を整える。
2. Engine の境界、Event、State Machine の設計を具体化する。
3. 最小のゲームを 1 つ選び、Engine の設計を検証する。
4. CLI Adapter を追加して、Engine をクライアント非依存で動かせることを確認する。
5. Discord Adapter を追加し、Discord から同じ Engine を利用する。
6. Web Adapter の可能性を検討する。
