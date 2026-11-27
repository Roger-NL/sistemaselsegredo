type Vertex = {
  sourceX: number;
  sourceY: number;
  distance: number;
  x: number;
  y: number;
  depth: number;
  reverse: boolean;
  projection: number;
};
type Face = {
  vertices: [Vertex, Vertex, Vertex];
  depth: number;
  reverse: boolean;
};
export type PanelCapture = { canvas: HTMLCanvasElement; fillFromTop: boolean };

const paperColor = "#fff7e8";

export function getTurnPanel(book: HTMLElement | null): HTMLElement | null {
  const panel = book?.querySelector<HTMLElement>(".fd-scene, .fd-examples, .fd-rule, .fd-cover .fd-panels, .fd-chapter-sheet");
  return panel?.getClientRects().length ? panel : panel?.querySelector(".fd-rule-examples") ?? null;
}

export function capturePanel(panel: HTMLElement | null): PanelCapture | null {
  if (!panel) return null;
  const bounds = panel.getBoundingClientRect();
  const { width, height } = bounds;
  if (!width || !height) return null;
  const images = [...panel.querySelectorAll("img")].filter(image => image.complete && image.naturalWidth);
  if (!images.length && !panel.classList.contains("fd-chapter-sheet")) return null;

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

  return { canvas, fillFromTop: panel.closest(".fd[data-fd-mobile-header][data-first-day-page='cover']") !== null };
}

