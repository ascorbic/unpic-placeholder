import { computed, effect, signal } from "@preact/signals";
import { JSX } from "preact";
import { decode, encode } from "blurhash";
import { Image as UnpicImage } from "@unpic/preact";
import {
  imageDataToDataURI,
  pixelsToCssGradients,
  rgbaPixelsToBmp,
} from "../../src";
import "./style.css";
import * as pako from "pako";

const hash = signal("LGF5]+Yk^6#M@-5c,1J5@[or[Q6.");

const gzipStringLength = (str: string) => {
  // Convert the string to a Uint8Array
  const uint8Array = new TextEncoder().encode(str);
  const compressed = pako.gzip(uint8Array);
  return compressed.length;
};

const stopsX = 4;
const stopsY = 3;

const pixels = computed(() => decode(hash.value, stopsX, stopsY));

const gradient = computed(() =>
  pixelsToCssGradients(pixels.value, stopsX, stopsY).join(", ")
);
const bmpDataUri = computed(() =>
  imageDataToDataURI(rgbaPixelsToBmp(pixels.value, 4, 3), "image/bmp")
);

const blurhashDataUri = computed(() => {
  const pixels = decode(hash.value, 32, 32);

  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  if (!canvas) return;
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

const imagedata = signal<ImageData | null>(null);
const imgSrc = signal("");

const clickedImage: JSX.GenericEventHandler<HTMLImageElement> = (event) => {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => {
    useImage(image);
  };
  image.src = (event.target as HTMLImageElement).src;
};

const useImage = (image: HTMLImageElement) => {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  console.log(canvas.width, canvas.height);
  const context = canvas.getContext("2d");
  if (!context) return;
  context.drawImage(image, 0, 0);

  imagedata.value = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imagedata.value.data;
  hash.value = encode(pixels, canvas.width, canvas.height, 4, 3);
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
        <div class="grid">
          <img
            src="https://images.unsplash.com/photo-1603380380982-40d14d094ff0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTE5fHxjb2xvcmZ1bHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=450&h=300&q=60"
            width={150}
            height={100}
            crossOrigin="anonymous"
            onClick={clickedImage}
          />
          <img
            src="https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Njh8fGNvbG9yZnVsfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=450&h=300&q=60"
            width={150}
            height={100}
            onClick={clickedImage}
            crossOrigin="anonymous"
          />

          <img
            src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8Y29sb3JmdWwlMjBsYW5kc2NhcGUlMjBvcmllbnRhdGlvbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=450&h=300&q=60"
            width={150}
            height={100}
            crossOrigin="anonymous"
            onClick={clickedImage}
          />
          <input type="file" onChange={handleFileInputChange} />
        </div>
        {imgSrc.value && <img src={imgSrc} width={100} />}
        <div class="hash">
          <label for="hash">Source hash</label>
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
            Gradient. Bytes: {gradient.value.length} Gzipped {gradientLength}
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
            BMP data URI. Bytes: {bmpDataUri.value.length}. GZipped {bmpLength}
          </p>
          <details>
            <summary>BMP URI</summary>
            <textarea readOnly>{bmpDataUri.value}</textarea>
          </details>
        </div>
        <div>
          <div
            style={{
              backgroundImage: `url(${blurhashDataUri})`,
              backgroundSize: "cover",
            }}
            class="blurhash"
          >
            {imgSrc.value && <img src={imgSrc} width={450} />}
          </div>
          <p>Reference blurshash render</p>
        </div>
      </div>
    </div>
  );
}
