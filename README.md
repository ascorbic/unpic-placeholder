# `@unpic/placeholder` 🖼️

This is a library for generating low quality image placeholders (LQIP) by
server-side rendering a [BlurHash](https://blurha.sh) values. These are
displayed while an image is loading, give better appearance and can help reduce
the LCP time. It can render the Blurhash to either a set of CSS gradients, or a
tiny BPM image data URI. These are usually around 150 bytes in size, and can be
applied as a background image to the img element.

Unlike other BlurHash libraries, this generates CSS values so it works without
client-side JavaScript in any web framework or none, and can be displayed before
page hydration. It was designed for
[unpic-img](https://github.com/ascorbic/unpic-img), which is a multi-framework
responsive image component that generates a single <code>&lt;img&gt;</code> tag,
but it can be used with `<img>` tags or with any framework's image component. It
uses no wrapper elements, and is just applied as a style to the `<img>` tag.

## Installation

```bash
npm install @unpic/placeholder
```

## Usage

With `<img>` tag:

```jsx
import { renderBlurhashCss } from "@unpic/placeholder";

const css = blurhashToImageCssString(blurhash);
const img = `<img src=${src} alt=${alt} style=${css} />`;
```

With `unpic-img`:

```jsx
import { renderBlurhashCss } from "@unpic/placeholder";
import { Image } from "@unpic/react";

export function MyImage({ src, alt, blurhash }) {
  const placeholder = blurhashToDataUri(blurhash);
  return <Image src={src} alt={alt} background={placeholder} />;
}
```
