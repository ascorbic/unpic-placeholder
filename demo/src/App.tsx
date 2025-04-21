import { computed, effect, signal } from "@preact/signals";
import { JSX } from "preact";
import { decode, encode } from "blurhash";

import {
  getPalette,
  imageDataToDataURI,
  pixelsToCssGradients,
  rgbaPixelsToBmp,
  generateGradientCssClass,
  pixelsToCssVars,
} from "../../src";
import "./style.css";
import { gzip } from "pako";

// ⚠️ IMPORTANT ⚠️
// Don't use this file as a reference for how to use the library!
// It is not the correct usage, and is only used for the demo so it can show sizes etc.

const hash = signal("LkLgR,_NITIUMJIokDs:ROMxNHxu");

const gzipStringLength = (str: string) => {
  // Convert the string to a Uint8Array
  const uint8Array = new TextEncoder().encode(str);
  const compressed = gzip(uint8Array);
  return compressed.length;
};

const stopsX = 4;
const stopsY = 3;

// Transparent 1x1 pixel PNG as data URI
const transparentPixel =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

// Track if hovering to show placeholder for each image type
const isHoveringGradient = signal(false);
const isHoveringBmp = signal(false);
const isHoveringLqip = signal(false);
const isHoveringColor = signal(false);
const isHoveringCssGradient = signal(false);
const isHoveringCssVars = signal(false);
const imgSrc = signal("");

// Fixed width with dynamic height
const fixedWidth = 450; // Fixed display width
const imageHeight = signal(300); // Default height

const pixels = computed(() => decode(hash.value, stopsX, stopsY));

const gradient = computed(() =>
  pixelsToCssGradients(pixels.value, stopsX, stopsY).join(", ")
);

const paletteColors = signal([] as [number, number, number][]);

const rgbToStyle = (rgb: [number, number, number]) => {
  const [r, g, b] = rgb;
  return `rgb(${r}, ${g}, ${b})`;
};

const bmpDataUri = computed(() =>
  imageDataToDataURI(rgbaPixelsToBmp(pixels.value, 4, 3), "image/bmp")
);

const lqipUri = signal("");

const directGradientString = signal("");
const directGradientLength = computed(() =>
  gzipStringLength(directGradientString.value)
);

const cssVarsString = signal("");
const cssClassString = signal("");
const cssVarsLength = computed(() => gzipStringLength(cssVarsString.value));

effect(() => {
  if (!imgSrc.value) {
    lqipUri.value = "";
    return;
  }

  // Create a canvas element to scale the image
  const canvas = document.createElement("canvas");
  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = () => {
    const maxSize = 4;
    const scale = Math.max(img.width, img.height) / maxSize;
    const width = Math.round(img.width / scale);
    const height = Math.round(img.height / scale);

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      lqipUri.value = "";
      return;
    }

    ctx.drawImage(img, 0, 0, width, height);
    lqipUri.value = canvas.toDataURL("image/bmp", 0.5);

    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, width, height);

    // Generate direct CSS gradient string
    const directGradients = pixelsToCssGradients(imageData.data, width, height);
    directGradientString.value = directGradients.join(", ");

    // Generate CSS variables (optimized)
    cssVarsString.value = pixelsToCssVars(imageData.data, width, height);
    cssClassString.value = generateGradientCssClass(width * height);
  };

  img.onerror = () => {
    lqipUri.value = "";
  };

  img.src = imgSrc.value;
});

const gradientLength = computed(() => gzipStringLength(gradient.value));
const bmpLength = computed(() => gzipStringLength(bmpDataUri.value));
const lqipLength = computed(() =>
  lqipUri.value ? gzipStringLength(lqipUri.value) : 0
);

const clickedImage: JSX.GenericEventHandler<HTMLImageElement> = (event) => {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => useImage(image);
  image.src = (event.target as HTMLImageElement).src;
};

