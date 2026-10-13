export const DEMO_CLASSES = [
  {
    id: "giao-ly-a",
    name: "Giáo lý A",
    subtitle: "Những bước đầu đức tin",
    icon: "📘",
    chapters: [
      {
        title: "Làm quen với đức tin",
        lessons: [
          {
            id: "a1",
            title: "Thiên Chúa là ai?",
            icon: "📖",
            description: "Làm quen với Thiên Chúa và tình yêu của Ngài.",
            image: "",
          },
          {
            id: "a2",
            title: "Tạo dựng vũ trụ",
            icon: "🌍",
            description: "Khám phá vẻ đẹp của công trình tạo dựng.",
          },
          {
            id: "a3",
            title: "Con người",
            icon: "🧒",
            description: "Mỗi người đều có phẩm giá và được yêu thương.",
          },
          {
            id: "a4",
            title: "Gia đình",
            icon: "🏡",
            description: "Học cách yêu thương và vâng lời trong gia đình.",
          },
          {
            id: "a5",
            title: "Cầu nguyện",
            icon: "🙏",
            description: "Tập trò chuyện với Chúa mỗi ngày.",
          },
          {
            id: "a6",
            title: "Các bí tích",
            icon: "✨",
            description: "Làm quen với các dấu chỉ ân sủng.",
          },
        ],
      },
    ],
  },
  {
    id: "giao-ly-b",
    name: "Giáo lý B",
    subtitle: "Khám phá Lời Chúa",
    icon: "📗",
    chapters: [
      {
        title: "Khám phá Lời Chúa",
        lessons: [
          {
            id: "b1",
            title: "Chúa Giêsu",
            icon: "✝️",
            description: "Tìm hiểu về Chúa Giêsu và sứ điệp yêu thương.",
          },
          {
            id: "b2",
            title: "Lời Chúa",
            icon: "📖",
            description: "Lắng nghe và thực hành Lời Chúa.",
          },
          {
            id: "b3",
            title: "Các dụ ngôn",
            icon: "🌱",
            description: "Khám phá những câu chuyện của Chúa Giêsu.",
          },
          {
            id: "b4",
            title: "Yêu thương tha nhân",
            icon: "❤️",
            description: "Thực hành yêu thương bằng hành động.",
          },
          {
            id: "b5",
            title: "Sống bác ái",
            icon: "🤝",
            description: "Biết chia sẻ và giúp đỡ mọi người.",
          },
        ],
      },
    ],
  },
  {
    id: "giao-ly-c",
    name: "Giáo lý C",
    subtitle: "Cùng sống Tin Mừng",
    icon: "📙",
    chapters: [
      {
        title: "Sống Tin Mừng",
        lessons: [
          {
            id: "c1",
            title: "Mười Điều Răn",
            icon: "📜",
            description: "Tìm hiểu những hướng dẫn sống theo tình yêu.",
          },
          {
            id: "c2",
            title: "Các nhân đức",
            icon: "🌿",
            description: "Nuôi dưỡng những thói quen tốt lành.",
          },
          {
            id: "c3",
            title: "Các thánh",
            icon: "⭐",
            description: "Học gương sống đức tin từ các thánh.",
          },
          {
            id: "c4",
            title: "Đời sống Kitô hữu",
            icon: "⛪",
            description: "Sống đức tin trong cộng đoàn.",
          },
        ],
      },
    ],
  },
  {
    id: "giao-ly-d",
    name: "Giáo lý D",
    subtitle: "Trưởng thành trong đức tin",
    icon: "📕",
    chapters: [
      {
        title: "Trưởng thành trong đức tin",
        lessons: [
          {
            id: "d1",
            title: "Đức tin và cuộc sống",
            icon: "🕯️",
            description: "Để đức tin soi sáng lựa chọn mỗi ngày.",
          },
          {
            id: "d2",
            title: "Phụng vụ",
            icon: "⛪",
            description: "Hiểu ý nghĩa các cử hành phụng vụ.",
          },
          {
            id: "d3",
            title: "Bí tích Thánh Thể",
            icon: "🍞",
            description: "Tìm hiểu trung tâm đời sống Kitô hữu.",
          },
          {
            id: "d4",
            title: "Phục vụ cộng đoàn",
            icon: "🤝",
            description: "Dùng khả năng để phục vụ mọi người.",
          },
        ],
      },
    ],
  },
];

export function flattenLessons(chapters = []) {
  return chapters.flatMap((chapter) =>
    (chapter.lessons || []).map((lesson) => ({
      ...lesson,
      chapterTitle: lesson.chapterTitle || chapter.title || chapter.name,
    })),
  );
}
