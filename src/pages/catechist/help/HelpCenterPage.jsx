// src/pages/help/HelpCenterPage.jsx

import React, { useMemo, useState } from "react";

import { Button, Input, Typography, Modal } from "antd";

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BarChartOutlined,
  BankOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  FormOutlined,
  QuestionCircleOutlined,
  RocketOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { useSearchParams } from "react-router-dom";

import { HELP_ARTICLES, HELP_CATEGORIES } from "./helpData";

import { HELP_STYLES } from "./HelpCenterStyles";

const { Title, Paragraph } = Typography;

const ICONS = {
  RocketOutlined,
  TeamOutlined,
  BankOutlined,
  CheckCircleOutlined,
  UserOutlined,
  FormOutlined,
  BarChartOutlined,
  SettingOutlined,
  ToolOutlined,
};

const QUICK_CATEGORY_KEYS = ["students", "attendance", "classes", "accounts"];

const HelpCenterPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const articleId = searchParams.get("article");
  const categoryKey = searchParams.get("category");

  const [searchText, setSearchText] = useState("");
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // =====================================================
  // ARTICLE
  // =====================================================

  const selectedArticle = useMemo(() => {
    if (!articleId) return null;

    return HELP_ARTICLES.find((item) => item.id === articleId) || null;
  }, [articleId]);

  // =====================================================
  // CATEGORY
  // =====================================================

  const selectedCategory = useMemo(() => {
    if (!categoryKey) return null;

    return HELP_CATEGORIES.find((item) => item.key === categoryKey) || null;
  }, [categoryKey]);

  const categoryArticles = useMemo(() => {
    if (!categoryKey) return [];

    return HELP_ARTICLES.filter((article) => article.category === categoryKey);
  }, [categoryKey]);

  // =====================================================
  // POPULAR
  // =====================================================

  const popularArticles = useMemo(() => {
    const preferredIds = [
      "attendance-qr",
      "student-import",
      "class-teacher",
      "account-role",
      "attendance-catechism",
      "student-create",
    ];

    return preferredIds
      .map((id) => HELP_ARTICLES.find((article) => article.id === id))
      .filter(Boolean)
      .slice(0, 5);
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const searchResults = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return [];

    return HELP_ARTICLES.filter((article) => {
      const content = [
        article.title,
        article.description,
        ...(article.keywords || []),
        ...(article.steps || []).map((step) => `${step.title} ${step.content}`),
      ]
        .join(" ")
        .toLowerCase();

      return content.includes(keyword);
    });
  }, [searchText]);

  // =====================================================
  // NAVIGATION
  // =====================================================

  const goHome = () => {
    setSearchText("");
    setSearchParams({});
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openArticle = (article) => {
    if (!article?.id) return;

    setSearchText("");

    setSearchParams({
      article: article.id,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openCategory = (category) => {
    if (!category?.key) return;

    setSearchText("");

    setSearchParams({
      category: category.key,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DETAIL ARTICLE
  // =====================================================

  if (selectedArticle) {
    const category = HELP_CATEGORIES.find(
      (item) => item.key === selectedArticle.category,
    );

    return (
      <>
        <style>{HELP_STYLES}</style>

        <div className="faith-help-page">
          <div className="faith-help-container">
            <button
              type="button"
              className="faith-help-back-button"
              onClick={goHome}
            >
              <ArrowLeftOutlined />
              <span>Trung tâm trợ giúp</span>
            </button>

            <div className="faith-help-detail-layout">
              <main className="faith-help-detail-main">
                <div className="faith-help-detail-category">
                  {category?.title || "Hướng dẫn"}
                </div>

                <Title className="faith-help-detail-title">
                  {selectedArticle.title}
                </Title>

                <Paragraph className="faith-help-detail-description">
                  {selectedArticle.description}
                </Paragraph>

                <div className="faith-help-detail-divider" />

                <div className="faith-help-step-list">
                  {selectedArticle.steps?.map((step, index) => (
                    <div
                      className="faith-help-step-row"
                      key={`${selectedArticle.id}-${index}`}
                    >
                      <div className="faith-help-step-index">{index + 1}</div>

                      <div className="faith-help-step-body">
                        <Title level={3}>{step.title}</Title>

                        <Paragraph>{step.content}</Paragraph>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedArticle.tips?.length > 0 && (
                  <div className="faith-help-tip-box">
                    <div className="faith-help-tip-icon">💡</div>

                    <div>
                      <div className="faith-help-tip-title">Một vài lưu ý</div>

                      <ul>
                        {selectedArticle.tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="faith-help-detail-bottom">
                  <Button onClick={goHome} icon={<ArrowLeftOutlined />}>
                    Quay lại trợ giúp
                  </Button>
                </div>
              </main>

              <aside className="faith-help-detail-side">
                <div className="faith-help-side-card">
                  <div className="faith-help-side-icon">
                    <QuestionCircleOutlined />
                  </div>

                  <div className="faith-help-side-title">
                    Cần trợ giúp khác?
                  </div>

                  <div className="faith-help-side-description">
                    Khám phá thêm các hướng dẫn khác trong Trung tâm trợ giúp.
                  </div>

                  <Button block onClick={goHome}>
                    Xem tất cả hướng dẫn
                  </Button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </>
    );
  }

  // =====================================================
  // CATEGORY PAGE
  // =====================================================

  if (selectedCategory) {
    const Icon = ICONS[selectedCategory.icon] || QuestionCircleOutlined;

    return (
      <>
        <style>{HELP_STYLES}</style>

        <div className="faith-help-page">
          <div className="faith-help-container">
            <button
              type="button"
              className="faith-help-back-button"
              onClick={goHome}
            >
              <ArrowLeftOutlined />
              <span>Trung tâm trợ giúp</span>
            </button>

            <section className="faith-help-category-header">
              <div className="faith-help-category-header-icon">
                <Icon />
              </div>

              <div>
                <div className="faith-help-overline">CHỦ ĐỀ HƯỚNG DẪN</div>

                <Title>{selectedCategory.title}</Title>

                <Paragraph>{selectedCategory.description}</Paragraph>
              </div>
            </section>

            <section className="faith-help-category-articles">
              <div className="faith-help-category-articles-heading">
                <div>
                  <div className="faith-help-overline">HƯỚNG DẪN</div>

                  <Title level={2}>
                    {categoryArticles.length} bài hướng dẫn
                  </Title>
                </div>
              </div>

              {categoryArticles.length === 0 ? (
                <div className="faith-help-empty">
                  <QuestionCircleOutlined />

                  <div>Chưa có hướng dẫn cho chủ đề này.</div>
                </div>
              ) : (
                <div className="faith-help-article-list">
                  {categoryArticles.map((article) => (
                    <button
                      type="button"
                      className="faith-help-article-list-item"
                      key={article.id}
                      onClick={() => openArticle(article)}
                    >
                      <div className="faith-help-article-list-icon">
                        <FileTextOutlined />
                      </div>

                      <div className="faith-help-article-list-content">
                        <div className="faith-help-article-list-title">
                          {article.title}
                        </div>

                        <div className="faith-help-article-list-description">
                          {article.description}
                        </div>
                      </div>

                      <ArrowRightOutlined />
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </>
    );
  }

  // =====================================================
  // HOME
  // =====================================================

  return (
    <>
      <style>{HELP_STYLES}</style>

      <div className="faith-help-page">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="faith-help-hero-new">
          <div className="faith-help-hero-decoration faith-help-decoration-one" />
          <div className="faith-help-hero-decoration faith-help-decoration-two" />

          <div className="faith-help-container">
            <div className="faith-help-hero-inner">
              <div className="faith-help-hero-copy">
                <div className="faith-help-brand-badge">
                  <QuestionCircleOutlined />
                  FAITHEDU HELP CENTER
                </div>

                <Title>
                  Mình có thể giúp gì
                  <br />
                  cho bạn?
                </Title>

                <Paragraph>
                  Tìm nhanh hướng dẫn sử dụng FaithEdu và quản lý giáo lý của
                  giáo xứ dễ dàng hơn.
                </Paragraph>

                <div className="faith-help-search-wrapper">
                  <div className="faith-help-search-new">
                    <SearchOutlined />

                    <Input
                      bordered={false}
                      value={searchText}
                      onChange={(event) => {
                        setSearchText(event.target.value);
                      }}
                      placeholder="Tìm kiếm hướng dẫn..."
                      allowClear
                    />

                    <div className="faith-help-search-shortcut">Tìm kiếm</div>
                  </div>

                  {searchText.trim() && (
                    <div className="faith-help-search-results">
                      <div className="faith-help-search-results-header">
                        <span>Kết quả tìm kiếm</span>

                        <span>{searchResults.length}</span>
                      </div>

                      {searchResults.length === 0 ? (
                        <div className="faith-help-no-result">
                          <SearchOutlined />

                          <div>Không tìm thấy hướng dẫn phù hợp.</div>
                        </div>
                      ) : (
                        searchResults.slice(0, 8).map((article) => (
                          <button
                            type="button"
                            className="faith-help-search-result-item"
                            key={article.id}
                            onClick={() => openArticle(article)}
                          >
                            <div>
                              <div className="faith-help-result-title">
                                {article.title}
                              </div>

                              <div className="faith-help-result-description">
                                {article.description}
                              </div>
                            </div>

                            <ArrowRightOutlined />
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="faith-help-hero-illustration">
                <div className="faith-help-illustration-glow" />

                <div className="faith-help-illustration-card main">
                  <div className="faith-help-illustration-icon">?</div>

                  <div className="faith-help-illustration-line large" />
                  <div className="faith-help-illustration-line" />
                  <div className="faith-help-illustration-line short" />

                  <div className="faith-help-illustration-check">
                    <CheckCircleOutlined />
                    Hướng dẫn dễ hiểu
                  </div>
                </div>

                <div className="faith-help-floating-card one">
                  <TeamOutlined />
                  Học sinh
                </div>

                <div className="faith-help-floating-card two">
                  <CheckCircleOutlined />
                  Điểm danh
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            MAIN
        ================================================= */}

        <div className="faith-help-container">
          <section className="faith-help-section">
            <div className="faith-help-section-heading">
              <div>
                <div className="faith-help-overline">BẮT ĐẦU NHANH</div>

                <Title level={2}>Bạn đang cần làm gì?</Title>

                <Paragraph>
                  Chọn một nhóm để tìm đúng hướng dẫn bạn đang cần.
                </Paragraph>
              </div>
            </div>

            <div className="faith-help-quick-grid">
              {QUICK_CATEGORY_KEYS.map((categoryKey) => {
                const category = HELP_CATEGORIES.find(
                  (item) => item.key === categoryKey,
                );

                if (!category) return null;

                const Icon = ICONS[category.icon] || QuestionCircleOutlined;

                const count = HELP_ARTICLES.filter(
                  (article) => article.category === category.key,
                ).length;

                return (
                  <button
                    type="button"
                    key={category.key}
                    className="faith-help-quick-card"
                    onClick={() => openCategory(category)}
                  >
                    <div className="faith-help-quick-icon">
                      <Icon />
                    </div>

                    <div className="faith-help-quick-content">
                      <div className="faith-help-quick-title">
                        {category.title}
                      </div>

                      <div className="faith-help-quick-description">
                        {category.description}
                      </div>

                      <div className="faith-help-quick-footer">
                        <span>{count} hướng dẫn</span>

                        <ArrowRightOutlined />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* =================================================
              ALL CATEGORIES
          ================================================= */}

          <section className="faith-help-section">
            <div className="faith-help-section-heading compact">
              <div>
                <div className="faith-help-overline">KHÁM PHÁ</div>

                <Title level={2}>Tất cả chủ đề</Title>
              </div>
            </div>

            <div className="faith-help-category-grid">
              {HELP_CATEGORIES.map((category) => {
                const Icon = ICONS[category.icon] || QuestionCircleOutlined;

                const count = HELP_ARTICLES.filter(
                  (article) => article.category === category.key,
                ).length;

                return (
                  <button
                    type="button"
                    className="faith-help-category-card"
                    key={category.key}
                    onClick={() => openCategory(category)}
                  >
                    <div className="faith-help-category-card-icon">
                      <Icon />
                    </div>

                    <div className="faith-help-category-card-body">
                      <div className="faith-help-category-card-title">
                        {category.title}
                      </div>

                      <div className="faith-help-category-card-description">
                        {category.description}
                      </div>

                      <div className="faith-help-category-card-count">
                        {count} bài hướng dẫn
                      </div>
                    </div>

                    <ArrowRightOutlined />
                  </button>
                );
              })}
            </div>
          </section>

          {/* =================================================
              POPULAR
          ================================================= */}

          <section className="faith-help-popular-section">
            <div className="faith-help-popular-header">
              <div>
                <div className="faith-help-overline">ĐƯỢC QUAN TÂM</div>

                <Title level={2}>Hướng dẫn phổ biến</Title>
              </div>

              <Button type="text" onClick={goHome}>
                Xem tất cả
                <ArrowRightOutlined />
              </Button>
            </div>

            <div className="faith-help-popular-list">
              {popularArticles.map((article, index) => (
                <button
                  type="button"
                  className="faith-help-popular-item"
                  key={article.id}
                  onClick={() => openArticle(article)}
                >
                  <div className="faith-help-popular-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="faith-help-popular-icon">
                    <FileTextOutlined />
                  </div>

                  <div className="faith-help-popular-copy">
                    <div>{article.title}</div>

                    <span>{article.description}</span>
                  </div>

                  <ArrowRightOutlined />
                </button>
              ))}
            </div>
          </section>

          {/* =================================================
              CONTACT
          ================================================= */}
          <section className="faith-help-contact">
            <div className="faith-help-contact-icon">
              <QuestionCircleOutlined />
            </div>

            <div className="faith-help-contact-copy">
              <div className="faith-help-contact-title">
                Bạn vẫn cần hỗ trợ?
              </div>

              <div className="faith-help-contact-description">
                Nếu không tìm thấy câu trả lời, hãy liên hệ quản trị viên giáo
                xứ để được hỗ trợ.
              </div>
            </div>

            <Button
              type="primary"
              className="faith-help-contact-button"
              onClick={() => setSupportModalOpen(true)}
            >
              Liên hệ hỗ trợ
              <ArrowRightOutlined />
            </Button>
          </section>
          <Modal
            open={supportModalOpen}
            onCancel={() => setSupportModalOpen(false)}
            footer={null}
            centered
            width={430}
            className="faith-help-support-modal"
          >
            <div className="faith-help-support-modal-content">
              <div className="faith-help-support-modal-icon">
                <QuestionCircleOutlined />
              </div>

              <div className="faith-help-support-modal-title">
                Liên hệ hỗ trợ
              </div>

              <div className="faith-help-support-modal-description">
                Nếu bạn gặp vấn đề khi sử dụng FaithEdu hoặc cần được hướng dẫn,
                hãy liên hệ đội ngũ hỗ trợ qua Zalo.
              </div>

              <div className="faith-help-zalo-card">
                <div className="faith-help-zalo-label">ZALO HỖ TRỢ</div>

                <div className="faith-help-zalo-number">033 604 1807</div>

                <div className="faith-help-zalo-note">
                  Nhấn vào số Zalo để liên hệ hỗ trợ
                </div>
              </div>

              <Button
                type="primary"
                block
                size="large"
                className="faith-help-zalo-button"
                href="https://zalo.me/0336041807"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mở Zalo hỗ trợ
                <ArrowRightOutlined />
              </Button>
            </div>
          </Modal>
          <div className="faith-help-bottom-space" />
        </div>
      </div>
    </>
  );
};

export default HelpCenterPage;
