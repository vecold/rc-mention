import React, { useState } from "react";
import { Button, Drawer } from "antd";
import { Mentions } from "./mentions";
import "./App.css";

// const { TextArea } = Input;
function App() {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };
  return (
    <div className="main">
      {/* <Mentions /> */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#fff",
        }}
      >
        <Button type="primary" onClick={showDrawer}>
          Open
        </Button>
        
      </div>
      <Drawer
          title="Basic Drawer"
          getContainer={false}
          mask={false}
          onClose={onClose}
          open={open}
          style={{position:'relative'}}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Drawer>
    </div>
  );
}

export default App;
