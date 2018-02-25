'use strict';

import Component from '../component/component';

export default class MinerCounter extends Component {
  constructor(options) {
    super();

    this._el = options.el;
    this._currentBombs = this._totalBombs = options.bombs;
    
    this._updateCounter();

    document.addEventListener('flagsetted', this._reduceCounter.bind(this));
    document.addEventListener('flagremoved', this._increaseCounter.bind(this));
    document.addEventListener('refreshField', this._restartCounter.bind(this));
  }

  _updateCounter() {
    if ((this._currentBombs / 1000) >= 1) return;
    let nums = "000" + (String(this._currentBombs));
    nums = nums.slice(-3);
    let outputs = this._el.querySelectorAll(".miner-head-counter-num");

    for (let i = 0; i < 3; i++) {
      this.setClass(outputs[i], "miner-head-counter-num", `num-${nums[i]}`);
    }
  }

  _reduceCounter() {
    this._currentBombs--;
    this._currentBombs = Math.max(this._currentBombs, 0);
    this._updateCounter();
  }

  _increaseCounter() {
    this._currentBombs++;
    this._currentBombs = Math.min(this._currentBombs, this._totalBombs);
    this._updateCounter();
  }

  _restartCounter() {
    this._currentBombs = this._totalBombs;
    this._updateCounter();
  }
}
