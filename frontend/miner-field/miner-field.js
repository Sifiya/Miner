'use strict';

import Component from '../component/component';

export default class MinerField extends Component {
  constructor(options) {
    super();

    this._el = options.el;
    this._width = options.width;
    this._height = options.height;
    this._bombs = options.bombs;

    this._compiledTemplate =  require('./template.hbs');

    this._bindAllListenerFunctions();

    this._render();

    document.addEventListener('refreshField', this._render);
  }

  //Методы, реагирующие на действия пользователя
  _onCellMouseDown(e) {
    e.preventDefault();
    let cell = e.target.closest(".miner-field-cell");
    if (!cell) return;

    if (e.button === 2) {
      if (this._clickType) return;
      if (cell.dataset.opened === "yes") return;
      this._setFlag(cell);
      return;
    }

    this._clickType = 1;
    this.trigger('cellMouseDown', true);

    if (cell.dataset.opened === "yes") return;
    if (cell.classList.contains("cell-flag")) return;

    this.setClass(cell, "miner-field-cell", "cell-0");
  }

  _onCellMouseOut(e) {
    if (!this._clickType) return;
    let cell = e.target.closest(".miner-field-cell");
    if (!cell) return;

    this._unpressCells();
  }

  _onCellMouseOver(e) {
    if (!this._clickType) return;
    let cell = e.target.closest(".miner-field-cell");
    if (!cell) return;
    if(cell.classList.contains("cell-flag")) return;
    if(cell.dataset.opened === "yes") return;

    this.setClass(cell, "miner-field-cell", "cell-0");
  }

  _onCellMouseUp(e) {
    this.trigger('cellMouseUp', true);
    if (!this._clickType) return;

    let cell = e.target.closest(".miner-field-cell");
    if (!cell || cell.classList.contains("cell-flag")) {
      this._clickType = 0;
      this._unpressCells();
      return;
    }

    if (this._clickType === 1) {
      this._openCell(cell);
    } else if (this._clickType === 2) {

      if (cell.dataset.opened === "yes") {
        let bombsAmount = Number(cell.dataset.content.slice(5));
        if (bombsAmount === this._countFlagsAround(cell)) {
          this._openNearCells(cell);
        }
      }

    }

    this._clickType = 0;
    this._unpressCells();
  }

  _onContextMenu(e) {
    e.preventDefault();
  }

  _onBothMBClicked(e) {
    if (e.buttons !== 3) return;
    let cell = e.target.closest(".miner-field-cell");
    if (!cell) return;

    this._clickType = 2;

    this._pressCellsAround(cell);
  }

  //Методы для корректного визуального отображения пользовательских взаимодействий
  _pressCellsAround(cell) {
    let callback = function(currentCell) {
      if (currentCell.classList.contains("cell-flag")) return;
      this.setClass(currentCell, "miner-field-cell", "cell-0");
    };
    this._iterateCellsAround(cell, callback.bind(this));
  }

  _unpressCells() {
    let pressedCells = this._el.querySelectorAll('.cell-0:not([data-opened])');
    for (let cell of pressedCells) {
      this.setClass(cell, "miner-field-cell", "cell-closed");
    }
  }

  //Методы геймплея
  _openCell(cell) {
    this.trigger('cellopened', true);
    this.setClass(cell, "miner-field-cell", cell.dataset.content);
    if (cell.dataset.content === "cell-b") {
      this._gameOver(cell);
      return;
    }

    cell.dataset.opened = "yes";
    if (cell.dataset.content === "cell-0") this._openNearCells(cell);

    let openedCells = this._el.querySelectorAll('[data-opened]').length;
    if ( openedCells == ((this._width * this._height) - this._bombs) ) {
      this._gameWin();
    }
  }

  _openNearCells(cell) {

    let callback = function(currentCell) {
      if (currentCell.classList.contains("cell-flag")) return;
      this._openCell(currentCell);
    };

    this._iterateCellsAround(cell, callback.bind(this));
  }

  _setFlag(cell) {
    if (cell.classList.contains("cell-flag")) {
      this.setClass(cell, "miner-field-cell", "cell-closed");
      this.trigger('flagremoved', true);
    } else {
      this.setClass(cell, "miner-field-cell", "cell-flag");
      this.trigger('flagsetted', true);
    }
  }

  _countFlagsAround(cell) {
    let flags = 0;

    this._iterateCellsAround(cell, (currentCell) => {
      if (currentCell.classList.contains("cell-flag")) flags++;
    });

    return flags;
  }

  _iterateCellsAround(cell, callback) {
    let rowIndex = Number(cell.dataset.coords.split(':')[0]);
    let cellIndex = Number(cell.dataset.coords.split(':')[1]);

    for (let i = rowIndex - 1; i <= rowIndex + 1; i++) {
      for (let j = cellIndex - 1; j <= cellIndex + 1; j++) {
        if ((i < 0) ||
            (j < 0) ||
            (i >= this._height) ||
            (j >= this._width)) continue;
        if (i === rowIndex && j === cellIndex) continue;

        let currentCell = this._el.querySelector(`[data-coords="${i}:${j}"]`);
        if (currentCell.dataset.opened === "yes") continue;
        callback(currentCell);
      }
    }
  }

