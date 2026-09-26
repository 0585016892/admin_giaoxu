import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Card,
  Empty,
  Pagination,
  Select,
  Spin,
  Tabs,
  Tag,
  message,
} from "antd";

import {
  BookOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  UserOutlined,
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

      if (!mounted) {
        return;
      }

      if (classList?.length === 1) {
        setSelectedClassId(classList[0].id);
      }

      setInitialLoading(false);
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
      data = data.filter((item) => {
        const name = String(item.student_name || "").toLowerCase();

        const code = String(item.student_code || "").toLowerCase();

        return name.includes(keyword) || code.includes(keyword);
      });
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

        const numericScore = Number(score);
        const passScore = Number(gradingRule?.pass_score || 5);

        if (scoreFilter === "good") {
          return numericScore >= 8;
        }

        if (scoreFilter === "pass") {
          return numericScore >= passScore && numericScore < 8;
        }

        if (scoreFilter === "fail") {
          return numericScore < passScore;
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

  const handleCreate = useCallback(() => {
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
  }, [selectedClassId, students, gradingRule]);

  /* ==========================================================
     EDIT
  ========================================================== */

  const handleEdit = useCallback((record) => {
    setEditingResult(record);
    setFormOpen(true);
  }, []);

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
        await handleViewDetail({
          student_id: detailStudent.id,
        });
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
        const response = await resultApi.getResultsByStudent(detailStudent.id);

        const data = unwrap(response);

        const list = normalizeResults(extractList(data));

        setDetailResults(list);
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
        <div className="results-loading-box">
          <div className="results-loading-icon">
            <CalculatorOutlined />
          </div>

          <Spin />

          <strong>Đang tải bảng điểm</strong>

          <span>Vui lòng chờ trong giây lát...</span>
        </div>
      </div>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="results-page">
      {/* ====================================================
          HEADER
      ==================================================== */}

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

      {/* ====================================================
          WARNING
      ==================================================== */}

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
          className="results-warning"
          message="Quy tắc chưa có đầu điểm"
          description="Hãy thêm ít nhất một đầu điểm vào quy tắc tính điểm."
        />
      )}

      {/* ====================================================
          CLASS SELECTOR
      ==================================================== */}
      <Card bordered={false} className="results-class-selector">
        <div className="results-class-selector-main">
          <div className="results-class-selector-icon">
            <BookOutlined />
          </div>

          <span className="results-class-selector-label">Lớp học</span>

          <Select
            size="middle"
            showSearch
            allowClear
            optionFilterProp="label"
            placeholder="Chọn lớp học"
            value={selectedClassId ? String(selectedClassId) : undefined}
            onChange={(value) => {
              setSelectedClassId(value ? Number(value) : null);
            }}
            loading={classLoading}
            options={classes.map((item) => ({
              value: String(item.id),
              label: item.name,
            }))}
            className="results-class-select"
          />
        </div>
      </Card>
      {/* ====================================================
          EMPTY CLASS
      ==================================================== */}

      {!selectedClassId ? (
        <Card bordered={false} className="results-empty-card">
          <div className="results-empty-icon">
            <BookOutlined />
          </div>

          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="results-empty-content">
                <strong>Chưa chọn lớp học</strong>

                <span>
                  Chọn một lớp ở phía trên để bắt đầu quản lý bảng điểm.
                </span>
              </div>
            }
          />
        </Card>
      ) : (
        <>
          {/* ==================================================
              OVERVIEW
          ================================================== */}

          <ResultsOverview
            statistics={statistics}
            rule={gradingRule}
            loading={studentLoading || resultLoading}
          />

          {/* ==================================================
              MAIN CONTENT
          ================================================== */}

          <Card bordered={false} className="results-content-card">
            {/* ------------------------------------------------
                CONTENT HEADER
            ------------------------------------------------ */}

            <div className="results-content-heading">
              <div className="results-heading-left">
                <div className="results-heading-icon">
                  <TrophyOutlined />
                </div>

                <div className="results-heading-info">
                  <div className="results-heading-title">
                    {selectedClass?.name || "Bảng điểm"}
                  </div>

                  <div className="results-heading-meta">
                    <span>
                      <UserOutlined />
                      {students.length} học viên
                    </span>

                    <span className="results-heading-dot">•</span>

                    <span>{results.length} kết quả</span>
                  </div>
                </div>
              </div>

              <div className="results-heading-right">
                {gradingRule ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">
                    Đã cấu hình điểm
                  </Tag>
                ) : (
                  <Tag icon={<CalculatorOutlined />} color="warning">
                    Chưa cấu hình
                  </Tag>
                )}
              </div>
            </div>

            {/* ------------------------------------------------
                FILTER
            ------------------------------------------------ */}

            <div className="results-filter-wrapper">
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
            </div>

            {/* ------------------------------------------------
                TABS
            ------------------------------------------------ */}

            <Tabs
              className="results-tabs"
              items={[
                {
                  key: "table",

                  label: (
                    <span className="results-tab-label">
                      <BookOutlined />
                      Bảng điểm
                      <span className="results-tab-count">
                        {filteredSummaries.length}
                      </span>
                    </span>
                  ),

                  children: (
                    <div className="results-table-section">
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
                          <div className="results-pagination-info">
                            Hiển thị{" "}
                            <strong>{paginatedSummaries.length}</strong> /{" "}
                            <strong>{filteredSummaries.length}</strong> học viên
                          </div>

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
                            showTotal={(total, range) =>
                              `${range[0]}-${range[1]} / ${total}`
                            }
                          />
                        </div>
                      )}

                      {!filteredSummaries.length &&
                        !studentLoading &&
                        !resultLoading && (
                          <div className="results-filter-empty">
                            <Empty
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                              description="Không tìm thấy học viên phù hợp"
                            />
                          </div>
                        )}
                    </div>
                  ),
                },

                {
                  key: "leaderboard",

                  label: (
                    <span className="results-tab-label">
                      <TrophyOutlined />
                      Xếp hạng
                      <span className="results-tab-count">
                        {leaderboard.length}
                      </span>
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

      {/* ====================================================
          DETAIL MODAL
      ==================================================== */}

      <StudentResultModal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailStudent(null);
        }}
        student={detailStudent}
        results={detailResults}
        rule={gradingRule}
        loading={detailLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deletingId={deletingId}
      />

      {/* ====================================================
          FORM MODAL
      ==================================================== */}

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
