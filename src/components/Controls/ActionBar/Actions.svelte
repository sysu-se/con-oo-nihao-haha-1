<script>
  // 导入候选数状态管理（笔记/候选数字）
  import { candidates } from '@sudoku/stores/candidates';
  // 导入用户棋盘、撤销/重做相关状态与方法
  import { userGrid, canUndo, canRedo, undo, redo } from '@sudoku/stores/grid';
  // 导入光标（选中格子）状态
  import { cursor } from '@sudoku/stores/cursor';
  // 导入提示次数状态
  import { hints } from '@sudoku/stores/hints';
  // 导入笔记模式开关
  import { notes } from '@sudoku/stores/notes';
  // 导入游戏设置（如是否限制提示次数）
  import { settings } from '@sudoku/stores/settings';
  // 导入键盘禁用状态
  import { keyboardDisabled } from '@sudoku/stores/keyboard';
  // 导入游戏暂停状态
  import { gamePaused } from '@sudoku/stores/game';

  // Svelte 响应式语句：判断是否有可用的提示次数
  $: hintsAvailable = $hints > 0;

  /**
   * 处理提示按钮点击事件
   * 逻辑：校验提示可用 → 清空当前格子候选数 → 调用提示方法填充正确数字
   */
  function handleHint() {
    // 仅当有剩余提示时执行
    if (hintsAvailable) {
      // 如果当前选中格子有候选数，清空候选数
      if ($candidates.hasOwnProperty($cursor.x + ',' + $cursor.y)) {
        candidates.clear($cursor);
      }
      // 调用棋盘的提示方法，自动填充正确数字
      userGrid.applyHint($cursor);
    }
  }
</script>

<!-- 操作按钮容器，使用间距样式 -->
<div class="action-buttons space-x-3">

  <!-- 撤销按钮 -->
  <!-- 禁用条件：游戏暂停 或 无法撤销；点击执行undo方法 -->
  <button class="btn btn-round" disabled={$gamePaused || !$canUndo} title="Undo" on:click={undo}>
    <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  </button>

  <!-- 重做按钮 -->
  <!-- 禁用条件：游戏暂停 或 无法重做；点击执行redo方法 -->
  <button class="btn btn-round" disabled={$gamePaused || !$canRedo} title="Redo" on:click={redo}>
    <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 90 00-8 8v2M21 10l-6 6m6-6l-6-6" />
    </svg>
  </button>

  <!-- 提示按钮（带角标） -->
  <!-- 禁用条件：键盘禁用 或 无可用提示 或 当前格子已填数字；点击执行handleHint -->
  <button class="btn btn-round btn-badge" disabled={$keyboardDisabled || !hintsAvailable || $userGrid[$cursor.y][$cursor.x] !== 0} on:click={handleHint} title="Hints ({$hints})">
    <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>

    <!-- 如果设置中开启了提示次数限制，显示剩余提示次数角标 -->
    {#if $settings.hintsLimited}
      <span class="badge" class:badge-primary={hintsAvailable}>{$hints}</span>
    {/if}
  </button>

  <!-- 笔记模式开关按钮（带角标） -->
  <!-- 点击切换笔记模式开关 -->
  <button class="btn btn-round btn-badge" on:click={notes.toggle} title="Notes ({$notes ? 'ON' : 'OFF'})">
    <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>

    <!-- 笔记模式状态角标：ON/OFF，开启时高亮显示 -->
    <span class="badge tracking-tighter" class:badge-primary={$notes}>{$notes ? 'ON' : 'OFF'}</span>
  </button>

</div>


<style>
  /* 操作按钮布局：弹性布局、自动换行、水平均匀分布、底部对齐 */
  .action-buttons {
    @apply flex flex-wrap justify-evenly self-end;
  }

  /* 带角标的按钮：设置相对定位，用于角标绝对定位 */
  .btn-badge {
    @apply relative;
  }

  /* 角标基础样式：尺寸、内边距、圆角、文本样式、定位 */
  .badge {
    min-height: 20px;
    min-width:  20px;
    @apply p-1 rounded-full leading-none text-center text-xs text-white bg-gray-600 inline-block absolute top-0 left-0;
  }

  /* 角标激活样式：主色调背景 */
  .badge-primary {
    @apply bg-primary;
  }
</style>