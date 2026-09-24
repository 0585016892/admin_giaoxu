import React, { useEffect, useMemo, useState } from "react";
import {
  PauseOutlined,
  CaretRightOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, InputNumber, Progress, message } from "antd";

const TimerTool = () => {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);

  const [remaining, setRemaining] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(5 * 60);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          clearInterval(interval);
          setRunning(false);
          message.success("Hết giờ!");
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const displayMinutes = Math.floor(remaining / 60);
  const displaySeconds = remaining % 60;

  const formattedTime = `${String(displayMinutes).padStart(
    2,
    "0",
  )}:${String(displaySeconds).padStart(2, "0")}`;

  const percent = useMemo(() => {
    if (!initialSeconds) return 0;

    return Math.round(((initialSeconds - remaining) / initialSeconds) * 100);
  }, [initialSeconds, remaining]);

  const handleSetTime = () => {
    const total = Math.max(0, Number(minutes || 0) * 60 + Number(seconds || 0));

    if (total <= 0) {
      message.warning("Vui lòng nhập thời gian lớn hơn 0.");
      return;
    }

    setInitialSeconds(total);
    setRemaining(total);
    setRunning(false);
  };

  const handleStart = () => {
    if (remaining <= 0) {
      handleSetTime();
      return;
    }

    setRunning(true);
  };

  const handleReset = () => {
    setRunning(false);
    setRemaining(initialSeconds);
  };

  return (
    <div className="tool-panel timer-tool">
      <div className="tool-panel-section">
        <div className="tool-section-label">Thời gian</div>

        <div className="timer-inputs">
          <div>
            <InputNumber
              min={0}
              max={999}
              value={minutes}
              onChange={(value) => setMinutes(value ?? 0)}
              addonAfter="phút"
            />
          </div>

          <div>
            <InputNumber
              min={0}
              max={59}
              value={seconds}
              onChange={(value) => setSeconds(value ?? 0)}
              addonAfter="giây"
            />
          </div>

          <Button onClick={handleSetTime}>Áp dụng</Button>
        </div>
      </div>

      <div className="timer-display-card">
        <div className="timer-display">{formattedTime}</div>

        <Progress percent={percent} showInfo={false} strokeWidth={8} />
      </div>

      <div className="tool-actions tool-actions-center">
        {!running ? (
          <Button
            type="primary"
            icon={<CaretRightOutlined />}
            size="large"
            onClick={handleStart}
          >
            {remaining === initialSeconds ? "Bắt đầu" : "Tiếp tục"}
          </Button>
        ) : (
          <Button
            size="large"
            icon={<PauseOutlined />}
            onClick={() => setRunning(false)}
          >
            Tạm dừng
          </Button>
        )}

        <Button size="large" icon={<ReloadOutlined />} onClick={handleReset}>
          Đặt lại
        </Button>
      </div>
    </div>
  );
};

export default TimerTool;
