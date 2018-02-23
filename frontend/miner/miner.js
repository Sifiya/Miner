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
  }

  _render() {
    this._el.innerHTML = this._compiledTemplate();
  }
}
