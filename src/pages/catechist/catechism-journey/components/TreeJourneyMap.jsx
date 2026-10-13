import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useChurchSettings } from "../../../../context/ChurchSettingsContext";

const PALETTES = [
  { color: "#2588d6", pale: "#e3f5ff", icon: "📘" },
  { color: "#31a66a", pale: "#e6f9e9", icon: "📗" },
  { color: "#ed9c28", pale: "#fff2d6", icon: "📙" },
  { color: "#d65c9d", pale: "#ffebf5", icon: "📕" },
  { color: "#8765d8", pale: "#f1ebff", icon: "📚" },
];

const NODE_W = 190;
const NODE_H = 78;

function lessonTitle(lesson, index) {
  return lesson.title || lesson.name || `Bài học ${index + 1}`;
}

function TreeNode({
  item,
  onSelect,
  onNodePointerDown,
  suppressClickRef,
  isRoot = false,
  isLesson = false,
}) {
  const {
    x,
    y,
    w = NODE_W,
    h = NODE_H,
    tone,
    icon,
    title,
    subtitle,
    tag,
  } = item;
  return (
    <motion.button
      type="button"
      className={`tree-node ${isRoot ? "tree-root" : ""} ${isLesson ? "tree-lesson" : ""} ${item.kind === "class" ? "tree-class" : ""}`}
      style={{
        left: x,
        top: y,
        width: w,
        minHeight: h,
        "--node-tone": tone.color,
        "--node-pale": tone.pale,
        touchAction: "none",
      }}
      onPointerDown={(event) => {
        if (isRoot) return;
        event.stopPropagation();
        onNodePointerDown(event, item);
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (suppressClickRef?.current) {
          suppressClickRef.current = false;
          event.preventDefault();
          return;
        }
        if (isLesson) onSelect?.(item.lessonData);
      }}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.98 }}
      title={
        isLesson ? "Kéo để sắp xếp · Nhấn để xem bài" : "Kéo để sắp xếp vị trí"
      }
    >
      <img
        style={{ height: "50px" }}
        src={`${process.env.REACT_APP_API_URL}${icon}`}
        alt=""
      />
      <span className="tree-node-copy">
        {tag && <small className="tree-node-tag">{tag}</small>}
        <strong>{title}</strong>
        {subtitle && <small className="tree-node-subtitle">{subtitle}</small>}
      </span>
      {!isRoot && (
        <span className="tree-node-open">{isLesson ? "↗" : "⋮⋮"}</span>
      )}
    </motion.button>
  );
}

