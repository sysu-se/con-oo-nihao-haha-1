const SUDOKU_SIZE = 9;
const BOX_SIZE = 3;

/**
 * 对 9x9 棋盘进行深拷贝（防御性拷贝）
 * @param {number[][]} grid 数独棋盘二维数组
 * @returns {number[][]} 拷贝后的新棋盘
 */
function deepCopyGrid(grid) {
  return grid.map(row => [...row]);
}

/**
 * 创建数独领域对象
 *
 * 核心职责：
 *  - 持有当前棋盘数据
 *  - 提供 guess() 方法更新单元格数值
 *  - 提供校验辅助方法（通过 getGrid + 外部校验实现）
 *  - 提供 clone() 方法创建独立深拷贝（用于 Game 类的历史记录）
 *  - 提供 toJSON() / toString() 方法实现序列化
 *
 * @param {number[][]} inputGrid - 9x9 数字棋盘（0 代表空白格）
 */
export function createSudoku(inputGrid) {
  // 防御性拷贝，避免外部修改影响内部状态
  const grid = deepCopyGrid(inputGrid);

  return {
    /**
     * 返回当前棋盘的防御性拷贝
     * @returns {number[][]} 棋盘数组
     */
    getGrid() {
      return deepCopyGrid(grid);
    },

    /**
     * 在指定单元格填写数值
     * @param {{ row: number, col: number, value: number }} move 填写参数：行、列、数值
     */
    guess({ row, col, value }) {
      grid[row][col] = value;
    },

    /**
     * 创建当前数独对象的独立深拷贝
     * @returns {ReturnType<createSudoku>} 新的数独对象
     */
    clone() {
      return createSudoku(grid);
    },

    /**
     * 序列化为安全的 JSON 格式数据
     * @returns {{ grid: number[][] }} 包含棋盘的 JSON 对象
     */
    toJSON() {
      return { grid: deepCopyGrid(grid) };
    },

    /**
     * 生成人类可读的棋盘格式化字符串
     * @returns {string} 格式化后的棋盘文本
     */
    toString() {
      let out = '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2564\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2564\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n';
      for (let row = 0; row < SUDOKU_SIZE; row++) {
        if (row !== 0 && row % BOX_SIZE === 0) {
          out += '\u255f\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2562\n';
        }
        for (let col = 0; col < SUDOKU_SIZE; col++) {
          if (col === 0) out += '\u2551 ';
          else if (col % BOX_SIZE === 0) out += '\u2502 ';
          out += (grid[row][col] === 0 ? '\u00b7' : grid[row][col]) + ' ';
          if (col === SUDOKU_SIZE - 1) out += '\u2551';
        }
        out += '\n';
      }
      out += '\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2567\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2567\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d';
      return out;
    },
  };
}

/**
 * 通过 JSON 数据恢复数独对象
 * @param {{ grid: number[][] }} json 序列化后的数独数据
 */
export function createSudokuFromJSON(json) {
  return createSudoku(json.grid);
}