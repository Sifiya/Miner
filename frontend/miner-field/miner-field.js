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

    this._onCellMouseDown = this._onCellMouseDown.bind(this);
    this._onCellMouseUp = this._onCellMouseUp.bind(this);
    this._onCellMouseOver = this._onCellMouseOver.bind(this);
    this._onCellMouseOut = this._onCellMouseOut.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
    this._render = this._render.bind(this);

    this._render();

    document.addEventListener('refreshField', this._render);
  }

  //Визуальные решения
  _onCellMouseDown(e) {
    e.preventDefault();
    if (e.button !== 0) return;

    this._mouseIsDown = true;
    this.trigger('cellMouseDown', true);

    this._clickedCell = e.target;
    if (!this._clickedCell.classList.contains("miner-field-cell")) return;
    if (!this._clickedCell.classList.contains("cell-closed")) return;

    this.setClass(this._clickedCell, "miner-field-cell", "cell-0");
  }

  _onCellMouseOver(e) {
    this._clickedCell = e.target;
    if (!this._clickedCell.classList.contains("miner-field-cell")) return;
    if (!this._mouseIsDown) return;

    this.setClass(this._clickedCell, "miner-field-cell", "cell-0");
  }

  _onCellMouseOut(e) {
    let cell = e.target;
    if (!cell.classList.contains("miner-field-cell")) return;
    if (!this._mouseIsDown) return;

    this.setClass(cell, "miner-field-cell", "cell-closed");
  }

  //Для визуала + открытия ячейки
  _onCellMouseUp(e) {
    if (!this._mouseIsDown) return;
    this._mouseIsDown = false;
    this.trigger('cellMouseUp', true);

    if (e.target === this._clickedCell) {
      this._openCell(this._clickedCell);
    } else {
      this.setClass(this._clickedCell, "miner-field-cell", "cell-closed");
    }
  }

  //Методы геймплея
  _openCell(cell) {
    this.setClass(cell, "miner-field-cell", cell.dataset.content);
    cell.dataset.opened = "yes";

    if (cell.dataset.content === "cell-0") this._openNearCells(cell);
    if (cell.dataset.content === "cell-b") this._gameOver(cell);
  }

  _openNearCells(cell) {

    let callback = function(currentCell) {
      if (currentCell.classList.contains("cell-f")) return;
      this._openCell(currentCell);
    };

    this._iterateCellsAround(cell, callback.bind(this));
  }

  _onContextMenu(e) {
    e.preventDefault();
    let cell = e.target.closest(".miner-field-cell");
    if (!cell || cell.dataset.opened === "yes") return;
    this._setFlag(cell);
  }

  _setFlag(cell) {
    if (cell.classList.contains("cell-flag")) {
      this.setClass(cell, "miner-field-cell", "cell-closed");
    } else {
      this.setClass(cell, "miner-field-cell", "cell-flag");
    }
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
      if (bombCell.classList.contains("cell-f")) continue;
      this.setClass(bombCell, "miner-field-cell", "cell-b");
    }

    this.setClass(cell, "miner-field-cell", "cell-b-boom");

    this._el.removeEventListener('mousedown', this._onCellMouseDown );
    document.removeEventListener('mouseup', this._onCellMouseUp );
    this._el.removeEventListener('mouseover', this._onCellMouseOver );
    this._el.removeEventListener('mouseout', this._onCellMouseOut );
    this._el.removeEventListener('contextmenu', this._onContextMenu);
  }

    //Методы, необходимые для создания поля
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
