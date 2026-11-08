(() => {
  'use strict';

  // 艺术化布局与模型意象，非真实坐标、地图或实景复刻。
  const PLACES = [
    { name: '长堤骑楼', district: '蓬江', position: [-9.6, -5.8], radius: [2.65, 1.4], story: '五间淡彩骑楼并肩展开，柱廊与拱口连成可以慢慢走过的街景；窄窗、砖红屋顶和细小檐线，拼出长堤的温柔意象。' },
    { name: '白水带', district: '江海', position: [-3.3, -5.9], radius: [2.3, 1.9], story: '折面青山托起一座小小的休憩亭，浅色登山阶梯顺坡而上。这里用山、树与步道表现白水带的绿意，不复刻具体寺塔。' },
    { name: '小鸟天堂', district: '新会', position: [3.3, -5.8], radius: [2.3, 2.0], story: '青绿水面围住河心榕树岛，粗壮树干、舒展根系与层层树冠相互交织；几只小鸟停留在枝叶上方，让沙盘也有呼吸感。' },
    { name: '梅家大院', district: '台山', position: [-9.5, 6.6], radius: [2.3, 2.0], story: '三面骑楼围成一个敞开的U形小院，连拱柱廊朝向中庭。暖色墙面、红瓦与庭心绿意，勾勒梅家大院的围合空间。' },
    { name: '开平碉楼', district: '开平', position: [-3.2, 6.7], radius: [2.45, 2.05], story: '三座高低错落的暖色碉楼立在小片田畴之间，层窗、顶部柱亭与垛口各不相同；以精巧的建筑轮廓，表现侨乡田园中的碉楼意象。' },
    { name: '古劳水乡', district: '鹤山', position: [-3.3, 1.3], radius: [2.05, 2.0], story: '两段窄水道从屋群之间穿过，拱起的小石桥串联两岸，一叶小船泊在桥边。低屋、绿水与细路组成可以俯看的水乡片段。' },
    { name: '歇马举人村', district: '恩平', position: [9.4, 6.5], radius: [2.15, 1.95], story: '青砖院落围住一方小庭，坡屋顶与镬耳轮廓层层相接，门楼点上一抹金色。模型以屋脊、院墙和门窗表现村落的书香意象。' },
    { name: '启明里', district: '蓬江', position: [-9.9, 1.2], radius: [2.2, 1.85], story: '青砖侨屋排成一条窄巷，木窗、灰塑与檐下红灯笼相互映衬；石板路把斑驳墙面串起来，留着侨都旧街的温度。' },
    { name: '川岛海岸', district: '台山', position: [9.3, 1.1], radius: [2.1, 1.75], story: '沙洲伸进浅海，条纹灯塔立在滩头，两只小船停在水边；一层层浪线铺开，把海岛海岸的开阔感收进掌心。' },
    { name: '赤坎古镇', district: '开平', position: [3.2, 6.6], radius: [2.15, 1.8], story: '临江一线骑楼并肩排开，街心立起一座钟楼，指针停在侨墟最热闹的时辰；码头、石阶与小船续上潭江的水路记忆。' },
    { name: '大雁山', district: '鹤山', position: [3.2, 1.2], radius: [2.1, 1.9], story: '几重青山叠起一道山脊，石阶蜿蜒向上，山顶小塔在半坡树影间露出塔身，让沙盘多一处可以仰望的轮廓。' },
    { name: '恩平温泉', district: '恩平', position: [9.4, -5.7], radius: [2.0, 1.8], story: '几方汤池顺着石径层层铺开，池水映着天光，岸边立着一座小亭；石径、树影与暖色铺面，拼出温泉乡的松弛感。' }
  ];
  const C = {
    sand: 0xcdd0b0, cream: 0xf0dfb5, pale: 0xf6e9cc, stone: 0xbac5b5,
    gold: 0xd8b567, goldLight: 0xf5d38a, base: 0x244956, darkBase: 0x153140,
    water: 0x238d89, waterLight: 0x55b6a3, waterDark: 0x1b7377,
    roof: 0xa95342, roofLight: 0xc77956, slate: 0x516b6b, brick: 0x839896,
    window: 0x29484c, wood: 0x735b43, trunk: 0x7e7550,
    green: 0x4a8a62, leaf: 0x77a66c, leafLight: 0x9fbb7d, shadow: 0x919f8e
  };
  const TAU = Math.PI * 2;
  const FOV = 42 * Math.PI / 180;
  const MAX_TRIANGLES = 80000;
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const add = (a, b) => a.map((v, i) => v + b[i]);
  const sub = (a, b) => a.map((v, i) => v - b[i]);
  const scale = (a, s) => a.map(v => v * s);
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const normalize = a => scale(a, 1 / (Math.hypot(...a) || 1));
  const rgb = (hex, gain = 1) => [hex >> 16 & 255, hex >> 8 & 255, hex & 255].map(v => clamp(v * gain / 255, 0, 1));

  // 列主序矩阵：右手坐标、Y轴向上、相机沿局部负Z方向观察。
  function multiply(a, b) {
    const out = new Float32Array(16);
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        for (let k = 0; k < 4; k++) out[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k];
      }
    }
    return out;
  }
  function perspective(aspect, far) {
    const f = 1 / Math.tan(FOV / 2), near = 0.1;
    return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, 2 * far * near / (near - far), 0]);
  }
  function lookAt(eye, target) {
    const z = normalize(sub(eye, target));
    const x = normalize(cross([0, 1, 0], z));
    const y = cross(z, x);
    return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]);
  }
  function cameraFrame(azimuth, elevation, zoom, aspect) {
    const target = [0, 0.65, 0];
    const backward = [Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.cos(azimuth) * Math.cos(elevation)];
    const forward = scale(backward, -1), right = normalize(cross(forward, [0, 1, 0])), up = cross(right, forward);
    const tangent = Math.tan(FOV / 2);
    let distance = 22;
    for (const x of [-14.2, 14.2]) for (const y of [-1.1, 4.6]) for (const z of [-10.2, 10.2]) {
      const p = sub([x, y, z], target), depth = dot(p, forward);
      distance = Math.max(distance, Math.abs(dot(p, right)) / (tangent * aspect * 0.90) - depth, Math.abs(dot(p, up)) / (tangent * 0.90) - depth);
    }
    distance *= zoom;
    const eye = add(target, scale(backward, distance));
    return { eye, forward, right, up, aspect, matrix: multiply(perspective(aspect, distance + 65), lookAt(eye, target)) };
  }

  // 平面三角形、封闭实体与低多面曲面共用顶点颜色和外向法线。
  class Mesh {
    constructor(id, origin = [0, 0, 0]) {
      this.id = id;
      this.origin = origin;
      this.vertices = [];
      this.frameState = { x: 0, y: 0, z: 0, angle: 0 };
      this.min = [Infinity, Infinity, Infinity];
      this.max = [-Infinity, -Infinity, -Infinity];
    }
    point(p) {
      const t = this.frameState, c = Math.cos(t.angle), s = Math.sin(t.angle);
      return [t.x + p[0] * c + p[2] * s, t.y + p[1], t.z - p[0] * s + p[2] * c];
    }
    frame(x, y, z, angle, fn) {
      const old = this.frameState, p = this.point([x, y, z]);
      this.frameState = { x: p[0], y: p[1], z: p[2], angle: old.angle + angle };
      try { fn(); } finally { this.frameState = old; }
    }
    tri(a, b, c, color) {
      const points = [this.point(a), this.point(b), this.point(c)];
      const n = cross(sub(points[1], points[0]), sub(points[2], points[0]));
      if (Math.hypot(...n) < 1e-9) return;
      const normal = normalize(n), tint = Array.isArray(color) ? color : rgb(color);
      for (const p of points) {
        this.vertices.push(...p, ...normal, ...tint);
        for (let j = 0; j < 3; j++) {
          this.min[j] = Math.min(this.min[j], p[j]);
          this.max[j] = Math.max(this.max[j], p[j]);
        }
      }
    }
    quad(a, b, c, d, color) { this.tri(a, b, c, color); this.tri(a, c, d, color); }
    box(x, y, z, w, h, d, color) {
      const l = x - w / 2, r = x + w / 2, f = z + d / 2, b = z - d / 2, t = y + h;
      this.quad([l, y, f], [r, y, f], [r, t, f], [l, t, f], color);
      this.quad([r, y, b], [l, y, b], [l, t, b], [r, t, b], color);
      this.quad([r, y, f], [r, y, b], [r, t, b], [r, t, f], color);
      this.quad([l, y, b], [l, y, f], [l, t, f], [l, t, b], color);
      this.quad([l, t, f], [r, t, f], [r, t, b], [l, t, b], color);
      this.quad([l, y, b], [r, y, b], [r, y, f], [l, y, f], color);
    }
    cylinder(x, y, z, radius, height, color, sides = 12, topRadius = radius) {
      for (let i = 0; i < sides; i++) {
        const a = TAU * i / sides, b = TAU * (i + 1) / sides;
        const p = [x + Math.cos(a) * radius, y, z + Math.sin(a) * radius];
        const q = [x + Math.cos(b) * radius, y, z + Math.sin(b) * radius];
        const u = [x + Math.cos(a) * topRadius, y + height, z + Math.sin(a) * topRadius];
        const v = [x + Math.cos(b) * topRadius, y + height, z + Math.sin(b) * topRadius];
        this.quad(p, u, v, q, color);
        this.tri([x, y + height, z], v, u, color);
        this.tri([x, y, z], p, q, color);
      }
    }
    beam(a, b, radius, color, sides = 6, endRadius = radius) {
      const axis = normalize(sub(b, a));
      const u = normalize(cross(axis, Math.abs(axis[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0]));
      const v = cross(axis, u);
      const point = (p, angle, r) => add(p, add(scale(u, Math.cos(angle) * r), scale(v, Math.sin(angle) * r)));
      for (let i = 0; i < sides; i++) {
        const angle = i * TAU / sides, next = (i + 1) * TAU / sides;
        const p = point(a, angle, radius), q = point(a, next, radius), r = point(b, next, endRadius), s = point(b, angle, endRadius);
        this.quad(p, q, r, s, color);
        this.tri(b, s, r, color);
        this.tri(a, q, p, color);
      }
    }
    ellipsoid(x, y, z, rx, ry, rz, color, sides = 10, bands = 5) {
      const point = (lat, lon) => [x + Math.cos(lat) * Math.cos(lon) * rx, y + Math.sin(lat) * ry, z + Math.cos(lat) * Math.sin(lon) * rz];
      for (let j = 0; j < bands; j++) for (let i = 0; i < sides; i++) {
        const lo = -Math.PI / 2 + Math.PI * j / bands, hi = lo + Math.PI / bands;
        const a = i * TAU / sides, b = (i + 1) * TAU / sides;
        const tint = rgb(color, 0.92 + ((i * 3 + j * 5) % 7) * 0.025);
        this.quad(point(lo, a), point(hi, a), point(hi, b), point(lo, b), tint);
      }
    }
    ring(x, y, z, rx, rz, thickness, color, sides = 64) {
      for (let i = 0; i < sides; i++) {
        const a = i * TAU / sides, b = (i + 1) * TAU / sides;
        const p = (angle, inset) => [x + Math.cos(angle) * (rx - inset), y, z + Math.sin(angle) * (rz - inset)];
        this.quad(p(a, 0), p(a, thickness), p(b, thickness), p(b, 0), color);
      }
    }
    finish() {
      this.data = new Float32Array(this.vertices);
      this.count = this.data.length / 9;
      this.vertices = null;
      return this;
    }
  }
  function roundedOutline(w, d, radius) {
    const points = [];
    for (const [x, z, start] of [[w / 2 - radius, d / 2 - radius, 0], [-w / 2 + radius, d / 2 - radius, 90], [-w / 2 + radius, -d / 2 + radius, 180], [w / 2 - radius, -d / 2 + radius, 270]]) {
      for (let j = 0; j <= 6; j++) {
        const a = (start + j * 15) * Math.PI / 180;
        points.push([x + Math.cos(a) * radius, z + Math.sin(a) * radius]);
      }
    }
    return points;
  }
  function platform(m, outline, bottom, top, color, topScale = 1) {
    for (let i = 0; i < outline.length; i++) {
      const a = outline[i], b = outline[(i + 1) % outline.length];
      const p = [a[0], bottom, a[1]], q = [b[0], bottom, b[1]];
      const u = [a[0] * topScale, top, a[1] * topScale], v = [b[0] * topScale, top, b[1] * topScale];
      m.quad(p, u, v, q, color);
      m.tri([0, top, 0], v, u, color);
      m.tri([0, bottom, 0], p, q, color);
    }
  }
  function sampleCurve(points, steps = 8) {
    const out = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
      for (let j = 0; j < steps; j++) {
        const t = j / steps, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(k => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
      }
    }
    out.push(points[points.length - 1]);
    return out;
  }
  function ribbon(m, points, width, y, color) {
    const edges = points.map((p, i) => {
      const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const nx = -(b[1] - a[1]) / len * width / 2, nz = (b[0] - a[0]) / len * width / 2;
      return [[p[0] - nx, y, p[1] - nz], [p[0] + nx, y, p[1] + nz]];
    });
    for (let i = 0; i < edges.length - 1; i++) m.quad(edges[i][0], edges[i][1], edges[i + 1][1], edges[i + 1][0], color);
  }
  function roof(m, x, y, z, w, d, rise, color = C.roof) {
    const l = x - w / 2, r = x + w / 2, f = z + d / 2, b = z - d / 2;
    m.quad([l, y, f], [r, y, f], [r, y + rise, z], [l, y + rise, z], color);
    m.quad([r, y, b], [l, y, b], [l, y + rise, z], [r, y + rise, z], rgb(color, 0.88));
    m.tri([l, y, f], [l, y + rise, z], [l, y, b], C.cream);
    m.tri([r, y, b], [r, y + rise, z], [r, y, f], C.cream);
    m.quad([l, y, b], [r, y, b], [r, y, f], [l, y, f], color);
    m.box(x, y + rise - 0.01, z, w + 0.08, 0.075, 0.085, C.roofLight);
    for (const side of [-1, 1]) m.box(x, y - 0.035, z + side * d / 2, w + 0.04, 0.065, 0.055, color);
    for (let i = 1; i < Math.floor(w / 0.22); i++) {
      const xx = l + i * 0.22;
      m.beam([xx, y + 0.015, f], [xx, y + rise + 0.015, z], 0.012, rgb(color, 1.12), 4);
      m.beam([xx, y + 0.015, b], [xx, y + rise + 0.015, z], 0.012, rgb(color, 0.98), 4);
    }
  }
  function windowPane(m, x, y, z, w = 0.18, h = 0.37, trim = C.pale) {
    m.box(x, y - 0.035, z, w + 0.075, h + 0.075, 0.048, trim);
    m.box(x, y, z + 0.03, w, h, 0.025, C.window);
    m.box(x, y, z + 0.048, 0.017, h, 0.015, C.gold);
    m.box(x, y + h * 0.55, z + 0.048, w, 0.019, 0.015, C.cream);
    m.box(x, y - 0.05, z + 0.025, w + 0.11, 0.05, 0.1, trim);
  }
  function arch(m, x, y, z, radius, thickness, color) {
    const depth = 0.16;
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 10, b = (i + 1) * Math.PI / 10;
      const p = (angle, r, zz) => [x + Math.cos(angle) * r, y + Math.sin(angle) * r, zz];
      const ao = p(a, radius + thickness, z), bo = p(b, radius + thickness, z), ai = p(a, radius, z), bi = p(b, radius, z);
      const ab = p(a, radius + thickness, z - depth), bb = p(b, radius + thickness, z - depth), ib = p(a, radius, z - depth), jb = p(b, radius, z - depth);
      m.quad(ao, bo, bi, ai, color);
      m.quad(bb, ab, ib, jb, color);
      m.quad(ab, bb, bo, ao, color);
      m.quad(ai, bi, jb, ib, color);
      if (i === 0) m.quad(ab, ao, ai, ib, color);
      if (i === 9) m.quad(bo, bb, jb, bi, color);
    }
  }
  function arcade(m, x, z, width, depth, height, bays, color, angle = 0, parapet = false) {
    m.frame(x, 0, z, angle, () => {
      const y = 0.26, front = depth / 2, bay = width / bays;
      m.box(0, 0.19, 0, width + 0.12, 0.08, depth + 0.2, C.stone);
      m.box(0, y, -depth * 0.12, width, 0.83, depth * 0.58, color);
      m.box(0, y + 0.91, 0, width, height - 0.91, depth, color);
      m.box(0, y + 0.87, 0, width + 0.12, 0.095, depth + 0.1, C.pale);
      m.box(0, y + height - 0.03, 0, width + 0.12, 0.1, depth + 0.12, C.pale);
      for (let i = 0; i < bays; i++) {
        const xx = -width / 2 + bay * (i + 0.5);
        m.box(xx, y + 0.03, front - depth * 0.36, bay * 0.64, 0.75, 0.03, C.window);
        arch(m, xx, y + 0.58, front + 0.025, bay * 0.30, 0.07, C.pale);
        windowPane(m, xx - bay * 0.17, y + 1.13, front + 0.03, Math.min(0.16, bay * 0.2), 0.44);
        windowPane(m, xx + bay * 0.17, y + 1.13, front + 0.03, Math.min(0.16, bay * 0.2), 0.44);
      }
      for (let i = 0; i <= bays; i++) {
        const xx = -width / 2 + bay * i;
        m.box(xx, y, front - 0.015, 0.105, 0.88, 0.15, C.pale);
        m.box(xx, y, front - 0.015, 0.16, 0.075, 0.21, C.cream);
        m.box(xx, y + 0.7, front - 0.015, 0.15, 0.08, 0.2, C.cream);
      }
      roof(m, 0, y + height + 0.08, -0.03, width + 0.12, depth + 0.18, 0.25);
      if (parapet) {
        m.box(0, y + height + 0.05, front, width * 0.94, 0.22, 0.12, color);
        m.box(0, y + height + 0.27, front, width, 0.065, 0.18, C.pale);
        m.tri([-width * 0.32, y + height + 0.32, front + 0.065], [width * 0.32, y + height + 0.32, front + 0.065], [0, y + height + 0.49, front + 0.065], C.cream);
        m.box(0, y + height + 0.12, front + 0.08, width * 0.28, 0.06, 0.03, C.gold);
      }
    });
  }
  function smallTree(m, x, z, size = 1, y = 0.2) {
    m.cylinder(x, y, z, 0.095 * size, 0.85 * size, C.trunk, 6, 0.06 * size);
    m.ellipsoid(x, y + 1.0 * size, z, 0.47 * size, 0.56 * size, 0.43 * size, C.leaf, 7, 4);
    m.ellipsoid(x + 0.22 * size, y + 0.86 * size, z + 0.1 * size, 0.3 * size, 0.35 * size, 0.33 * size, C.green, 7, 4);
  }
  function house(m, x, z, w, d, height, color = C.cream, roofColor = C.roof, ears = false) {
    const y = 0.23;
    m.box(x, y, z, w, height, d, color);
    m.box(x, y, z, w + 0.06, 0.09, d + 0.06, C.stone);
    windowPane(m, x - w * 0.25, y + height * 0.43, z + d / 2 + 0.015, 0.14, Math.min(0.31, height * 0.32));
    m.box(x + w * 0.18, y, z + d / 2 + 0.026, w * 0.21, height * 0.65, 0.055, C.wood);
    m.box(x + w * 0.18, y + 0.08, z + d / 2 + 0.06, 0.016, height * 0.51, 0.012, C.gold);
    roof(m, x, y + height + 0.025, z, w + 0.2, d + 0.17, 0.29, roofColor);
    if (ears) {
      const profile = [[-0.5, 0], [-0.5, 0.37], [-0.42, 0.61], [-0.30, 0.63], [-0.19, 0.34], [0, 0.39], [0.19, 0.34], [0.30, 0.63], [0.42, 0.61], [0.5, 0.37], [0.5, 0]];
      for (const side of [-1, 1]) for (let i = 0; i < profile.length - 1; i++) {
        const xx = x + side * w / 2, l = xx - 0.045, r = xx + 0.045, base = y + height;
        const a = profile[i], b = profile[i + 1], za = z + a[0] * (d + 0.12), zb = z + b[0] * (d + 0.12), ya = base + a[1], yb = base + b[1];
        m.quad([r, base, za], [r, ya, za], [r, yb, zb], [r, base, zb], C.brick);
        m.quad([l, base, zb], [l, yb, zb], [l, ya, za], [l, base, za], C.brick);
        m.quad([l, ya, za], [l, yb, zb], [r, yb, zb], [r, ya, za], C.slate);
        m.beam([xx, ya + 0.02, za], [xx, yb + 0.02, zb], 0.027, C.pale, 4);
      }
    }
  }
  function bridge(m, x, z, length = 1.65, width = 0.56, angle = 0) {
    m.frame(x, 0, z, angle, () => {
      const height = t => 0.31 + Math.sin(t * Math.PI) * 0.36;
      for (let i = 0; i < 10; i++) {
        const a = i / 10, b = (i + 1) / 10, xa = (a - 0.5) * length, xb = (b - 0.5) * length, ya = height(a), yb = height(b), f = width / 2;
        m.quad([xa, ya, f], [xb, yb, f], [xb, yb, -f], [xa, ya, -f], C.pale);
        m.quad([xa, ya - 0.13, -f], [xb, yb - 0.13, -f], [xb, yb - 0.13, f], [xa, ya - 0.13, f], C.stone);
        m.quad([xa, ya - 0.13, f], [xb, yb - 0.13, f], [xb, yb, f], [xa, ya, f], C.stone);
        m.quad([xb, yb - 0.13, -f], [xa, ya - 0.13, -f], [xa, ya, -f], [xb, yb, -f], C.stone);
        for (const side of [-1, 1]) {
          m.beam([xa, ya + 0.29, side * f], [xb, yb + 0.29, side * f], 0.035, C.cream, 5);
          if (i % 2 === 0) m.box(xa, ya, side * f, 0.065, 0.29, 0.065, C.cream);
        }
      }
      for (const side of [-1, 1]) {
        m.box(side * length / 2, 0.17, 0, 0.19, 0.17, width + 0.08, C.stone);
        for (const edge of [-1, 1]) m.box(side * length / 2, 0.3, edge * width / 2, 0.09, 0.32, 0.09, C.cream);
      }
    });
  }

  // 十二组建筑各有固定构图，使用细部与轮廓区分地标。
  function longArcade(m) {
    const tones = [0xe4c7a0, 0xc4cbb0, 0xeddbb4, 0xdab5a0, 0xc1d0bc];
    for (let i = 0; i < 5; i++) arcade(m, (i - 2) * 0.93, 0, 0.86, 1.18, [1.85, 2.04, 2.13, 1.94, 1.84][i], 1, tones[i], 0, true);
    m.box(0, 0.16, 0.91, 4.95, 0.08, 0.53, C.pale);
    m.box(0, 0.14, 1.24, 5.08, 0.045, 0.19, C.stone);
    for (let i = 0; i < 11; i++) m.box(-2.35 + i * 0.47, 0.242, 0.92, 0.018, 0.006, 0.5, C.gold);
    smallTree(m, -2.5, -0.2, 0.65);
    smallTree(m, 2.5, 0.65, 0.58);
  }
  // 缓坡山包：低面数的折面山体，供山地类地标复用。
  function ridge(m, x, z, rx, rz, height, color) {
    const sides = 12, rings = 4;
    const point = (ring, i) => {
      const t = ring / rings, a = i * TAU / sides, r = (1 - t) * (1 + 0.09 * Math.sin(a * 3));
      return [x + Math.cos(a) * rx * r, 0.19 + t * height, z + Math.sin(a) * rz * r];
    };
    for (let j = 0; j < rings; j++) for (let i = 0; i < sides; i++) m.quad(point(j, i), point(j + 1, i), point(j + 1, i + 1), point(j, i + 1), rgb(color, 0.89 + ((i + j * 2) % 5) * 0.04));
  }
  function greenHill(m) {
    ridge(m, -0.9, -0.35, 1.25, 1.22, 1.35, C.green);
    ridge(m, 0.25, 0.1, 1.77, 1.56, 1.92, C.leaf);
    for (let i = 0; i < 12; i++) m.box(0.25 + Math.sin(i * 0.25) * 0.1, 0.21 + i * 0.146, 1.53 - i * 0.121, 0.35, 0.09, 0.19, C.pale);
    m.box(0.25, 1.97, 0.1, 0.89, 0.12, 0.79, C.stone);
    for (const x of [-0.08, 0.58]) for (const z of [-0.18, 0.38]) m.cylinder(x, 2.09, z, 0.045, 0.63, C.cream, 6);
    m.box(0.25, 2.69, 0.1, 0.93, 0.07, 0.84, C.gold);
    const apex = [0.25, 3.06, 0.1], corners = [[-0.3, 2.76, -0.41], [-0.3, 2.76, 0.61], [0.8, 2.76, 0.61], [0.8, 2.76, -0.41]];
    for (let i = 0; i < 4; i++) m.tri(corners[i], corners[(i + 1) % 4], apex, C.roof);
    m.cylinder(0.25, 3.055, 0.1, 0.045, 0.12, C.gold, 6, 0.02);
    for (const [x, z, s] of [[-1.4, 0.6, 0.58], [1.45, 0.65, 0.65], [-1.45, -0.9, 0.72], [1.2, -0.9, 0.62]]) smallTree(m, x, z, s);
  }
  function bird(m, x, y, z, size, angle) {
    m.frame(x, y, z, angle, () => {
      m.ellipsoid(0, 0, 0, size * 0.11, size * 0.12, size * 0.36, C.pale, 6, 3);
      for (const side of [-1, 1]) {
        const a = [0, 0, 0.08], b = [side * size * 0.45, size * 0.22, 0.04], c = [side * size, size * 0.14, -0.16];
        m.tri(a, side > 0 ? b : c, side > 0 ? c : b, C.pale);
        m.tri(a, side > 0 ? c : b, side > 0 ? b : c, C.cream);
      }
      m.beam([0, 0, size * 0.25], [0, 0, size * 0.47], size * 0.055, C.gold, 4, 0);
    });
  }
  function banyanIsland(m) {
    m.frame(0, 0, 0, 0, () => {
      const water = Array.from({ length: 32 }, (_, i) => [Math.cos(i * TAU / 32) * 2.1, Math.sin(i * TAU / 32) * 1.82]);
      platform(m, water, 0.145, 0.18, C.water);
      const island = Array.from({ length: 14 }, (_, i) => {
        const a = i * TAU / 14, r = 1 + Math.sin(i * 2.1) * 0.07;
        return [Math.cos(a) * 1.4 * r, Math.sin(a) * 1.16 * r];
      });
      platform(m, island, 0.17, 0.3, C.stone, 0.93);
      platform(m, island.map(p => p.map(v => v * 0.9)), 0.29, 0.34, C.leaf);
    });
    m.beam([0.08, 0.32, 0.05], [-0.08, 1.96, 0], 0.28, C.trunk, 8, 0.19);
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8;
      m.beam([0, 0.65, 0], [Math.cos(a) * 1.08, 0.35, Math.sin(a) * 0.87], 0.13, C.trunk, 6, 0.035);
    }
    for (const [x, y, z] of [[-0.88, 2.06, 0.2], [0.89, 2.04, 0.24], [0.15, 2.33, -0.61], [-0.42, 2.62, -0.06]]) m.beam([-0.03, 1.45, 0], [x, y, z], 0.12, C.trunk, 6, 0.055);
    const crowns = [[-0.91, 2.2, 0.17, 0.99, 0.68, 0.85, C.green], [0.78, 2.31, 0.1, 1.01, 0.74, 0.88, C.leaf], [0, 2.71, -0.47, 1.05, 0.75, 0.84, C.leafLight], [-0.15, 2.45, 0.64, 0.9, 0.62, 0.74, C.green], [-0.94, 2.55, -0.51, 0.66, 0.53, 0.64, C.leaf]];
    for (const crown of crowns) m.ellipsoid(...crown, 9, 5);
    for (const [x, z, h] of [[-0.86, 0.5, 1.98], [0.71, 0.49, 2.12], [0.93, -0.38, 2.02], [-0.64, -0.59, 2.1], [0.3, 0.75, 1.92]]) {
      m.beam([x, 0.36, z], [x + 0.08, h, z - 0.04], 0.024, C.trunk, 5, 0.018);
    }
    bird(m, -1.57, 3.15, 0.15, 0.33, -0.6);
    bird(m, 1.23, 3.59, -0.19, 0.32, 0.45);
    bird(m, 0.08, 3.73, 0.35, 0.22, 0.7);
    ribbon(m, sampleCurve([[-1.7, 0.78], [-1.3, 1.25], [-0.5, 1.48]]), 0.035, 0.188, C.waterLight);
    ribbon(m, sampleCurve([[0.9, -1.39], [1.4, -1.12], [1.75, -0.59]]), 0.04, 0.188, C.waterLight);
  }
  function courtyard(m) {
    m.box(0, 0.17, 0.05, 3.83, 0.065, 3.05, C.cream);
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) m.box(-1.35 + i * 0.45, 0.239, -1.14 + j * 0.4, 0.425, 0.01, 0.376, (i + j) % 2 ? 0xd4cdb4 : 0xe2d9be);
    arcade(m, 0, -1.02, 3.72, 0.83, 1.87, 4, 0xe8d0a7);
    arcade(m, -1.46, 0.16, 2.6, 0.8, 1.87, 3, 0xdcc399, Math.PI / 2);
    arcade(m, 1.46, 0.16, 2.6, 0.8, 1.87, 3, 0xe4d5b3, -Math.PI / 2);
    m.box(0, 0.16, 1.65, 2.43, 0.06, 0.27, C.stone);
    m.cylinder(0, 0.25, 0.15, 0.29, 0.19, C.stone, 10);
    smallTree(m, 0, 0.15, 0.62, 0.44);
    m.box(-0.65, 0.25, 0.64, 0.44, 0.18, 0.19, C.wood);
    m.box(0.65, 0.25, 0.64, 0.44, 0.18, 0.19, C.wood);
  }
  function tower(m, x, z, w, d, height, floors, style, color) {
    m.frame(x, 0, z, 0, () => {
      const y = 0.23;
      m.box(0, y, 0, w, height, d, color);
      m.box(0, 0.18, 0, w + 0.21, 0.18, d + 0.21, C.stone);
      for (const xx of [-1, 1]) for (const zz of [-1, 1]) m.box(xx * (w / 2 - 0.045), y, zz * (d / 2 - 0.035), 0.095, height, 0.095, C.pale);
      for (let floor = 0; floor < floors; floor++) {
        const fy = y + floor * height / floors;
        m.box(0, fy + height / floors - 0.08, 0, w + 0.115, 0.075, d + 0.115, C.cream);
        for (let side = 0; side < 4; side++) m.frame(0, 0, 0, side * Math.PI / 2, () => {
          const ww = side % 2 ? d : w, dd = side % 2 ? w : d;
          for (const xx of [-ww * 0.23, ww * 0.23]) windowPane(m, xx, fy + 0.21, dd / 2 + 0.02, ww * 0.13, Math.min(0.39, height / floors * 0.45));
        });
      }
      m.box(0, y, d / 2 + 0.038, w * 0.28, 0.51, 0.055, C.wood);
      m.box(0, y + 0.53, d / 2 + 0.06, w * 0.37, 0.095, 0.08, C.gold);
      const top = y + height;
      m.box(0, top, 0, w + 0.28, 0.12, d + 0.28, C.cream);
      if (style === 'pavilion') {
        for (const xx of [-w * 0.38, w * 0.38]) for (const zz of [-d * 0.38, d * 0.38]) {
          m.cylinder(xx, top + 0.12, zz, 0.055, 0.48, C.pale, 6);
          m.box(xx, top + 0.55, zz, 0.16, 0.08, 0.16, C.gold);
        }
        m.box(0, top + 0.63, 0, w + 0.23, 0.1, d + 0.23, C.cream);
        roof(m, 0, top + 0.73, 0, w + 0.33, d + 0.31, 0.18);
      } else if (style === 'battlement') {
        for (const side of [-1, 1]) {
          m.box(0, top + 0.12, side * d / 2, w + 0.14, 0.17, 0.11, color);
          m.box(side * w / 2, top + 0.12, 0, 0.11, 0.17, d + 0.14, color);
          for (const q of [-1, 0, 1]) {
            m.box(q * w * 0.43, top + 0.29, side * d / 2, 0.2, 0.22, 0.14, C.cream);
            if (q === 0) m.box(side * w / 2, top + 0.29, 0, 0.14, 0.22, 0.2, C.cream);
          }
        }
      } else {
        m.box(0, top + 0.12, 0, w * 0.72, 0.3, d * 0.72, color);
        arch(m, 0, top + 0.3, d * 0.36 + 0.06, w * 0.2, 0.075, C.pale);
        roof(m, 0, top + 0.51, 0, w + 0.16, d + 0.2, 0.22);
      }
      m.box(0, 0.16, d / 2 + 0.18, w * 0.55, 0.06, 0.29, C.pale);
    });
  }
  function diaolou(m) {
    for (const [x, z, w, d, tint] of [[-1.36, 0.91, 1.07, 0.57, 0xa8b774], [-1.32, 1.56, 1.18, 0.43, 0xc8bf79], [-1.41, -1.02, 0.8, 0.66, 0x95a86b], [0.58, 1.57, 1.1, 0.45, 0xb4bf83]]) {
      m.box(x, 0.16, z, w, 0.06, d, C.cream);
      m.box(x, 0.22, z, w - 0.08, 0.035, d - 0.08, tint);
      for (let i = 0; i < 5; i++) m.box(x - w * 0.36 + i * w * 0.18, 0.256, z, 0.025, 0.02, d - 0.12, C.leafLight);
    }
    ribbon(m, [[-0.2, -1.56], [-0.2, 1.18], [0.1, 1.65]], 0.19, 0.18, C.pale);
    tower(m, -0.8, -0.38, 1.02, 1.0, 3.12, 4, 'pavilion', 0xe8d2a4);
    tower(m, 0.76, -0.73, 0.94, 0.97, 2.62, 3, 'battlement', 0xd6ba88);
    tower(m, 0.78, 0.71, 0.88, 0.91, 2.13, 3, 'pediment', 0xf0ddb4);
    smallTree(m, 1.74, -0.44, 0.68);
    smallTree(m, -1.82, 0.12, 0.52);
  }
  function boat(m, x, z, angle = 0) {
    m.frame(x, 0, z, angle, () => {
      const outline = [[0, -0.43], [0.16, -0.21], [0.16, 0.25], [0, 0.43], [-0.16, 0.25], [-0.16, -0.21]];
      platform(m, outline.map(p => [p[0] * 0.62, p[1] * 0.87]), 0.185, 0.29, C.wood, 1.25);
      for (let i = 0; i < outline.length; i++) {
        const a = outline[i], b = outline[(i + 1) % outline.length];
        m.beam([a[0], 0.3, a[1]], [b[0], 0.3, b[1]], 0.023, C.gold, 4);
      }
      m.box(0, 0.295, 0.11, 0.29, 0.035, 0.1, C.cream);
      m.beam([-0.15, 0.36, 0.13], [0.38, 0.2, -0.22], 0.017, C.wood, 4);
    });
  }
  function waterVillage(m) {
    m.box(0, 0.14, 0, 3.76, 0.035, 3.4, C.stone);
    const paths = [[[-0.62, -1.7], [-0.74, -0.65], [-0.59, 0.5], [-0.49, 1.7]], [[0.64, -1.7], [0.89, -0.62], [0.74, 0.65], [0.72, 1.7]]];
    for (const points of paths) {
      const curve = sampleCurve(points);
      ribbon(m, curve, 0.68, 0.184, C.pale);
      ribbon(m, curve, 0.52, 0.19, C.water);
      ribbon(m, curve.map(p => [p[0] - 0.13, p[1]]), 0.025, 0.198, C.waterLight);
    }
    house(m, -1.34, -0.77, 0.73, 0.91, 0.79, 0xe5d6b4, C.slate);
    house(m, -1.4, 0.64, 0.7, 0.85, 0.65, C.pale, C.roof);
    house(m, 0.09, -0.99, 0.65, 0.72, 0.86, C.cream, C.slate);
    house(m, 1.43, -0.65, 0.68, 0.87, 0.73, C.pale, C.roof);
    house(m, 1.39, 0.88, 0.65, 0.76, 0.86, 0xd8ceac, C.slate);
    bridge(m, -0.58, 0.12, 1.25, 0.49);
    bridge(m, 0.78, -0.08, 1.06, 0.39);
    boat(m, -0.53, 1.11, -0.08);
    boat(m, 0.8, -1.12, 0.23);
    smallTree(m, 0.1, 1.14, 0.56);
    for (const [x, z] of [[-1.77, -1.41], [1.69, 1.46], [0.21, -1.58]]) {
      for (let i = 0; i < 3; i++) m.beam([x + i * 0.05, 0.19, z], [x + i * 0.06 - 0.08, 0.49 + i * 0.045, z + 0.03], 0.014, C.green, 4);
    }
  }
  function scholarVillage(m) {
    m.box(0, 0.17, 0, 3.55, 0.065, 3.2, C.stone);
    for (let i = 0; i < 7; i++) m.box(-1.36 + i * 0.45, 0.239, 0.34, 0.018, 0.007, 1.76, C.pale);
    house(m, -0.78, -0.77, 1.21, 1.03, 1.13, C.brick, C.slate, true);
    house(m, 0.74, -0.77, 1.2, 1.03, 1.26, 0x94a6a0, C.slate, true);
    m.frame(-1.33, 0, 0.35, Math.PI / 2, () => house(m, 0, 0, 1.28, 0.64, 0.82, C.brick, C.roof));
    m.frame(1.33, 0, 0.35, -Math.PI / 2, () => house(m, 0, 0, 1.28, 0.64, 0.87, C.brick, C.slate));
    for (const side of [-1, 1]) {
      m.box(side * 1.1, 0.23, 1.28, 1.16, 0.73, 0.17, C.brick);
      m.box(side * 1.1, 0.96, 1.28, 1.24, 0.09, 0.24, C.slate);
      for (let row = 0; row < 4; row++) {
        m.box(side * 1.1, 0.35 + row * 0.14, 1.373, 1.1, 0.014, 0.013, 0xb0b9ad);
        for (let j = 0; j < 4; j++) m.box(side * 1.1 - 0.43 + j * 0.27 + (row % 2) * 0.06, 0.25 + row * 0.14, 1.374, 0.012, 0.1, 0.012, 0xb0b9ad);
      }
    }
    m.box(0, 0.23, 1.25, 1.03, 1.36, 0.44, C.cream);
    m.box(0, 0.23, 1.49, 0.6, 1.01, 0.05, C.wood);
    m.box(0, 0.27, 1.525, 0.025, 0.91, 0.017, C.gold);
    for (const x of [-0.11, 0.11]) m.cylinder(x, 0.66, 1.537, 0.035, 0.04, C.gold, 6);
    m.box(0, 1.32, 1.49, 0.54, 0.18, 0.055, C.gold);
    m.box(0, 1.35, 1.527, 0.41, 0.105, 0.014, C.window);
    roof(m, 0, 1.62, 1.25, 1.32, 0.78, 0.25, C.slate);
    m.box(0, 0.15, 1.64, 1.05, 0.07, 0.3, C.pale);
    smallTree(m, 0.52, 0.38, 0.61);
    m.cylinder(-0.53, 0.24, 0.4, 0.17, 0.24, C.cream, 8);
  }
  // 启明里：窄巷两侧的青砖侨屋、檐下红灯笼与巷口小门楼。
  function qiaoLane(m) {
    m.box(0, 0.17, 0, 3.6, 0.06, 3.1, C.stone);
    for (let i = 0; i < 7; i++) m.box(0, 0.232, -1.32 + i * 0.44, 0.8, 0.018, 0.4, i % 2 ? 0xd4ccb2 : 0xc4bea4);
    for (const side of [-1, 1]) {
      m.frame(side * 1.24, 0, 0, -side * Math.PI / 2, () => {
        house(m, 0, -0.7, 1.02, 1.1, 1.24, C.brick, C.slate, true);
        house(m, 0, 0.64, 1.02, 1.1, 1.02, 0x8ea19b, C.roof, true);
      });
      for (const z of [-1.08, -0.02, 1.02]) {
        m.beam([side * 0.64, 1.62, z], [side * 0.5, 1.62, z], 0.018, C.wood, 4);
        m.ellipsoid(side * 0.5, 1.46, z, 0.085, 0.115, 0.085, 0xc4534a, 7, 4);
        m.cylinder(side * 0.5, 1.55, z, 0.03, 0.05, C.gold, 6);
      }
    }
    for (const side of [-1, 1]) m.box(side * 0.57, 0.23, 1.5, 0.16, 1.42, 0.16, C.brick);
    m.box(0, 1.63, 1.5, 1.34, 0.16, 0.2, C.brick);
    m.box(0, 1.72, 1.5, 0.62, 0.2, 0.06, C.gold);
    roof(m, 0, 1.79, 1.5, 1.5, 0.48, 0.2, C.roof);
    smallTree(m, -1.52, -1.34, 0.4);
    smallTree(m, 1.52, -1.28, 0.36);
  }
  // 川岛海岸：浅海滩涂、红白条纹灯塔、礁石与层层浪线。
  function coastalBay(m) {
    const sea = Array.from({ length: 30 }, (_, i) => [Math.cos(i * TAU / 30) * 1.82, Math.sin(i * TAU / 30) * 1.4]);
    platform(m, sea, 0.14, 0.178, C.water);
    const spit = [[-1.7, -0.1], [-1.32, -0.92], [-0.38, -1.26], [0.72, -1.1], [1.5, -0.45], [1.72, 0.3], [1.2, 1.0], [0.05, 1.26], [-1.02, 1.02], [-1.62, 0.42]];
    platform(m, spit, 0.16, 0.23, C.sand, 0.97);
    platform(m, spit.map(p => p.map(v => v * 0.84)), 0.225, 0.252, 0xd9d4ac);
    const lx = 0.52, lz = 0.28;
    m.cylinder(lx, 0.25, lz, 0.38, 0.1, C.stone, 10);
    for (let i = 0; i < 5; i++) m.cylinder(lx, 0.35 + i * 0.3, lz, 0.24 - i * 0.016, 0.3, i % 2 ? C.pale : 0xc4624f, 10);
    m.cylinder(lx, 1.85, lz, 0.21, 0.05, C.gold, 10);
    m.cylinder(lx, 1.9, lz, 0.18, 0.24, C.window, 8);
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8;
      m.box(lx + Math.cos(a) * 0.19, 1.9, lz + Math.sin(a) * 0.19, 0.05, 0.3, 0.05, C.gold);
    }
    m.cylinder(lx, 2.14, lz, 0.26, 0.18, C.roof, 8, 0.02);
    m.cylinder(lx, 2.32, lz, 0.03, 0.13, C.gold, 6, 0.012);
    house(m, -0.74, 0.52, 0.6, 0.48, 0.42, C.cream, C.roof);
    for (const [rx, rz, rs] of [[-1.36, -0.55, 0.27], [1.28, 0.72, 0.23], [0.1, -1.02, 0.18]]) m.ellipsoid(rx, 0.22, rz, rs, rs * 0.62, rs * 0.82, C.stone, 7, 4);
    boat(m, -1.02, -0.94, 0.5);
    boat(m, 1.12, 0.94, -0.75);
    for (const start of [-2.5, 0.55, 2.2]) {
      const wave = Array.from({ length: 7 }, (_, i) => {
        const a = start + i * 0.16, r = 1.62 + i * 0.02;
        return [Math.cos(a) * r, Math.sin(a) * r * 0.76];
      });
      ribbon(m, wave, 0.05, 0.183, C.waterLight);
    }
    smallTree(m, -0.94, -0.62, 0.48);
    smallTree(m, 1.08, -0.32, 0.38);
  }
  // 赤坎古镇：临江骑楼、街心钟楼与潭江码头。
  function clockTown(m) {
    m.box(0, 0.14, 0, 3.74, 0.03, 3.2, C.stone);
    const river = sampleCurve([[-1.85, 1.02], [0, 0.88], [1.85, 1.04]]);
    ribbon(m, river, 1.16, 0.176, C.pale);
    ribbon(m, river, 0.94, 0.18, C.waterDark);
    ribbon(m, river, 0.8, 0.184, C.water);
    ribbon(m, river.map(p => [p[0], p[1] - 0.21]), 0.03, 0.19, C.waterLight);
    m.box(0, 0.17, -1.43, 3.5, 0.14, 0.22, C.pale);
    for (let i = 0; i < 9; i++) m.box(-1.55 + i * 0.39, 0.31, -1.43, 0.07, 0.16, 0.1, C.cream);
    const tones = [0xe4c7a0, 0xcdd3b6];
    arcade(m, -1.18, -0.66, 1.0, 1.1, 1.5, 1, tones[0], 0, true);
    arcade(m, -0.16, -0.66, 1.0, 1.1, 1.66, 1, tones[1], 0, true);
    m.box(0.92, 0.17, -0.38, 0.6, 2.28, 0.6, 0xe8d6ae);
    m.box(0.92, 0.17, -0.38, 0.7, 0.12, 0.7, C.stone);
    for (const side of [-1, 1]) {
      m.frame(0.92, 0, -0.38, side * Math.PI / 2, () => {
        m.box(0, 1.52, 0.305, 0.44, 0.44, 0.025, C.gold);
        m.box(0, 1.52, 0.318, 0.34, 0.34, 0.02, C.pale);
        m.box(0, 1.58, 0.332, 0.025, 0.14, 0.012, C.window);
        m.box(0.055, 1.55, 0.332, 0.11, 0.022, 0.012, C.window);
      });
    }
    m.frame(0.92, 0, -0.38, 0, () => {
      m.box(0, 1.52, 0.305, 0.44, 0.44, 0.025, C.gold);
      m.box(0, 1.52, 0.318, 0.34, 0.34, 0.02, C.pale);
      m.box(0, 1.58, 0.332, 0.025, 0.14, 0.012, C.window);
      m.box(0.055, 1.55, 0.332, 0.11, 0.022, 0.012, C.window);
    });
    m.box(0.92, 2.45, -0.38, 0.72, 0.09, 0.72, C.cream);
    m.cylinder(0.92, 2.54, -0.38, 0.42, 0.5, C.slate, 4, 0.02);
    m.cylinder(0.92, 3.02, -0.38, 0.032, 0.28, C.gold, 6, 0.01);
    m.box(1.42, 0.17, 0.74, 0.72, 0.055, 0.6, C.wood);
    for (const px of [1.08, 1.76]) m.box(px, 0.17, 1.02, 0.07, 0.24, 0.07, C.wood);
    boat(m, 1.15, 1.16, Math.PI / 2);
    for (const x of [-1.5, -0.9, -0.3, 0.32]) {
      m.box(x, 0.19, 0.35, 0.06, 0.22, 0.06, C.cream);
    }
    smallTree(m, -1.56, -1.24, 0.44);
    smallTree(m, 1.6, -1.14, 0.38);
  }
  // 大雁山：两重山脊、石阶山道与山顶五层小塔。
  function pagodaHill(m) {
    ridge(m, -0.92, -0.42, 1.28, 1.2, 1.08, C.green);
    ridge(m, 0.34, 0.28, 1.72, 1.5, 1.78, C.leaf);
    for (let i = 0; i < 13; i++) m.box(-1.02 + i * 0.1, 0.21 + i * 0.135, 1.44 - i * 0.115, 0.4, 0.07, 0.19, i % 2 ? C.pale : C.cream);
    const y = 1.86;
    m.box(0.34, y, 0.28, 0.92, 0.16, 0.92, C.stone);
    for (let i = 0; i < 5; i++) {
      const w = 0.6 - i * 0.08, yy = y + 0.16 + i * 0.36;
      m.box(0.34, yy, 0.28, w, 0.24, w, 0xf0e0b8);
      m.box(0.34, yy + 0.24, 0.28, w + 0.2, 0.05, w + 0.2, C.slate);
      m.cylinder(0.34, yy + 0.29, 0.28, (w + 0.14) / 2, 0.1, C.slate, 4, (w + 0.1) / 2 * 0.55);
      m.box(0.34, yy + 0.06, 0.28 + w / 2 + 0.012, 0.12, 0.14, 0.02, C.window);
    }
    m.beam([0.34, 3.99, 0.28], [0.34, 4.3, 0.28], 0.03, C.gold, 6, 0.01);
    m.cylinder(0.34, 4.06, 0.28, 0.06, 0.02, C.gold, 8);
    for (const [x, z, s] of [[-1.72, 0.62, 0.5], [1.68, -0.32, 0.52], [1.28, 1.3, 0.42], [-1.42, -1.3, 0.46], [0.16, 1.72, 0.36]]) smallTree(m, x, z, s);
  }
  // 恩平温泉：层层汤池、石径、小亭与树影。
  function springPools(m) {
    m.box(0, 0.16, 0, 3.5, 0.06, 3.0, C.stone);
    const path = sampleCurve([[-1.42, -1.18], [-0.6, -0.55], [0.15, 0.05], [0.82, 0.62], [1.35, 1.12]]);
    ribbon(m, path, 0.34, 0.228, C.pale);
    for (const [x, z, r] of [[-0.82, -0.42, 0.62], [0.72, 0.28, 0.7], [-0.7, 1.02, 0.46]]) {
      m.cylinder(x, 0.2, z, r, 0.02, 0x9aa79a, 12);
      m.cylinder(x, 0.2, z, r - 0.1, 0.035, C.water, 12);
      m.ring(x, 0.238, z, r, r, 0.1, C.stone, 24);
      m.ring(x, 0.241, z, r - 0.09, r - 0.09, 0.028, C.waterLight, 24);
    }
    m.box(1.15, 0.22, -1.05, 1.0, 0.06, 1.0, C.cream);
    for (const [dx, dz] of [[-0.38, -0.38], [0.38, -0.38], [-0.38, 0.38], [0.38, 0.38]]) m.cylinder(1.15 + dx, 0.28, -1.05 + dz, 0.04, 0.85, C.wood, 6);
    m.box(1.15, 1.1, -1.05, 1.04, 0.06, 1.04, C.cream);
    roof(m, 1.15, 1.16, -1.05, 1.28, 1.28, 0.32, C.slate);
    m.beam([1.15, 1.48, -1.05], [1.15, 1.7, -1.05], 0.028, C.gold, 6, 0.01);
    for (const [x, z, s] of [[-1.5, -1.3, 0.46], [1.45, 1.22, 0.4], [0.02, -1.4, 0.38]]) smallTree(m, x, z, s);
    for (const [x, z, r] of [[-1.35, 0.15, 0.14], [0.28, 0.92, 0.12], [1.55, 0.35, 0.11]]) m.ellipsoid(x, 0.24, z, r, r * 0.7, r, C.stone, 7, 4);
  }
  function buildScene() {
    const board = new Mesh(-1), outline = roundedOutline(28, 20, 3.4);
    platform(board, outline.map(p => p.map(v => v * 0.965)), -1.04, -0.91, C.darkBase);
    platform(board, outline.map(p => p.map(v => v * 0.98)), -0.91, -0.25, C.base, 1.018);
    platform(board, outline, -0.25, -0.16, C.gold);
    platform(board, outline, -0.16, 0.075, C.cream, 0.993);
    platform(board, outline.map(p => p.map(v => v * 0.993)), 0.075, 0.125, C.goldLight);
    platform(board, outline.map(p => p.map(v => v * 0.98)), 0.125, 0.147, C.sand);
    const river = sampleCurve([[-13.4, -1.05], [-10.6, -1.7], [-7.4, -2.4], [-4.1, -2.2], [-0.6, -1.34], [2.7, -1.62], [6.1, -2.5], [9.5, -2.9], [13.4, -2.2]], 12);
    for (const branch of [[[-6.05, -2.32], [-5.98, -1.4], [-5.9, -0.58]], [[0.2, -1.4], [0.22, -0.5], [0.18, 0.52]], [[6.7, -2.58], [6.72, -1.55], [6.66, -0.5]]]) {
      const curve = sampleCurve(branch);
      ribbon(board, curve, 0.87, 0.153, C.pale);
      ribbon(board, curve, 0.67, 0.159, C.waterDark);
      ribbon(board, curve, 0.59, 0.165, C.water);
    }
    ribbon(board, river, 1.9, 0.154, C.pale);
    ribbon(board, river, 1.66, 0.16, C.waterDark);
    ribbon(board, river, 1.44, 0.166, C.water);
    ribbon(board, river.map(p => [p[0], p[1] + 0.38]), 0.04, 0.173, C.waterLight);
    for (let i = 7; i < river.length - 8; i += 17) ribbon(board, river.slice(i, i + 5).map(p => [p[0], p[1] - 0.28]), 0.029, 0.174, 0x85c9b1);
    const roads = [
      [[-12.2, -3.55], [-8.6, -3.5], [-4.9, -3.5], [-2.2, -3.62], [0.6, -3.5], [3.4, -3.55], [6.3, -3.85], [8.6, -3.95], [11.9, -3.9]],
      [[-12.5, 4.15], [-6.9, 4.12], [0.1, 4.15], [6.8, 4.12], [12.4, 4.15]]
    ];
    for (const road of roads) {
      const curve = sampleCurve(road);
      ribbon(board, curve, 0.34, 0.155, C.shadow);
      ribbon(board, curve, 0.25, 0.161, C.pale);
    }
    bridge(board, -7.6, -2.4, 2.6, 0.55, Math.PI / 2);
    bridge(board, 5.9, -2.45, 2.6, 0.55, Math.PI / 2);
    const leafSpots = [];
    const plantTree = (x, z, size) => { smallTree(board, x, z, size, 0.15); leafSpots.push([x, 0.2 + 0.95 * size, z]); };
    for (const [x, z, size] of [
      [-13.2, -6.3, 0.58], [-13.1, 0.4, 0.52], [-6.9, -7.9, 0.55], [-6.85, 5.9, 0.48],
      [0.15, -7.7, 0.46], [0.1, 8.9, 0.5], [6.8, -7.6, 0.52], [6.75, 8.9, 0.48],
      [13.2, -8.3, 0.55], [13.15, 3.4, 0.5], [-13.2, 8.6, 0.52], [-13.15, -8.4, 0.5],
      [12.9, 8.6, 0.5], [-6.2, -8.9, 0.44], [4.9, -8.9, 0.42], [0.6, 3.0, 0.38],
      [6.2, 2.9, 0.4], [-6.4, 3.1, 0.42], [12.6, 0.0, 0.4], [-11.9, 3.2, 0.4]
    ]) plantTree(x, z, size);
    // 底板上补充的风景：河面荷叶与小船、岸边芦苇、掠水飞鸟，都不是地标，仅作点缀。
    for (const [x, z, r] of [[-11.6, -1.35, 0.17], [-10.4, -1.75, 0.12], [-4.35, -1.9, 0.15], [1.35, -1.2, 0.16], [7.4, -2.3, 0.13], [10.6, -2.55, 0.15]]) board.cylinder(x, 0.176, z, r, 0.014, C.leafLight, 8);
    for (const [x, z, r] of [[-11.4, -1.2, 0.07], [-4.5, -1.75, 0.06], [1.55, -1.05, 0.06], [10.75, -2.4, 0.07]]) board.cylinder(x, 0.18, z, r, 0.022, 0xd98a94, 6);
    boat(board, -4.9, -1.75, 0.4);
    boat(board, 2.4, -1.35, -0.9);
    boat(board, 10.1, -2.9, 0.25);
    for (const [x, z] of [[-9.9, -3.0], [-2.6, -2.95], [4.6, -2.55], [9.3, -3.65]]) {
      for (let i = 0; i < 3; i++) board.beam([x + i * 0.05, 0.17, z], [x + i * 0.06 - 0.08, 0.46 + i * 0.05, z + 0.03], 0.014, C.green, 4);
    }
    for (const [x, y, z, s] of [[-5.2, 3.1, -1.3, 1], [0.5, 3.6, -1.9, 0.8], [6.2, 3.3, -1.2, 0.9], [11.2, 3.8, -2.3, 0.7]]) {
      board.beam([x - 0.22 * s, y, z], [x, y + 0.07 * s, z], 0.02, C.shadow, 4);
      board.beam([x, y + 0.07 * s, z], [x + 0.22 * s, y, z], 0.02, C.shadow, 4);
    }
    for (let i = 0; i < 7; i++) board.cylinder(-1.2 + i * 0.4, 0.152, -8.95, 0.055, 0.028, C.gold, 8);
    board.box(0, 0.154, -8.75, 2.9, 0.016, 0.045, C.gold);
    const builders = [longArcade, greenHill, banyanIsland, courtyard, diaolou, waterVillage, scholarVillage, qiaoLane, coastalBay, clockTown, pagodaHill, springPools];
    const models = PLACES.map((place, i) => {
      const m = new Mesh(i, [place.position[0], 0, place.position[1]]);
      builders[i](m);
      return m.finish();
    });
    const halos = PLACES.map((place, i) => {
      const m = new Mesh(i, [place.position[0], 0, place.position[1]]);
      m.ring(0, 0.181, 0, place.radius[0], place.radius[1], 0.075, C.goldLight);
      m.ring(0, 0.182, 0, place.radius[0] + 0.12, place.radius[1] + 0.12, 0.022, C.gold);
      return m.finish();
    });
    const meshes = [board.finish(), ...models, ...halos];
    const triangles = meshes.reduce((total, m) => total + m.count / 3, 0);
    if (triangles >= MAX_TRIANGLES) throw new Error(`沙盘三角形超出设计限制：${triangles}/${MAX_TRIANGLES}`);
    return { meshes, board, models, halos, leafSpots, triangles };
  }

  // 点击先检测包围盒，再进行射线与真实模型三角面相交检测。
  function rayMesh(mesh, origin, direction, closest = Infinity) {
    const o = sub(origin, mesh.origin);
    let near = 0, far = closest;
    for (let k = 0; k < 3; k++) {
      if (Math.abs(direction[k]) < 1e-8) {
        if (o[k] < mesh.min[k] || o[k] > mesh.max[k]) return Infinity;
      } else {
        let a = (mesh.min[k] - o[k]) / direction[k], b = (mesh.max[k] - o[k]) / direction[k];
        if (a > b) [a, b] = [b, a];
        near = Math.max(near, a); far = Math.min(far, b);
        if (near > far) return Infinity;
      }
    }
    const v = mesh.data;
    let result = Infinity;
    for (let i = 0; i < v.length; i += 27) {
      const a = [v[i], v[i + 1], v[i + 2]], e1 = [v[i + 9] - a[0], v[i + 10] - a[1], v[i + 11] - a[2]], e2 = [v[i + 18] - a[0], v[i + 19] - a[1], v[i + 20] - a[2]];
      const p = cross(direction, e2), det = dot(e1, p);
      if (Math.abs(det) < 1e-8) continue;
      const inv = 1 / det, t = sub(o, a), u = dot(t, p) * inv;
      if (u < 0 || u > 1) continue;
      const q = cross(t, e1), w = dot(direction, q) * inv;
      if (w < 0 || u + w > 1) continue;
      const distance = dot(e2, q) * inv;
      if (distance > 0.01 && distance < closest && distance < result) result = distance;
    }
    return result;
  }

  // 落叶：固定数量叶片在树冠附近循环飘落，用线性同余随机数保证每次刷新轨迹一致。
  const LEAF_COUNT = 58;
  const LEAF_TINTS = [0xd8b567, 0xb9c77e, 0x8fae64, 0xc79a58];
  function createLeafSystem(spots) {
    let seed = 20261108, visits = 0;
    const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const data = new Float32Array(LEAF_COUNT * 54);
    function respawn(leaf) {
      const spot = spots[(leaf.id * 5 + visits++) % spots.length];
      leaf.x = spot[0] + (rand() - 0.5) * 1.05;
      leaf.z = spot[2] + (rand() - 0.5) * 1.05;
      leaf.y = spot[1] + 0.2 + rand() * 0.9;
      leaf.fall = 0.22 + rand() * 0.16;
      leaf.sway = 0.1 + rand() * 0.14;
      leaf.rate = 0.9 + rand() * 0.8;
      leaf.phase = rand() * TAU;
      leaf.spin = rand() * TAU;
      leaf.spinRate = 1.2 + rand() * 1.8;
      leaf.size = 0.105 + rand() * 0.075;
      leaf.tint = rgb(LEAF_TINTS[Math.floor(rand() * LEAF_TINTS.length)]);
    }
    const states = Array.from({ length: LEAF_COUNT }, (_, id) => {
      const leaf = { id };
      respawn(leaf);
      return leaf;
    });
    const write = (leaf, offset) => {
      const s = leaf.size, c = Math.cos(leaf.spin), sn = Math.sin(leaf.spin), lift = 0.28;
      const n = 1 / Math.hypot(lift, 1), normal = [lift * sn * n, n, lift * c * n];
      const corners = [[0, 0, s], [s * 0.55, -0.012, 0], [0, 0, -s], [0, 0, -s], [-s * 0.55, 0.012, 0], [0, 0, s]];
      let i = offset;
      for (const p of corners) {
        data[i++] = leaf.x + p[0] * c - p[2] * sn;
        data[i++] = leaf.y + p[1];
        data[i++] = leaf.z + p[0] * sn + p[2] * c;
        data[i++] = normal[0]; data[i++] = normal[1]; data[i++] = normal[2];
        data[i++] = leaf.tint[0]; data[i++] = leaf.tint[1]; data[i++] = leaf.tint[2];
      }
    };
    function update(time, seconds) {
      for (const leaf of states) {
        leaf.y -= leaf.fall * seconds;
        leaf.x += Math.sin(time * leaf.rate + leaf.phase) * leaf.sway * seconds;
        leaf.z += Math.cos(time * leaf.rate * 0.8 + leaf.phase) * leaf.sway * 0.7 * seconds;
        leaf.spin += leaf.spinRate * seconds;
        if (leaf.y < 0.22) respawn(leaf);
      }
      states.forEach((leaf, i) => write(leaf, i * 54));
      return data;
    }
    update(0, 0);
    return { data, update };
  }

  // WebGL 1着色器保留完整编译日志，恢复上下文时重建全部GPU资源。
  const VERTEX_SHADER = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec3 aColor;
    uniform mat4 uViewProjection;
    uniform vec3 uOrigin;
    varying vec3 vNormal;
    varying vec3 vColor;
    varying vec3 vWorld;
    void main() {
      vWorld = aPosition + uOrigin;
      vNormal = aNormal;
      vColor = aColor;
      gl_Position = uViewProjection * vec4(vWorld, 1.0);
    }
  `;
  const FRAGMENT_SHADER = `
    precision mediump float;
    varying vec3 vNormal;
    varying vec3 vColor;
    varying vec3 vWorld;
    uniform float uHighlight;
    uniform float uTime;
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 color = vColor;
      // 向上的青色水面按世界位置叠加两层时序波纹与流动高光，看起来像真的在流。
      float water = step(0.44, vColor.g) * step(vColor.r * 1.35, vColor.b) * step(0.90, normal.y) * (1.0 - step(0.08, abs(vWorld.y - 0.175)));
      if (water > 0.5) {
        float ripple = sin(vWorld.x * 2.1 + vWorld.z * 1.4 + uTime * 1.6) * 0.5 + 0.5;
        float cross = sin(vWorld.z * 2.9 - uTime * 1.15 + sin(vWorld.x * 1.1) * 1.2) * 0.5 + 0.5;
        float glint = smoothstep(0.90, 1.0, sin(vWorld.x * 1.15 - vWorld.z * 2.3 + uTime * 1.9));
        color = mix(color, vec3(0.36, 0.78, 0.71), 0.08 + 0.2 * ripple * cross);
        color += vec3(0.24, 0.34, 0.30) * glint;
      }
      float sun = max(dot(normal, normalize(vec3(-0.45, 0.85, 0.60))), 0.0);
      float fill = max(dot(normal, normalize(vec3(0.70, 0.25, -0.70))), 0.0);
      float light = 0.53 + 0.43 * sun + 0.12 * fill;
      color = mix(color, vec3(1.0, 0.83, 0.52), uHighlight * 0.075);
      gl_FragColor = vec4(color * (light + uHighlight * 0.055), 1.0);
    }
  `;
  function createRenderer(gl, scene) {
    const shaders = [], buffers = [];
    let program = null;
    try {
      for (const [type, source, label] of [[gl.VERTEX_SHADER, VERTEX_SHADER, '顶点'], [gl.FRAGMENT_SHADER, FRAGMENT_SHADER, '片元']]) {
        const shader = gl.createShader(type);
        if (!shader) throw new Error(`${label}着色器创建失败`);
        shaders.push(shader);
        gl.shaderSource(shader, source); gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          const log = gl.getShaderInfoLog(shader) || '驱动未提供日志';
          console.error(`[city3d] ${label}着色器编译失败\n${log}\n${source.split('\n').map((line, i) => `${i + 1}: ${line}`).join('\n')}`);
          throw new Error(`${label}着色器编译失败：${log}`);
        }
      }
      program = gl.createProgram();
      if (!program) throw new Error('着色器程序创建失败');
      for (const shader of shaders) gl.attachShader(program, shader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`着色器链接失败：${gl.getProgramInfoLog(program) || '驱动未提供日志'}`);
      const attributes = ['aPosition', 'aNormal', 'aColor'].map(name => gl.getAttribLocation(program, name));
      const uniforms = Object.fromEntries(['uViewProjection', 'uOrigin', 'uHighlight', 'uTime'].map(name => [name, gl.getUniformLocation(program, name)]));
      for (const mesh of scene.meshes) {
        const buffer = gl.createBuffer();
        if (!buffer) throw new Error('模型缓冲区创建失败');
        buffers.push(buffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.data, gl.STATIC_DRAW);
      }
      const leafBuffer = gl.createBuffer();
      if (!leafBuffer) throw new Error('落叶缓冲区创建失败');
      buffers.push(leafBuffer);
      gl.bindBuffer(gl.ARRAY_BUFFER, leafBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, LEAF_COUNT * 54 * 4, gl.DYNAMIC_DRAW);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.disable(gl.CULL_FACE);
      gl.clearColor(0.027, 0.080, 0.125, 1);
      return { program, attributes, uniforms, buffers, leafBuffer };
    } catch (error) {
      for (const buffer of buffers) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      throw error;
    } finally {
      for (const shader of shaders) gl.deleteShader(shader);
    }
  }

  // DOM选择与文字信息独立于WebGL，失败时仍可使用完整地标列表。
  function init() {
    const section = document.getElementById('city3d'), canvas = document.getElementById('cityCanvas');
    if (!section || !canvas || canvas.dataset.cityInitialized === 'true') return;
    canvas.dataset.cityInitialized = 'true';
    const view = canvas.closest('.city-view') || canvas.parentElement;
    const status = document.getElementById('cityStatus');
    const detail = { number: document.getElementById('cityNumber'), name: document.getElementById('cityName'), district: document.getElementById('cityDistrict'), story: document.getElementById('cityStory') };
    const actionButtons = [...section.querySelectorAll('[data-city-action]')];
    let selected = 4, azimuth = 0.33, elevation = 0.68, zoom = 1;
    let gl = null, scene = null, renderer = null, ready = false, failure = '', leaves = null, clock = 0;
    let width = 0, height = 0, frame = null, auto = false, raf = 0, lastTime = 0, inView = true;
    let resizeObserver = null, visibilityObserver = null;
    const pointers = new Map();
    let dragged = false, pinchDistance = 0;
    canvas.style.touchAction = 'none';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    function setStatus() {
      if (!status) return;
      status.hidden = ready && !failure;
      const text = failure || (ready ? `已呈现江门地标艺术沙盘 · 当前：${PLACES[selected].name}${auto ? (inView && !document.hidden ? ' · 自动环游中' : ' · 自动环游已暂停，返回后继续') : ' · 拖动旋转，点一处地标看介绍'}` : '正在准备沙盘…');
      if (status.textContent !== text) status.textContent = text;
    }
    function updateSelection() {
      const place = PLACES[selected];
      if (detail.number) detail.number.textContent = String(selected + 1).padStart(2, '0');
      if (detail.name) detail.name.textContent = place.name;
      if (detail.district) detail.district.textContent = place.district;
      if (detail.story) detail.story.textContent = place.story;
      section.dataset.citySelected = String(selected);
      setStatus();
    }
    function setControls() {
      for (const button of actionButtons) {
        if ('disabled' in button) button.disabled = !ready;
        button.setAttribute('aria-disabled', String(!ready));
        if (button.dataset.cityAction === 'auto') {
          button.setAttribute('aria-pressed', String(auto));
          button.classList.toggle('is-active', auto);
        }
      }
    }
    function fail(message, error) {
      ready = false;
      failure = message;
      setAuto(false);
      setControls(); setStatus();
      section.dataset.cityState = 'unavailable';
      canvas.dataset.cityRenderer = 'unavailable';
      if (error) console.error('[city3d]', error);
    }
    function selectPlace(index) {
      if (!Number.isInteger(index) || index < 0 || index >= PLACES.length) return;
      setAuto(false);
      selected = index;
      updateSelection();
      draw();
    }

    function draw() {
      if (!ready || !renderer || !width || !height || gl.isContextLost()) return;
      frame = cameraFrame(azimuth, elevation, zoom, width / height);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(renderer.program);
      gl.uniformMatrix4fv(renderer.uniforms.uViewProjection, false, frame.matrix);
      gl.uniform1f(renderer.uniforms.uTime, clock);
      for (let i = 0; i < scene.meshes.length; i++) {
        const mesh = scene.meshes[i];
        if (i > scene.models.length && mesh.id !== selected) continue;
        gl.bindBuffer(gl.ARRAY_BUFFER, renderer.buffers[i]);
        renderer.attributes.forEach((attribute, j) => {
          gl.enableVertexAttribArray(attribute);
          gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 36, j * 12);
        });
        gl.uniform3fv(renderer.uniforms.uOrigin, mesh.origin);
        gl.uniform1f(renderer.uniforms.uHighlight, mesh.id === selected ? 1 : 0);
        gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
      }
      if (leaves) {
        gl.bindBuffer(gl.ARRAY_BUFFER, renderer.leafBuffer);
        renderer.attributes.forEach((attribute, j) => {
          gl.enableVertexAttribArray(attribute);
          gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 36, j * 12);
        });
        gl.uniform3fv(renderer.uniforms.uOrigin, [0, 0, 0]);
        gl.uniform1f(renderer.uniforms.uHighlight, 0);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, leaves.data);
        gl.drawArrays(gl.TRIANGLES, 0, LEAF_COUNT * 6);
      }
    }
    function resize() {
      const rect = view.getBoundingClientRect();
      width = view.clientWidth || rect.width;
      height = view.clientHeight || rect.height;
      if (width <= 0 || height <= 0) { width = 0; height = 0; return; }
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75, 2048 / Math.max(width, height));
      const w = Math.max(1, Math.round(width * dpr)), h = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      draw();
    }

    // 水波与落叶需要持续动画；环游只控制相机绕行，离屏或后台时整段暂停。
    function canAnimate() { return ready && inView && !document.hidden && width > 0 && height > 0; }
    function tick(time) {
      raf = 0;
      if (!canAnimate()) { lastTime = 0; return; }
      const seconds = lastTime ? Math.min((time - lastTime) / 1000, 0.08) : 0.016;
      lastTime = time;
      const reduced = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      const step = seconds * (reduced ? 0.35 : 1);
      clock += step;
      if (auto) azimuth = (azimuth + seconds * (reduced ? 0.085 : 0.17)) % TAU;
      if (leaves) leaves.update(clock, step);
      draw();
      raf = window.requestAnimationFrame(tick);
    }
    function syncAnimation() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0; lastTime = 0;
      if (canAnimate()) raf = window.requestAnimationFrame(tick);
      setStatus();
    }
    function setAuto(value) {
      const next = Boolean(value && ready);
      if (auto === next) return;
      auto = next;
      setControls(); syncAnimation();
    }
    function manual(action) {
      if (!ready) return;
      setAuto(false);
      switch (action) {
        case 'left': azimuth -= 0.15; break;
        case 'right': azimuth += 0.15; break;
        case 'up': elevation = clamp(elevation + 0.09, 0.34, 1.13); break;
        case 'down': elevation = clamp(elevation - 0.09, 0.34, 1.13); break;
        case 'in': zoom = clamp(zoom / 1.13, 0.6, 1.8); break;
        case 'out': zoom = clamp(zoom * 1.13, 0.6, 1.8); break;
        case 'reset': azimuth = 0.33; elevation = 0.68; zoom = 1; break;
        default: return;
      }
      azimuth %= TAU;
      draw();
    }
    function pick(clientX, clientY) {
      if (!ready || !frame) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = (clientX - rect.left) / rect.width * 2 - 1, y = 1 - (clientY - rect.top) / rect.height * 2;
      const tangent = Math.tan(FOV / 2);
      const direction = normalize(add(frame.forward, add(scale(frame.right, x * tangent * frame.aspect), scale(frame.up, y * tangent))));
      let nearest = Infinity, index = -1;
      for (const model of scene.models) {
        const distance = rayMesh(model, frame.eye, direction, nearest);
        if (distance < nearest) { nearest = distance; index = model.id; }
      }
      if (index >= 0) selectPlace(index);
    }
    section.addEventListener('click', event => {
      const button = event.target.closest('button[data-city-action]');
      if (!button || !section.contains(button)) return;
      event.preventDefault();
      if (button.dataset.cityAction === 'auto') { if (ready) setAuto(!auto); }
      else manual(button.dataset.cityAction);
    });
    canvas.addEventListener('keydown', event => {
      if (!ready || event.altKey || event.metaKey || event.ctrlKey) return;
      const actions = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', '+': 'in', '=': 'in', '-': 'out', '_': 'out', '0': 'reset' };
      const action = actions[event.key];
      if (action) { event.preventDefault(); manual(action); }
    });
    canvas.addEventListener('wheel', event => {
      if (!ready || (document.activeElement !== canvas && !event.ctrlKey)) return;
      event.preventDefault(); setAuto(false);
      const units = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1;
      zoom = clamp(zoom * Math.exp(clamp(event.deltaY * units, -240, 240) * 0.0015), 0.6, 1.8);
      draw();
    }, { passive: false });
    canvas.addEventListener('pointerdown', event => {
      if (!ready || (event.pointerType !== 'touch' && event.button !== 0)) return;
      setAuto(false);
      if (pointers.size === 0) dragged = false;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY });
      canvas.setPointerCapture(event.pointerId);
      if (pointers.size > 1) {
        dragged = true;
        const [a, b] = [...pointers.values()];
        pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
      }
    });
    canvas.addEventListener('pointermove', event => {
      const p = pointers.get(event.pointerId);
      if (!p || !ready) return;
      const dx = event.clientX - p.x, dy = event.clientY - p.y;
      p.x = event.clientX; p.y = event.clientY;
      if (pointers.size > 1) {
        const [a, b] = [...pointers.values()], distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDistance > 2 && distance > 2) zoom = clamp(zoom * pinchDistance / distance, 0.6, 1.8);
        pinchDistance = distance; dragged = true; draw();
      } else {
        if (Math.hypot(p.x - p.startX, p.y - p.startY) > 5) dragged = true;
        if (dragged) { azimuth = (azimuth - dx * 0.006) % TAU; elevation = clamp(elevation + dy * 0.005, 0.34, 1.13); draw(); }
      }
    });
    function releasePointer(event, cancelled) {
      const p = pointers.get(event.pointerId);
      if (!p) return;
      const click = !cancelled && !dragged && pointers.size === 1 && Math.hypot(event.clientX - p.startX, event.clientY - p.startY) <= 5;
      pointers.delete(event.pointerId);
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      pinchDistance = 0;
      if (pointers.size) dragged = true;
      if (click) pick(event.clientX, event.clientY);
    }
    canvas.addEventListener('pointerup', event => releasePointer(event, false));
    canvas.addEventListener('pointercancel', event => releasePointer(event, true));
    canvas.addEventListener('lostpointercapture', event => releasePointer(event, true));
    document.addEventListener('visibilitychange', () => {
      pointers.clear(); pinchDistance = 0;
      syncAnimation();
      if (!document.hidden) resize();
    });
    window.addEventListener('blur', () => { pointers.clear(); pinchDistance = 0; });
    window.addEventListener('resize', () => { resize(); syncAnimation(); }, { passive: true });
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => { resize(); syncAnimation(); });
      resizeObserver.observe(view);
    }
    if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver(entries => {
        inView = entries.some(entry => entry.isIntersecting && entry.intersectionRatio > 0);
        syncAnimation();
        if (inView) resize();
      }, { threshold: 0 });
      visibilityObserver.observe(canvas);
    } else {
      const checkView = () => {
        const rect = canvas.getBoundingClientRect();
        inView = rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
        syncAnimation();
      };
      window.addEventListener('scroll', checkView, { passive: true });
      checkView();
    }
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      pointers.clear();
      fail('三维绘图上下文已丢失，等待浏览器恢复；若未恢复请刷新。右侧地标介绍仍可查看。');
      section.dataset.cityState = 'lost';
      renderer = null;
    });
    canvas.addEventListener('webglcontextrestored', () => initializeGL());
    function initializeGL() {
      try {
        gl = canvas.getContext('webgl', { alpha: false, antialias: true, depth: true, stencil: false, preserveDrawingBuffer: false }) || canvas.getContext('experimental-webgl', { alpha: false, antialias: true, depth: true });
        if (!gl) { fail('当前浏览器无法启用 WebGL 三维绘图；可尝试开启硬件加速，或使用右侧地标介绍查看文字。'); return; }
        if (!scene) scene = buildScene();
        if (!leaves) leaves = createLeafSystem(scene.leafSpots);
        renderer = createRenderer(gl, scene);
        ready = true; failure = '';
        resize();
        const error = gl.getError();
        if (error !== gl.NO_ERROR) throw new Error(`WebGL初始化错误：0x${error.toString(16)}`);
        section.dataset.cityState = 'ready';
        canvas.dataset.cityRenderer = 'webgl1';
        canvas.dataset.cityTriangles = String(scene.triangles);
        setControls(); setStatus(); syncAnimation();
      } catch (error) {
        if (renderer && gl && !gl.isContextLost()) {
          for (const buffer of renderer.buffers) gl.deleteBuffer(buffer);
          gl.deleteProgram(renderer.program);
        }
        renderer = null;
        fail('三维沙盘初始化失败，请刷新页面或检查浏览器硬件加速；地标介绍仍可查看，技术详情见控制台。', error);
      }
    }
    updateSelection(); setControls(); initializeGL();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
