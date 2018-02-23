'use strict';

import MinerGame from './miner/miner';

let miner = new MinerGame({
  el: document.querySelector(".miner"),
  width: 30,
  height: 16,
  bombs: 99
});
