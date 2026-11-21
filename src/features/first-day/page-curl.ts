type Point = { x: number; y: number; depth: number; reverse: boolean };

export function capturePanel(image: HTMLImageElement | null): HTMLCanvasElement | null {
  if (!image?.naturalWidth) return null;
  const { width, height } = image.getBoundingClientRect();
  if (!width || !height) return null;
  const canvas = document.createElement("canvas");
  const resolution = Math.min(1.4, 950 / Math.max(width, height));
  canvas.width = Math.round(width * resolution);
  canvas.height = Math.round(height * resolution);
  const context = canvas.getContext("2d");
  if (!context) return null;
  const style = getComputedStyle(image);
  const [horizontal = "50%", vertical = "50%"] = style.objectPosition.split(" ");
  const align = (value: string) => value.endsWith("%") ? Number.parseFloat(value) / 100 : .5;
  const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
  const scaledWidth = image.naturalWidth * scale;
  const scaledHeight = image.naturalHeight * scale;
  context.drawImage(image, (canvas.width - scaledWidth) * align(horizontal), (canvas.height - scaledHeight) * align(vertical), scaledWidth, scaledHeight);
  return canvas;
}

export function curlPanel(canvas: HTMLCanvasElement, source: HTMLCanvasElement, direction: number) {
  const context = canvas.getContext("2d");
  if (!context) return () => {};
  const bounds = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(1.4, 950 / Math.max(bounds.width, bounds.height));
  const width = canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
  const height = canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
  const duration = 710;
  const columns = 24;
  const rows = 18;
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  const normalX = .89;
  const normalY = .456;
  const corner = width * normalX + height * normalY;
  const radius = Math.min(width, height) * .13;
  const sweep = corner + radius * 2;
  const start = performance.now();
  let frame = 0;

  function project(viewX: number, y: number, fold: number, lift: number): Point {
    const x = direction > 0 ? viewX : width - viewX;
    const distance = x * normalX + y * normalY - fold;
    if (distance <= 0) return { x: viewX, y, depth: 0, reverse: false };
    const angle = Math.min(distance / radius, Math.PI);
    const bend = radius * Math.sin(angle) - Math.max(0, distance - radius * Math.PI);
    const depth = radius * (1 - Math.cos(angle));
    const shift = bend - distance;
    return {
      x: viewX + direction * (normalX * shift + depth * .08),
      y: y + normalY * shift - depth * lift,
      depth,
      reverse: angle > Math.PI / 2,
    };
  }

  function triangle(paper: CanvasRenderingContext2D, points: readonly Point[], texels: readonly number[], reverse: boolean, depth: number) {
    const [first, second, third] = points;
    const [u, v, nextU, nextV, lastU, lastV] = texels;
    paper.save();
    paper.beginPath();
    paper.moveTo(first.x, first.y);
    paper.lineTo(second.x, second.y);
    paper.lineTo(third.x, third.y);
    paper.closePath();
    paper.clip();
    if (reverse) {
      const tint = Math.round(254 - Math.min(32, depth * .28));
      paper.fillStyle = `rgb(${tint} ${tint - 4} ${tint - 15})`;
      paper.fillRect(-width, -height, width * 3, height * 3);
    } else {
      const denominator = (nextU - u) * (lastV - v) - (lastU - u) * (nextV - v);
      const mapX = ((second.x - first.x) * (lastV - v) - (third.x - first.x) * (nextV - v)) / denominator;
      const mapY = ((second.y - first.y) * (lastV - v) - (third.y - first.y) * (nextV - v)) / denominator;
      const shearX = ((third.x - first.x) * (nextU - u) - (second.x - first.x) * (lastU - u)) / denominator;
      const shearY = ((third.y - first.y) * (nextU - u) - (second.y - first.y) * (lastU - u)) / denominator;
      paper.transform(mapX, mapY, shearX, shearY, first.x - mapX * u - shearX * v, first.y - mapY * u - shearY * v);
      paper.drawImage(source, 0, 0, width, height);
      if (depth > 0) {
        paper.fillStyle = `rgb(48 35 18 / ${Math.min(.23, depth / radius * .18)})`;
        paper.fillRect(0, 0, width, height);
      }
    }
    paper.restore();
  }

  function paint(time: number) {
    const progress = Math.min(1, Math.max(0, (time - start) / duration));
    context!.clearRect(0, 0, width, height);
    if (progress === 1) return;
    const ease = progress * progress * (3 - 2 * progress);
    const fold = corner - sweep * ease;
    const lift = .24 + .15 * Math.sin(Math.PI * ease);
    const corners = [[0, 0], [width, 0], [width, height], [0, height]];
    const signedDistance = (x: number, y: number) => (direction > 0 ? x : width - x) * normalX + y * normalY - fold;
    const flat = corners.flatMap(([x, y], index) => {
      const [nextX, nextY] = corners[(index + 1) % corners.length];
      const distance = signedDistance(x, y);
      const nextDistance = signedDistance(nextX, nextY);
      const points = distance <= 0 ? [[x, y]] : [];
      if ((distance <= 0) !== (nextDistance <= 0)) {
        const fraction = distance / (distance - nextDistance);
        points.push([x + (nextX - x) * fraction, y + (nextY - y) * fraction]);
      }
      return points;
    });
    if (flat.length) {
      context!.save();
      context!.beginPath();
      context!.moveTo(flat[0][0], flat[0][1]);
      flat.slice(1).forEach(([x, y]) => context!.lineTo(x, y));
      context!.closePath();
      context!.clip();
      context!.drawImage(source, 0, 0, width, height);
      context!.restore();
    }
    const mesh = Array.from({ length: rows + 1 }, (_, row) =>
      Array.from({ length: columns + 1 }, (_, column) => project(column * cellWidth, row * cellHeight, fold, lift)));
    const faces: { vertices: Point[]; texels: number[]; depth: number; reverse: boolean }[] = [];
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const x = column * cellWidth;
        const y = row * cellHeight;
        const right = x + cellWidth;
        const bottom = y + cellHeight;
        const a = mesh[row][column];
        const b = mesh[row][column + 1];
        const c = mesh[row + 1][column];
        const d = mesh[row + 1][column + 1];
        const add = (vertices: Point[], texels: number[]) => {
          if (vertices.every(point => point.depth === 0)) return;
          faces.push({
            vertices, texels,
            depth: vertices.reduce((sum, point) => sum + point.depth, 0) / 3,
            reverse: vertices.filter(point => point.reverse).length >= 2,
          });
        };
        add([a, b, c], [x, y, right, y, x, bottom]);
        add([b, d, c], [right, y, right, bottom, x, bottom]);
      }
    }
    context!.globalAlpha = Math.min(1, (1 - progress) / .1);
    faces.sort((first, second) => first.depth - second.depth);
    for (const face of faces) triangle(context!, face.vertices, face.texels, face.reverse, face.depth);
    context!.globalAlpha = 1;
    frame = requestAnimationFrame(paint);
  }

  paint(start);
  return () => {
    cancelAnimationFrame(frame);
    context.clearRect(0, 0, width, height);
  };
}