function fitFront({ canvas: source, fillFromTop }: PanelCapture, width: number, height: number) {
  if (width === source.width && height === source.height) return source;
  const front = document.createElement("canvas");
  front.width = width;
  front.height = height;
  const context = front.getContext("2d");
  if (!context) return source;
  const widthScale = width / source.width;
  const heightScale = height / source.height;
  const scale = fillFromTop ? Math.max(widthScale, heightScale) : Math.min(widthScale, heightScale);
  const fittedWidth = source.width * scale;
  const fittedHeight = source.height * scale;
  context.fillStyle = paperColor;
  context.fillRect(0, 0, width, height);
  // Keep the cover flush with the frame and crop the bottom where the page controls appear.
  const top = fillFromTop ? 0 : (height - fittedHeight) / 2;
  context.drawImage(source, (width - fittedWidth) / 2, top, fittedWidth, fittedHeight);
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

export function curlPanel(canvas: HTMLCanvasElement, source: PanelCapture, direction: number) {
  const context = canvas.getContext("2d");
  if (!context) return () => {};
  const bounds = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(1.4, 950 / Math.max(bounds.width, bounds.height));
  const width = Math.max(1, Math.round(bounds.width * pixelRatio));
  const height = Math.max(1, Math.round(bounds.height * pixelRatio));
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
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
  const bendLimit = Math.PI * radius;
  const sweep = corner + radius * 2;
  const corners = [[0, 0], [width, 0], [width, height], [0, height]];
  const sheetX = (x: number) => direction > 0 ? x : width - x;
  const mesh: Vertex[][] = Array.from({ length: rows + 1 }, (_, row) =>
    Array.from({ length: columns + 1 }, (_, column) => {
      const sourceX = column * cellWidth;
      const sourceY = row * cellHeight;
      return { sourceX, sourceY, distance: sheetX(sourceX) * normalX + sourceY * normalY,
        x: sourceX, y: sourceY, depth: 0, reverse: false, projection: 0 };
    }));
  const face = (a: Vertex, b: Vertex, c: Vertex): Face => ({ vertices: [a, b, c], depth: 0, reverse: false });
  const cells = mesh.slice(0, rows).map((line, row) =>
    line.slice(0, columns).map((a, column) => {
      const b = line[column + 1];
      const c = mesh[row + 1][column];
      const d = mesh[row + 1][column + 1];
      return {
        first: face(a, b, c), second: face(b, d, c),
        nearest: direction > 0 ? a : b, farthest: direction > 0 ? d : c,
      };
    }));
  const curved: Face[] = [];
  const start = performance.now();
  let frame = 0;
  let projection = 0;

  function project(vertex: Vertex, fold: number, lift: number) {
    if (vertex.projection === projection) return;
    vertex.projection = projection;
    const distance = vertex.distance - fold;
    if (distance <= 0) {
      vertex.x = vertex.sourceX;
      vertex.y = vertex.sourceY;
      vertex.depth = 0;
      vertex.reverse = false;
      return;
    }
    const flatBack = distance >= bendLimit;
    const angle = flatBack ? Math.PI : distance / radius;
    const depth = flatBack ? radius * 2 : radius * (1 - Math.cos(angle));
    const shift = flatBack ? bendLimit - 2 * distance : radius * Math.sin(angle) - distance;
    vertex.x = vertex.sourceX + direction * (normalX * shift + depth * .08);
    vertex.y = vertex.sourceY + normalY * shift - depth * lift;
    vertex.depth = depth;
    vertex.reverse = angle > Math.PI / 2;
  }

  function triangle(paper: CanvasRenderingContext2D, { vertices: [first, second, third], reverse, depth }: Face) {
    const { sourceX: u, sourceY: v } = first;
    const { sourceX: nextU, sourceY: nextV } = second;
    const { sourceX: lastU, sourceY: lastV } = third;
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

  function collectCurved(item: Face) {
    const [a, b, c] = item.vertices;
    if (a.depth === 0 && b.depth === 0 && c.depth === 0) return;
    if (Math.max(a.x, b.x, c.x) <= 0 || Math.min(a.x, b.x, c.x) >= width ||
        Math.max(a.y, b.y, c.y) <= 0 || Math.min(a.y, b.y, c.y) >= height) return;
    item.depth = (a.depth + b.depth + c.depth) / 3;
    item.reverse = Number(a.reverse) + Number(b.reverse) + Number(c.reverse) >= 2;
    curved.push(item);
  }

  function paintFlatBack(paper: CanvasRenderingContext2D, path: Path2D, fold: number, lift: number) {
    // Beyond the rounded bend, all mesh faces lie on the same reflected plane.
    // Draw that part of the sheet once using its original affine projection.
    const depth = radius * 2;
    const shift = bendLimit + 2 * (fold - sheetX(0) * normalX);
    const diagonal = -2 * direction * normalX * normalY;
    paper.save();
    paper.transform(1 - 2 * normalX ** 2, diagonal, diagonal, 1 - 2 * normalY ** 2,
      direction * (normalX * shift + depth * .08), normalY * shift - depth * lift);
    paper.clip(path);
    paper.drawImage(back, 0, 0, width, height);
    paper.fillStyle = "rgb(48 35 18 / .14)";
    paper.fillRect(0, 0, width, height);
    paper.restore();
  }

  function paint(time: number) {
    const progress = Math.min(1, Math.max(0, (time - start) / duration));
    context!.clearRect(0, 0, width, height);
    if (progress === 1) return;
    if (progress === 0) {
      context!.drawImage(front, 0, 0, width, height);
      frame = requestAnimationFrame(paint);
      return;
    }
    const ease = progress * progress * (3 - 2 * progress);
    const fold = corner - sweep * ease;
    const lift = .24 + .15 * Math.sin(Math.PI * ease);
    const signedDistance = (x: number, y: number) => sheetX(x) * normalX + y * normalY - fold;
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
    projection++;
    curved.length = 0;
    let flatBack: Path2D | undefined;
    for (let row = 0; row < rows; row++) {
      let firstFlat = columns;
      let lastFlat = -1;
      for (let column = 0; column < columns; column++) {
        const cell = cells[row][column];
        if (cell.farthest.distance <= fold) continue;
        if (cell.nearest.distance - fold >= bendLimit) {
          firstFlat = Math.min(firstFlat, column);
          lastFlat = column;
          continue;
        }
        // Only the bend needs individual projections. Adjacent triangles
        // share vertices, while the two flat regions are each painted once.
        const [a, b, c] = cell.first.vertices;
        project(a, fold, lift);
        project(b, fold, lift);
        project(c, fold, lift);
        project(cell.second.vertices[1], fold, lift);
        collectCurved(cell.first);
        collectCurved(cell.second);
      }
      if (lastFlat >= 0) {
        flatBack ??= new Path2D();
        flatBack.rect(firstFlat * cellWidth, row * cellHeight, (lastFlat + 1 - firstFlat) * cellWidth, cellHeight);
      }
    }
    context!.globalAlpha = Math.min(1, (1 - progress) / .1);
    curved.sort((first, second) => first.depth - second.depth);
    for (const face of curved) triangle(context!, face);
    if (flatBack) paintFlatBack(context!, flatBack, fold, lift);
    context!.globalAlpha = 1;
    frame = requestAnimationFrame(paint);
  }

  paint(start);
  return () => {
    cancelAnimationFrame(frame);
    context.clearRect(0, 0, width, height);
  };
}
