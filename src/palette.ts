export type Colour = [red: number, green: number, blue: number];
export type Color = Colour;
export type Cluster = { centroid: Colour; cluster: Colour[] };

/**
 * Gets a palette of colors from an image using k-means clustering,
 * sorted in descending order by dominance.
 *
 * @param pixels The RGBA pixel data of the image.
 * @param clusterCount The number of colors to return. Defaults to 8.
 * @returns An array of colors as RGB tuples.
 */
export function getPalette(
  pixels: Uint8ClampedArray,
  clusterCount = 8
): Colour[] {
  // Sample 1000 pixels and perform up to 50 iterations of k-means clustering
  const clusters = kMeansClusters(pixels, clusterCount, 1000, 50);
  return clusters.map((cluster) => cluster.centroid);
}

/**
 * Gets the dominant color in an image. Returns an RGB tuple, e.g. [255, 0, 0] for red.
 * @param pixels The RGBA pixel data of the image.
 * @returns The dominant color as an RGB tuple.
 */
export function getDominantColor(pixels: Uint8ClampedArray): Colour {
  // Gives a better result than getPalette(pixels, 1)[0]
  return getPalette(pixels, 4)[0];
}

/**
 * Performs k-means clustering on an array of pixel data to create a palette of the most common colors.
 *
 * @param data - The RGBA pixel data to cluster.
 * @param clusterCount - The number of clusters (i.e., colors) to generate.
 * @param sampleSize - The number of pixels to randomly sample from the data. Higher numbers take a long time.
 * @param maxIterations - The maximum number of iterations to perform.
 * @returns An array of the final clusters, sorted by size in descending order.
 */

export function kMeansClusters(
  pixels: Uint8ClampedArray,
  clusterCount: number,
  sampleSize: number,
  maxIterations: number
): Array<Cluster> {
  // Extract RGB values from pixels
  const data: Colour[] = [];

  // Randomly sample pixels
  for (let i = 0; i < sampleSize * 4; i += 4) {
    const index = Math.floor(Math.random() * (pixels.length / 4)) * 4;
    data.push([pixels[index], pixels[index + 1], pixels[index + 2]]);
  }

  // Initialize clusters with random centroids
  let clusters: Cluster[] = [];
  for (let i = 0; i < clusterCount; i++) {
    clusters.push({
      centroid: data[Math.floor(Math.random() * data.length)],
      cluster: [],
    });
  }

  // Iterate until convergence or max iterations reached
  let changed = true;
  let iterations = 0;
  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // Assign each point to closest cluster
    clusters.forEach((cluster) => (cluster.cluster = []));
    data.forEach((point) => {
      let minDistance = Infinity;
      let closestClusterIndex = 0;
      clusters.forEach((cluster, index) => {
        const distance = euclideanDistance(point, cluster.centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestClusterIndex = index;
        }
      });
      clusters[closestClusterIndex].cluster.push(point);
    });

    // Update centroids
    clusters.forEach((cluster) => {
      const newCentroid = mean(cluster.cluster);
      if (newCentroid && !equal(newCentroid, cluster.centroid)) {
        changed = true;
        cluster.centroid = newCentroid as Colour;
      }
    });
  }
  console.log(`k-means converged in ${iterations} iterations.`);
  // Sort clusters by size in descending order so the most dominant colours are first
  return clusters.sort((a, b) => b.cluster.length - a.cluster.length);
}

function euclideanDistance(a: Colour, b: Colour): number {
  return Math.sqrt(
    a.reduce((sum, value, index) => sum + Math.pow(value - b[index], 2), 0)
  );
}

function mean(points: Colour[]): Colour | undefined {
  return points?.[0]?.map(
    (_, index) =>
      points.reduce((sum, point) => sum + point[index], 0) / points.length
  ) as Colour;
}

function equal(a: any[], b: any[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * Given a color as an RGB tuple, returns a CSS string e.g. `rgb(255, 0, 0)`
 * @param color
 * @returns string
 */

export function rgbColorToCssString([red, green, blue]: Colour): string {
  return `rgb(${red},${green},${blue})`;
}
