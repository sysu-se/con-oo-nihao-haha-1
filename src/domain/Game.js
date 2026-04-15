import { createSudokuFromJSON } from './Sudoku.js';

/**
 * 内部工厂方法：通过显式状态创建 Game 实例
 * 供 createGame 和 createGameFromJSON 内部调用
 */
function createGameInternal(currentSudoku, history, historyIdx) {
  let _current = currentSudoku;
  let _history = history;
  let _idx = historyIdx;

  return {
    /**
     * 获取当前的数独领域对象
     */
    getSudoku() {
      return _current;
    },

    /**
     * 填写数字：更新当前数独棋盘，并记录到操作历史
     * @param {{ row: number, col: number, value: number }} move 移动参数：行、列、填写的值
     */
    guess({ row, col, value }) {
      _current.guess({ row, col, value });
      // 丢弃当前位置之后的所有重做历史
      _history.length = _idx + 1;
      // 对新状态创建快照
      _history.push(_current.clone());
      _idx++;
    },

    /**
     * 撤销上一步操作（恢复上一个历史快照）
     */
    undo() {
      if (_idx > 0) {
        _idx--;
        _current = _history[_idx].clone();
      }
    },

    /**
     * 重做上一步撤销的操作
     */
    redo() {
      if (_idx < _history.length - 1) {
        _idx++;
        _current = _history[_idx].clone();
      }
    },

    /** @returns {boolean} 是否可以执行撤销 */
    canUndo() {
      return _idx > 0;
    },

    /** @returns {boolean} 是否可以执行重做 */
    canRedo() {
      return _idx < _history.length - 1;
    },

    /**
     * 将完整游戏状态（包含操作历史）序列化为纯 JSON 格式
     */
    toJSON() {
      return {
        currentSudoku: _current.toJSON(),
        history: _history.map(s => s.toJSON()),
        historyIndex: _idx,
      };
    },
  };
}

/**
 * 包装一个数独对象，创建新的游戏实例
 *
 * 核心职责：
 *  - 持有当前数独实例
 *  - 管理操作历史（基于快照模式）
 *  - 提供撤销/重做功能
 *  - 提供 guess() 作为 UI 操作的统一入口
 *
 * @param {{ sudoku: ReturnType<import('./Sudoku.js').createSudoku> }} opts 配置参数：数独实例
 */
export function createGame({ sudoku }) {
  const initialSnapshot = sudoku.clone();
  return createGameInternal(sudoku.clone(), [initialSnapshot], 0);
}

/**
 * 通过 JSON 数据恢复游戏实例
 * @param {object} json 序列化的游戏状态数据
 */
export function createGameFromJSON(json) {
  const currentSudoku = createSudokuFromJSON(json.currentSudoku);
  const history = json.history.map(s => createSudokuFromJSON(s));
  return createGameInternal(currentSudoku, history, json.historyIndex);
}