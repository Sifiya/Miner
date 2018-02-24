'use strict';

export default class VisualComponent {
  setClass(elem, basicCls, addCls) {
    elem.className = basicCls;
    elem.classList.add(addCls);
  }
}
