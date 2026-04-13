// 数独棋盘尺寸 9x9
const SUDOKU_SIZE = 9;
// 3x3 小宫格尺寸
const BOX_SIZE = 3;
     
// Sudoku (棋盘) - 表示数独谜题的核心领域对象
class Sudoku {
  /**
   * 构造函数
   * @param {number[][]} grid - 9x9二维数字数组（0代表空格）
   */
  constructor(grid) {
    // 深拷贝输入网格，避免共享引用
    this._grid = grid.map(row => [...row]);
  }

  /**
   * 返回当前棋盘的深拷贝
   * @returns {number[][]}
   */
  getGrid() {
    return this._grid.map(row => [...row]);
  }

  /**
   * 在棋盘上执行落子操作
   * @param {{ row: number, col: number, value: number }} move - 落子信息
   */
  guess(move) {
    const { row, col, value } = move;
    this._grid[row][col] = value;
  }

  /**
   * 创建当前Sudoku实例的独立深拷贝
   * @returns {Sudoku}
   */
  clone() {
    return new Sudoku(this._grid);
  }

  /**
   * 将数独对象序列化为JSON安全的普通对象
   * 仅序列化棋盘数据，不包含临时状态
   * @returns {{ grid: number[][] }}
   */
  toJSON() {
    return {
      grid: this.getGrid(),
    };
  }

  /**
   * 生成可读的、便于调试的字符串表示
   * 使用制表符绘制9x9棋盘格式
   * @returns {string}
   */
  toString() {
    let out = '+---------+---------+---------+\n';

    for (let row = 0; row < SUDOKU_SIZE; row++) {
      if (row !== 0 && row % BOX_SIZE === 0) {
        out += '+---------+---------+---------+\n';
      }

      for (let col = 0; col < SUDOKU_SIZE; col++) {
        if (col === 0) {
          out += '| ';
        } else if (col % BOX_SIZE === 0) {
          out += '| ';
        }

        const val = this._grid[row][col];
        out += (val === 0 ? '.' : String(val)) + '  ';

        if (col === SUDOKU_SIZE - 1) {
          out += '|';
        }
      }

      out += '\n';
    }

    out += '+---------+---------+---------+';
    return out;
  }
}

// Game - 管理数独游戏会话，支持撤销/重做

class Game {
  /**
   * 构造函数
   * @param {Sudoku} sudoku - 初始数独棋盘
   */
  constructor(sudoku) {
    // 存储当前数独状态
    this._sudoku = sudoku.clone();
    // 历史栈：存储落子记录与原值，用于撤销
    this._undoStack = []; // 数组元素：{ row, col, value, previousValue }
    this._redoStack = [];
  }

  /**
   * 获取当前的数独对象
   * @returns {Sudoku}
   */
  getSudoku() {
    return this._sudoku;
  }

  /**
   * 在当前数独上执行落子，并记录到历史记录
   * 新落子会清空重做历史
   * @param {{ row: number, col: number, value: number }} move - 落子信息
   */
  guess(move) {
    const { row, col, value } = move;
    const previousValue = this._sudoku.getGrid()[row][col];

    // 记录落子与原值，用于撤销
    this._undoStack.push({ row, col, value, previousValue });

    // 执行新落子后，清空重做栈
    this._redoStack = [];

    // 应用落子
    this._sudoku.guess(move);
  }

  /**
   * 撤销最近一次落子
   */
  undo() {
    if (!this.canUndo()) return;

    const lastMove = this._undoStack.pop();
    // 存入重做栈后再回退
    this._redoStack.push(lastMove);

    // 将单元格恢复为撤销前的值
    this._sudoku.guess({
      row: lastMove.row,
      col: lastMove.col,
      value: lastMove.previousValue,
    });
  }

  /**
   * 重做最近一次撤销的落子
   */
  redo() {
    if (!this.canRedo()) return;

    const move = this._redoStack.pop();
    // 重新存入撤销栈
    this._undoStack.push(move);

    // 重新应用落子
    this._sudoku.guess({
      row: move.row,
      col: move.col,
      value: move.value,
    });
  }

  /**
   * 判断是否可以执行撤销
   * @returns {boolean}
   */
  canUndo() {
    return this._undoStack.length > 0;
  }

  /**
   * 判断是否可以执行重做
   * @returns {boolean}
   */
  canRedo() {
    return this._redoStack.length > 0;
  }

  /**
   * 将游戏对象序列化为JSON安全对象
   * 序列化内容：当前棋盘、撤销栈、重做栈
   * 不序列化：UI临时状态、计时器等
   * @returns {object}
   */
  toJSON() {
    return {
      sudoku: this._sudoku.toJSON(),
      undoStack: this._undoStack.map(m => ({ ...m })),
      redoStack: this._redoStack.map(m => ({ ...m })),
    };
  }

  /**
   * 生成便于调试的字符串表示
   * @returns {string}
   */
  toString() {
    return (
      `Game {\n` +
      `  撤销栈: ${this._undoStack.length} 步,\n` +
      `  重做栈: ${this._redoStack.length} 步,\n` +
      `  数独棋盘:\n${this._sudoku.toString()}\n` +
      `}`
    );
  }
}

// 题目要求的函数
/**
 * 从9x9数字网格创建数独对象
 * @param {number[][]} input - 9x9网格数组
 * @returns {Sudoku}
 */
export function createSudoku(input) {
  return new Sudoku(input);
}
    
/**
 * 从序列化的JSON数据恢复数独对象
 * @param {object} json - sudoku.toJSON()的输出结果
 * @returns {Sudoku}
 */
export function createSudokuFromJSON(json) {
  return new Sudoku(json.grid);
}

/**
 * 从数独对象创建新游戏
 * @param {{ sudoku: Sudoku }} options - 配置项
 * @returns {Game}
 */
export function createGame({ sudoku }) {
  return new Game(sudoku);
}

/**
 * 从序列化的JSON数据恢复游戏对象
 * 重建数独对象并恢复撤销/重做栈
 * @param {object} json - game.toJSON()的输出结果
 * @returns {Game}
 */
export function createGameFromJSON(json) {
  const sudoku = createSudokuFromJSON(json.sudoku);
  const game = new Game(sudoku);
  // 恢复历史栈（深拷贝每一步落子）
  game._undoStack = (json.undoStack || []).map(m => ({ ...m }));
  game._redoStack = (json.redoStack || []).map(m => ({ ...m }));
  return game;
}