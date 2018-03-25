'use strict';

import MinerGame from './miner/miner';

let miner = new MinerGame({
  el: document.querySelector(".miner"),
  // width: 10,
  // height: 10,
  // bombs: 10
  width: 30,
  height: 16,
  bombs: 99
});
