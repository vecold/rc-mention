import React, { useRef } from 'react';

function EditableDiv() {
  const editorRef = useRef(null);

  const handleKeyDown = (event) => {
    if (event.altKey && event.key === 'Enter') {
      // 阻止默认行为（例如，在某些浏览器中，ALT + ENTER可能默认会提交表单）
      event.preventDefault();

      // 获取当前光标位置
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // 创建一个换行符节点
        const br = document.createElement('br');

        // 在光标位置插入换行符
        range.insertNode(br);

        // 将光标移动到换行符后面
        range.setStartAfter(br);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  return (
    <div
      contentEditable
      ref={editorRef}
      onKeyDown={handleKeyDown}
      style={{width:'100px',height:'100px',background:'#fff',color:'black'}}
    >
      {/* 编辑器内容 */}
    </div>
  );
}

export default EditableDiv;