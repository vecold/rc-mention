import type { MenuProps } from "antd";

const isSafari = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes("applewebkit") && !userAgent.includes("chrome");
};

export const getEditorRange = () => {
  let range = null;
  let selection = null;
  if (window.getSelection) {
    // 获取选区对象
    selection = window.getSelection();
    if (!selection) {
      return null;
    }
    // 对于 Safari，直接获取第一个选区
    if (isSafari()) {
      range = selection.getRangeAt(0);
    } else {
      // 对于其他浏览器，检查 rangeCount 是否大于 0
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      }
    }
  } else {
    return null;
  }
  return {
    range,
    selection,
  };
};

// 重新设置光标的位置
export const resetRange = (range) => {
  if (range) {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (range.select) {
      range.select();
    }
  }
};

// 获取光标坐标
export const getSelectionCoords = () => {
  const win = window;
  const doc = win.document;
  let sel = doc.selection;
  let range;
  let rects;
  let rect;
  let x = 0;
  let y = 0;
  if (sel) {
    if (sel.type !== "Control") {
      range = sel.createRange();
      range.collapse(true);
      x = range.boundingLeft;
      y = range.boundingTop;
    }
  } else if (win.getSelection) {
    sel = win.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0).cloneRange();
      if (range.getClientRects) {
        range.collapse(true);
        rects = range.getClientRects();
        if (rects.length > 0) {
          rect = rects[0];
        }
        // 光标在行首时，rect为undefined
        if (rect) {
          x = rect.left;
          y = rect.top;
        }
      }
      if ((x === 0 && y === 0) || rect === undefined) {
        const span = doc.createElement("span");
        if (span.getClientRects) {
          span.appendChild(doc.createTextNode("\u200b"));
          range.insertNode(span);
          rect = span.getClientRects()[0];
          x = rect.left;
          y = rect.top;
          const spanParent = span.parentNode;
          spanParent.removeChild(span);
          spanParent.normalize();
        }
      }
    }
  }
  return { x: x, y: y };
};

// 选择人员后插入@人员样式
export const insertHtmlAtCaret = ([btn, bSpaceNode], selection, range) => {
  if (selection.getRangeAt && selection.rangeCount) {
    // 如果是 @ 样式，不做反应
    if (selection.focusNode.parentNode.nodeName === 'BUTTON') return
    range.deleteContents()
    const el = document.createElement('div')
    el.appendChild(btn)
    if (bSpaceNode) {
      el.appendChild(bSpaceNode)
    }
    const frag = document.createDocumentFragment()
    let node
    let lastNode
    while ((node = el.firstChild)) {
      lastNode = frag.appendChild(node)
    }
    range.insertNode(frag)
    if (lastNode) {
      range = range.cloneRange()
      range.setStartAfter(lastNode)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
}

export const items: MenuProps["items"] = [
  {
    key: "asan",
    label: "阿三",
  },
  {
    key: "baobo",
    label: "鲍勃",
  },
  {
    key: "chensheng",
    label: "陈胜",
  },
  {
    key: "chengliang",
    label: "程亮",
  },
  {
    key: "chenguang",
    label: "程光",
  },
  {
    key: "huba",
    label: "胡巴",
  },
  {
    key: "lisi",
    label: "李四",
  },
  {
    key: "likui",
    label: "李逵",
  },
  {
    key: "lizhaodi",
    label: "李招娣",
  },
  {
    key: "liguang",
    label: "李广",
  },
  {
    key: "liyuanfang",
    label: "李元芳",
  },
  {
    key: "lidazhao",
    label: "李大钊",
  },
  {
    key: "libai",
    label: "李白",
  },
  {
    key: "wangwu",
    label: "王五",
  },
  {
    key: "zhangsan",
    label: "张三",
  },
];
