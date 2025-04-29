// Type definitions for the Visual Viewport API
// This allows us to use window.visualViewport in TypeScript

interface VisualViewport extends EventTarget {
  readonly width: number;
  readonly height: number;
  readonly offsetLeft: number;
  readonly offsetTop: number;
  readonly pageLeft: number;
  readonly pageTop: number;
  readonly scale: number;
  onresize: ((this: VisualViewport, ev: Event) => void) | null;
  onscroll: ((this: VisualViewport, ev: Event) => void) | null;
}

interface Window {
  visualViewport?: VisualViewport;
} 