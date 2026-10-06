// src/pages/help/helpData.js

export const HELP_CATEGORIES = [
  {
    key: "getting-started",
    title: "Bắt đầu sử dụng",
    icon: "RocketOutlined",
    description: "Những hướng dẫn cơ bản khi bắt đầu sử dụng FaithEdu.",
  },
  {
    key: "students",
    title: "Học sinh",
    icon: "TeamOutlined",
    description: "Quản lý hồ sơ, lớp, gia đình và thông tin học sinh.",
  },
  {
    key: "classes",
    title: "Lớp học",
    icon: "BankOutlined",
    description: "Quản lý lớp học và phân công huấn luyện viên.",
  },
  {
    key: "attendance",
    title: "Điểm danh",
    icon: "CheckCircleOutlined",
    description: "Hướng dẫn điểm danh giáo lý, Thánh lễ và QR.",
  },
  {
    key: "accounts",
    title: "Tài khoản & phân quyền",
    icon: "UserOutlined",
    description: "Quản lý tài khoản và quyền sử dụng hệ thống.",
  },
  {
    key: "exams",
    title: "Thi & điểm",
    icon: "FormOutlined",
    description: "Quản lý kỳ thi, bài thi và kết quả học tập.",
  },
  {
    key: "reports",
    title: "Báo cáo & dữ liệu",
    icon: "BarChartOutlined",
    description: "Thống kê và xuất dữ liệu.",
  },
  {
    key: "settings",
    title: "Cài đặt giáo xứ",
    icon: "SettingOutlined",
    description: "Thiết lập các chức năng dành riêng cho giáo xứ.",
  },
  {
    key: "troubleshooting",
    title: "Xử lý sự cố",
    icon: "ToolOutlined",
    description: "Một số lỗi thường gặp và cách xử lý.",
  },
];

