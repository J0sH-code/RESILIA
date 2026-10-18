import { useCallback, useLayoutEffect, useRef, useState } from "react";

/** Size of the illustrative map artwork, in canvas pixels. */
export const MAP_WIDTH = 944;
export const MAP_HEIGHT = 530;

const ZOOM_STEPS = [1, 1.5, 2, 3];
const DEFAULT_CENTER = { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 };

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function clampCenter(center, zoom) {
  const halfW = MAP_WIDTH / 2 / zoom;
  const halfH = MAP_HEIGHT / 2 / zoom;
  return {
    x: clamp(center.x, halfW, MAP_WIDTH - halfW),
    y: clamp(center.y, halfH, MAP_HEIGHT - halfH),
  };
}

/**
 * Fit-to-width, zoom and drag-to-pan for the fixed-size illustrative map.
 * Exposes `project` to place screen-space overlays (pins, labels, popups)
 * on canvas coordinates so they stay crisp at any zoom level.
 */
export function useMapViewport() {
  const viewportRef = useRef(null);
  const [width, setWidth] = useState(MAP_WIDTH);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const drag = useRef(null);

  useLayoutEffect(() => {
    const node = viewportRef.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const zoom = ZOOM_STEPS[zoomIndex];
  const scale = (width / MAP_WIDTH) * zoom;
  const height = (width * MAP_HEIGHT) / MAP_WIDTH;
  const offsetX = width / 2 - center.x * scale;
  const offsetY = height / 2 - center.y * scale;

  const project = useCallback(
    (x, y) => ({ left: x * scale + offsetX, top: y * scale + offsetY }),
    [scale, offsetX, offsetY],
  );

  const unproject = useCallback(
    (left, top) => ({ x: (left - offsetX) / scale, y: (top - offsetY) / scale }),
    [scale, offsetX, offsetY],
  );

  const setZoomStep = (nextIndex) => {
    const index = clamp(nextIndex, 0, ZOOM_STEPS.length - 1);
    setZoomIndex(index);
    setCenter((current) => clampCenter(current, ZOOM_STEPS[index]));
  };

  const zoomIn = () => setZoomStep(zoomIndex + 1);
  const zoomOut = () => setZoomStep(zoomIndex - 1);
  const reset = () => {
    setZoomIndex(0);
    setCenter(DEFAULT_CENTER);
  };
  const centerOn = (point) => {
    const index = Math.max(zoomIndex, 1);
    setZoomIndex(index);
    setCenter(clampCenter(point, ZOOM_STEPS[index]));
  };

  const panHandlers = {
    onPointerDown(event) {
      if (event.button !== 0 || event.target.closest("button, a, input")) return;
      drag.current = { x: event.clientX, y: event.clientY, center, moved: false };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove(event) {
      if (!drag.current) return;
      const dx = event.clientX - drag.current.x;
      const dy = event.clientY - drag.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
      setCenter(
        clampCenter(
          { x: drag.current.center.x - dx / scale, y: drag.current.center.y - dy / scale },
          zoom,
        ),
      );
    },
    onPointerUp(event) {
      const wasDrag = drag.current?.moved;
      drag.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      return wasDrag;
    },
  };

  return {
    viewportRef,
    viewportSize: { width, height },
    canvasTransform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
    project,
    unproject,
    scale,
    zoom,
    canZoomIn: zoomIndex < ZOOM_STEPS.length - 1,
    canZoomOut: zoomIndex > 0,
    zoomIn,
    zoomOut,
    reset,
    centerOn,
    panHandlers,
  };
}
