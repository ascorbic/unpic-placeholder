import { decode } from "blurhash";
import {
  imageDataToDataURI,
  pixelsToCssGradients,
  rgbaPixelsToBmp,
} from "./format";

export interface CSSObject {
  backgroundImage: string;
  backgroundSize?: string;
}

/**
 * Given a blurhash, returns a data URI of a BMP image. At tiny sizes, this is smaller than a PNG.
 * @param blurhash the blurhash string
 * @param width the width of the generated background image. Keep it tiny. Default is 8 pixels
 * @param height the height of the generated background image. Keep it tiny. Default is 8 pixels
 */
export function blurhashToDataUri(
  blurhash: string,
  width = 8,
  height = 8
): `data:image/bmp;base64,${string}` {
  const pixels = decode(blurhash, width, height);
  const data = rgbaPixelsToBmp(pixels, width, height);
  return imageDataToDataURI(data, "image/bmp");
}

/**
 * Given a blurhash, returns an array of CSS linear-gradient() strings.
 * This is a rough approximation of the blurhash image but as pure CSS.
 * @param blurhash the blurhash string
 * @param columns the number of gradients to generate horizontally. Default is 4
 * @param rows the number of gradients to generate vertically. Default is 3
 */
export function blurhashToCssGradients(
  blurhash: string,
  columns = 4,
  rows = 3
): Array<string> {
  const pixels = decode(blurhash, columns, rows);
  return pixelsToCssGradients(pixels, columns, rows);
}

/**
 * Given a blurhash, returns an array of CSS linear-gradient() strings.
 * This is a rough approximation of the blurhash image but as pure CSS.
 * @param blurhash the blurhash string
 * @param columns the number of gradients to generate horizontally. Default is 4
 * @param rows the number of gradients to generate vertically. Default is 3
 */
export function blurhashToCssGradientString(
  blurhash: string,
  columns = 4,
  rows = 3
): string {
  return blurhashToCssGradients(blurhash, columns, rows).join(",");
}

/**
 * Given a blurhash, returns an object with a CSS background-image property.
 * @param blurhash the blurhash string
 * @param columns the number of gradients to generate horizontally. Default is 4
 * @param rows the number of gradients to generate vertically. Default is 3
 */
export function blurhashToGradientCssObject(
  blurhash: string,
  columns = 4,
  rows = 3
): CSSObject {
  return {
    backgroundImage: blurhashToCssGradients(blurhash, columns, rows).join(","),
  };
}

/**
 * Given a blurhash, returns an object with CSS background properties to apply to an img.
 * @param blurhash the blurhash string
 * @param width the width of the generated background image. Default is 8 pixels
 * @param height the height of the generated background image. Default is 8 pixels
 */
export function blurhashToImageCssObject(
  blurhash: string,
  width = 8,
  height = 8
): CSSObject {
  return {
    backgroundImage: `url("${blurhashToDataUri(blurhash, width, height)}")`,
    backgroundSize: "cover",
  };
}

/**
 * Given a blurhash, returns a CSS string for a background to apply to an img element.
 * @param blurhash the blurhash string
 * @param width the width of the generated background image. Default is 8 pixels
 * @param height the height of the generated background image. Default is 8 pixels
 */

export function blurhashToImageCssString(
  blurhash: string,
  width = 8,
  height = 8
): string {
  return `background: url("${blurhashToDataUri(
    blurhash,
    width,
    height
  )}") cover`;
}
