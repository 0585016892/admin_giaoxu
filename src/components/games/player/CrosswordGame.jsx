// CrosswordGame.jsx
import React from "react";
import { Button, Result } from "antd";

const CrosswordGame = ({ game, onExit }) => (
  <Result
    status="info"
    title={`Ô chữ - ${game.name}`}
    subTitle="Màn chơi đang được xây dựng."
    extra={<Button onClick={onExit}>Quay lại</Button>}
  />
);

export default CrosswordGame;
