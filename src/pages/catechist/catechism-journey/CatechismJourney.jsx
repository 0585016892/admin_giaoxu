import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Alert, Button, Spin } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import TreeJourneyMap from "./components/TreeJourneyMap";
import LessonModal from "./components/LessonModal";
import {
  getJourneyClasses,
  getClassJourney,
} from "../../../api/catechismJourneyApi";

import "./CatechismJourney.css";

/**
 * Chuẩn hóa dữ liệu API thành cấu trúc TreeJourneyMap đang sử dụng.
 * Không tạo chapters trong database; chapters ở đây chỉ là nhóm hiển thị.
 */
function mapApiClassToJourneyClass(item, journeyData = null) {
  const lessons =
    journeyData?.chapters?.flatMap((chapter) =>
      (chapter.lessons || []).map((lesson, index) => ({
        ...lesson,
        id: lesson.id,
        title: lesson.title,
        chapterTitle: chapter.title,
        order: lesson.order ?? index + 1,
        icon: "📖",
        description: "",
        image: "",
      })),
    ) || [];

  return {
    ...item,
    id: item.id,
    name: item.name,
    subtitle: item.category || "Chương trình giáo lý",
    icon: "📘",
    chapters: lessons.length
      ? [
          {
            id: `class-${item.id}-lessons`,
            title: "Hành trình bài học",
            lessons,
          },
        ]
      : [],
    lessons,
    lesson_count: journeyData?.lesson_count ?? item.lesson_count ?? 0,
    mapping_supported:
      journeyData?.mapping_supported ?? item.mapping_supported ?? false,
    journey_message: journeyData?.message || null,
  };
}

export default function CatechismJourney() {
  const [classes, setClasses] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadJourney = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await getJourneyClasses();

      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error(
          response?.message || "API không trả về danh sách lớp hợp lệ.",
        );
      }

      const classRows = response.data;

      // Tải hành trình riêng cho từng lớp để TreeJourneyMap nhận được
      // dữ liệu bài học thật, không còn sử dụng DEMO_CLASSES.
      const journeyResults = await Promise.all(
        classRows.map(async (item) => {
          try {
            const journeyResponse = await getClassJourney(item.id);

            if (!journeyResponse?.success) {
              return mapApiClassToJourneyClass(item);
            }

            return mapApiClassToJourneyClass(item, journeyResponse.data);
          } catch (err) {
            console.error(
              `[CatechismJourney] Không tải được lớp ${item.id}:`,
              err,
            );

            return mapApiClassToJourneyClass(item);
          }
        }),
      );

      setClasses(journeyResults);

      if (journeyResults.length === 0) {
        setNotice("Giáo xứ hiện chưa có lớp giáo lý đang hoạt động.");
      }
    } catch (err) {
      console.error("[CatechismJourney] loadJourney:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải hành trình giáo lý.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJourney();
  }, [loadJourney]);

  const lessons = useMemo(
    () =>
      classes.flatMap((item) =>
        (item.chapters || []).flatMap((chapter) =>
          (chapter.lessons || []).map((lesson) => ({
            ...lesson,
            classId: item.id,
            className: item.name,
          })),
        ),
      ),
    [classes],
  );

  const selectedLessonIndex = useMemo(
    () =>
      lessons.findIndex(
        (item) => String(item.id) === String(selectedLesson?.id),
      ),
    [lessons, selectedLesson],
  );

  const handleNextLesson = useCallback(() => {
    if (selectedLessonIndex >= 0 && selectedLessonIndex < lessons.length - 1) {
      setSelectedLesson(lessons[selectedLessonIndex + 1]);
    }
  }, [lessons, selectedLessonIndex]);

  return (
    <div className="journey-page tree-journey-page">
      <div className="journey-sky-glow" aria-hidden="true" />

      <main className="journey-main">
        {error && (
          <Alert
            type="error"
            showIcon
            message="Không tải được hành trình giáo lý"
            description={error}
            action={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={loadJourney}
              >
                Thử lại
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        )}

        {notice && (
          <Alert
            type="info"
            showIcon
            message={notice}
            style={{ marginBottom: 16 }}
          />
        )}

        {loading ? (
          <div
            style={{
              minHeight: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spin size="large" tip="Đang tải hành trình giáo lý..." />
          </div>
        ) : (
          <TreeJourneyMap
            classes={classes}
            onSelectLesson={setSelectedLesson}
          />
        )}
      </main>

      <AnimatePresence>
        {selectedLesson && (
          <LessonModal
            key={selectedLesson.id}
            lesson={selectedLesson}
            onClose={() => setSelectedLesson(null)}
            onNext={handleNextLesson}
            hasNext={
              selectedLessonIndex >= 0 &&
              selectedLessonIndex < lessons.length - 1
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
