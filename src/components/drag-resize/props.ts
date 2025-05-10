export type DragResizeProps = {
  /**
   * 是否显示 stick，设置选中时的拖拽标识是否显示
   * @default true
   */
  showStick?: boolean;
  /**
   * stick 大小，设置选中时的拖拽标识的大小
   * @default 8
   */
  stickSize?: number;
  /**
   * 父元素x轴上的缩放比例
   * @default 1
   */
  parentScaleX?: number;
  /**
   * 父元素y轴上的缩放比例
   * @default 1
   */
  parentScaleY?: number;
  /**
   * 是否激活状态
   * @default false
   */
  isActive?: boolean;
  /**
   * 是否锁定
   */
  preventActiveBehavior?: boolean;
  /**
   * 是否可拖拽
   * @default true
   */
  isDraggable?: boolean;
  /**
   * 是否可缩放
   * @default true
   */
  isResizable?: boolean;
  /**
   * 是否固定宽高比
   */
  aspectRatio?: boolean;
  /**
   * 是否可调整大小
   */
  parentLimitation?: boolean;
  /**
   * 将组件更改的范围限制为其父大小
   */
  snapToGrid?: boolean;
  /**
   * x轴上的网格大小
   */
  gridX?: number;
  /**
   * y轴上的网格大小
   */
  gridY?: number;
  /**
   * 定义父元素的初始宽度。 如果未指定，则自动计算
   */
  parentW?: number;
  /**
   * 定义父元素的初始高度。 如果未指定，则自动计算
   */
  parentH?: number;
  /**
   * 元素宽度
   */
  w?: number | string;
  /**
   * 元素高度
   */
  h?: number | string;
  /**
   * 元素最小宽度
   */
  minw?: number;
  /**
   * 元素最小高度
   */
  minh?: number;
  /**
   * x轴元素初始位置
   */
  x?: number;
  /**
   * y轴元素初始位置
   */
  y?: number;
  /**
   * 元素在容器内的层级
   */
  z?: number | string;
  /**
   * 定义应该用于拖动组件的选择器
   */
  dragHandle?: string | null;
  /**
   * 定义应该用于防止拖动初始化的选择器
   */
  dragCancel?: string | null;
  /**
   * 定义句柄数组以限制元素大小调整的方向
   */
  sticks?: Sticks[];
  /**
   * 定义元素可拖动的轴。 可用值为`x`，`y`，`both`或`none`
   */
  axis?: Axis;
  /**
   * 容器的类名
   */
  contentClass?: string;
};

export type Sticks = "tl" | "tm" | "tr" | "mr" | "br" | "bm" | "bl" | "ml";

export type Axis = "x" | "y" | "both" | "none";