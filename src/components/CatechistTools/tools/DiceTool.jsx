import React, { useState } from "react";
import { ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";

const DICE = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const DiceTool = () => {
  const [value, setValue] = useState(null);
  const [rolling, setRolling] = useState(false);

  const handleRoll = () => {
    setRolling(true);

    let count = 0;

    const interval = setInterval(() => {
      const random = Math.floor(Math.random() * 6);

      setValue(random);

      count += 1;

      if (count >= 10) {
        clearInterval(interval);

        setValue(Math.floor(Math.random() * 6));
        setRolling(false);
      }
    }, 100);
  };

  return (
    <div className="tool-panel dice-tool">
      <div className={`dice-display ${rolling ? "is-rolling" : ""}`}>
        {value !== null ? DICE[value] : "🎲"}
      </div>

      <div className="dice-number">
        {value !== null ? `Mặt ${value + 1}` : "Chưa tung"}
      </div>

      <div className="tool-actions tool-actions-center">
        <Button
          type="primary"
          size="large"
          loading={rolling}
          onClick={handleRoll}
        >
          {rolling ? "Đang tung..." : "Tung xúc xắc"}
        </Button>

        {value !== null && !rolling && (
          <Button size="large" icon={<ReloadOutlined />} onClick={handleRoll}>
            Tung lại
          </Button>
        )}
      </div>
    </div>
  );
};

export default DiceTool;
