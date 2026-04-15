DESIGN.md - 数独领域对象设计与 Svelte 接入说明

本文档用于说明数独项目的领域对象设计、Svelte 响应式接入方案，并完整补充领域对象消费方式、响应式机制、版本改进说明三大核心内容。

一、整体架构
项目采用三层分离架构，实现视图层与核心业务逻辑的完全解耦：
┌─────────────────────────────────────────────────┐
│                  Svelte 组件层                    │
│  Board / Keyboard / Actions / Header / Modal     │
│       通过 $store 读取状态，调用 store 方法        │
└────────────────────┬────────────────────────────┘
                     │ 订阅状态 / 调用方法
┌────────────────────▼────────────────────────────┐
│              Store Adapter 层                    │
│         src/node_modules/@sudoku/stores/grid.js  │
│   内部持有 Game 领域对象，封装为 Svelte 响应式商店   │
│   对外暴露状态：grid / userGrid / canUndo / canRedo
│   对外暴露方法：guess / undo / redo / applyHint
└────────────────────┬────────────────────────────┘
                     │ 调用领域对象业务逻辑
┌────────────────────▼────────────────────────────┐
│               领域对象层                          │
│         src/domain/Game.js + Sudoku.js           │
│   Game: 管理游戏流程、操作历史、undo/redo 入口
│   Sudoku: 管理棋盘数据、填写、校验、克隆、序列化
└─────────────────────────────────────────────────┘

二、领域对象核心设计
1. Sudoku（数独棋盘实体）
持有 9×9 棋盘数据，提供 guess() 修改格子数值
提供 getGrid() 返回深拷贝，禁止外部直接修改内部状态
提供 clone() 生成独立副本，用于历史快照存储
支持序列化，保证状态可持久化
2. Game（游戏控制器）
持有 Sudoku 实例，作为 UI 唯一操作入口
基于快照模式管理操作历史，实现 undo/redo
对外提供 guess()/undo()/redo() 统一接口
提供 canUndo()/canRedo() 判断操作可用性

三、领域对象如何被消费
1. View 层直接消费的是什么？
View 层不直接消费 Game 或 Sudoku 领域对象，而是直接消费 Store Adapter（src/node_modules/@sudoku/stores/grid.js）。该适配器是连接 Svelte 视图与领域对象的唯一桥梁。
2. View 层拿到的数据是什么？
View 层通过 $ 语法订阅 Store，获取以下响应式数据：
$grid：原始数独谜题棋盘（只读，用于标记预填格子）
$userGrid：用户当前填写的棋盘（用于界面渲染）
$invalidCells：冲突错误的单元格列表（用于高亮报错）
$gameWon：游戏是否完成（胜利状态）
$canUndo / $canRedo：撤销 / 重做按钮是否可用
3. 用户操作如何进入领域对象？
所有用户交互都会通过 Store Adapter 转发到领域对象，形成标准调用链：
数字填写（guess）
UI 键盘 / 格子点击 → 调用 Adapter 的 userGrid.set() → Adapter 调用 currentGame.guess(...) → Sudoku 更新棋盘
撤销（Undo）
UI 撤销按钮点击 → 调用 Adapter 的 undo() → 调用 currentGame.undo() → 恢复历史快照
重做（Redo）
UI 重做按钮点击 → 调用 Adapter 的 redo() → 调用 currentGame.redo() → 恢复历史快照
4. 领域对象变化后，Svelte 为什么会更新？
核心依赖 Adapter 中的 syncFromDomain() 同步函数：
领域对象完成操作后，触发该函数
函数从领域对象获取全新的深拷贝数组（新引用）
调用 Svelte store 的 .set() 方法更新状态
Svelte 检测到引用变化，自动通知所有组件刷新界面

四、响应式机制说明
1. 依赖的 Svelte 响应式机制
本方案基于 Svelte 3 标准机制实现，未使用 $: 响应式语句：
writable：创建可修改的响应式状态容器
derived：从基础状态派生出 invalidCells、gameWon
$store 语法：组件快速订阅状态
重新赋值：通过新数组引用触发界面更新
2. 方案中暴露给 UI 的响应式数据
以下状态会实时同步到界面，支持自动刷新：
用户棋盘 userGrid
原始谜题棋盘 grid
冲突单元格 invalidCells
胜利状态 gameWon
撤销 / 重做可用状态 canUndo/canRedo
3. 保留在领域对象内部的状态
以下状态仅用于业务逻辑，对 UI 完全隐藏：
Game.history：存储所有棋盘快照的数组
Game.historyIndex：当前历史索引
Sudoku 内部原始棋盘引用
4. 直接修改内部对象会出现什么问题？
Svelte 3 的响应式基于引用赋值检测：
如果直接修改数组内部值（如 $userGrid[row][col] = 5），引用不会改变
Svelte 无法检测到数据变化，界面不会刷新
同时会破坏领域对象的封装性，导致状态不可控

五、改进说明
1. 相比 HW1，我改进了什么？
真正将领域对象接入 Svelte 前端：UI 所有操作均通过 Game/Sudoku 完成，不再直接操作数组
清晰划分职责边界：领域层负责业务逻辑，Adapter 负责适配框架，组件层只负责渲染
完整实现 Undo/Redo：基于快照模式的历史管理，支持标准撤销 / 重做逻辑
状态安全保护：通过深拷贝禁止外部篡改内部数据，保证状态一致性
2. 为什么 HW1 的做法不足以支撑真实接入？
领域对象与 UI 完全脱节：Game/Sudoku 仅用于测试，前端仍使用原始状态管理
核心逻辑散落在组件中：填写、状态更新等逻辑未收敛到领域对象
无历史管理机制：Undo/Redo 按钮仅有 UI，无业务逻辑
直接修改数组：易导致状态异常，且无法支撑复杂业务
3. 新设计的 trade-off（权衡取舍）
优势：领域对象完全不依赖 Svelte，可独立测试、跨框架复用
所有业务逻辑集中管理，代码可维护性大幅提升
封装性强，杜绝外部非法修改状态
撤销 / 重做逻辑简单可靠，符合用户习惯
代价：每次操作生成 9×9 数组深拷贝，存在极小性能开销（数独场景可忽略）
历史记录使用全量快照，存储空间略高于增量记录（对数独无影响）