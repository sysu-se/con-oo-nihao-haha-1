## HW 问题收集

列举在HW 1、HW1.1过程里，你所遇到的2\~3个通过自己学习已经解决的问题，和2\~3个尚未解决的问题与挑战

### 已解决

1. 啥是”标量derived store“ 有啥作用？
   1. **上下文**：Coding Agent 说：”UI 的棋盘、输入、Undo/Redo、胜利判断、分享编码全部直接读取领域对象公开接口；允许保留少量标量 derived store，但不再生成板级 view model。“ 
   2. **解决手段**：直接询问CA + 查看网页资料
2. Xxxx xxx ?
   1. **上下文**：xxxx
   2. **解决手段**：。。。。

### 未解决

1. 这个sameArea有啥用啊？

   1. **上下文**：`src/components/Board/index.svelte`

      ```javascript
      sameArea={$settings.highlightCells && !isSelected($cursor, x, y) && isSameArea($cursor, x, y)}
      ```

   2. **尝试解决手段**：问CA未果

2. Xxxx xxx ?

   1. **上下文**：xxxx
   2. **尝试解决手段**：。。。。