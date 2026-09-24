import React, { useState } from "react";
import { NumberOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, InputNumber, message } from "antd";

const NumberPickerTool = () => {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);

  const handlePick = () => {
    const minimum = Number(min);
    const maximum = Number(max);

    if (minimum >= maximum) {
      message.warning("Số bắt đầu phải nhỏ hơn số kết thúc.");
      return;
    }

    setRolling(true);

    let count = 0;

    const interval = setInterval(() => {
      const value =
        Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

      setResult(value);

      count += 1;

      if (count >= 10) {
        clearInterval(interval);

        const finalValue =
          Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

        setResult(finalValue);
        setRolling(false);
      }
    }, 90);
  };

  return (
    <div className="tool-panel number-picker-tool">
      <div className="number-picker-settings">
        <div>
          <div className="tool-section-label">Từ</div>

          <InputNumber value={min} onChange={(value) => setMin(value ?? 1)} />
        </div>

        <div className="number-picker-separator">→</div>

        <div>
          <div className="tool-section-label">Đến</div>

          <InputNumber value={max} onChange={(value) => setMax(value ?? 100)} />
        </div>
      </div>

      <div className={`number-result ${rolling ? "is-rolling" : ""}`}>
        {result ?? "?"}
      </div>

      <div className="tool-actions tool-actions-center">
        <Button
          type="primary"
          size="large"
          icon={<NumberOutlined />}
          loading={rolling}
          onClick={handlePick}
        >
          {rolling ? "Đang bốc..." : "Bốc số"}
        </Button>

        {result !== null && !rolling && (
          <Button size="large" icon={<ReloadOutlined />} onClick={handlePick}>
            Bốc lại
          </Button>
        )}
      </div>
    </div>
  );
};

export default NumberPickerTool;
