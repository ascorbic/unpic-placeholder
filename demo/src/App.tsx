import { computed, effect, signal } from "@preact/signals";
import { JSX } from "preact";
import { decode, encode } from "blurhash";

import {
  getPalette,
  imageDataToDataURI,
  pixelsToCssGradients,
  rgbaPixelsToBmp,
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

const blurhashDataUri = computed(() => {
  const pixels = decode(hash.value, 32, 32);

  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext("2d");
  const imgData = ctx?.createImageData(32, 32);
  imgData?.data.set(pixels);
  if (imgData) {
    ctx?.putImageData(imgData, 0, 0);
  }
  return canvas.toDataURL();
});

const gradientLength = computed(() => gzipStringLength(gradient.value));
const bmpLength = computed(() => gzipStringLength(bmpDataUri.value));

const imgSrc = signal("");

const clickedImage: JSX.GenericEventHandler<HTMLImageElement> = (event) => {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => useImage(image);
  image.src = (event.target as HTMLImageElement).src;
};

const useImage = (image: HTMLImageElement) => {
  const canvas = document.createElement("canvas");

  const width = Math.min(image.width, 450);
  const height = image.height * (width / image.width);

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
        {imgSrc.value && <img src={imgSrc} width={100} />}
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
          <div style={{ backgroundImage: gradient.value }} class="blurhash">
            {imgSrc.value && <img src={imgSrc} width={450} />}
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
          <div
            style={{
              backgroundImage: `url(${bmpDataUri})`,
              backgroundSize: "cover",
            }}
            class="blurhash"
          >
            {imgSrc.value && <img src={imgSrc} width={450} />}
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
          <div
            style={{
              backgroundColor: rgbToStyle(
                paletteColors.value?.[0] || [0, 0, 0]
              ),
            }}
            class="blurhash"
          >
            {imgSrc.value && <img src={imgSrc} width={450} />}
          </div>
          <p>Dominant color</p>
        </div>
      </div>
    </div>
  );
}