export const HELP_ARTICLES = [
  // =========================================================
  // BẮT ĐẦU
  // =========================================================

  {
    id: "login",
    category: "getting-started",
    title: "Đăng nhập vào FaithEdu",
    description: "Hướng dẫn đăng nhập và truy cập hệ thống.",
    keywords: ["đăng nhập", "login", "tài khoản", "mật khẩu"],
    steps: [
      {
        title: "Mở trang FaithEdu",
        content: "Truy cập trang FaithEdu của giáo xứ và chọn Đăng nhập.",
      },
      {
        title: "Nhập tài khoản",
        content: "Nhập tên đăng nhập và mật khẩu đã được giáo xứ cấp.",
      },
      {
        title: "Đăng nhập",
        content: "Bấm Đăng nhập để truy cập vào hệ thống.",
      },
    ],
    tips: [
      "Không chia sẻ mật khẩu tài khoản cho người khác.",
      "Nếu quên mật khẩu, hãy liên hệ người quản trị giáo xứ để được cấp lại.",
    ],
  },

  {
    id: "overview",
    category: "getting-started",
    title: "Tổng quan hệ thống",
    description: "Làm quen với các khu vực chính của FaithEdu.",
    keywords: ["dashboard", "trang chủ", "tổng quan"],
    steps: [
      {
        title: "Thanh điều hướng",
        content:
          "Thanh điều hướng bên trái chứa các chức năng chính của hệ thống.",
      },
      {
        title: "Khu vực nội dung",
        content:
          "Khu vực trung tâm hiển thị dữ liệu và chức năng của từng trang.",
      },
      {
        title: "Tài khoản",
        content:
          "Khu vực tài khoản cho phép xem thông tin cá nhân và các thao tác liên quan.",
      },
    ],
  },

  // =========================================================
  // HỌC SINH
  // =========================================================

  {
    id: "student-create",
    category: "students",
    title: "Thêm học sinh",
    description: "Hướng dẫn tạo hồ sơ học sinh mới.",
    keywords: ["học sinh", "thêm", "tạo", "hồ sơ"],
    steps: [
      {
        title: "Mở danh sách học sinh",
        content: "Vào chức năng Học sinh từ thanh điều hướng.",
      },
      {
        title: "Chọn thêm học sinh",
        content: "Bấm nút Thêm học sinh.",
      },
      {
        title: "Nhập thông tin",
        content: "Nhập đầy đủ các thông tin cần thiết của học sinh.",
      },
      {
        title: "Lưu",
        content: "Kiểm tra thông tin và bấm Lưu để tạo hồ sơ.",
      },
    ],
  },

  {
    id: "student-import",
    category: "students",
    title: "Import học sinh bằng Excel",
    description: "Thêm nhiều học sinh cùng lúc bằng file Excel.",
    keywords: ["excel", "import", "nhập", "danh sách", "học sinh"],
    steps: [
      {
        title: "Chuẩn bị file Excel",
        content: "Chuẩn bị file Excel theo đúng mẫu của FaithEdu.",
      },
      {
        title: "Mở chức năng Import",
        content: "Tại trang Học sinh, chọn chức năng Import Excel.",
      },
      {
        title: "Chọn file",
        content: "Chọn file Excel cần nhập.",
      },
      {
        title: "Kiểm tra dữ liệu",
        content: "FaithEdu sẽ kiểm tra dữ liệu trước khi thêm vào hệ thống.",
      },
      {
        title: "Hoàn tất",
        content:
          "Sau khi dữ liệu hợp lệ, hệ thống sẽ thêm học sinh vào danh sách.",
      },
    ],
    tips: [
      "Nên sử dụng file Excel mẫu của FaithEdu để hạn chế lỗi định dạng.",
      "Kiểm tra tên học sinh và thông tin lớp trước khi import.",
    ],
  },

  {
    id: "student-qr",
    category: "students",
    title: "Mã QR học sinh",
    description: "Quản lý và sử dụng mã QR của học sinh.",
    keywords: ["QR", "mã qr", "học sinh", "điểm danh"],
    steps: [
      {
        title: "Mở hồ sơ học sinh",
        content: "Tìm học sinh trong danh sách và mở thông tin chi tiết.",
      },
      {
        title: "Xem mã QR",
        content: "Mã QR của học sinh được sử dụng để nhận diện khi điểm danh.",
      },
      {
        title: "Sử dụng mã QR",
        content:
          "Đưa mã QR trước camera của thiết bị đang thực hiện điểm danh.",
      },
    ],
  },

  // =========================================================
  // LỚP HỌC
  // =========================================================

  {
    id: "class-create",
    category: "classes",
    title: "Tạo lớp học",
    description: "Hướng dẫn tạo lớp học mới.",
    keywords: ["lớp", "lớp học", "tạo lớp"],
    steps: [
      {
        title: "Mở quản lý lớp",
        content: "Truy cập chức năng Lớp học.",
      },
      {
        title: "Tạo lớp",
        content: "Chọn Thêm lớp học và nhập thông tin lớp.",
      },
      {
        title: "Lưu lớp",
        content: "Kiểm tra thông tin và lưu lại.",
      },
    ],
  },

  {
    id: "class-teacher",
    category: "classes",
    title: "Phân công huấn luyện viên",
    description: "Gán huấn luyện viên phụ trách lớp.",
    keywords: ["huấn luyện viên", "giáo lý viên", "phân công", "lớp"],
    steps: [
      {
        title: "Mở lớp học",
        content: "Chọn lớp cần phân công.",
      },
      {
        title: "Mở phân công",
        content: "Chọn chức năng phân công huấn luyện viên.",
      },
      {
        title: "Chọn người phụ trách",
        content: "Chọn tài khoản huấn luyện viên phù hợp.",
      },
      {
        title: "Lưu",
        content: "Lưu lại để hoàn tất phân công.",
      },
    ],
  },

  // =========================================================
  // ĐIỂM DANH
  // =========================================================

  {
    id: "attendance-catechism",
    category: "attendance",
    title: "Điểm danh học giáo lý",
    description: "Hướng dẫn điểm danh học sinh trong buổi học giáo lý.",
    keywords: ["điểm danh", "giáo lý", "học giáo lý", "có mặt", "vắng"],
    steps: [
      {
        title: "Mở Điểm danh",
        content: "Truy cập chức năng Điểm danh.",
      },
      {
        title: "Chọn lớp",
        content: "Chọn lớp cần điểm danh.",
      },
      {
        title: "Chọn ngày",
        content: "Chọn ngày diễn ra buổi học.",
      },
      {
        title: "Điểm danh",
        content: "Đánh dấu trạng thái của từng học sinh.",
      },
      {
        title: "Hoàn tất",
        content: "Kiểm tra lại danh sách và hoàn tất buổi điểm danh.",
      },
    ],
  },

  {
    id: "attendance-mass",
    category: "attendance",
    title: "Điểm danh Thánh lễ",
    description: "Hướng dẫn điểm danh học sinh tham dự Thánh lễ.",
    keywords: ["điểm danh", "thánh lễ", "mass", "lễ"],
    steps: [
      {
        title: "Chọn loại điểm danh",
        content: "Chọn loại điểm danh Thánh lễ.",
      },
      {
        title: "Chọn ngày",
        content: "Chọn ngày Thánh lễ cần ghi nhận.",
      },
      {
        title: "Điểm danh",
        content: "Ghi nhận học sinh tham dự Thánh lễ.",
      },
      {
        title: "Hoàn tất",
        content: "Kiểm tra lại dữ liệu và hoàn tất.",
      },
    ],
  },

  {
    id: "attendance-qr",
    category: "attendance",
    title: "Điểm danh bằng mã QR",
    description: "Sử dụng camera để quét mã QR học sinh.",
    keywords: ["QR", "quét QR", "điểm danh QR", "camera", "nhiều máy"],
    steps: [
      {
        title: "Mở điểm danh QR",
        content: "Mở chức năng điểm danh và chọn hình thức quét QR.",
      },
      {
        title: "Cho phép camera",
        content:
          "Nếu trình duyệt hỏi quyền camera, hãy cho phép sử dụng camera.",
      },
      {
        title: "Quét mã",
        content: "Đưa mã QR của học sinh vào vùng quét.",
      },
      {
        title: "Kiểm tra kết quả",
        content: "Sau khi quét thành công, hệ thống sẽ ghi nhận điểm danh.",
      },
    ],
    tips: [
      "Có thể sử dụng nhiều thiết bị cùng lúc để tăng tốc độ điểm danh.",
      "Mỗi thiết bị cần đăng nhập bằng tài khoản có quyền sử dụng điểm danh.",
      "Đảm bảo camera hoạt động bình thường trước khi bắt đầu.",
    ],
  },

  // =========================================================
  // TÀI KHOẢN
  // =========================================================

  {
    id: "account-role",
    category: "accounts",
    title: "Vai trò và quyền sử dụng",
    description: "Tìm hiểu các vai trò tài khoản trong FaithEdu.",
    keywords: [
      "vai trò",
      "quyền",
      "phân quyền",
      "tài khoản",
      "giáo viên",
      "huấn luyện viên",
    ],
    steps: [
      {
        title: "Huấn luyện viên",
        content:
          "Huấn luyện viên có quyền sử dụng các chức năng quản lý giáo lý theo phạm vi được hệ thống cho phép.",
      },
      {
        title: "Giáo viên",
        content:
          "Giáo viên tập trung vào các chức năng quản lý và giảng dạy lớp được phân công.",
      },
      {
        title: "Quản trị giáo lý",
        content:
          "Quản trị giáo lý có quyền quản lý hệ thống giáo lý của giáo xứ theo phân quyền.",
      },
    ],
    tips: [
      "Không cấp quyền cao hơn mức cần thiết cho tài khoản.",
      "Các thao tác phân quyền quan trọng luôn được kiểm tra ở phía máy chủ.",
    ],
  },

  {
    id: "account-reset-password",
    category: "accounts",
    title: "Cấp lại mật khẩu",
    description: "Hướng dẫn cấp lại mật khẩu cho tài khoản.",
    keywords: ["mật khẩu", "quên mật khẩu", "reset", "cấp lại"],
    steps: [
      {
        title: "Tìm tài khoản",
        content: "Tìm tài khoản cần cấp lại mật khẩu.",
      },
      {
        title: "Chọn Cấp lại mật khẩu",
        content:
          "Mở menu thao tác của tài khoản và chọn chức năng cấp lại mật khẩu.",
      },
      {
        title: "Xác nhận",
        content: "Kiểm tra thông tin và xác nhận thao tác.",
      },
    ],
  },

  // =========================================================
  // THI & ĐIỂM
  // =========================================================

  {
    id: "exam-create",
    category: "exams",
    title: "Tạo kỳ thi",
    description: "Hướng dẫn tạo một kỳ thi mới.",
    keywords: ["thi", "kỳ thi", "bài thi", "tạo"],
    steps: [
      {
        title: "Mở quản lý kỳ thi",
        content: "Truy cập chức năng Thi & điểm.",
      },
      {
        title: "Tạo kỳ thi",
        content: "Chọn tạo kỳ thi mới và nhập thông tin.",
      },
      {
        title: "Thiết lập",
        content: "Thiết lập hình thức và các thông tin liên quan.",
      },
      {
        title: "Lưu",
        content: "Kiểm tra lại và lưu kỳ thi.",
      },
    ],
  },

  // =========================================================
  // BÁO CÁO
  // =========================================================

  {
    id: "export-excel",
    category: "reports",
    title: "Xuất dữ liệu Excel",
    description: "Xuất danh sách và dữ liệu từ FaithEdu.",
    keywords: ["excel", "xuất", "export", "báo cáo"],
    steps: [
      {
        title: "Mở trang dữ liệu",
        content: "Mở chức năng có dữ liệu cần xuất.",
      },
      {
        title: "Chọn Xuất Excel",
        content: "Bấm nút Xuất Excel.",
      },
      {
        title: "Tải file",
        content: "Chờ hệ thống tạo file và tải file về máy.",
      },
    ],
  },

  // =========================================================
  // CÀI ĐẶT
  // =========================================================

  {
    id: "church-settings",
    category: "settings",
    title: "Cài đặt giáo xứ",
    description: "Quản lý các thiết lập chung của giáo xứ.",
    keywords: ["cài đặt", "giáo xứ", "thiết lập", "settings"],
    steps: [
      {
        title: "Mở Cài đặt",
        content: "Truy cập khu vực cài đặt giáo xứ.",
      },
      {
        title: "Chọn nhóm thiết lập",
        content: "Chọn nhóm chức năng cần cấu hình.",
      },
      {
        title: "Lưu thay đổi",
        content: "Sau khi cấu hình xong, lưu lại để áp dụng.",
      },
    ],
  },

  // =========================================================
  // XỬ LÝ SỰ CỐ
  // =========================================================

  {
    id: "trouble-login",
    category: "troubleshooting",
    title: "Không đăng nhập được",
    description: "Một số nguyên nhân phổ biến khi đăng nhập thất bại.",
    keywords: ["lỗi đăng nhập", "không đăng nhập", "mật khẩu sai", "login"],
    steps: [
      {
        title: "Kiểm tra tài khoản",
        content: "Kiểm tra lại tên đăng nhập và mật khẩu.",
      },
      {
        title: "Kiểm tra trạng thái tài khoản",
        content: "Tài khoản có thể đang bị khóa hoặc chưa được kích hoạt.",
      },
      {
        title: "Liên hệ quản trị",
        content:
          "Nếu vẫn không đăng nhập được, liên hệ người quản trị giáo xứ.",
      },
    ],
  },

  {
    id: "trouble-qr",
    category: "troubleshooting",
    title: "Không quét được mã QR",
    description: "Xử lý khi camera không nhận diện được mã QR.",
    keywords: ["QR lỗi", "không quét được", "camera", "điểm danh"],
    steps: [
      {
        title: "Kiểm tra quyền camera",
        content: "Đảm bảo trình duyệt đã được cấp quyền sử dụng camera.",
      },
      {
        title: "Kiểm tra ánh sáng",
        content: "Đảm bảo mã QR đủ sáng và không bị che khuất.",
      },
      {
        title: "Đưa mã vào đúng vùng",
        content:
          "Đặt mã QR vào chính giữa vùng quét và giữ ổn định trong vài giây.",
      },
      {
        title: "Thử lại",
        content: "Nếu vẫn không nhận diện được, tải lại trang và thử lại.",
      },
    ],
  },
];
