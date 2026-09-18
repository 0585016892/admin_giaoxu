import React, { useEffect, useRef, useState, useMemo } from "react";

import dayjs from "dayjs";

import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Tabs,
  message,
} from "antd";

import {
  CameraOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

const DATE_FIELDS = [
  "date_of_birth",
  "baptism_date",
  "first_communion_date",
  "confirmation_date",
  "enrollment_date",
];

const EMPTY_INITIAL_VALUES = {};

const StudentForm = ({
  form,
  classes = [],
  saving = false,
  onFinish,
  initialValues = EMPTY_INITIAL_VALUES,
}) => {
  const [activeTab, setActiveTab] = useState("basic");

  /*
   * File ảnh thật người dùng vừa chọn
   */
  const [avatarFile, setAvatarFile] = useState(null);

  /*
   * URL / base64 dùng để preview
   */
  const [avatarPreview, setAvatarPreview] = useState(null);

  /*
   * Người dùng có chủ động xóa avatar hay không
   */
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  const fileInputRef = useRef(null);

  /* =====================================================
     DATE
  ===================================================== */

  const toDayjs = (value) => {
    if (!value) {
      return null;
    }

    if (dayjs.isDayjs(value)) {
      return value.isValid() ? value : null;
    }

    const date = dayjs(value);

    return date.isValid() ? date : null;
  };

  const formatDate = (value) => {
    if (!value) {
      return null;
    }

    const date = toDayjs(value);

    if (!date) {
      return null;
    }

    return date.format("YYYY-MM-DD");
  };

  /* =====================================================
     INITIAL VALUES
  ===================================================== */

  const studentId = initialValues?.id;

  const formValues = useMemo(() => {
    const values = {
      ...initialValues,
    };

    DATE_FIELDS.forEach((field) => {
      values[field] = toDayjs(initialValues?.[field]);
    });

    return values;
  }, [initialValues]);

  useEffect(() => {
    if (!form) {
      return;
    }

    form.setFieldsValue(formValues);

    if (initialValues?.avatar) {
      setAvatarPreview(initialValues.avatar);
    } else {
      setAvatarPreview(null);
    }

    setAvatarFile(null);
    setAvatarRemoved(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [studentId, form, formValues, initialValues?.avatar]);
  /* =====================================================
     AVATAR
  ===================================================== */

  const handleSelectAvatar = () => {
    if (saving) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event) => {
    if (saving) {
      return;
    }

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      message.error("Chỉ hỗ trợ ảnh JPG, JPEG, PNG hoặc WEBP");

      event.target.value = "";

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error("Ảnh không được vượt quá 5MB");

      event.target.value = "";

      return;
    }

    /*
     * Đây là file thật để gửi FormData
     */
    setAvatarFile(file);

    /*
     * Người dùng đã chọn ảnh mới
     * => không còn trạng thái xóa
     */
    setAvatarRemoved(false);

    /*
     * Preview bằng object URL.
     *
     * Nhanh hơn FileReader và không cần base64.
     */
    const objectUrl = URL.createObjectURL(file);

    setAvatarPreview(objectUrl);
  };

  /*
   * Cleanup Object URL
   */
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleRemoveAvatar = () => {
    if (saving) {
      return;
    }

    /*
     * Xóa file mới nếu vừa chọn
     */
    setAvatarFile(null);

    /*
     * Xóa preview
     */
    setAvatarPreview(null);

    /*
     * Đánh dấu người dùng chủ động xóa
     */
    setAvatarRemoved(true);

    /*
     * Reset input file
     */
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    /*
     * Quan trọng:
     * Form field avatar = null
     * để StudentManagement biết cần xóa avatar cũ.
     */
    form.setFieldValue("avatar", null);
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = (values) => {
    const submitValues = {
      ...values,

      date_of_birth: formatDate(values.date_of_birth),

      baptism_date: formatDate(values.baptism_date),

      first_communion_date: formatDate(values.first_communion_date),

      confirmation_date: formatDate(values.confirmation_date),

      enrollment_date: formatDate(values.enrollment_date),

      /*
       * File thật
       */
      avatarFile: avatarFile,

      /*
       * Cho Management biết user có xóa avatar không
       */
      avatarRemoved: avatarRemoved,
    };

    /*
     * Không gửi avatar URL dạng text.
     *
     * Avatar thật sẽ được buildStudentFormData()
     * thêm vào FormData bằng key "avatar".
     */
    delete submitValues.avatar;

    onFinish?.(submitValues);
  };

  /* =====================================================
     TAB ERROR
  ===================================================== */

  const handleFinishFailed = ({ errorFields }) => {
    if (!errorFields?.length) {
      return;
    }

    const firstError = errorFields[0]?.name?.[0];

    const basicFields = [
      "code",
      "name",
      "gender",
      "date_of_birth",
      "birth_place",
      "nationality",
      "phone",
      "email",
      "class_id",
      "address",
      "parish",
    ];

    const familyFields = [
      "father_name",
      "father_phone",
      "mother_name",
      "mother_phone",
      "guardian_name",
      "guardian_phone",
      "guardian_relationship",
    ];

    const sacramentFields = [
      "baptism_name",
      "baptism_date",
      "baptism_place",
      "baptism_parish",
      "baptism_certificate_no",
      "saint_name",
      "first_communion_date",
      "first_communion_place",
      "confirmation_date",
      "confirmation_place",
      "confirmation_saint_name",
    ];

    const catechismFields = [
      "catechism_level",
      "catechism_status",
      "enrollment_date",
      "status",
      "note",
    ];

    if (basicFields.includes(firstError)) {
      setActiveTab("basic");
      return;
    }

    if (familyFields.includes(firstError)) {
      setActiveTab("family");
      return;
    }

    if (sacramentFields.includes(firstError)) {
      setActiveTab("sacraments");
      return;
    }

    if (catechismFields.includes(firstError)) {
      setActiveTab("catechism");
    }
  };

  /* =====================================================
     PHONE
  ===================================================== */

  const phoneRule = {
    validator: (_, value) => {
      if (!value) {
        return Promise.resolve();
      }

      const phone = String(value).replace(/\s/g, "");

      const valid = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(phone);

      if (!valid) {
        return Promise.reject(new Error("Số điện thoại không hợp lệ"));
      }

      return Promise.resolve();
    },
  };

  /* =====================================================
     BASIC
  ===================================================== */

  const basicTab = (
    <>
      <Row gutter={16}>
        <Col xs={24}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 24,
              padding: 20,
              borderRadius: 18,
              background: "linear-gradient(135deg, #FAFAFA, #F5F7FA)",
              border: "1px solid #E5E7EB",
            }}
          >
            <Avatar
              size={110}
              src={avatarPreview || undefined}
              icon={!avatarPreview && <UserOutlined />}
              style={{
                flexShrink: 0,
                border: "4px solid #D4AF37",
                background: "#E2E8F0",
              }}
            />

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#1B365D",
                  marginBottom: 5,
                }}
              >
                Ảnh học sinh
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: "#64748B",
                  marginBottom: 14,
                }}
              >
                Ảnh đại diện của học sinh
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  style={{
                    display: "none",
                  }}
                  onChange={handleAvatarChange}
                />

                <Button
                  icon={<CameraOutlined />}
                  onClick={handleSelectAvatar}
                  disabled={saving}
                  style={{
                    borderColor: "#1B365D",
                    color: "#1B365D",
                    fontWeight: 500,
                  }}
                >
                  {avatarPreview ? "Đổi ảnh" : "Chọn ảnh"}
                </Button>

                {avatarPreview && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleRemoveAvatar}
                    disabled={saving}
                  >
                    Xóa ảnh
                  </Button>
                )}
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "#94A3B8",
                }}
              >
                JPG, PNG hoặc WEBP · tối đa 5MB
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Divider orientation="left">Thông tin cơ bản</Divider>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Mã học sinh" name="code">
            <Input placeholder="Tự động tạo" disabled />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập họ tên",
              },
            ]}
          >
            <Input placeholder="Nhập họ và tên học sinh" />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Giới tính" name="gender">
            <Select
              allowClear
              placeholder="Chọn giới tính"
              options={[
                {
                  label: "Nam",
                  value: "male",
                },
                {
                  label: "Nữ",
                  value: "female",
                },
                {
                  label: "Khác",
                  value: "other",
                },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Ngày sinh" name="date_of_birth">
            <DatePicker
              style={{
                width: "100%",
              }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Nơi sinh" name="birth_place">
            <Input placeholder="Nhập nơi sinh" />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Quốc tịch" name="nationality">
            <Input placeholder="Việt Nam" />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Số điện thoại" name="phone" rules={[phoneRule]}>
            <Input placeholder="09xxxxxxxx" />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                type: "email",
                message: "Email không hợp lệ",
              },
            ]}
          >
            <Input placeholder="example@email.com" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Lớp giáo lý" name="class_id">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Chọn lớp giáo lý"
              options={classes.map((item) => ({
                label: item.name || item.class_name || `Lớp #${item.id}`,
                value: item.id,
              }))}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Giáo xứ / Giáo họ" name="parish">
            <Input placeholder="Nhập giáo xứ / giáo họ" />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item label="Địa chỉ" name="address">
            <TextArea rows={2} placeholder="Nhập địa chỉ" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  /* =====================================================
     FAMILY
  ===================================================== */

  const familyTab = (
    <>
      <Divider orientation="left">Thông tin cha</Divider>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Họ tên cha" name="father_name">
            <Input placeholder="Họ và tên cha" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label="Số điện thoại cha"
            name="father_phone"
            rules={[phoneRule]}
          >
            <Input placeholder="Số điện thoại cha" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Thông tin mẹ</Divider>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Họ tên mẹ" name="mother_name">
            <Input placeholder="Họ và tên mẹ" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label="Số điện thoại mẹ"
            name="mother_phone"
            rules={[phoneRule]}
          >
            <Input placeholder="Số điện thoại mẹ" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Người giám hộ</Divider>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item label="Họ tên" name="guardian_name">
            <Input placeholder="Người giám hộ" />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            label="Số điện thoại"
            name="guardian_phone"
            rules={[phoneRule]}
          >
            <Input placeholder="Số điện thoại" />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Quan hệ" name="guardian_relationship">
            <Input placeholder="Ví dụ: Ông, bà, cô..." />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  /* =====================================================
     SACRAMENTS
  ===================================================== */

  const sacramentsTab = (
    <>
      <Divider orientation="left">Bí tích Rửa tội</Divider>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item label="Tên thánh" name="baptism_name">
            <Input placeholder="Tên thánh" />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Ngày Rửa tội" name="baptism_date">
            <DatePicker
              style={{
                width: "100%",
              }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Nơi Rửa tội" name="baptism_place">
            <Input placeholder="Nhà thờ" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Giáo xứ Rửa tội" name="baptism_parish">
            <Input placeholder="Giáo xứ" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Số chứng thư" name="baptism_certificate_no">
            <Input placeholder="Số chứng thư Rửa tội" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Rước lễ lần đầu</Divider>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Ngày Rước lễ lần đầu" name="first_communion_date">
            <DatePicker
              style={{
                width: "100%",
              }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Nơi Rước lễ lần đầu" name="first_communion_place">
            <Input placeholder="Nhà thờ / giáo xứ" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Bí tích Thêm sức</Divider>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item label="Ngày Thêm sức" name="confirmation_date">
            <DatePicker
              style={{
                width: "100%",
              }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Nơi Thêm sức" name="confirmation_place">
            <Input placeholder="Nhà thờ / giáo xứ" />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Tên thánh Thêm sức" name="confirmation_saint_name">
            <Input placeholder="Tên thánh" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Tên thánh hiện tại" name="saint_name">
        <Input placeholder="Tên thánh" />
      </Form.Item>
    </>
  );

  /* =====================================================
     CATECHISM
  ===================================================== */

  const catechismTab = (
    <>
      <Divider orientation="left">Thông tin học giáo lý</Divider>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item label="Cấp / Khối giáo lý" name="catechism_level">
            <Input placeholder="Ví dụ: Khai tâm..." />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Trạng thái học giáo lý" name="catechism_status">
            <Select
              allowClear
              placeholder="Chọn trạng thái"
              options={[
                {
                  label: "Mới đăng ký",
                  value: "new",
                },
                {
                  label: "Đang học",
                  value: "studying",
                },
                {
                  label: "Đã hoàn thành",
                  value: "completed",
                },
                {
                  label: "Đã tốt nghiệp",
                  value: "graduated",
                },
                {
                  label: "Đã nghỉ",
                  value: "dropped",
                },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item label="Ngày nhập học" name="enrollment_date">
            <DatePicker
              style={{
                width: "100%",
              }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Trạng thái học sinh" name="status">
            <Select
              allowClear
              placeholder="Chọn trạng thái"
              options={[
                {
                  label: "Đang học",
                  value: "active",
                },
                {
                  label: "Không hoạt động",
                  value: "inactive",
                },
                {
                  label: "Đã tốt nghiệp",
                  value: "graduated",
                },
                {
                  label: "Đã chuyển đi",
                  value: "transferred",
                },
                {
                  label: "Đã nghỉ",
                  value: "dropped",
                },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item label="Ghi chú" name="note">
            <TextArea rows={4} placeholder="Thông tin ghi chú..." />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      onFinishFailed={handleFinishFailed}
      disabled={saving}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "basic",
            label: "Thông tin cơ bản",
            children: basicTab,
          },
          {
            key: "family",
            label: "Gia đình",
            children: familyTab,
          },
          {
            key: "sacraments",
            label: "Bí tích",
            children: sacramentsTab,
          },
          {
            key: "catechism",
            label: "Giáo lý",
            children: catechismTab,
          },
        ]}
      />
    </Form>
  );
};

export default StudentForm;
