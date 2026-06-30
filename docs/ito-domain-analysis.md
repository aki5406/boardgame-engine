# ITO ドメイン分析

このドキュメントは、ITO を実装する前にゲームをドメインとして分析するためのものです。

目的は、ITO を構成する概念・ルール・状態遷移を整理し、現在の Engine API の上でどのように表現できるかを確認することです。このドキュメントでは、コード、Event、State、Reducer、Adapter、Engine の変更は追加しません。

## 参照

- [ito - ArclightGames Official](https://arclightgames.jp/product/ito/)

公式ページでは、ITO は「数字を口にしたらアウト」という制限の中で、テーマに沿った表現を使い、全員で小さい順にカードを出す会話ゲームとして説明されています。

この分析では、まず完全協力型の基本フローに絞ります。協力と裏切りのルール、複数ステージ、ライフ、追加カードなどの詳細ルールは、最初の実装では必要になるまで扱いません。

## ITO Domain Model

### Theme

数字をヒントに変換するための共有された尺度です。

例:

- 人気の食べ物
- 動物の大きさ
- 高そうなもの

責務:

- 低い数字と高い数字が何を意味するかを round に与える。
- player が数字を直接言わずに相対的な大きさを表現できるようにする。
- Engine ではなく ITO の概念として扱う。

### Number Card

round ごとに player に配られる秘密の数字です。

責務:

- player が直接言えない真の値を表す。
- reveal されるまでは他 player から隠される。
- judge 時に reveal order が昇順かどうかを判定するために使われる。

### Player Hand

engine-domain の `EnginePlayer` と ITO の `Number Card` を結びつける概念です。

責務:

- player と hidden number card を対応付ける。
- card が reveal 済みかどうかを保持する。
- 認証、Discord user、CLI user、UI 表示名は扱わない。

### Hint

player が theme に沿って、自分の number card を間接的に表現したものです。

責務:

- number を直接言わずに相対的な値を伝える。
- player と round に紐づく。
- 後続実装で必要になった場合のみ、編集や再提出の扱いを決める。

### Round

1 つの theme と 1 セットの number cards で行われる 1 回分の挑戦です。

責務:

- 選ばれた theme を持つ。
- round 中の player hands を持つ。
- hints と reveal progress を持つ。
- judge 後に result を生成する。

### Reveal Order

player が card を reveal した順序です。

責務:

- group の最終回答を表す。
- number card の昇順と比較される。
- Engine ではなく ITO 固有の game state として扱う。

### Result

round の判定結果です。

責務:

- 成功または失敗を記録する。
- 必要であれば expected order と actual reveal order を持つ。
- 必要であれば失敗位置を持つ。

### Game Settings

ITO session の設定です。

将来的に含み得るもの:

- number range
- round count
- theme list
- variant rules

最初の実装では、選んだ最小フローに必要なものだけに絞ります。

## State Flow

最初の ITO 実装では、小さな明示的 phase model として扱うのが自然です。

```text
WaitingForPlayers
  |
  v
ThemeSelected
  |
  v
CardsDistributed
  |
  v
HintsSubmitted
  |
  v
Revealing
  |
  v
Judged
  |
  v
Finished
```

### WaitingForPlayers

session は存在するが、round を開始する準備がまだ整っていない状態です。

含み得る state:

- players

### ThemeSelected

round の theme が選ばれた状態です。

含み得る state:

- players
- current round
- theme

### CardsDistributed

各 player に hidden number card が配られた状態です。

含み得る state:

- players
- theme
- player hands

### HintsSubmitted

player が hidden card に対する hint を出した状態です。

含み得る state:

- players
- theme
- player hands
- hints

### Revealing

group が選んだ順序で card を reveal している状態です。

含み得る state:

- players
- theme
- player hands
- hints
- reveal order

### Judged

reveal order が number card の昇順と比較され、判定された状態です。

含み得る state:

- players
- theme
- player hands
- hints
- reveal order
- result

### Finished

game または round sequence が完了した状態です。

含み得る state:

- final result
- completed rounds

## Engine と ITO の責務

### Engine の責務

現在の Engine は小さく保つべきです。

- generic な event application boundary を提供する。
- 1 つの `EngineGame` を持つ。
- session snapshot を開始する。
- game reducer を呼び出して event を適用する。
- 次の session snapshot を返す。

Engine は ITO 固有の phase、theme、number card、hint、reveal order、judge rule を知るべきではありません。

### ITO の責務

ITO は実際のゲームルールを持ちます。

- theme を選択または受け取る。
- hidden number cards を配る。
- player hands を管理する。
- hints を記録する。
- reveal order を記録する。
- reveal order が昇順かどうかを judge する。
- round / game result を生成する。
- 各 phase でどの event が有効かを決める。

### Adapter の責務

Adapter はこの分析 PR の範囲外です。

将来的な Adapter は以下を担当し得ます。

- user command を受け取る。
- current state を表示する。
- 各 player の number card を本人以外に隠して表示する。
- 外部 user identity を `EnginePlayer.id` に変換する。

Adapter は ITO の judge rule や state transition rule を持つべきではありません。

## Engine Feedback

### Engine に足りないかもしれないもの

以下は観察結果であり、この PR では追加しません。

#### Game-specific State/Event Typing

ITO では game-specific な state / event typing が欲しくなる可能性があります。

現在の `EngineState` と `EngineEvent` は意図的に汎用 shape です。Counter と初期 ITO の探索には十分ですが、ITO では複数の event kind と phase-specific state shape が出てくる見込みです。さらに別のゲームでも同じ圧力が出たら、`EngineGame<State, Event>` や `EngineReducer<State, Event>` のような generic support を検討してよさそうです。

ただし、現時点では Counter と ITO の 2 例だけなので、Rule of Three に従ってまだ追加しません。

#### Event Validity Boundary

ITO には phase によって有効な event が変わる性質があります。たとえば、hint 提出前に reveal する event は無効になりそうです。

現在の Engine は error model を持たず、reducer を呼ぶだけです。最初の ITO 実装では reducer が validity を扱えば十分です。後続で、invalid event を structured result として返すのか、throw するのか、無視するのかを決める必要があります。

#### Private Information

ITO では hidden number card が必要です。Engine が private visibility rule を知るべきではありませんが、Adapter は将来的に player-specific view を表示する必要があります。

これはまず Adapter / View の責務として扱い、Engine concept にはしないのが自然です。

### Engine が過剰かもしれないもの

現時点の Engine concept に、ITO から見て過剰なものはありません。

- `EngineGame` は ITO game definition と自然に対応する。
- `EngineReducer` は ITO state transition と自然に対応する。
- `EngineGameSession` は 1 回分の ITO play session と自然に対応する。
- `EnginePlayer` は hidden card や hint を player と対応付けるために有用。
- `startSession` が players を要求することも ITO では自然。

## 今回決めたこと

- ITO 固有概念は Engine ではなく ITO game package に置く。
- ITO は明示的な phase model で表現できそう。
- hidden number cards、hints、reveal order、judging は ITO の責務。
- Engine は generic な event-to-state transition runner のままにする。
- 最初の ITO 実装前に Engine 変更は不要。

## 今回決めなかったこと

- ITO state / event の正確な TypeScript 型。
- event 名。
- reducer 実装。
- 最初の実装で multiple rounds を扱うか。
- theme をどう選ぶか、どう保存するか。
- number cards をどう shuffle / generate するか。
- invalid event をどう表現するか。
- Adapter が private information をどう表示するか。

## 今後検討すること

- 最初の ITO 実装は one round only にするか。
- phase-specific state を discriminated union で表現するか。
- `EngineGame` / `EngineReducer` に generics が必要か。
- invalid event を ignore / reject / structured error のどれで扱うか。
- Engine を adapter-aware にせず player-specific private view をどう表現するか。
- executable examples が増えた段階で sample games を `examples/*` に移すか。

## ADR Update

- [x] 更新なし
- [ ] 更新あり（理由を記載）

この PR は game-domain analysis を記録するだけであり、新しい architecture decision や Engine 方針の変更は含まないため ADR は更新しません。
