import { signal, effect } from "@preact/signals";
import type { JSX } from "preact";
import { gzip } from "pako";

import { pixelsToCssVars, generateGradientCssClass } from "../../../src";
import "./style.css";

// Track if hovering to show placeholder
const isHoveringCssVars = signal(false);
const imgSrc = signal("");

// Larger preview size
const previewWidth = 800; // Increased from 450
const imageHeight = signal(500); // Increased from 300

// Variables for CSS Variables optimization
const cssVarsString = signal("");
const cssVarsObject = signal({});
const cssClassString = signal("");

// Computed signal for CSS vars gzipped length
const cssVarsLength = signal(0);

const gzipStringLength = (str: string) => {
  // Convert the string to a Uint8Array
  const uint8Array = new TextEncoder().encode(str);
  const compressed = gzip(uint8Array);
  return compressed.length;
};

// Update the gzipped length whenever the cssVarsString changes
effect(() => {
  if (cssVarsString.value) {
    cssVarsLength.value = gzipStringLength(cssVarsString.value);
  } else {
    cssVarsLength.value = 0;
  }
});

const rgbToStyle = (rgb: [number, number, number]) => {
  const [r, g, b] = rgb;
  return `rgb(${r}, ${g}, ${b})`;
};

const sampleImages = [
  "https://images.unsplash.com/photo-1603380380982-40d14d094ff0?&auto=format&fit=crop&w=800&h=600&q=60",
  "https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&w=800&h=600&q=60",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&h=600&q=60",
  "https://images.unsplash.com/photo-1743068417491-95b9e08a7fbc?auto=format&fit=crop&w=800&h=600&q=60",
  "https://images.unsplash.com/photo-1741850820849-1b63a5911606?auto=format&fit=crop&w=800&h=600&q=60",
  "https://images.unsplash.com/photo-1742787584125-d94d44334047?auto=format&fit=crop&w=800&h=600&q=60",
  "https://images.unsplash.com/photo-1726549384638-e530b978ac3e?auto=format&fit=crop&w=800&h=600&q=60",
  "https://images.unsplash.com/photo-1726179612723-124312ff97a8?auto=format&fit=crop&w=800&h=600&q=60",
  "https://images.unsplash.com/photo-1741807083060-39c641cd97fa?auto=format&fit=crop&w=800&h=600&q=60",
];

effect(() => {
  if (!imgSrc.value) {
    cssVarsString.value = "";
    cssClassString.value = "";
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
      cssVarsString.value = "";
      return;
    }

    ctx.drawImage(img, 0, 0, width, height);

    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, width, height);

    // Generate CSS variables (optimized)
    try {
      const cssVars = pixelsToCssVars(imageData.data, width, height);
      // Convert CSS variables string to a JSON object to be used directly as style
      const cssVarsObj: Record<string, string> = {};

      // Parse the CSS variables string into a style object
      const styleProps = cssVars.split(";").filter(Boolean);
      for (const prop of styleProps) {
        const [key, value] = prop.split(":").map((item) => item.trim());
        if (key && value) {
          cssVarsObj[key] = value;
        }
      }

      cssVarsString.value = Object.entries(cssVarsObj)
        .map(([key, value]) => `${key}:${value}`)
        .join(";");
      cssClassString.value = generateGradientCssClass(width * height);
      cssVarsObject.value = cssVarsObj;
    } catch (error) {
      console.error("Error generating CSS variables:", error);
      cssVarsString.value = "{}";
    }
  };

  img.onerror = () => {
    cssVarsString.value = "";
  };

  img.src = imgSrc.value;
});

const clickedImage: JSX.GenericEventHandler<HTMLImageElement> = (event) => {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => useImage(image);
  image.src = (event.target as HTMLImageElement).src;
};

const useImage = (image: HTMLImageElement) => {
  const canvas = document.createElement("canvas");

  const width = Math.min(image.width, previewWidth);
  const height = Math.round(image.height * (width / image.width));

  // Calculate height based on aspect ratio for the display width
  const displayHeight = Math.round((previewWidth / width) * height);
  imageHeight.value = displayHeight;

  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  context.drawImage(image, 0, 0, width, height);

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
          <p>
            Click one of the examples or choose your own image. Hover over the
            image to see the CSS gradient placeholder effect.
          </p>
        </div>
        <div class="grid">
          {sampleImages.map((src) => (
            <img
              src={src}
              width={150}
              height={100}
              crossOrigin="anonymous"
              onClick={clickedImage}
            />
          ))}
          <label for="file">Choose your own</label>
          <input type="file" id="file" onChange={handleFileInputChange} />
        </div>
      </div>
      <div class="images">
        <div class="preview-container">
          <div class="image-preview">
            {imgSrc.value && (
              <div
                className="image-container i-placeholder"
                style={{
                  width: `${previewWidth}px`,
                  height: `${imageHeight.value}px`,
                  ...cssVarsObject.value,
                  position: "relative",
                }}
                onMouseOver={() => (isHoveringCssVars.value = true)}
                onMouseOut={() => (isHoveringCssVars.value = false)}
              >
                <img
                  src={imgSrc.value}
                  width={previewWidth}
                  height={imageHeight.value}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: isHoveringCssVars.value ? 0 : 1,
                    transition: "opacity 0.3s ease-in-out",
                  }}
                />
              </div>
            )}
          </div>
          {imgSrc.value ? (
            <div class="image-details">
              <details>
                <summary>CSS Variables</summary>
                <textarea readOnly>style="{cssVarsString.value}"</textarea>
              </details>
              <details>
                <summary>Shared CSS Class</summary>
                <textarea readOnly>{cssClassString.value}</textarea>
              </details>
              <p>
                <strong>CSS Variables Image Placeholder</strong>
                <br />
                Bytes: {cssVarsString.value.length}. Gzipped: {cssVarsLength}{" "}
                bytes
              </p>
              <p class="hover-instructions">
                <i>Hover over the image to see the placeholder effect</i>
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