  _gameOver(cell) {
    let bombCells = this._el.querySelectorAll("[data-content='cell-b']");
    for (let bombCell of bombCells) {
      if (bombCell.classList.contains("cell-flag")) continue;
      this.setClass(bombCell, "miner-field-cell", "cell-b");
    }

    let wrongFlags = this._el.querySelectorAll(".cell-flag:not([data-content='cell-b'])");
    for (let wrongFlag of wrongFlags) {
      this.setClass(wrongFlag, "miner-field-cell", "cell-b-wrong");
    }

    this.setClass(cell, "miner-field-cell", "cell-b-boom");

    this._el.removeEventListener('mousedown', this._onCellMouseDown );
    document.removeEventListener('mouseup', this._onCellMouseUp );
    this._el.removeEventListener('mouseover', this._onCellMouseOver );
    this._el.removeEventListener('mouseout', this._onCellMouseOut );
    this._el.removeEventListener('contextmenu', this._onContextMenu);
    this._el.removeEventListener('mousedown', this._onBothMBClicked );
    this._el.removeEventListener('mouseover', this._onBothMBClicked );

    this.trigger('gameover', true);
  }

  _gameWin() {
    this._el.removeEventListener('mousedown', this._onCellMouseDown );
    document.removeEventListener('mouseup', this._onCellMouseUp );
    this._el.removeEventListener('mouseover', this._onCellMouseOver );
    this._el.removeEventListener('mouseout', this._onCellMouseOut );
    this._el.removeEventListener('contextmenu', this._onContextMenu);
    this._el.removeEventListener('mousedown', this._onBothMBClicked );
    this._el.removeEventListener('mouseover', this._onBothMBClicked );

    this.trigger('gamewin', true);
  }

  //Методы, необходимые для создания поля
  _bindAllListenerFunctions() {
    this._onCellMouseDown = this._onCellMouseDown.bind(this);
    this._onCellMouseUp = this._onCellMouseUp.bind(this);
    this._onCellMouseOver = this._onCellMouseOver.bind(this);
    this._onCellMouseOut = this._onCellMouseOut.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
    this._onBothMBClicked = this._onBothMBClicked.bind(this);
    this._render = this._render.bind(this);
  }

  _render() {
    this._prepareFieldArray();
    this._el.innerHTML = this._compiledTemplate({
      field: this._fieldArray
    });

    this._el.addEventListener('mousedown', this._onCellMouseDown );
    document.addEventListener('mouseup', this._onCellMouseUp );
    this._el.addEventListener('mouseover', this._onCellMouseOver );
    this._el.addEventListener('mouseout', this._onCellMouseOut );
    this._el.addEventListener('contextmenu', this._onContextMenu);
    this._el.addEventListener('mousedown', this._onBothMBClicked );
    this._el.addEventListener('mouseover', this._onBothMBClicked );
  }

  _prepareFieldArray() {
    this._fieldArray = [];
    for (let i = 0; i < this._height; i++) {
      this._fieldArray[i] = [];
      for (let j = 0; j < this._width; j++) {
        this._fieldArray[i][j] = {'value': 0, 'coords': `${i}:${j}`};
      }
    }

    this._setAllBombs();
    this._setNumbers();
  }

  _setAllBombs() {
    for (let i = 0; i < this._bombs; i++) {
      this._setOneBomb();
    }
  }

  _setOneBomb() {
    let coords = this._pickRandomCell();

    if (this._fieldArray[coords.i][coords.j].value === "b") {
      this._setOneBomb();
      return;
    }

    this._fieldArray[coords.i][coords.j].value = "b";
  }

  _pickRandomCell() {
    let i = Math.round( Math.random() * this._height - 0.5 );
    let j = Math.round( Math.random() * this._width - 0.5 );

    return {'i': i, 'j': j};
  }

  _setNumbers() {
    for (let i = 0; i < this._height; i++) {
      for (let j = 0; j < this._width; j++) {
        if (this._fieldArray[i][j].value === "b") continue;
        this._fieldArray[i][j].value = this._countBombsAround(i, j);
      }
    }
  }

  _countBombsAround(i, j) {
    let subIMin = (i === 0) ? 0 : i - 1 ;
    let subJMin = (j === 0) ? 0 : j - 1 ;
    let subIMax = (i === (this._height - 1)) ? i : i + 1 ;
    let subJMax = (j === (this._width - 1)) ? j : j + 1 ;
    let bombsAmount = 0;

    for (let subI = subIMin; subI <= subIMax; subI++) {
      for (let subJ = subJMin; subJ <= subJMax; subJ++) {
        if (subI === i && subJ === j) continue;
        if (this._fieldArray[subI][subJ].value === "b") bombsAmount++;
      }
    }

    return bombsAmount;
  }

}
