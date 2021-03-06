'use strict';

import Component from '../component/component';
import MinerField from '../miner-field/miner-field';
import MinerCounter from '../miner-counter/miner-counter';
import MinerTimer from '../miner-timer/miner-timer';

export default class MinerGame extends Component {
  constructor(options) {
    super();
    this._el = options.el;

    this._compiledTemplate = require('./template.hbs');

    this._render();

    this._minerField = new MinerField({
      el: this._el.querySelector(".miner-field"),
      width: options.width,
      height: options.height,
      bombs: options.bombs
    });

    this._counter = new MinerCounter({
      el: this._el.querySelector(".miner-head-counter"),
      bombs: options.bombs
    });

    this._minerTimer = new MinerTimer({
      el: this._el.querySelector(".miner-head-timer")
    });

    this._smileButton = this._el.querySelector(".miner-head-smile");

    this._smileRemoveWowFace = this._smileRemoveWowFace.bind(this);
    this._smileSetWowFace = this._smileSetWowFace.bind(this);

    this._smileButton.addEventListener('click', this._initiateCreatingNewField.bind(this) );
    this._el.addEventListener('cellMouseDown', this._smileSetWowFace );
    this._el.addEventListener('cellMouseUp', this._smileRemoveWowFace );
    this._el.addEventListener('gameover', this._smileSetDeadFace.bind(this) );
    this._el.addEventListener('gamewin', this._smileSetWinnerFace.bind(this) );

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

  _initiateCreatingNewField() {
    this.trigger('refreshField', true);
    this._el.addEventListener('cellMouseUp', this._smileRemoveWowFace );
    this._el.addEventListener('cellMouseDown', this._smileSetWowFace );
  }

  _smileSetWowFace() {
    this._smileButton.classList.add("opening");
  }

  _smileRemoveWowFace() {
    this._smileButton.className = "miner-head-smile";
  }

  _smileSetDeadFace() {
    this._smileButton.classList.add("dead");
  }

  _smileSetWinnerFace() {
    this._smileButton.classList.add("winner");
    this._el.removeEventListener('cellMouseUp', this._smileRemoveWowFace );
    this._el.removeEventListener('cellMouseDown', this._smileSetWowFace );
  }
}
