# con-oo-nihao-haha-1 - Review

## Review 结论

本仓库完成了把 Game/Sudoku 通过 store adapter 接入 Svelte 主流程的基础工作，界面输入与撤销/重做也确实会调用领域对象；但整体仍不达标，最关键的阻塞点是 `Sudoku` 没有真正承担数独规则与校验语义，题面 givens、冲突判定、胜负判定等核心业务仍散落在 store/UI 一侧，且 `Game` 还直接暴露可变 `Sudoku` 使历史边界可以被绕过，因此领域对象尚未成为设计上正确且可维护的业务核心。

## 总体评价

| 维度 | 评价 |
| --- | --- |
| OOP | fair |
| JS Convention | fair |
| Sudoku Business | poor |
| OOD | poor |

## 缺点

### 1. Sudoku 没有封装数独校验与合法性语义，只是二维数组写入器

- 严重程度：core
- 位置：src/domain/Sudoku.js:25-44; src/node_modules/@sudoku/stores/grid.js:136-181; src/node_modules/@sudoku/stores/game.js:7-18
- 原因：`createSudoku` 只做深拷贝并在 `guess` 中直接 `grid[row][col] = value`，没有固定题面、取值范围、行列宫冲突校验、完成判定等领域规则；相反，冲突检测与胜利判定被放在 `invalidCells` 和 `gameWon` 这些 store 派生逻辑里完成。作业明确要求重点关注数独业务语义和 `Sudoku` 的校验职责，这一项没有建模到领域对象里。

### 2. Game 直接泄漏可变 Sudoku，Undo/Redo 历史边界可被绕过

- 严重程度：core
- 位置：src/domain/Game.js:16-17; src/domain/Sudoku.js:42-44
- 原因：`getSudoku()` 直接返回内部 `_current`，而 `Sudoku.guess()` 又是公开可变方法，外部代码可以通过 `game.getSudoku().guess(...)` 直接改盘面而不经过 `Game.guess()`。评审时做了本地小实验，格子变化后 `canUndo()` 仍为 `false`，说明历史没有记录下来。既然 `Game` 的职责是管理统一操作入口和历史，这个 API 设计会破坏它自己的不变量。

### 3. 题面 givens 被放在 store 外部，领域对象无法判断哪些格子不可修改

- 严重程度：core
- 位置：src/node_modules/@sudoku/stores/grid.js:11-18; src/node_modules/@sudoku/stores/grid.js:43-48; src/node_modules/@sudoku/stores/keyboard.js:6-10
- 原因：原始题面被单独存放在 `_grid`，`Game/Sudoku` 只持有当前盘面；某格是否可编辑，是 `keyboardDisabled` 通过 `$grid[$cursor.y][$cursor.x] !== 0` 在 store/UI 层判断的，不是领域对象自己判断的。这样一来，题面不可改这条核心数独规则没有进入领域模型，领域层本身也无法阻止对预填格的修改。

### 4. 序列化接口没有进入真实游戏流程，当前进度与历史无法在 UI 中恢复

- 严重程度：major
- 位置：src/domain/Game.js:96-99; src/node_modules/@sudoku/game.js:13-34
- 原因：虽然实现了 `createGameFromJSON` / `createSudokuFromJSON`，但真实启动流程只有 `startNew` 和 `startCustom`，分别走 `grid.generate` 与 `grid.decodeSencode`；`src/` 下没有任何实际代码消费恢复接口。作业要求重点关注序列化和真实接入，这里更像是“为测试准备了接口”，而不是把序列化纳入真实使用流程。

### 5. 设计文档与仓库现状存在关键不一致，影响作业答辩可信度

- 严重程度：major
- 位置：DESIGN.md:23-25; DESIGN.md:42-63; README.md:8-10
- 原因：`DESIGN.md` 把 `Sudoku` 描述成负责校验的领域实体，并把 View 消费关系写得比实际更“领域化”；但真实代码里校验和胜负判断主要在 store。与此同时，`README.md` 仍写着 Undo/Redo 未完成。作业明确要求在文档中清楚说明 View 如何消费领域对象、为什么会更新，当前文档与实现混杂了对和不对的说法。

## 优点

### 1. 领域对象入口与课程测试契约基本齐全

- 位置：src/domain/index.js:1-2; src/domain/Sudoku.js:25-92; src/domain/Game.js:87-99
- 原因：仓库提供了 `createSudoku`、`createSudokuFromJSON`、`createGame`、`createGameFromJSON` 四个工厂函数，`Sudoku` 也具备 `clone`、`toJSON`、`toString` 等接口，至少满足了课程给出的基础合同。

### 2. Svelte 主交互已经通过 store adapter 转发到 Game

- 位置：src/node_modules/@sudoku/stores/grid.js:32-48; src/components/Controls/Keyboard.svelte:10-25; src/components/Controls/ActionBar/Actions.svelte:44-52
- 原因：键盘输入不会直接改组件内局部数组，而是通过 `userGrid.set` 进入 `currentGame.guess`；撤销/重做按钮也调用了 `undo`/`redo` 再同步回 store。就“真实接入”这一条的最表层链路而言，确实比只在测试里有领域对象前进了一步。

### 3. 快照式历史在正常操作入口上形成了完整撤销/重做链路

- 位置：src/domain/Game.js:24-31; src/domain/Game.js:36-60
- 原因：`guess` 后会截断 redo 分支、追加克隆快照并推进索引，`undo`/`redo` 再通过快照恢复当前盘面，`canUndo`/`canRedo` 也为 UI 提供了可用状态。这个基本机制本身是清晰的。

### 4. Sudoku 对外部数组别名做了防御性处理

- 位置：src/domain/Sudoku.js:9-10; src/domain/Sudoku.js:34-35; src/domain/Sudoku.js:50-59
- 原因：创建、读取、序列化时都做了二维数组复制，`clone()` 也返回独立实例，避免了最直接的共享嵌套数组污染问题。

## 补充说明

- [object Object]
- [object Object]
- [object Object]
