'use strict';

export default class Component {
  setClass(elem, basicCls, addCls) {
    elem.className = basicCls;
    elem.classList.add(addCls);
  }

  trigger(name, bubbles = false) {
    let newEvent = new CustomEvent(name, {
      bubbles: bubbles
    });
    this._el.dispatchEvent(newEvent);
  }
}
