'use strict';

import MinerField from '../miner-field/miner-field';

export default class MinerGame {
  constructor(options) {
    this._el = options.el;

    this._compiledTemplate = require('./template.hbs');

    this._render();

    this._minerField = new MinerField({
      el: this._el.querySelector(".miner-field"),
      width: options.width,
      height: options.height,
      bombs: options.bombs
    });

    this._smileButton = this._el.querySelector(".miner-head-smile");

    //Я не знаю, как тут реализовать так, чтобы родитель и ребенок "не знали" друг про друга
    this._smileButton.addEventListener('click', this._initiateCreatingNewField.bind(this) );

    this._smileButton.addEventListener('mousedown', this._smileButtonMouseDown.bind(this));
    document.addEventListener('mouseup', this._smileButtonMouseUp.bind(this));
  }

  _smileButtonMouseDown(e) {
    this._smileButton.className = "miner-head-smile";
    this._smileButton.classList.add("clicked");
    this._smileMouseIsDown = true;
    e.preventDefault();
  }

  _smileButtonMouseUp(e) {
    if (!this._smileMouseIsDown) {
      return;
    }
    this._smileButton.className = "miner-head-smile";
    this._smileMouseIsDown = false;
  }

  _render() {
    this._el.innerHTML = this._compiledTemplate();
  }

  _initiateCreatingNewField(e) {
    let newEvent = new CustomEvent('refreshField', { bubbles: true });
    this._el.dispatchEvent(newEvent);
  }
}
