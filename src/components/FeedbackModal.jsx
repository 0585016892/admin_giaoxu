import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Form, Input, Rate, Progress } from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  CloseOutlined,
  HeartFilled,
  SendOutlined,
  StarFilled,
} from "@ant-design/icons";
import { AnimatePresence, motion } from "framer-motion";
import { sendFeedback } from "../api/contactMessageApi";
import { useUser } from "../context/UserContext";
import LoadingLogo from "../components/LoadingLogo";
import { useNotification } from "./notification";

const { TextArea } = Input;
const SUBJECT = "Đánh giá FaithEdu sau thời gian sử dụng";
const DURATIONS = ["Dưới 1 tháng", "1–3 tháng", "Trên 3 tháng"];
const BENEFITS = [
  "Quản lý lớp học và học sinh",
  "Điểm danh bằng mã QR",
  "Quản lý điểm số và kết quả học tập",
  "Thư viện tài liệu và bài giảng",
  "Chưa thấy hiệu quả rõ rệt",
];
const RATINGS = [
  "Chưa đánh giá",
  "Rất chưa hài lòng",
  "Chưa hài lòng",
  "Bình thường",
  "Hài lòng",
  "Rất hài lòng",
];
const initialSurvey = { duration: "", rating: 0, benefits: [], comment: "" };

