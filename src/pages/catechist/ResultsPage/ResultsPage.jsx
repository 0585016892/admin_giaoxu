import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Card,
  Empty,
  Pagination,
  Select,
  Spin,
  Tabs,
  message,
} from "antd";

import {
  BookOutlined,
  CalculatorOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

import classApi from "../../../api/classApi";
import studentApi from "../../../api/studentApi";
import resultApi from "../../../api/resultApi";

import ResultsHeader from "./components/ResultsHeader";
import ResultsOverview from "./components/ResultsOverview";
import ResultsFilters from "./components/ResultsFilters";
import ResultsTable from "./components/ResultsTable";
import StudentResultModal from "./components/StudentResultModal";
import ResultFormModal from "./components/ResultFormModal";
import Leaderboard from "./components/Leaderboard";

import {
  extractList,
  normalizeResults,
  normalizeRule,
  buildClassSummaries,
  calculateClassStatistics,
  getLeaderboardRows,
} from "../../../utils/resultsUtils";

import "./resultsPage.css";

/* ============================================================
   RESPONSE HELPERS
============================================================ */

const unwrap = (response) => {
  if (!response) {
    return null;
  }

  if (response?.data?.success !== undefined) {
    return response.data;
  }

  if (response?.success !== undefined) {
    return response;
  }

  if (response?.data !== undefined) {
    return response.data;
  }

  return response;
};

/* ============================================================
   PAGE
============================================================ */

const ResultsPage = () => {
  /* ==========================================================
     DATA
  ========================================================== */

  const [classes, setClasses] = useState([]);

  const [students, setStudents] = useState([]);

  const [results, setResults] = useState([]);

  const [gradingRule, setGradingRule] = useState(null);

  /* ==========================================================
     LOADING
  ========================================================== */

  const [initialLoading, setInitialLoading] = useState(true);

  const [classLoading, setClassLoading] = useState(false);

  const [studentLoading, setStudentLoading] = useState(false);

  const [resultLoading, setResultLoading] = useState(false);

  const [ruleLoading, setRuleLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  /* ==========================================================
     CLASS
  ========================================================== */

  const [selectedClassId, setSelectedClassId] = useState(null);

  /* ==========================================================
     FILTER
  ========================================================== */

  const [searchText, setSearchText] = useState("");

  const [scoreFilter, setScoreFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  /* ==========================================================
     DETAIL
  ========================================================== */

  const [detailOpen, setDetailOpen] = useState(false);

  const [detailStudent, setDetailStudent] = useState(null);

  const [detailResults, setDetailResults] = useState([]);

  const [detailLoading, setDetailLoading] = useState(false);

  /* ==========================================================
     FORM
  ========================================================== */

  const [formOpen, setFormOpen] = useState(false);

  const [editingResult, setEditingResult] = useState(null);

  /* ==========================================================
     LOAD RULE
  ========================================================== */

  const loadRule = useCallback(async () => {
    try {
      setRuleLoading(true);

      const response = await resultApi.getGradingRule();

      const data = unwrap(response);

      if (data?.success === false) {
        setGradingRule(null);

        return null;
      }

      const rawRule = data?.data || data?.rule || data;

      const rule = normalizeRule(rawRule);

      setGradingRule(rule);

      return rule;
    } catch (error) {
      setGradingRule(null);

      message.error(
        error?.response?.data?.message || "Không thể tải quy tắc tính điểm",
      );

      return null;
    } finally {
      setRuleLoading(false);
    }
  }, []);

  /* ==========================================================
     LOAD CLASSES
  ========================================================== */

  const loadClasses = useCallback(async () => {
    try {
      setClassLoading(true);

      const response = await classApi.getClassTeacher();

      const data = unwrap(response);

      const list = extractList(data)
        .map((item) => ({
          ...item,

          id: Number(item.id),

          name:
            item.name || item.class_name || item.className || `Lớp #${item.id}`,
        }))
        .filter((item) => Number.isFinite(item.id));

      setClasses(list);

      return list;
    } catch (error) {
      setClasses([]);

      message.error(
        error?.response?.data?.message || "Không thể tải danh sách lớp",
      );

      return [];
    } finally {
      setClassLoading(false);
    }
  }, []);

  /* ==========================================================
     LOAD STUDENTS
  ========================================================== */

  const loadStudents = useCallback(async (classId) => {
    if (!classId) {
      setStudents([]);
      return [];
    }

    try {
      setStudentLoading(true);

      const response = await studentApi.getAll({
        class_id: classId,
      });

      const data = unwrap(response);

      const list = extractList(data);

      setStudents(list);

      return list;
    } catch (error) {
      setStudents([]);

      message.error(
        error?.response?.data?.message || "Không thể tải danh sách học viên",
      );

      return [];
    } finally {
      setStudentLoading(false);
    }
  }, []);

  /* ==========================================================
     LOAD RESULTS
  ========================================================== */

  const loadResults = useCallback(async (classId) => {
    if (!classId) {
      setResults([]);
      return [];
    }

    try {
      setResultLoading(true);

      const response = await resultApi.getResultsByClass(classId);

      const data = unwrap(response);

      if (data?.success === false) {
        setResults([]);

        message.error(data?.message || "Không thể tải bảng điểm");

        return [];
      }

      const list = normalizeResults(extractList(data));

      setResults(list);

      return list;
    } catch (error) {
      setResults([]);

      message.error(
        error?.response?.data?.message || "Không thể tải bảng điểm",
      );

      return [];
    } finally {
      setResultLoading(false);
    }
  }, []);

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setInitialLoading(true);

      const [classList] = await Promise.all([loadClasses(), loadRule()]);

      if (mounted && classList?.length === 1) {
        setSelectedClassId(classList[0].id);
      }

      if (mounted) {
        setInitialLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [loadClasses, loadRule]);

  /* ==========================================================
     CLASS CHANGE
  ========================================================== */

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setResults([]);
      return;
    }

    setCurrentPage(1);
    setSearchText("");
    setScoreFilter("all");

    loadStudents(selectedClassId);

    loadResults(selectedClassId);
  }, [selectedClassId, loadStudents, loadResults]);

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh = useCallback(async () => {
    const [classList] = await Promise.all([loadClasses(), loadRule()]);

    const currentId = selectedClassId;

    if (
      currentId &&
      classList.some((item) => Number(item.id) === Number(currentId))
    ) {
      await Promise.all([loadStudents(currentId), loadResults(currentId)]);
    }
  }, [selectedClassId, loadClasses, loadRule, loadStudents, loadResults]);

  /* ==========================================================
     SELECTED CLASS
  ========================================================== */

  const selectedClass = useMemo(
    () => classes.find((item) => Number(item.id) === Number(selectedClassId)),
    [classes, selectedClassId],
  );

  /* ==========================================================
     SUMMARIES
  ========================================================== */

  const summaries = useMemo(() => {
    if (!students.length) {
      return [];
    }

    return buildClassSummaries({
      students,
      results,
      rule: gradingRule,
    });
  }, [students, results, gradingRule]);

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredSummaries = useMemo(() => {
    let data = [...summaries];

    const keyword = searchText.trim().toLowerCase();

    if (keyword) {
      data = data.filter(
        (item) =>
          String(item.student_name || "")
            .toLowerCase()
            .includes(keyword) ||
          String(item.student_code || "")
            .toLowerCase()
            .includes(keyword),
      );
    }

    if (scoreFilter !== "all") {
      data = data.filter((item) => {
        const score = item.score;

        if (scoreFilter === "pending") {
          return score === null || score === undefined;
        }

        if (score === null || score === undefined) {
          return false;
        }

        if (scoreFilter === "good") {
          return Number(score) >= 8;
        }

        if (scoreFilter === "pass") {
          return (
            Number(score) >= Number(gradingRule?.pass_score || 5) &&
            Number(score) < 8
          );
        }

        if (scoreFilter === "fail") {
          return Number(score) < Number(gradingRule?.pass_score || 5);
        }

        return true;
      });
    }

    return data;
  }, [summaries, searchText, scoreFilter, gradingRule]);

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const paginatedSummaries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredSummaries.slice(start, start + pageSize);
  }, [filteredSummaries, currentPage, pageSize]);

  /* ==========================================================
     STATISTICS
  ========================================================== */

  const statistics = useMemo(
    () => calculateClassStatistics(summaries, gradingRule),
    [summaries, gradingRule],
  );

  /* ==========================================================
     LEADERBOARD
  ========================================================== */

  const leaderboard = useMemo(() => getLeaderboardRows(summaries), [summaries]);

  /* ==========================================================
     VIEW DETAIL
  ========================================================== */

  const handleViewDetail = useCallback(
    async (record) => {
      const student = students.find(
        (item) => Number(item.id) === Number(record.student_id),
      );

      setDetailStudent(
        student || {
          id: record.student_id,

          name: record.student_name,

          code: record.student_code,
        },
      );

      setDetailOpen(true);

      try {
        setDetailLoading(true);

        const response = await resultApi.getResultsByStudent(record.student_id);

        const data = unwrap(response);

        const list = normalizeResults(extractList(data));

        const classList = list.filter(
          (item) =>
            !selectedClassId ||
            item.class_id === null ||
            Number(item.class_id) === Number(selectedClassId),
        );

        setDetailResults(classList);
      } catch (error) {
        setDetailResults(record.results || []);
      } finally {
        setDetailLoading(false);
      }
    },
    [students, selectedClassId],
  );

  /* ==========================================================
     CREATE
  ========================================================== */

  const handleCreate = () => {
    if (!selectedClassId) {
      message.warning("Vui lòng chọn lớp trước");
      return;
    }

    if (!students.length) {
      message.warning("Lớp chưa có học viên");
      return;
    }

    if (!gradingRule || !gradingRule.items?.length) {
      message.warning("Giáo xứ chưa cấu hình quy tắc tính điểm");
      return;
    }

    setEditingResult(null);

    setFormOpen(true);
  };

  /* ==========================================================
     EDIT
  ========================================================== */

  const handleEdit = (record) => {
    setEditingResult(record);

    setFormOpen(true);
  };

  /* ==========================================================
     SUBMIT RESULT
  ========================================================== */

  const handleSubmitResult = async (payload) => {
    if (!selectedClassId) {
      return;
    }

    try {
      setSubmitting(true);

      const finalPayload = {
        ...payload,

        class_id: Number(selectedClassId),
      };

      let response;

      if (editingResult) {
        response = await resultApi.updateResult(editingResult.id, finalPayload);
      } else {
        response = await resultApi.createResult(finalPayload);
      }

      const data = unwrap(response);

      if (data?.success === false) {
        throw new Error(data?.message || "Không thể lưu điểm");
      }

      message.success(
        editingResult ? "Cập nhật điểm thành công" : "Nhập điểm thành công",
      );

      setFormOpen(false);

      setEditingResult(null);

      await loadResults(selectedClassId);

      if (detailStudent?.id) {
        const student = students.find(
          (item) => Number(item.id) === Number(detailStudent.id),
        );

        if (student) {
          await handleViewDetail({
            student_id: student.id,

            results: results.filter(
              (item) => Number(item.student_id) === Number(student.id),
            ),
          });
        }
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể lưu điểm",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ==========================================================
     DELETE
  ========================================================== */

  const handleDelete = async (resultId) => {
    if (!resultId) {
      return;
    }

    try {
      setDeletingId(resultId);

      const response = await resultApi.deleteResult(resultId);

      const data = unwrap(response);

      if (data?.success === false) {
        throw new Error(data?.message || "Không thể xóa điểm");
      }

      message.success("Đã xóa kết quả");

      await loadResults(selectedClassId);

      if (detailStudent?.id) {
        const currentResults = await resultApi.getResultsByStudent(
          detailStudent.id,
        );

        const currentData = unwrap(currentResults);

        setDetailResults(normalizeResults(extractList(currentData)));
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể xóa điểm",
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ==========================================================
     CLOSE FORM
  ========================================================== */

  const handleCloseForm = () => {
    if (submitting) {
      return;
    }

    setFormOpen(false);

    setEditingResult(null);
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (initialLoading) {
    return (
      <div className="results-page results-page-loading">
        <Spin size="large" />

        <span>Đang tải bảng điểm...</span>
      </div>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="results-page">
      <ResultsHeader
        onRefresh={handleRefresh}
        refreshLoading={
          classLoading || studentLoading || resultLoading || ruleLoading
        }
        onCreate={handleCreate}
        createDisabled={
          !selectedClassId || !gradingRule || !gradingRule.items?.length
        }
      />

      {!gradingRule && (
        <Alert
          type="warning"
          showIcon
          icon={<CalculatorOutlined />}
          className="results-warning"
          message="Chưa có quy tắc tính điểm"
          description="Hãy cấu hình quy tắc tính điểm cho giáo xứ trước khi nhập kết quả học tập."
        />
      )}

      {gradingRule && !gradingRule.items?.length && (
        <Alert
          type="warning"
          showIcon
          message="Quy tắc chưa có đầu điểm"
          description="Hãy thêm ít nhất một đầu điểm vào quy tắc tính điểm."
        />
      )}

      {/* ======================================================
          CLASS SELECT
      ====================================================== */}

      <Card bordered={false} className="results-class-selector">
        <div className="results-class-selector-left">
          <div className="results-class-selector-icon">
            <BookOutlined />
          </div>

          <div>
            <strong>Lớp học</strong>

            <span>Chọn lớp để xem bảng điểm</span>
          </div>
        </div>

        <Select
          size="large"
          showSearch
          optionFilterProp="label"
          placeholder="Chọn lớp học"
          value={selectedClassId ? String(selectedClassId) : undefined}
          onChange={(value) => {
            setSelectedClassId(Number(value));
          }}
          loading={classLoading}
          options={classes.map((item) => ({
            value: String(item.id),
            label: item.name,
          }))}
          className="results-class-select"
        />
      </Card>

      {!selectedClassId ? (
        <Card bordered={false} className="results-empty-card">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chọn lớp học để bắt đầu quản lý bảng điểm"
          />
        </Card>
      ) : (
        <>
          <ResultsOverview statistics={statistics} rule={gradingRule} />

          <Card bordered={false} className="results-content-card">
            <div className="results-content-heading">
              <div>
                <div className="results-content-title">
                  <div className="results-content-title-icon">
                    <TrophyOutlined />
                  </div>

                  <div>
                    <strong>{selectedClass?.name || "Bảng điểm"}</strong>

                    <span>{filteredSummaries.length} học viên</span>
                  </div>
                </div>
              </div>
            </div>

            <ResultsFilters
              searchText={searchText}
              setSearchText={(value) => {
                setSearchText(value);
                setCurrentPage(1);
              }}
              scoreFilter={scoreFilter}
              setScoreFilter={(value) => {
                setScoreFilter(value);
                setCurrentPage(1);
              }}
              rule={gradingRule}
            />

            <Tabs
              className="results-tabs"
              items={[
                {
                  key: "table",

                  label: (
                    <span>
                      <BookOutlined />
                      Bảng điểm
                    </span>
                  ),

                  children: (
                    <>
                      <ResultsTable
                        data={paginatedSummaries}
                        rule={gradingRule}
                        loading={studentLoading || resultLoading}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        onView={handleViewDetail}
                      />

                      {filteredSummaries.length > 0 && (
                        <div className="results-pagination">
                          <span>
                            Hiển thị{" "}
                            <strong>{paginatedSummaries.length}</strong> /{" "}
                            <strong>{filteredSummaries.length}</strong>
                          </span>

                          <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={filteredSummaries.length}
                            showSizeChanger
                            pageSizeOptions={["10", "20", "50"]}
                            onChange={(page, size) => {
                              setCurrentPage(page);

                              setPageSize(size);
                            }}
                            size="small"
                          />
                        </div>
                      )}
                    </>
                  ),
                },

                {
                  key: "leaderboard",

                  label: (
                    <span>
                      <TrophyOutlined />
                      Xếp hạng
                    </span>
                  ),

                  children: (
                    <Leaderboard data={leaderboard} rule={gradingRule} />
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}

      {/* ======================================================
          DETAIL
      ====================================================== */}

      <StudentResultModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        student={detailStudent}
        results={detailResults}
        rule={gradingRule}
        loading={detailLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deletingId={deletingId}
      />

      {/* ======================================================
          FORM
      ====================================================== */}

      <ResultFormModal
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitResult}
        submitting={submitting}
        students={students}
        rule={gradingRule}
        editingResult={editingResult}
      />
    </div>
  );
};

export default ResultsPage;
