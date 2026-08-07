// Pure geometry for the square avatar cropper. Keeping it framework-free makes
// the crop math testable and keeps the editor component small.
export interface PickedImage {
  uri: string
  width: number
  height: number
}

export interface Offset {
  x: number
  y: number
}

export interface CropRegion {
  originX: number
  originY: number
  width: number
  height: number
}

export const VIEWPORT_SIZE = 280
export const MIN_SCALE = 1
export const MAX_SCALE = 3
export const ZOOM_STEP = 0.25
export const OUTPUT_SIZE = 512

type Size = Pick<PickedImage, 'width' | 'height'>

/** Scale that makes the image's shorter side exactly fill the square viewport. */
export function baseScaleFor(image: Size, viewport: number = VIEWPORT_SIZE): number {
  return viewport / Math.min(image.width, image.height)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Keeps the pan offset within bounds so the viewport never shows empty space. */
export function clampTranslate(
  candidate: Offset,
  userScale: number,
  image: Size,
  viewport: number = VIEWPORT_SIZE,
): Offset {
  const displayScale = baseScaleFor(image, viewport) * userScale
  const maxX = Math.max(0, (image.width * displayScale - viewport) / 2)
  const maxY = Math.max(0, (image.height * displayScale - viewport) / 2)
  return {
    x: clamp(candidate.x, -maxX, maxX),
    y: clamp(candidate.y, -maxY, maxY),
  }
}

/** Maps the current pan/zoom to a crop region in the source image's pixels. */
export function computeCropRegion(
  image: Size,
  scale: number,
  translate: Offset,
  viewport: number = VIEWPORT_SIZE,
): CropRegion {
  const displayScale = baseScaleFor(image, viewport) * scale
  const cropSize = viewport / displayScale
  const originX = image.width / 2 - viewport / (2 * displayScale) - translate.x / displayScale
  const originY = image.height / 2 - viewport / (2 * displayScale) - translate.y / displayScale
  return {
    originX: Math.max(0, Math.round(originX)),
    originY: Math.max(0, Math.round(originY)),
    width: Math.round(cropSize),
    height: Math.round(cropSize),
  }
}