const FeedbackModal = ({ open, onClose }) => {
  const { user } = useUser();
  const notify = useNotification();
  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [survey, setSurvey] = useState(initialSurvey);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  const userName = user?.full_name || user?.name || user?.fullName || "";
  const userEmail = user?.email || "";
  const avatarLetter = userName.trim().charAt(0).toUpperCase() || "F";

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setSurvey({ ...initialSurvey, benefits: [] });
    setLoading(false);
    setLoadingProgress(0);
    setCompleted(false);
    form.setFieldsValue({ email: userEmail });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [open, userEmail, form]);

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(survey.duration);
    if (step === 1) return survey.rating > 0;
    // Benefits and comments are optional: do not force positive feedback.
    return true;
  }, [step, survey.duration, survey.rating]);

  const update = (key, value) =>
    setSurvey((prev) => ({ ...prev, [key]: value }));

  const toggleBenefit = (benefit) => {
    setSurvey((prev) => {
      const isExclusive = benefit === "Chưa thấy hiệu quả rõ rệt";
      let benefits;
      if (prev.benefits.includes(benefit)) {
        benefits = prev.benefits.filter((item) => item !== benefit);
      } else if (isExclusive) {
        benefits = [benefit];
      } else {
        benefits = [
          ...prev.benefits.filter(
            (item) => item !== "Chưa thấy hiệu quả rõ rệt",
          ),
          benefit,
        ];
      }
      return { ...prev, benefits };
    });
  };

  const close = () => {
    if (loading) return;
    onClose?.();
  };

  const submit = async () => {
    if (loading || !survey.duration || !survey.rating) return;
    try {
      // Validate email even if user jumps to this step.
      const { email } = await form.validateFields(["email"]);
      if (!userName.trim()) {
        notify.error("Không tìm thấy tên tài khoản. Vui lòng đăng nhập lại.");
        return;
      }
      setLoading(true);
      setLoadingProgress(8);
      timerRef.current = setInterval(() => {
        if (mountedRef.current) {
          setLoadingProgress((value) =>
            Math.min(90, value + Math.max(0.4, (90 - value) * 0.055)),
          );
        }
      }, 100);

      const message = [
        "KHẢO SÁT ĐÁNH GIÁ FAITHEDU SAU THỜI GIAN SỬ DỤNG",
        "",
        `1. Thời gian sử dụng: ${survey.duration}`,
        `2. Mức độ hài lòng: ${survey.rating}/5 sao (${RATINGS[survey.rating]})`,
        "3. Công việc FaithEdu đã hỗ trợ:",
        ...(survey.benefits.length
          ? survey.benefits.map((item) => `- ${item}`)
          : ["- Không lựa chọn"]),
        "4. Góp ý và đề xuất cải thiện:",
        survey.comment.trim() || "Không có góp ý thêm.",
      ].join("\n");

      // contact_messages contains no separate rating column.
      await sendFeedback({
        name: userName.trim(),
        email: email.trim(),
        subject: SUBJECT,
        message,
      });
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      if (mountedRef.current) {
        setLoadingProgress(100);
        setCompleted(true);
        notify.success("Cảm ơn Quý vị! Đánh giá đã được gửi thành công.");
      }
    } catch (error) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      // Ant Design validation errors are handled by the form itself.
      if (error?.errorFields) return;
      notify.error(
        error?.response?.data?.message ||
          "Không thể gửi đánh giá. Vui lòng thử lại sau.",
      );
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const next = async () => {
    if (loading || !canContinue) return;
    if (step === 0) {
      try {
        await form.validateFields(["email"]);
      } catch {
        return;
      }
    }
    if (step < 3) setStep((current) => current + 1);
    else await submit();
  };

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      closable={false}
      maskClosable={!loading}
      keyboard={!loading}
      centered
      width={620}
      destroyOnClose
      styles={{
        body: { padding: 0 },
        mask: { background: "rgba(24,20,55,.52)", backdropFilter: "blur(7px)" },
      }}
    >
      <div className="fe-survey">
        <header className="fe-survey-hero">
          <motion.div
            className="fe-survey-orb fe-survey-orb-one"
            animate={{ y: [0, 16, 0], x: [0, -9, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="fe-survey-orb fe-survey-orb-two" />
          <div className="fe-survey-brand">
            <span>✦ FaithEdu</span>
            <span className="fe-survey-tag">KHẢO SÁT TRẢI NGHIỆM</span>
          </div>
          <button
            className="fe-survey-close"
            type="button"
            aria-label="Đóng khảo sát"
            disabled={loading}
            onClick={close}
          >
            <CloseOutlined />
          </button>
          <motion.div
            className="fe-survey-heart"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220 }}
          >
            <HeartFilled />
          </motion.div>
          <h2>
            Một chút cảm nhận,
            <br />
            một bước hoàn thiện!
          </h2>
          <p>
            Sau một thời gian đồng hành, FaithEdu mong lắng nghe những chia sẻ
            chân thành từ Quý Cha và Quý Anh Chị.
          </p>
          <span className="fe-survey-time">✦ Chỉ khoảng 2 phút để chia sẻ</span>
        </header>

        <div className="fe-survey-body">
          <AnimatePresence mode="wait" initial={false}>
            {completed ? (
              <motion.div
                key="completed"
                className="fe-survey-complete"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 180, delay: 0.1 }}
                  className="fe-survey-complete-icon"
                >
                  <CheckCircleFilled />
                </motion.div>
                <h3>Cảm ơn Quý vị đã chia sẻ!</h3>
                <p>
                  Mỗi đánh giá là động lực để FaithEdu tiếp tục hoàn thiện và
                  phục vụ công tác giáo lý tốt hơn.
                </p>
                <button
                  type="button"
                  className="fe-survey-primary"
                  onClick={close}
                >
                  Hoàn tất
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="questions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="fe-survey-user">
                  <div className="fe-survey-avatar">{avatarLetter}</div>
                  <div className="fe-survey-user-info">
                    <strong>{userName || "Tài khoản FaithEdu"}</strong>
                    <span>Đánh giá từ tài khoản của Quý vị</span>
                  </div>
                  <CheckCircleFilled className="fe-survey-verified" />
                </div>
                <Form
                  form={form}
                  layout="vertical"
                  requiredMark={false}
                  initialValues={{ email: userEmail }}
                >
                  <div className="fe-survey-progress-head">
                    <span>Câu hỏi {step + 1} / 4</span>
                    <span>{(step + 1) * 25}%</span>
                  </div>
                  <Progress
                    percent={(step + 1) * 25}
                    showInfo={false}
                    strokeColor={{ "0%": "#7161df", "100%": "#d383c9" }}
                    trailColor="#eeeafa"
                    size={{ height: 7 }}
                  />
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.section
                      key={step}
                      className="fe-survey-question"
                      initial={{ opacity: 0, x: 22 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -18 }}
                      transition={{ duration: 0.24, ease: "easeOut" }}
                    >
                      {step === 0 && (
                        <>
                          <h3>Quý vị đã sử dụng FaithEdu bao lâu?</h3>
                          <p>
                            Chọn thời gian phù hợp với trải nghiệm của Quý vị.
                          </p>
                          <Form.Item
                            name="email"
                            label="Email liên hệ"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập email",
                              },
                              { type: "email", message: "Email không hợp lệ" },
                            ]}
                          >
                            <Input
                              size="large"
                              placeholder="Email của Quý vị"
                            />
                          </Form.Item>
                          <div className="fe-survey-options">
                            {DURATIONS.map((item) => (
                              <button
                                key={item}
                                type="button"
                                className={`fe-survey-option ${survey.duration === item ? "selected" : ""}`}
                                onClick={() => update("duration", item)}
                              >
                                <span className="fe-survey-option-check">
                                  {survey.duration === item ? "✓" : ""}
                                </span>
                                {item}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                      {step === 1 && (
                        <>
                          <h3>Quý vị hài lòng với FaithEdu ở mức độ nào?</h3>
                          <p>
                            Đánh giá dựa trên trải nghiệm thực tế của Quý vị.
                          </p>
                          <div className="fe-survey-stars">
                            <Rate
                              value={survey.rating}
                              onChange={(value) => update("rating", value)}
                              character={<StarFilled />}
                            />
                          </div>
                          <div className="fe-survey-rating-label">
                            {survey.rating
                              ? `${survey.rating}/5 · ${RATINGS[survey.rating]}`
                              : "Chạm vào ngôi sao để đánh giá"}
                          </div>
                        </>
                      )}
                      {step === 2 && (
                        <>
                          <h3>
                            FaithEdu đã hỗ trợ Quý vị trong công việc nào?
                          </h3>
                          <p>Có thể chọn nhiều nội dung hoặc bỏ qua.</p>
                          <div className="fe-survey-options">
                            {BENEFITS.map((item) => (
                              <button
                                key={item}
                                type="button"
                                className={`fe-survey-option ${survey.benefits.includes(item) ? "selected" : ""}`}
                                onClick={() => toggleBenefit(item)}
                              >
                                <span className="fe-survey-option-check">
                                  {survey.benefits.includes(item) ? "✓" : ""}
                                </span>
                                {item}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                      {step === 3 && (
                        <>
                          <h3>Quý vị mong muốn FaithEdu cải thiện điều gì?</h3>
                          <p>
                            Những góp ý chân thành sẽ giúp FaithEdu phát triển
                            tốt hơn.
                          </p>
                          <TextArea
                            value={survey.comment}
                            onChange={(event) =>
                              update("comment", event.target.value)
                            }
                            rows={5}
                            maxLength={2000}
                            showCount
                            placeholder="Điều Quý vị yêu thích, những khó khăn hoặc tính năng mong muốn..."
                          />
                          <div className="fe-survey-optional">
                            Quý vị có thể bỏ qua nếu chưa có góp ý thêm.
                          </div>
                        </>
                      )}
                    </motion.section>
                  </AnimatePresence>
                  <div className="fe-survey-actions">
                    <button
                      type="button"
                      className="fe-survey-secondary"
                      onClick={() =>
                        step === 0 ? close() : setStep((s) => s - 1)
                      }
                      disabled={loading}
                    >
                      {step === 0 ? (
                        "Để sau"
                      ) : (
                        <>
                          <ArrowLeftOutlined /> Quay lại
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="fe-survey-primary"
                      disabled={loading || !canContinue}
                      onClick={next}
                    >
                      {step === 3 ? (
                        <>
                          <SendOutlined /> Gửi đánh giá
                        </>
                      ) : (
                        <>
                          Tiếp tục <ArrowRightOutlined />
                        </>
                      )}
                    </button>
                  </div>
                </Form>
                <div className="fe-survey-footnote">
                  Ý kiến của Quý vị được gửi đến đội ngũ FaithEdu để cải thiện
                  hệ thống.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {loading && (
          <div className="fe-survey-loading">
            <div className="fe-survey-loading-card">
              <LoadingLogo progress={loadingProgress} />
            </div>
          </div>
        )}
      </div>
      <style>{`
        .fe-survey{position:relative;overflow:hidden;border-radius:20px;background:#fff;color:#292e4b;font-family:inherit}
        .fe-survey-hero{position:relative;overflow:hidden;background:linear-gradient(125deg,#4e46a6,#7357d7 62%,#a95fc8);color:#fff;padding:23px 27px 28px}
        .fe-survey-orb{position:absolute;border:1px solid rgba(255,255,255,.22);border-radius:50%;pointer-events:none}
        .fe-survey-orb-one{width:220px;height:220px;right:-80px;top:-90px}.fe-survey-orb-two{width:120px;height:120px;right:70px;bottom:-90px;background:rgba(255,255,255,.04)}
        .fe-survey-brand{display:flex;justify-content:space-between;align-items:center;gap:15px;padding-right:35px;position:relative;font-weight:800;font-size:14px}
        .fe-survey-tag{color:#e7dcff;font-size:9px;letter-spacing:1.5px;font-weight:800}
        .fe-survey-close{position:absolute;top:15px;right:16px;border:0;border-radius:9px;width:31px;height:31px;background:rgba(255,255,255,.16);color:#fff;cursor:pointer;z-index:2}
        .fe-survey-close:disabled{opacity:.5;cursor:not-allowed}.fe-survey-heart{position:relative;margin-top:20px;font-size:29px;color:#ffb8dc}
        .fe-survey-hero h2{position:relative;color:#fff;font-size:25px;line-height:1.24;font-weight:800;margin:7px 0 9px}
        .fe-survey-hero p{position:relative;max-width:440px;color:#f0eaff;font-size:12px;line-height:1.7;margin:0}
        .fe-survey-time{position:relative;display:inline-block;margin-top:14px;padding:6px 12px;border-radius:20px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.24);font-size:11px;font-weight:700}
        .fe-survey-body{padding:20px 27px 22px}.fe-survey-user{display:flex;align-items:center;gap:10px;padding:9px 12px;background:#faf9ff;border:1px solid #efecfb;border-radius:12px;margin-bottom:19px}
        .fe-survey-avatar{display:grid;place-items:center;width:36px;height:36px;flex:0 0 36px;border-radius:50%;background:linear-gradient(145deg,#6656d1,#b274d2);color:#fff;font-weight:800}
        .fe-survey-user-info{min-width:0;flex:1;display:flex;flex-direction:column;gap:2px}.fe-survey-user-info strong{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fe-survey-user-info span{font-size:10px;color:#8c8ba1}.fe-survey-verified{color:#29a779}
        .fe-survey-progress-head{display:flex;justify-content:space-between;color:#7060c6;font-weight:700;font-size:11px;margin-bottom:6px}
        .fe-survey .ant-progress{margin:0 0 18px;line-height:1}.fe-survey-question{min-height:225px}.fe-survey-question h3{font-size:17px;font-weight:800;color:#292e4b;margin:0 0 7px;line-height:1.45}.fe-survey-question>p{font-size:12px;color:#8989a0;margin:0 0 17px}
        .fe-survey .ant-form-item{margin-bottom:14px}.fe-survey .ant-form-item-label>label{font-size:11px;font-weight:700;color:#5d607a}.fe-survey .ant-input,.fe-survey .ant-input-affix-wrapper{border-color:#e6e2f3;border-radius:10px;font-size:12px}.fe-survey .ant-input:focus,.fe-survey .ant-input-focused{border-color:#8570e5;box-shadow:0 0 0 3px rgba(117,91,220,.08)}
        .fe-survey-options{display:flex;flex-direction:column;gap:8px}.fe-survey-option{display:flex;align-items:center;text-align:left;gap:11px;width:100%;min-height:44px;padding:10px 13px;background:#fff;border:1.5px solid #e9e6f5;border-radius:11px;color:#43445f;font-size:12px;cursor:pointer;transition:transform .18s,border-color .18s,background .18s}
        .fe-survey-option:hover{transform:translateX(3px);border-color:#a699ec;background:#faf8ff}.fe-survey-option.selected{background:#f3f0ff;border-color:#806be2;color:#5b48bf;font-weight:700}
        .fe-survey-option-check{display:grid;place-items:center;width:18px;height:18px;flex:0 0 18px;border:2px solid #c8c5db;border-radius:50%;font-size:11px}.fe-survey-option.selected .fe-survey-option-check{background:#806be2;border-color:#806be2;color:#fff}
        .fe-survey-stars{display:flex;justify-content:center;margin:33px 0 15px}.fe-survey-stars .ant-rate{font-size:38px;color:#f3b842}.fe-survey-stars .ant-rate-star{margin-inline-end:10px;transition:transform .18s}.fe-survey-stars .ant-rate-star:hover{transform:scale(1.18)}.fe-survey-rating-label{text-align:center;color:#7762c8;font-size:13px;font-weight:700}
        .fe-survey-optional{font-size:11px;color:#9a98ae;margin-top:9px}.fe-survey-actions{display:flex;justify-content:space-between;gap:12px;margin-top:22px}.fe-survey-primary,.fe-survey-secondary{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:11px;min-height:42px;padding:0 18px;font-size:12px;font-weight:750;cursor:pointer;transition:transform .2s,box-shadow .2s}
        .fe-survey-primary{background:linear-gradient(110deg,#6555d4,#9665dd);color:#fff;box-shadow:0 5px 15px rgba(118,96,215,.24)}.fe-survey-primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 9px 22px rgba(118,96,215,.3)}.fe-survey-primary:disabled{opacity:.5;cursor:not-allowed}.fe-survey-secondary{background:#f2f0f9;color:#675d8e}.fe-survey-secondary:hover:not(:disabled){background:#eae6f7}.fe-survey-footnote{text-align:center;color:#aaa6ba;font-size:10px;margin-top:18px;line-height:1.5}
        .fe-survey-complete{text-align:center;padding:30px 8px}.fe-survey-complete-icon{color:#52ba9c;font-size:56px}.fe-survey-complete h3{font-size:21px;font-weight:800;margin:15px 0 8px}.fe-survey-complete p{font-size:12px;color:#8c8ba1;line-height:1.7;max-width:360px;margin:0 auto 22px}
        .fe-survey-loading{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.93);backdrop-filter:blur(6px)}.fe-survey-loading-card{display:flex;flex-direction:column;align-items:center;gap:8px;padding:26px;background:#fff;border:1px solid #eeeafa;border-radius:16px;box-shadow:0 15px 40px rgba(50,35,110,.12)}.fe-survey-loading-card strong{font-size:13px;color:#6352bd}.fe-survey-loading-card span{font-size:11px;color:#9994af}
        @media(max-width:600px){.fe-survey-hero{padding:19px 19px 22px}.fe-survey-hero h2{font-size:21px}.fe-survey-brand{font-size:12px}.fe-survey-tag{font-size:8px;letter-spacing:.5px}.fe-survey-body{padding:17px 18px 20px}.fe-survey-question h3{font-size:15px}.fe-survey-stars .ant-rate{font-size:31px}.fe-survey-stars .ant-rate-star{margin-inline-end:5px}.fe-survey-actions button{padding:0 13px}.fe-survey-question{min-height:210px}}
        @media(prefers-reduced-motion:reduce){.fe-survey *{transition:none!important;animation:none!important}}
      `}</style>
    </Modal>
  );
};

export default FeedbackModal;
