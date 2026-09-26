import React, { memo, useEffect, useState } from "react";
import { Card, Flex, Button, Tag, Typography, Tooltip } from "antd";
import { ReloadOutlined, BookOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

const DailyVerseCard = memo(function DailyVerseCard({
  verse,
  loading = false,
  onRefresh,
  images = [],
}) {
  const [currentImage, setCurrentImage] = useState(null);

  /**
   * Chọn ảnh ban đầu
   */
  useEffect(() => {
    if (!images?.length) {
      setCurrentImage(null);
      return;
    }

    const randomIndex = Math.floor(Math.random() * images.length);

    setCurrentImage(images[randomIndex]);
  }, [images]);

  /**
   * Đổi ảnh
   */
  const handleRefresh = async () => {
    /**
     * Đổi ảnh trước
     */
    if (images?.length > 1) {
      setCurrentImage((current) => {
        const availableImages = images.filter((image) => image !== current);

        if (!availableImages.length) {
          return current;
        }

        const randomIndex = Math.floor(Math.random() * availableImages.length);

        return availableImages[randomIndex];
      });
    }

    /**
     * Gọi API đổi lời Chúa
     */
    if (onRefresh) {
      await onRefresh();
    }
  };

  return (
    <Card
      bordered={false}
      loading={loading}
      style={{
        position: "relative",
        minHeight: 260,
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid #E5E7EB",
        background: "#173B5E",
        boxShadow: "0 6px 24px rgba(23, 59, 94, 0.08)",
      }}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      {/* =====================================================
          BACKGROUND IMAGE
      ====================================================== */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: currentImage ? `url(${currentImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* =====================================================
          OVERLAY
      ====================================================== */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(10,28,45,0.08) 0%, rgba(10,28,45,0.18) 35%, rgba(10,28,45,0.82) 100%)",
        }}
      />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: 260,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* =================================================
            HEADER
        ================================================== */}

        <Flex justify="space-between" align="center" gap={10}>
          <Tag
            icon={<BookOutlined />}
            style={{
              margin: 0,
              padding: "4px 9px",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 8,
              background: "rgba(255,255,255,0.16)",
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: 600,
              lineHeight: "18px",
              backdropFilter: "blur(8px)",
            }}
          >
            Lời Chúa mỗi ngày
          </Tag>

          <Tooltip title="Đổi lời Chúa">
            <Button
              type="text"
              shape="circle"
              icon={
                <ReloadOutlined
                  style={{
                    fontSize: 14,
                    color: "#FFFFFF",
                  }}
                />
              }
              onClick={handleRefresh}
              style={{
                width: 34,
                height: 34,
                minWidth: 34,
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
              }}
            />
          </Tooltip>
        </Flex>

        {/* =================================================
            VERSE
        ================================================== */}

        <div
          style={{
            width: "100%",
            maxWidth: 720,
            margin: "32px auto 0",
          }}
        >
          <Paragraph
            style={{
              margin: 0,
              color: "#FFFFFF",
              fontSize: 16,
              lineHeight: 1.65,
              fontStyle: "italic",
              fontWeight: 600,
              textAlign: "center",
              textShadow: "0 2px 8px rgba(0,0,0,0.45)",
            }}
          >
            “
            {verse?.verse_text ||
              "Chúa là mục tử chăn dắt tôi, tôi chẳng thiếu thốn gì."}
            ”
          </Paragraph>

          <Text
            style={{
              display: "block",
              marginTop: 10,
              color: "#E2E8F0",
              fontSize: 12,
              fontWeight: 700,
              textAlign: "center",
              textShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}
          >
            — {verse?.reference || "Tv 23,1"}
          </Text>
        </div>

        {/* =================================================
            FOOTER
        ================================================== */}

        <Flex
          justify="center"
          align="center"
          gap={5}
          style={{
            marginTop: 22,
          }}
        >
          {images.length > 0 &&
            images.map((image, index) => (
              <div
                key={image || index}
                style={{
                  width: image === currentImage ? 18 : 6,
                  height: 6,
                  borderRadius: 10,
                  background:
                    image === currentImage
                      ? "#FFFFFF"
                      : "rgba(255,255,255,0.45)",
                  transition: "all 0.25s ease",
                }}
              />
            ))}
        </Flex>
      </div>
    </Card>
  );
});

export default DailyVerseCard;
