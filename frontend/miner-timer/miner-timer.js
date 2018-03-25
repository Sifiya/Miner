'use strict';

import Component from '../component/component';

export default class MinerTimer extends Component {
  constructor(options) {
    super();

    this._el = options.el;

    this._timerCount = 0;
    this._updateTimer();

    document.addEventListener('refreshField', this._restartTimer.bind(this) );
    document.addEventListener('gameover', this._stop.bind(this) );
    document.addEventListener('gamewin', this._stop.bind(this) );
    document.addEventListener('cellopened', this._start.bind(this) );
  }

  _start() {
    if (this._timerId) return;
    this._start = new Date().getTime();
    this._timerId = setInterval(this._tick.bind(this), 1000);
  }

  _stop() {
    clearInterval(this._timerId);
    this._timerId = null;
  }

  _tick() {
    let now = new Date().getTime();
    this._timerCount = Math.floor((now - this._start) / 1000);

    //На случай если каунтер подвиснет и пропустит 999-тую секунду
    if (this._timerCount > 999) {
      this._timerCount = 999;
    }

    this._updateTimer();
    if (this._timerCount === 999) this._stop();
  }

  _updateTimer() {
    let timerStr = "000" + String(this._timerCount);
    timerStr = timerStr.slice(-3);
    let outputs = this._el.querySelectorAll(".miner-head-timer-num");

    for (let i = 0; i < 3; i++) {
      this.setClass(outputs[i], "miner-head-timer-num", `num-${timerStr[i]}`);
    }
  }

  _restartTimer() {
    this._stop();
    this._timerCount = 0;
    this._updateTimer();
  }

}
