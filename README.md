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
import { blurhashToImageCssString } from "@unpic/placeholder";

const css = blurhashToImageCssString(blurhash);
const img = `<img src=${src} alt=${alt} style=${css} />`;
```

With `unpic-img`:

```jsx
import { blurhashToCssGradientString } from "@unpic/placeholder";
import { Image } from "@unpic/react";

export function MyImage({ src, alt, blurhash }) {
  const placeholder = blurhashToCssGradientString(blurhash);
  return <Image src={src} alt={alt} background={placeholder} />;
}
```

## Generating the BlurHash

You should pre-generate the BlurHash ahead of time. Some CDNs can do this for
you. See [Imgix](https://blog.imgix.com/2021/01/26/blurhash) for example. This
library does not generate the BlurHash. You can use the
[blurhash](https://github.com/woltapp/blurhash/tree/master/TypeScript) library
to do this. There are a few ways to do this. In Node:

```typescript

import { encode } from "blurhash";
import { readFileSync } from "fs";


## API

<!-- TSDOC_START -->

## :toolbox: Functions

- [blurhashToDataUri](#gear-blurhashtodatauri)
- [blurhashToCssGradients](#gear-blurhashtocssgradients)
- [blurhashToCssGradientString](#gear-blurhashtocssgradientstring)
- [blurhashToGradientCssObject](#gear-blurhashtogradientcssobject)
- [blurhashToImageCssObject](#gear-blurhashtoimagecssobject)
- [blurhashToImageCssString](#gear-blurhashtoimagecssstring)

### :gear: blurhashToDataUri

Given a blurhash, returns a data URI of a BMP image. At tiny sizes, this is
smaller than a PNG.

| Function            | Type                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `blurhashToDataUri` | `(blurhash: string, width?: number, height?: number) => `data:image/bmp;base64,${string}`` |

Parameters:

- `blurhash`: the blurhash string
- `width`: the width of the generated background image. Keep it tiny. Default is
  8 pixels
- `height`: the height of the generated background image. Keep it tiny. Default
  is 8 pixels

### :gear: blurhashToCssGradients

Given a blurhash, returns an array of CSS linear-gradient() strings. This is a
rough approximation of the blurhash image but as pure CSS.

| Function                 | Type                                                              |
| ------------------------ | ----------------------------------------------------------------- |
| `blurhashToCssGradients` | `(blurhash: string, columns?: number, rows?: number) => string[]` |

Parameters:

- `blurhash`: the blurhash string
- `columns`: the number of gradients to generate horizontally. Default is 4
- `rows`: the number of gradients to generate vertically. Default is 3

### :gear: blurhashToCssGradientString

Given a blurhash, returns an array of CSS linear-gradient() strings. This is a
rough approximation of the blurhash image but as pure CSS.

| Function                      | Type                                                            |
| ----------------------------- | --------------------------------------------------------------- |
| `blurhashToCssGradientString` | `(blurhash: string, columns?: number, rows?: number) => string` |

Parameters:

- `blurhash`: the blurhash string
- `columns`: the number of gradients to generate horizontally. Default is 4
- `rows`: the number of gradients to generate vertically. Default is 3

### :gear: blurhashToGradientCssObject

Given a blurhash, returns an object with a CSS background-image property.

| Function                      | Type                                                               |
| ----------------------------- | ------------------------------------------------------------------ |
| `blurhashToGradientCssObject` | `(blurhash: string, columns?: number, rows?: number) => CSSObject` |

Parameters:

- `blurhash`: the blurhash string
- `columns`: the number of gradients to generate horizontally. Default is 4
- `rows`: the number of gradients to generate vertically. Default is 3

### :gear: blurhashToImageCssObject

Given a blurhash, returns an object with CSS background properties to apply to
an img.

| Function                   | Type                                                               |
| -------------------------- | ------------------------------------------------------------------ |
| `blurhashToImageCssObject` | `(blurhash: string, width?: number, height?: number) => CSSObject` |

Parameters:

- `blurhash`: the blurhash string
- `width`: the width of the generated background image. Default is 8 pixels
- `height`: the height of the generated background image. Default is 8 pixels

### :gear: blurhashToImageCssString

Given a blurhash, returns a CSS string for a background to apply to an img
element.

| Function                   | Type                                                            |
| -------------------------- | --------------------------------------------------------------- |
| `blurhashToImageCssString` | `(blurhash: string, width?: number, height?: number) => string` |

Parameters:

- `blurhash`: the blurhash string
- `width`: the width of the generated background image. Default is 8 pixels
- `height`: the height of the generated background image. Default is 8 pixels

<!-- TSDOC_END -->

---

Copyright © 2023 [Matt Kane](https://github.com/ascorbic). This project is
[MIT](LICENSE) licensed.
```
