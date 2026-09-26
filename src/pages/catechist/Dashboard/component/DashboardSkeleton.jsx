import React from "react";
import { Row, Col, Card, Skeleton } from "antd";

const chibiCardStyle = {
  borderRadius: 24,
  border: "1px solid #F3F4F6",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
  background: "#FFFFFF",
  overflow: "hidden",
};

export default function DashboardSkeleton() {
  return (
    <Row gutter={[20, 20]}>
      {[1, 2, 3, 4].map((key) => (
        <Col xs={24} sm={12} lg={6} key={key}>
          <Card bordered={false} style={chibiCardStyle}>
            <Skeleton active avatar paragraph={{ rows: 2 }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
