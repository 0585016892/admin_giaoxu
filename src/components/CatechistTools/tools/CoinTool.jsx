import React, { useState } from "react";
import { ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";

const CoinTool = () => {
  const [result, setResult] = useState(null);
  const [flipping, setFlipping] = useState(false);

  const handleFlip = () => {
    setFlipping(true);

    let count = 0;

    const interval = setInterval(() => {
      setResult(Math.random() > 0.5 ? "heads" : "tails");

      count += 1;

      if (count >= 12) {
        clearInterval(interval);

        setResult(Math.random() > 0.5 ? "heads" : "tails");

        setFlipping(false);
      }
    }, 100);
  };

  const isHeads = result === "heads";

  return (
    <div className="tool-panel coin-tool">
      <div className={`coin-display ${flipping ? "is-flipping" : ""}`}>
        {result === null ? "?" : isHeads ? "N" : "S"}
      </div>

      <div className="coin-result">
        {result === null ? "Tung đồng xu" : isHeads ? "NGỬA" : "SẤP"}
      </div>

      <div className="tool-actions tool-actions-center">
        <Button
          type="primary"
          size="large"
          loading={flipping}
          onClick={handleFlip}
        >
          {flipping ? "Đang tung..." : "Tung đồng xu"}
        </Button>

        {result !== null && !flipping && (
          <Button size="large" icon={<ReloadOutlined />} onClick={handleFlip}>
            Tung lại
          </Button>
        )}
      </div>
    </div>
  );
};

export default CoinTool;
