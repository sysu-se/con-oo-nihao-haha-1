## HW 问题收集

列举在HW 1、HW1.1过程里，你所遇到的2\~3个通过自己学习已经解决的问题，和2\~3个尚未解决的问题与挑战

### 已解决

1. 启动后报错 “Could not resolve '../../domain/gameStore.js'”，如何修复？

   1. **上下文**：执行npm run dev，出现路径引用错误，提示在src/node_modules/.../grid.js中无法找到../../domain/gameStore.js，同时伴随 QRCode.svelte 缺少 alt 属性的警告。 
   2. **解决手段**：直接询问CA + 查看网页资料

2. Svelte 订阅（subscribe）是什么意思，如何作用于数独项目？

   1. **上下文**：完成领域对象接入 Svelte 流程后，不清楚subscribe的含义，以及为何$userGrid、$canUndo等能实现 UI 自动刷新，无法回答作业中 “领域对象变化后 Svelte 为什么会更新” 的核心问题。
   2. **解决手段**：通过询问CA，阅读自己的代码，明确订阅与响应式机制的关联
   
3. 如何通过 Store Adapter 将 Sudoku/Game 领域对象真正接入 Svelte 流程？
   
   1.**上下文**:HW1 仅完成独立领域对象，无法对接 UI；HW1.1 要求视图必须消费领域对象，不清楚如何搭建适配层让 UI 通过 store 调用guess、undo、redo。
   2.**解决手段**：询问AI，按照作业推荐的Store Adapter模式，在grid.js中持有Game实例，通过syncFromDomain同步状态到Svelte writable store，让组件只调用 store 方法，不直接操作数组，完成领域对象真实接入。



### 未解决

1. 领域对象快照模式的历史存储是否有更优方案？

   1. **上下文**：当前 Game 使用全量 Sudoku 快照实现 Undo/Redo，每次操作都进行深拷贝，想了解是否可以使用增量记录替代全量快照，同时不破坏现有分层与封装。
   2. **尝试解决手段**：查阅状态回溯相关设计模式，询问AI，但增量方案会大幅增加 Game 与 Sudoku 的耦合，暂未找到兼顾简洁性、可维护性与性能的替代方案。

2. 如何更规范地封装自定义 Store，统一领域对象的暴露方式？

   1. **上下文**：当前Store Adapter对外暴露了store订阅、方法、派生状态多种形式，接口不够统一，想优化封装结构但不确定Svelte自定义store的最佳实践。
   2. **尝试解决手段**：参考Svelte官方custom store示例，但结合数独多状态同步、撤销重做等场景后，仍无法确定职责边界最清晰的封装形式。