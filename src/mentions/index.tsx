import { useRef, useState, useCallback, useEffect } from "react";
import { Dropdown } from "antd";
import classNames from "classnames";
import { getEditorRange, items, insertHtmlAtCaret } from "./utils";
import { defaultPlaceholder } from "./constant";
import styles from "./index.module.less";

interface IProps {
  maxLength?: number;
  value?: string;
  placeholder?: string;
}
interface IPerson {
  id?: string;
  label?: string;
  key?: string;
}

const Mentions = (props: IProps) => {
  const { maxLength, value, placeholder = defaultPlaceholder } = props;
  const [inputStr, setInputStr] = useState(value);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  // 记录编辑器光标的位置
  const editorRange = useRef(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateInputStr = useCallback(() => {
    if (editorRef.current) {
      const { innerHTML } = editorRef.current;
      // 移除innerHTML中的所有空白字符
      const trimmed = innerHTML.replace(/(\r\n|\n|\r|\t|\s)/gm, "");
      // 如果移除空白字符后的结果不为空，则认为有内容
      setInputStr(trimmed);
    }
  }, []);

  const checkIsShowSelectDialog = () => {
    const rangeInfo = getEditorRange();
    if (!rangeInfo || !rangeInfo.range || !rangeInfo.selection) return;
    const curNode = rangeInfo.range.endContainer;

    if (!curNode || !curNode.textContent || curNode.nodeName !== "#text")
      return;
    const searchStr = curNode.textContent.slice(
      0,
      rangeInfo.selection.focusOffset
    );
    // 判断光标位置前方是否有at，只有一个at则展示默认dialog，除了at还有关键字则展示searchDialog
    const keywords = /@([^@]*)$/.exec(searchStr);
    if (keywords && keywords.length >= 2) {
      // 展示搜索选人
      setShowDialog(true);
      // setSearchKey(keyWord);
      // 记下弹窗前光标位置range
      editorRange.current = rangeInfo;
    } else {
      // 关掉选人
      setShowDialog(false);
    }
  };

  const onInputBlur = () => {
    editorRange.current = getEditorRange();
    setTimeout(() => {
      setShowDialog(false);
    }, 16);
  };

  const onSelectPerson = (personItem: IPerson) => {
    // 选择人员后关闭并重置选人框，重置搜索词
    setShowDialog(false);
    // setPersonList([])
    const editor = editorRef.current;
    if (editor) {
      const myEditorRange = editorRange?.current?.range;
      if (!myEditorRange) return;
      const textNode = myEditorRange.endContainer; // 拿到末尾文本节点
      const endOffset = myEditorRange.endOffset; // 光标位置
      // 找出光标前的@符号位置
      const textNodeValue = textNode.nodeValue;
      const expRes = /@([^@]*)$/.exec(textNodeValue);
      if (expRes && expRes.length > 1) {
        myEditorRange.setStart(textNode, expRes.index);
        myEditorRange.setEnd(textNode, endOffset);
        myEditorRange.deleteContents(); // 删除草稿end
        const btn = document.createElement("button");
        btn.dataset.person = JSON.stringify(personItem);
        btn.textContent = `@${personItem.label}`;
        btn.setAttribute(
          "style",
          "color:#4387f4;border:none;background:transparent;padding:0;font-size:inherit"
        );
        btn.contentEditable = "false";
        btn.addEventListener(
          "click",
          () => {
            return false;
          },
          false
        );
        btn.tabindex = "0";
        const bSpaceNode = document.createTextNode("\u00A0"); // 插入空格字符
        insertHtmlAtCaret(
          [btn, bSpaceNode],
          editorRange.current.selection,
          editorRange.current.range
        );
      }
      // onDataChangeCallBack()
    }
  };
  const ensureLastChildIsBr = useCallback((element) => {
    const children = Array.from(element.childNodes);
    const lastChild = children[children.length - 1];
    if ((lastChild && lastChild.nodeName !== "BR") || !lastChild) {
      const br = document.createElement("br");
      element.appendChild(br);
    }
  }, []);
  // 键盘弹起
  const onInputKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 输入了@，直接弹选人浮层
    if (e.keyCode === 50 && e.shiftKey) {
      setShowDialog(true);
    } else {
      // 这里是输入的不是@，但是可能前方有@，因此需要进行检测看看是否要展示选人浮层 删除@后需要隐藏 选人弹框
      checkIsShowSelectDialog();
    }
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 确保div的最后一个子节点是br标签
    ensureLastChildIsBr(editorRef.current);
    // 设置maxLength后，限制字符数输入
    if (maxLength && maxLength > 0) {
      if (e.target.innerText.length >= maxLength) {
        // 不屏蔽删除键
        if (!(e.keyCode === 8 || e.keyCode === 46)) {
          e.preventDefault();
        }
      }
    }
    if (e.altKey && e.keyCode === 13) {
      // event.preventDefault();
      const { selection, range } = getEditorRange();

      if (selection) {
        // 创建一个换行符节点
        const br = document.createElement("br");

        // 在光标位置插入换行符
        range.insertNode(br);

        // 将光标移动到换行符后面
        range.setStartAfter(br);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      updateInputStr();
    }

    if (showDialog && items.length > 0) {
      const dialogHeight = 256;
      const itemHeight = 32;
      const menuDom = menuRef.current;
      const nowScrollTop = menuDom.scrollTop;
      // 向下移动光标，调整dialog选中的人
      if (e.keyCode === 40) {
        e.preventDefault();
        let newIndex = activeIndex + 1;
        if (newIndex === items.length) {
          newIndex = items.length - 1;
        }
        setActiveIndex(newIndex);
        // 调整滚动条的位置
        if ((newIndex + 1) * itemHeight > dialogHeight + nowScrollTop) {
          menuDom.scrollTo({
            top: (newIndex + 1) * itemHeight - dialogHeight,
            behavior: "smooth",
          });
        }
      }
      // 向上移动光标，调整dialog选中的人
      if (e.keyCode === 38) {
        e.preventDefault();
        let newIndex = activeIndex - 1;
        if (newIndex < 0) {
          newIndex = 0;
        }
        setActiveIndex(newIndex);
        if (newIndex * itemHeight < nowScrollTop) {
          menuDom.scrollTo({
            top: newIndex === 0 ? 0 : newIndex * itemHeight,
            behavior: "smooth",
          });
        }
      }
      // 按Enter键，确认选择当前人
      if (e.keyCode === 13) {
        e.preventDefault();
        onSelectPerson(items[activeIndex]);
      }
      return;
    }
    if (!e.altKey && e.keyCode === 13) {
      e.preventDefault();
    }
    
  };

  const dropdownMenu = useCallback(
    () => (
      <div className={styles.dropDownMenu} ref={menuRef}>
        {items.map((item, index) => (
          <div
            className={classNames(styles.item, {
              [styles.focusItem]: index === activeIndex,
            })}
            key={item.key}
            onClick={() => {
              onSelectPerson(item);
            }}
          >
            <div className={styles.icon}>{item.label[0]}</div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    ),
    [activeIndex]
  );

  const onInputText = () => {
    updateInputStr();
    // onDataChangeCallBack()
  };
  useEffect(() => {
    if(editorRef.current) {
      ensureLastChildIsBr(editorRef.current)
    }
  }, [ensureLastChildIsBr]);

  return (
    <div style={{ position: "relative" }}>
      <Dropdown dropdownRender={dropdownMenu} open={showDialog}>
        <div
          contentEditable
          className={styles["at-mentions__editor"]}
          ref={editorRef}
          // style={{ minHeight: minHeight > 0 ? minHeight : 'auto' }}
          // tabIndex={0}
          onKeyUp={onInputKeyUp}
          onKeyDown={onInputKeyDown}
          onBlur={onInputBlur}
          onMouseUp={checkIsShowSelectDialog}
          onFocus={checkIsShowSelectDialog}
          // onPaste={onPaste}
          onInput={onInputText}
        />
      </Dropdown>
      {!(inputStr && inputStr.length > 0 && inputStr !== "<br>") &&
        placeholder.length > 0 && (
          <div className={styles.placeholder}>{placeholder}</div>
        )}
    </div>
  );
};

export { Mentions };
