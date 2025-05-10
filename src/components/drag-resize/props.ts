export type DragResizeProps = {
  stickSize?: number;
  parentScaleX?: number;
  parentScaleY?: number;
  isActive?: boolean;
  preventActiveBehavior?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
  aspectRatio?: boolean;
  parentLimitation?: boolean;
  snapToGrid?: boolean;
  gridX?: number;
  //
  gridY?: number;
  parentW?: number;
  parentH?: number;
  w?: number | string;
  h?: number | string;
  minw?: number;
  minh?: number;
  x?: number;
  y?: number;
  z?: number | string;
  dragHandle?: string | null;
  dragCancel?: string | null;
  sticks?: Sticks[];
  axis?: Axis;
  contentClass?: string;
};

export type Sticks = "tl" | "tm" | "tr" | "mr" | "br" | "bm" | "bl" | "ml";

export type Axis = "x" | "y" | "both" | "none";