import { useEffect } from "react";

const SITE_URL = "https://giaolyso.site";
const DEFAULT_IMAGE = `${SITE_URL}/thumbnail-seo.png`;

function normalizePath(path = "/") {
  const cleanPath = `/${String(path).trim()}`
    .replace(/^\/+/, "")
    .split(/[?#]/)[0];

  if (!cleanPath) return "/";

  const normalized = `/${cleanPath}`.replace(/\/+/g, "/");

  return normalized === "/" ? "/" : normalized.replace(/\/+$/, "");
}

export default function SEO({
  title = "FaithEdu – Giáo Lý Số",
  description = "FaithEdu giúp giáo xứ số hóa công tác giáo lý với các tính năng quản lý lớp học, học viên, giáo lý viên và điểm danh QR.",
  path = "/",
  image = DEFAULT_IMAGE,
  imageAlt = "FaithEdu – Phần mềm quản lý giáo lý Công giáo",
  type = "website",
  noindex = false,
}) {
  useEffect(() => {
    const canonicalPath = normalizePath(path);
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    const imageUrl = image.startsWith("http")
      ? image
      : `${SITE_URL}/${image.replace(/^\/+/, "")}`;

    document.title = title;

    const setMeta = (key, value, attr = "name") => {
      let element = document.head.querySelector(`meta[${attr}="${key}"]`);

      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }

      element.setAttribute("content", String(value));
    };

    const setCanonical = (url) => {
      let element = document.head.querySelector('link[rel="canonical"]');

      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", "canonical");
        document.head.appendChild(element);
      }

      element.setAttribute("href", url);
    };

    // SEO cơ bản
    setMeta("description", description);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");

    // Open Graph: Facebook, Zalo và các nền tảng hỗ trợ
    setMeta("og:type", type, "property");
    setMeta("og:site_name", "FaithEdu - Giáo Lý Số", "property");
    setMeta("og:locale", "vi_VN", "property");
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", canonicalUrl, "property");
    setMeta("og:image", imageUrl, "property");
    setMeta("og:image:alt", imageAlt, "property");

    // Twitter / X
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", imageUrl);
    setMeta("twitter:image:alt", imageAlt);

    // Canonical
    setCanonical(canonicalUrl);
  }, [title, description, path, image, imageAlt, type, noindex]);

  return null;
}
