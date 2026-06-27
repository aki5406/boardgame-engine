# Architecture

boardgame-engine は、Engine を中心に複数のクライアントから利用できる構成を目指します。

## Principles

- Engine はゲームルールと状態遷移を扱う。
- Adapter は外部クライアントとの入出力を扱う。
- Discord は最初の Adapter であり、Engine の依存先ではない。
- State は Event によって遷移する。
- クライアント固有の都合を Engine に持ち込まない。

## Repository Layout

- `packages/*`: Engine、共通型、ゲーム実装、テスト支援などの再利用可能なパッケージ。
- `apps/*`: CLI、Discord、Web などの実行可能なアプリケーション。
- `docs/*`: アーキテクチャ、ロードマップ、設計判断の記録。

## Dependency Direction

依存方向は `apps -> packages` を基本とします。

`packages` はクライアント非依存であるべきです。`packages` から `apps` に依存してはいけません。

## Future Shape

将来的には、Engine が Event を受け取り State を更新し、Adapter が各クライアントの入力と出力を Engine の形式に変換する構成を目指します。