export default function TreeJourneyMap({ classes = [], onSelectLesson }) {
  const { settings } = useChurchSettings();
  const viewportRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(0.62);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [draggingCanvas, setDraggingCanvas] = useState(false);
  const [nodePositions, setNodePositions] = useState({});
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  console.log(settings);

  useEffect(() => {
    const syncFullscreen = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const layout = useMemo(() => {
    const items = [];
    const connectors = [];
    const classMeta = classes.map((cls) => {
      const lessons = (cls.chapters || []).flatMap((ch) =>
        (ch.lessons || []).map((lesson) => ({
          ...lesson,
          chapterTitle: lesson.chapterTitle || ch.title || ch.name,
        })),
      );
      return { cls, lessons };
    });

    // Compact radial layout: parish at the center, classes on an orbit,
    // and each class's lessons arranged in a small outward-facing cluster.
    const rootW = 230,
      rootH = 110;
    const centerX = 1050,
      centerY = 850;
    const orbitRx = Math.max(340, Math.min(470, classMeta.length * 38 + 220));
    const orbitRy = Math.max(270, Math.min(390, classMeta.length * 28 + 180));
    const rootItem = {
      kind: "root",
      id: "parish-root",
      x: centerX - rootW / 2,
      y: centerY - rootH / 2,
      w: rootW,
      h: rootH,
      tone: { color: "#e7a72f", pale: "#fff3c9" },
      icon: settings?.logo || "⛪",
      title: settings?.slogan || "Giáo lý",
      subtitle: "Trung tâm chương trình giáo lý",
    };
    items.push(rootItem);

    const count = Math.max(1, classMeta.length);
    classMeta.forEach(({ cls, lessons }, ci) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * ci) / count;
      const cx = centerX + Math.cos(angle) * orbitRx;
      const cy = centerY + Math.sin(angle) * orbitRy;
      const tone = PALETTES[ci % PALETTES.length];
      const classItem = {
        kind: "class",
        id: cls.id,
        x: cx - 102,
        y: cy - 41,
        w: 204,
        h: 82,
        tone,
        icon: cls.icon || tone.icon,
        title: cls.name,
        subtitle: cls.subtitle || `${lessons.length} bài học`,
        classData: cls,
        angle,
      };
      items.push(classItem);

      // Lessons form compact rows extending away from the parish, near their class.
      const outwardX = Math.cos(angle),
        outwardY = Math.sin(angle);
      const tangentX = -outwardY,
        tangentY = outwardX;
      const cols = 2;
      const rows = Math.max(1, Math.ceil(lessons.length / cols));
      const lessonRadius = 165;
      lessons.forEach((lesson, li) => {
        const col = Math.floor(li / rows);
        const row = li % rows;
        const tangentOffset = (row - (rows - 1) / 2) * 92;
        const radialOffset = lessonRadius + col * 205;
        const x = cx + outwardX * radialOffset + tangentX * tangentOffset - 108;
        const y = cy + outwardY * radialOffset + tangentY * tangentOffset - 36;
        items.push({
          kind: "lesson",
          id: lesson.id || `${cls.id}-lesson-${li}`,
          x,
          y,
          w: 216,
          h: 72,
          tone: { color: tone.color, pale: tone.pale },
          icon: lesson.icon || "📖",
          title: lessonTitle(lesson, li),
          subtitle:
            lesson.description ||
            lesson.summary ||
            lesson.chapterTitle ||
            `Nội dung bài ${li + 1}`,
          tag: `BÀI ${li + 1}`,
          classId: cls.id,
          lessonData: {
            ...lesson,
            id: lesson.id || `${cls.id}-lesson-${li}`,
            className: cls.name,
            lessonNumber: li + 1,
            status:
              lesson.status ||
              (lesson.completed
                ? "completed"
                : li === 0
                  ? "current"
                  : "locked"),
            image: lesson.image || lesson.thumbnail || lesson.imageUrl,
          },
        });
      });
    });

    // Connectors are drawn between the nearest edges of each pair of nodes.
    const center = (item) => ({
      x: item.x + item.w / 2,
      y: item.y + item.h / 2,
    });

    items
      .filter((item) => item.kind === "class")
      .forEach((cls) => {
        const a = center(rootItem),
          b = center(cls);
        const dx = b.x - a.x,
          dy = b.y - a.y;
        const scaleA =
          1 /
          Math.max(
            Math.abs(dx) / (rootItem.w / 2),
            Math.abs(dy) / (rootItem.h / 2),
            0.001,
          );
        const scaleB =
          1 /
          Math.max(
            Math.abs(dx) / (cls.w / 2),
            Math.abs(dy) / (cls.h / 2),
            0.001,
          );
        const sx = a.x + dx * scaleA,
          sy = a.y + dy * scaleA;
        const ex = b.x - dx * scaleB,
          ey = b.y - dy * scaleB;
        const bend = Math.max(55, Math.min(150, Math.hypot(dx, dy) * 0.22));
        const nx = -dy / (Math.hypot(dx, dy) || 1),
          ny = dx / (Math.hypot(dx, dy) || 1);
        connectors.push({
          id: `root-${cls.id}`,
          d: `M ${sx} ${sy} Q ${(sx + ex) / 2 + nx * bend} ${(sy + ey) / 2 + ny * bend} ${ex} ${ey}`,
          color: cls.tone.color,
          width: 5,
        });
      });
    items
      .filter((item) => item.kind === "lesson")
      .forEach((lesson) => {
        const cls = items.find(
          (item) => item.kind === "class" && item.id === lesson.classId,
        );
        if (!cls) return;
        const a = center(cls),
          b = center(lesson);
        const dx = b.x - a.x,
          dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const scaleA =
          1 /
          Math.max(
            Math.abs(dx) / (cls.w / 2),
            Math.abs(dy) / (cls.h / 2),
            0.001,
          );
        const scaleB =
          1 /
          Math.max(
            Math.abs(dx) / (lesson.w / 2),
            Math.abs(dy) / (lesson.h / 2),
            0.001,
          );
        const sx = a.x + dx * scaleA,
          sy = a.y + dy * scaleA;
        const ex = b.x - dx * scaleB,
          ey = b.y - dy * scaleB;
        const bend = Math.min(55, len * 0.14);
        const nx = -dy / len,
          ny = dx / len;
        connectors.push({
          id: `${cls.id}-${lesson.id}`,
          d: `M ${sx} ${sy} Q ${(sx + ex) / 2 + nx * bend} ${(sy + ey) / 2 + ny * bend} ${ex} ${ey}`,
          color: cls.tone.color,
          width: 3,
          lesson: true,
        });
      });

    const minX = Math.min(...items.map((item) => item.x)) - 220;
    const minY = Math.min(...items.map((item) => item.y)) - 180;
    const maxX = Math.max(...items.map((item) => item.x + item.w)) + 260;
    const maxY = Math.max(...items.map((item) => item.y + item.h)) + 220;
    // Shift all nodes and connector coordinates into positive canvas space.
    const shiftedItems = items.map((item) => ({
      ...item,
      x: item.x - minX,
      y: item.y - minY,
    }));
    const shiftedConnectors = connectors.map((line) => {
      const nums = line.d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
      let i = 0;
      const shifted = line.d.replace(/-?\d+(?:\.\d+)?/g, () => {
        const value = nums[i++];
        return String(value - (i % 2 === 1 ? minX : minY));
      });
      return { ...line, d: shifted };
    });
    return {
      items: shiftedItems,
      connectors: shiftedConnectors,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [classes, settings?.logo, settings?.slogan]);
  const renderedItems = useMemo(
    () =>
      layout.items.map((item) => ({
        ...item,
        x: item.x + (nodePositions[item.id]?.x || 0),
        y: item.y + (nodePositions[item.id]?.y || 0),
      })),
    [layout, nodePositions],
  );

  const renderedConnectors = useMemo(() => {
    const itemsById = Object.fromEntries(
      renderedItems.map((item) => [item.id, item]),
    );
    const center = (item) => ({
      x: item.x + item.w / 2,
      y: item.y + item.h / 2,
    });
    return layout.connectors.map((line) => {
      let from, to;
      if (line.id.startsWith("root-")) {
        from = itemsById["parish-root"];
        to = itemsById[line.id.slice(5)];
      } else {
        to = renderedItems.find(
          (item) => item.kind === "lesson" && line.id.endsWith(`-${item.id}`),
        );
        from = to && itemsById[to.classId];
      }
      if (!from || !to) return line;
      const a = center(from),
        b = center(to);
      const dx = b.x - a.x,
        dy = b.y - a.y,
        len = Math.hypot(dx, dy) || 1;
      const scaleA =
        1 /
        Math.max(
          Math.abs(dx) / (from.w / 2),
          Math.abs(dy) / (from.h / 2),
          0.001,
        );
      const scaleB =
        1 /
        Math.max(Math.abs(dx) / (to.w / 2), Math.abs(dy) / (to.h / 2), 0.001);
      const sx = a.x + dx * scaleA,
        sy = a.y + dy * scaleA;
      const ex = b.x - dx * scaleB,
        ey = b.y - dy * scaleB;
      const bend = line.lesson
        ? Math.min(55, len * 0.14)
        : Math.max(55, Math.min(150, len * 0.22));
      const nx = -dy / len,
        ny = dx / len;
      return {
        ...line,
        d: `M ${sx} ${sy} Q ${(sx + ex) / 2 + nx * bend} ${(sy + ey) / 2 + ny * bend} ${ex} ${ey}`,
      };
    });
  }, [layout.connectors, renderedItems]);

  const startCanvasDrag = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest?.(".tree-node")) return;
    setDraggingCanvas(true);
    dragRef.current = {
      type: "canvas",
      x: event.clientX,
      y: event.clientY,
      ox: offset.x,
      oy: offset.y,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const startNodeDrag = (event, item) => {
    if (event.button !== undefined && event.button !== 0) return;
    dragRef.current = {
      type: "node",
      id: item.id,
      startX: event.clientX,
      startY: event.clientY,
      ox: nodePositions[item.id]?.x || 0,
      oy: nodePositions[item.id]?.y || 0,
      moved: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (drag.type === "canvas") {
      setOffset({
        x: drag.ox + event.clientX - drag.x,
        y: drag.oy + event.clientY - drag.y,
      });
      return;
    }
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    setNodePositions((prev) => ({
      ...prev,
      [drag.id]: { x: drag.ox + dx, y: drag.oy + dy },
    }));
  };
  const endDrag = () => {
    if (dragRef.current?.type === "node" && dragRef.current.moved) {
      suppressClickRef.current = true;
    }
    dragRef.current = null;
    setDraggingCanvas(false);
  };
  const resetView = () => {
    setOffset({ x: 0, y: 0 });
    setNodePositions({});
    setZoomLevel(0.62);
  };
  const zoomAt = (nextZoom, clientX, clientY) => {
    const viewport = viewportRef.current;
    const next = Math.max(0.25, Math.min(1.8, nextZoom));
    if (
      viewport &&
      typeof clientX === "number" &&
      typeof clientY === "number"
    ) {
      const rect = viewport.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      const old = zoomLevel;
      const localX = (px - offset.x) / old;
      const localY = (py - offset.y) / old;
      setOffset({ x: px - localX * next, y: py - localY * next });
    }
    setZoomLevel(next);
  };
  const handleWheelZoom = (event) => {
    event.preventDefault();
    zoomAt(
      zoomLevel * (event.deltaY < 0 ? 1.08 : 0.92),
      event.clientX,
      event.clientY,
    );
  };
  const toggleFullscreen = async () => {
    const target = viewportRef.current?.closest(".tree-journey");
    if (!target) return;
    try {
      if (!document.fullscreenElement) {
        await target.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((value) => !value);
    }
  };

  return (
    <section className="tree-journey">
      <div
        className={`tree-viewport ${draggingCanvas ? "is-dragging" : ""}`}
        ref={viewportRef}
        onWheel={handleWheelZoom}
      >
        <div className="tree-map-tools">
          <span>{Math.round(zoomLevel * 100)}%</span>
          <button
            type="button"
            title="Thu nhỏ sơ đồ"
            aria-label="Thu nhỏ sơ đồ"
            onClick={() => zoomAt(zoomLevel * 0.85)}
          >
            −
          </button>
          <button
            type="button"
            title="Phóng to sơ đồ"
            aria-label="Phóng to sơ đồ"
            onClick={() => zoomAt(zoomLevel * 1.18)}
          >
            ＋
          </button>
          <button
            type="button"
            title="Đặt lại sơ đồ"
            aria-label="Đặt lại sơ đồ"
            onClick={resetView}
          >
            ↺
          </button>
          <button
            type="button"
            title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            aria-label="Toàn màn hình"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? "⤢" : "⛶"}
          </button>
        </div>
        <div
          className="tree-canvas"
          style={{
            width: layout.width,
            height: layout.height,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoomLevel})`,
          }}
          onPointerDown={startCanvasDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
        >
          <svg
            className="tree-connectors"
            width={layout.width}
            height={layout.height}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            aria-hidden="true"
          >
            <defs>
              <filter id="lineGlow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {renderedConnectors.map((line) => (
              <g key={line.id}>
                <path
                  d={line.d}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={line.width + 5}
                  strokeLinecap="round"
                  opacity=".92"
                />
                <path
                  d={line.d}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={line.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={line.lesson ? ".78" : ".98"}
                  filter="url(#lineGlow)"
                />
                <path
                  d={line.d}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeDasharray="4 9"
                  strokeLinecap="round"
                  opacity=".85"
                />
              </g>
            ))}
          </svg>
          {renderedItems.map((item) => (
            <TreeNode
              key={`${item.kind}-${item.id}`}
              item={item}
              isRoot={item.kind === "root"}
              isLesson={item.kind === "lesson"}
              onSelect={onSelectLesson}
              onNodePointerDown={startNodeDrag}
              suppressClickRef={suppressClickRef}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
