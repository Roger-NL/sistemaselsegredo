type Point = { x: number; y: number; depth: number; reverse: boolean };

const paperColor = "#fff7e8";

export function getTurnPanel(book: HTMLElement | null): HTMLElement | null {
  const panel = book?.querySelector<HTMLElement>(".fd-scene, .fd-examples, .fd-rule, .fd-cover .fd-panels");
  return panel?.getClientRects().length ? panel : panel?.querySelector(".fd-rule-examples") ?? null;
}

export function capturePanel(panel: HTMLElement | null): HTMLCanvasElement | null {
  if (!panel) return null;
  const bounds = panel.getBoundingClientRect();
  const { width, height } = bounds;
  if (!width || !height) return null;
  const images = [...panel.querySelectorAll("img")].filter(image => image.complete && image.naturalWidth);
  if (!images.length) return null;

  const canvas = document.createElement("canvas");
  const resolution = Math.min(1.4, 950 / Math.max(width, height));
  canvas.width = Math.round(width * resolution);
  canvas.height = Math.round(height * resolution);
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.scale(resolution, resolution);
  context.fillStyle = paperColor;
  context.fillRect(0, 0, width, height);
  const align = (value: string) => value.endsWith("%") ? Number.parseFloat(value) / 100 : .5;

  for (const image of images) {
    const rect = image.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    const x = rect.left - bounds.left;
    const y = rect.top - bounds.top;
    const { objectPosition, objectFit } = getComputedStyle(image);
    const [horizontal = "50%", vertical = "50%"] = objectPosition.split(" ");
    const scale = objectFit === "contain"
      ? Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight)
      : Math.max(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
    const fittedWidth = objectFit === "fill" ? rect.width : image.naturalWidth * scale;
    const fittedHeight = objectFit === "fill" ? rect.height : image.naturalHeight * scale;

    context.save();
    context.beginPath();
    context.rect(x, y, rect.width, rect.height);
    context.clip();
    context.drawImage(image,
      x + (rect.width - fittedWidth) * align(horizontal),
      y + (rect.height - fittedHeight) * align(vertical),
      fittedWidth, fittedHeight);
    context.restore();
  }

  return canvas;
}

function fitFront(source: HTMLCanvasElement, width: number, height: number) {
  if (width === source.width && height === source.height) return source;
  const front = document.createElement("canvas");
  front.width = width;
  front.height = height;
  const context = front.getContext("2d");
  if (!context) return source;
  const scale = Math.min(width / source.width, height / source.height);
  const fittedWidth = source.width * scale;
  const fittedHeight = source.height * scale;
  context.fillStyle = paperColor;
  context.fillRect(0, 0, width, height);
  context.drawImage(source, (width - fittedWidth) / 2, (height - fittedHeight) / 2, fittedWidth, fittedHeight);
  return front;
}

function printReverse(width: number, height: number, direction: number, normalX: number, normalY: number) {
  const reverse = document.createElement("canvas");
  reverse.width = width;
  reverse.height = height;
  const ink = reverse.getContext("2d");
  if (!ink) return reverse;

  ink.fillStyle = paperColor;
  ink.fillRect(0, 0, width, height);
  ink.translate(width * (direction > 0 ? .70 : .30), height * .65);
  // Compensate the mirrored coordinates of the fold so the stamp reads from its back.
  ink.rotate(direction * (2 * Math.atan2(normalY, normalX) - .13));
  ink.scale(-1, 1);

  const stampWidth = Math.min(width * .36, height * .91);
  const fontSize = stampWidth / 7.4;
  const left = -stampWidth / 2;
  const top = -fontSize * .77;
  const font = `${fontSize}px "First Day Barlow", Arial, sans-serif`;
  ink.lineWidth = fontSize * .04;
  ink.strokeStyle = "#39776b";
  ink.fillStyle = "#efc653";
  ink.globalAlpha = .24;
  ink.beginPath();
  ink.roundRect(left + fontSize * .12, top + fontSize * .12, stampWidth, fontSize * 1.54, fontSize * .13);
  ink.fill();
  ink.globalAlpha = .66;
  ink.beginPath();
  ink.roundRect(left, top, stampWidth, fontSize * 1.54, fontSize * .13);
  ink.stroke();

  ink.globalAlpha = .92;
  ink.fillStyle = "#365f56";
  const barUnit = fontSize / 23;
  const bars = [12, 23, 18, 9];
  bars.forEach((length, index) => {
    ink.save();
    ink.translate(left + fontSize * .41 + index * 6 * barUnit, 0);
    ink.rotate(.31);
    ink.beginPath();
    ink.roundRect(-1.5 * barUnit, -length * barUnit / 2, 3 * barUnit, length * barUnit, 1.5 * barUnit);
    ink.fill();
    ink.restore();
  });

  const textLeft = left + fontSize * 1.51;
  ink.textBaseline = "middle";
  ink.font = `700 ${font}`;
  ink.fillText("based", textLeft, 0);
  const basedWidth = ink.measureText("based").width;
  ink.font = `400 ${font}`;
  ink.fillText("speak.", textLeft + basedWidth, 0);
  return reverse;
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
  const front = fitFront(source, width, height);
  const back = printReverse(width, height, direction, normalX, normalY);
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
    const denominator = (nextU - u) * (lastV - v) - (lastU - u) * (nextV - v);
    const mapX = ((second.x - first.x) * (lastV - v) - (third.x - first.x) * (nextV - v)) / denominator;
    const mapY = ((second.y - first.y) * (lastV - v) - (third.y - first.y) * (nextV - v)) / denominator;
    const shearX = ((third.x - first.x) * (nextU - u) - (second.x - first.x) * (lastU - u)) / denominator;
    const shearY = ((third.y - first.y) * (nextU - u) - (second.y - first.y) * (lastU - u)) / denominator;
    paper.transform(mapX, mapY, shearX, shearY, first.x - mapX * u - shearX * v, first.y - mapY * u - shearY * v);
    paper.drawImage(reverse ? back : front, 0, 0, width, height);
    if (depth > 0) {
      const shade = Math.min(.23, depth / radius * (reverse ? .07 : .18));
      paper.fillStyle = `rgb(48 35 18 / ${shade})`;
      paper.fillRect(0, 0, width, height);
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
      context!.drawImage(front, 0, 0, width, height);
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