const useImage = (image: HTMLImageElement) => {
  const canvas = document.createElement("canvas");

  const width = Math.min(image.width, fixedWidth);
  const height = Math.round(image.height * (width / image.width));

  // Calculate height based on aspect ratio for the fixed display width
  const displayHeight = Math.round((fixedWidth / width) * height);
  imageHeight.value = displayHeight;

  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  context.drawImage(image, 0, 0, width, height);

  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const start = performance.now();
  paletteColors.value = getPalette(data, 8);
  console.log("getPalette", performance.now() - start, "ms");

  hash.value = encode(data, canvas.width, canvas.height, 4, 3);
  imgSrc.value = image.src;
};

const handleFileInputChange: JSX.GenericEventHandler<HTMLInputElement> = (
  event
) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();

  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      useImage(image);
    };
    image.src = reader.result as string;
    imgSrc.value = image.src;
  };

  reader.readAsDataURL(file);
};

export default function App() {
  return (
    <div>
      <div class="tools">
        <div class="instructions">
          <h1>@unpic/placeholder</h1>
          <p>
            This is a library for generating low quality image placeholders by
            extracting the dominant color from image or server-side rendering a{" "}
            <a href="https://blurha.sh/">BlurHash</a>. These are displayed while
            an image is loading, and give better appearance and can help reduce
            the LCP time. It can render a Blurhash to either a set of CSS
            gradients, or a tiny BMP image data URI. These are usually both
            around 150 bytes in size, and can be applied as a CSS background
            image to the img element. For more details, see the{" "}
            <a href="https://github.com/ascorbic/unpic-placeholder">README</a>.
          </p>
          <p>
            Try it out by clicking one of the examples or choosing your own
            image. The placeholder images are then displayed below.
          </p>
          <div class="palette">
            {paletteColors.value.map((color) => (
              <div
                style={{
                  backgroundColor: rgbToStyle(color),
                }}
              />
            ))}
          </div>
          <div
            class="dominant-color"
            style={{
              backgroundColor: rgbToStyle(
                paletteColors.value?.[0] ?? [0, 0, 0]
              ),
            }}
          >
            Dominant color
          </div>
        </div>
        <div class="grid">
          <img
            src="https://images.unsplash.com/photo-1603380380982-40d14d094ff0?&auto=format&fit=crop&w=450&h=300&q=60"
            width={150}
            height={100}
            crossOrigin="anonymous"
            onLoad={clickedImage}
            onClick={clickedImage}
          />
          <img
            src="https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&w=450&h=300&q=60"
            width={150}
            height={100}
            onClick={clickedImage}
            crossOrigin="anonymous"
          />
          <img
            src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=450&h=300&q=60"
            width={150}
            height={100}
            crossOrigin="anonymous"
            onClick={clickedImage}
          />
          <label for="file">Choose your own</label>
          <input type="file" id="file" onChange={handleFileInputChange} />
        </div>
        {imgSrc.value && <img src={imgSrc.value} width={100} />}
        <div class="hash">
          <label for="hash">BlurHash</label>
          <input
            id="hash"
            value={hash}
            onInput={(e) => (hash.value = (e.target as any)?.value)}
          />
        </div>
      </div>
      <div class="images">
        <div>
          <div class="blurhash">
            {imgSrc.value && (
              <img
                src={isHoveringGradient.value ? transparentPixel : imgSrc.value}
                width={fixedWidth}
                height={imageHeight.value}
                style={{
                  backgroundImage: gradient.value,
                  backgroundSize: "cover",
                }}
                onMouseOver={() => (isHoveringGradient.value = true)}
                onMouseOut={() => (isHoveringGradient.value = false)}
              />
            )}
          </div>
          <p>
            <code>blurhashToCssGradientString</code>. Bytes:{" "}
            {gradient.value.length} Gzipped {gradientLength}
          </p>
          <details>
            <summary>Gradient CSS</summary>
            <textarea readOnly>background-image: {gradient.value}</textarea>
          </details>
        </div>
        <div>
          <div class="blurhash">
            {imgSrc.value && (
              <img
                src={isHoveringBmp.value ? transparentPixel : imgSrc.value}
                width={fixedWidth}
                height={imageHeight.value}
                style={{
                  backgroundImage: `url(${bmpDataUri})`,
                  backgroundSize: "cover",
                }}
                onMouseOver={() => (isHoveringBmp.value = true)}
                onMouseOut={() => (isHoveringBmp.value = false)}
              />
            )}
          </div>
          <p>
            <code>blurhashToDataUri</code>. Bytes: {bmpDataUri.value.length}.
            GZipped {bmpLength}
          </p>
          <details>
            <summary>BMP URI</summary>
            <textarea readOnly>{bmpDataUri.value}</textarea>
          </details>
        </div>
        <div>
          <div class="blurhash">
            {imgSrc.value && (
              <img
                src={isHoveringLqip.value ? transparentPixel : imgSrc.value}
                width={fixedWidth}
                height={imageHeight.value}
                style={{
                  backgroundImage: lqipUri.value ? `url(${lqipUri})` : "none",
                  backgroundSize: "cover",
                }}
                onMouseOver={() => (isHoveringLqip.value = true)}
                onMouseOut={() => (isHoveringLqip.value = false)}
              />
            )}
          </div>
          <p>
            <code>LQIP</code>. Bytes: {lqipUri.value.length}. GZipped{" "}
            {lqipLength}
          </p>
          <details>
            <summary>LQIP URI</summary>
            <textarea readOnly>{lqipUri.value}</textarea>
          </details>
        </div>
        <div>
          <div class="blurhash">
            {imgSrc.value && (
              <img
                src={isHoveringColor.value ? transparentPixel : imgSrc.value}
                width={fixedWidth}
                height={imageHeight.value}
                style={{
                  backgroundColor: rgbToStyle(
                    paletteColors.value?.[0] || [0, 0, 0]
                  ),
                  backgroundSize: "cover",
                }}
                onMouseOver={() => (isHoveringColor.value = true)}
                onMouseOut={() => (isHoveringColor.value = false)}
              />
            )}
          </div>
          <p>Dominant color</p>
        </div>
        <div>
          <div class="blurhash">
            {imgSrc.value && (
              <img
                src={
                  isHoveringCssGradient.value ? transparentPixel : imgSrc.value
                }
                width={fixedWidth}
                height={imageHeight.value}
                style={{
                  backgroundImage: directGradientString.value,
                  backgroundSize: "cover",
                }}
                onMouseOver={() => (isHoveringCssGradient.value = true)}
                onMouseOut={() => (isHoveringCssGradient.value = false)}
              />
            )}
          </div>
          <p>
            <code>imageToCssGradient</code>. Bytes:{" "}
            {directGradientString.value.length}. GZipped {directGradientLength}
          </p>
          <details>
            <summary>CSS Gradient</summary>
            <textarea readOnly>
              background-image: {directGradientString.value}
            </textarea>
          </details>
        </div>
        <div>
          <div class="blurhash">
            {imgSrc.value && (
              <img
                src={isHoveringCssVars.value ? transparentPixel : imgSrc.value}
                width={fixedWidth}
                height={imageHeight.value}
                className="i-placeholder"
                style={cssVarsString.value ? cssVarsString.value : {}}
                onMouseOver={() => (isHoveringCssVars.value = true)}
                onMouseOut={() => (isHoveringCssVars.value = false)}
              />
            )}
          </div>
          <p>
            <code>CSS Variables</code>. Bytes: {cssVarsString.value.length}.
            GZipped {cssVarsLength}
          </p>
          <details>
            <summary>CSS Variables</summary>
            <textarea readOnly>{cssVarsString.value}</textarea>
          </details>
          <details>
            <summary>Shared CSS Class</summary>
            <textarea readOnly>{cssClassString.value}</textarea>
          </details>
        </div>
      </div>
    </div>
  );
}
