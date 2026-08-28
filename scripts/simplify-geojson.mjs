import fs from 'node:fs';

const source = process.argv[2];
const target = process.argv[3];
if (!source || !target) throw new Error('source and target paths are required');

const data = JSON.parse(fs.readFileSync(source, 'utf8'));
const names = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県',
  '埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県',
  '岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
  '鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県',
  '佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'
];

const sq = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
function segDist(p, a, b) {
  let x = a[0], y = a[1], dx = b[0] - x, dy = b[1] - y;
  if (dx || dy) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) [x, y] = b;
    else if (t > 0) { x += dx * t; y += dy * t; }
  }
  return (p[0] - x) ** 2 + (p[1] - y) ** 2;
}
function rdp(points, tolerance = 0.018) {
  if (points.length <= 4) return points;
  const closed = sq(points[0], points.at(-1)) < 1e-12;
  const base = closed ? points.slice(0, -1) : points.slice();
  if (base.length <= 3) return points;
  const keep = new Uint8Array(base.length); keep[0] = keep[base.length - 1] = 1;
  const stack = [[0, base.length - 1]], limit = tolerance * tolerance;
  while (stack.length) {
    const [start, end] = stack.pop(); let max = limit, index = -1;
    for (let i = start + 1; i < end; i++) {
      const d = segDist(base[i], base[start], base[end]);
      if (d > max) { max = d; index = i; }
    }
    if (index > 0) { keep[index] = 1; stack.push([start, index], [index, end]); }
  }
  const out = base.filter((_, i) => keep[i]);
  if (closed) out.push(out[0]);
  return out.length >= 4 ? out : points;
}
function bboxArea(ring) {
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for (const [x,y] of ring) { minX=Math.min(minX,x); minY=Math.min(minY,y); maxX=Math.max(maxX,x); maxY=Math.max(maxY,y); }
  return (maxX-minX)*(maxY-minY);
}
function simplifyPolygon(poly) {
  // Tiny offshore polygons make the classroom map noisy and hard to tap.
  // Keep each prefecture's recognisable main landmass and substantial islands.
  if (!poly[0] || bboxArea(poly[0]) < 0.01) return null;
  return poly.map((ring, i) => rdp(ring, i ? 0.01 : 0.018)).filter(r => r.length >= 4);
}

const features = data.features.map((feature) => {
  const name = feature.properties.P;
  const multi = feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates : [feature.geometry.coordinates];
  const coordinates = multi.map(simplifyPolygon).filter(Boolean);
  return {
    type: 'Feature',
    properties: { code: String(names.indexOf(name) + 1).padStart(2, '0'), name },
    geometry: { type: 'MultiPolygon', coordinates }
  };
});

const output = {
  type: 'FeatureCollection',
  attribution: 'Derived from MLIT National Land Numerical Information (N03) via open-data-jp-prefectures-geojson (MIT)',
  features
};
fs.mkdirSync(new URL('../data/', import.meta.url), { recursive: true });
fs.writeFileSync(target, JSON.stringify(output));
console.log(`${features.length} prefectures, ${fs.statSync(target).size} bytes`);
