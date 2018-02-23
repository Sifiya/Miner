'use strict';

export default class MinerField {
  constructor(options) {
    this._el = options.el;
    this._width = options.width;
    this._height = options.height;
    this._bombs = options.bombs;

    this._compiledTemplate =  require('./template.hbs');

    this._render();
  }

  _render() {
    this._prepareFieldArray();
    this._el.innerHTML = this._compiledTemplate({
      field: this._fieldArray
    });
  }

  _prepareFieldArray() {
    this._fieldArray = [];
    for (let i = 0; i < this._height; i++) {
      this._fieldArray[i] = [];
      for (let j = 0; j < this._width; j++) {
        this._fieldArray[i][j] = {'value': 0};
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
