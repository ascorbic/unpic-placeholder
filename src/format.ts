/**
 * Converts raw RGBA pixels to a data URI
 */

import { Colour } from "./index";

export function rgbaPixelsToBmp(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): Uint8Array {
  // convert RGBA pixels to BMP format
  const bytesPerPixel = 3;
  // BMP width must be a multiple of 4
  const padding = (4 - ((width * bytesPerPixel) % 4)) % 4;
  const bmpPixels = new Uint8Array((width * bytesPerPixel + padding) * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const j =
        (height - y - 1) * (width * bytesPerPixel + padding) +
        x * bytesPerPixel;
      bmpPixels[j] = pixels[i + 2]; // blue channel
      bmpPixels[j + 1] = pixels[i + 1]; // green channel
      bmpPixels[j + 2] = pixels[i]; // red channel
    }
  }

  // create BMP header
  const header = new Uint8Array([
    0x42,
    0x4d, // magic
    0x36 + bmpPixels.length,
    0x04,
    0x00,
    0x00, // size in bytes
    0x00,
    0x00, // app data
    0x00,
    0x00, // app data
    0x36,
    0x00,
    0x00,
    0x00, // start of data offset
    0x28,
    0x00,
    0x00,
    0x00, // info hdrlen
    width & 0xff,
    (width >> 8) & 0xff,
    (width >> 16) & 0xff,
    (width >> 24) & 0xff, // width
    height & 0xff,
    (height >> 8) & 0xff,
    (height >> 16) & 0xff,
    (height >> 24) & 0xff, // height
    0x01,
    0x00, // num color planes
    0x18,
    0x00, // bits per pixel
    0x00,
    0x00,
    0x00,
    0x00, // compression is none
    bmpPixels.length,
    0x00,
    0x00,
    0x00, // image bits size
    0x13,
    0x0b,
    0x00,
    0x00, // horz resoluition in pixel / m
    0x13,
    0x0b,
    0x00,
    0x00, // vert resolutions (0x03C3 = 96 dpi, 0x0B13 = 72 dpi)
    0x00,
    0x00,
    0x00,
    0x00, // #colors in palette
    0x00,
    0x00,
    0x00,
    0x00, // #important colors
  ]);

  // concatenate header and pixels
  const fullArr = new Uint8Array(header.length + bmpPixels.length);
  fullArr.set(header);
  fullArr.set(bmpPixels, header.length);
  return fullArr;
}

export function imageDataToDataURI<T extends string>(
  data: Uint8Array,
  mimeType: T
): `data:${T};base64,${string}` {
  const base64 = btoa(String.fromCharCode(...data));
  return `data:${mimeType};base64,${base64}`;
}

const toHex = (n: number): string => {
  const hex = n.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + toHex(r) + toHex(g) + toHex(b);
};

// Save some bytes
function percentOrZero(num: number): string | 0 {
  if (num === 0) return 0;
  return `${num}%`;
}

/**
 * Converts raw RGBA pixels to an array of CSS gradients
 */
export function pixelsToCssGradients(
  pixels: Uint8ClampedArray,
  columns: number,
  rows: number
): Array<string> {
  const stops = [];
  for (let i = 0, j = 0; i < pixels.length; i += 4, j++) {
    const col = j % columns;
    const row = Math.floor(j / columns);

    const percentX = Math.round((col / (columns - 1)) * 100);
    const percentY = Math.round((row / (rows - 1)) * 100);

    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    // pixels[i+3] is alpha channel, but we don't need it

    const color = `radial-gradient(at ${percentOrZero(
      percentX
      // Hex is smaller than rgba. #00000000 = transparent
    )} ${percentOrZero(percentY)},${rgbToHex(r, g, b)},#00000000 50%)`;
    stops.push(color);
  }
  return stops;
}
