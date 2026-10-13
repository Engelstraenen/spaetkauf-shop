// Zeichnet alle Produkt- und Kampagnenbilder als SVG im SPÄTKAUF-Stil und trägt die Pfade in products.json ein.
// Aufruf: npm run draw
import fs from 'node:fs'
import assert from 'node:assert/strict'

const ROOT = new URL('../', import.meta.url)
const W = 1200, H = 1500
const BG = '#ececea', INK = '#161616', SIGNAL = '#ff3b1f', METAL = '#c4c4c0'
const FONT = 'font-family="Helvetica Neue, Arial, sans-serif" font-weight="900"'

// ---------- Helfer ----------
const rgb = (h) => h.slice(1).match(/../g).map((x) => parseInt(x, 16))
const mix = (a, b, k) => '#' + rgb(a).map((c, i) => Math.round(c + (rgb(b)[i] - c) * k).toString(16).padStart(2, '0')).join('')
const isDark = (h) => { const [r, g, b] = rgb(h); return 0.299 * r + 0.587 * g + 0.114 * b < 120 }
const r1 = (v) => Math.round(v * 10) / 10
const pt = ([x, y]) => `${r1(x)} ${r1(y)}`
const mx = ([x, y]) => [-x, y]
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k]
const lerp = (a, b, s) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s]
const quad = (a, c, b, s) => lerp(lerp(a, c, s), lerp(c, b, s), s)
const sides = (fn) => { fn((v) => v, 1); fn(mx, -1) }
const slug = (s) => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/[^a-z0-9]+/g, '-')

// Ein Stift = eine Ebene mit eigener Farbe, eigenen Mustern und Clip-Pfaden.
let uid = 0
function pen(color = INK, texture = 'twill') {
  const id = `p${uid++}`
  const dark = isDark(color)
  const tc = dark ? '255,255,255' : '0,0,0'
  const t = {
    fill: color,
    shade: mix(color, '#000000', 0.3),
    line: dark ? 'rgba(255,255,255,.36)' : 'rgba(0,0,0,.42)',
    print: dark ? '#f1eee6' : INK,
  }
  const defs = [
    `<linearGradient id="${id}sh" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>`,
    `<pattern id="${id}twill" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 7L7 0" stroke="rgb(${tc})" stroke-opacity=".07" stroke-width="1.4"/></pattern>`,
    `<pattern id="${id}rib" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M3 0V10" stroke="rgb(${tc})" stroke-opacity=".13" stroke-width="2.6"/></pattern>`,
    `<pattern id="${id}denim" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6L6 0" stroke="#fff" stroke-opacity=".14" stroke-width="1.6"/></pattern>`,
    `<pattern id="${id}canvas" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3H6M3 0V6" stroke="rgb(${tc})" stroke-opacity=".07" stroke-width="1.2"/></pattern>`,
  ]
  const box = [Infinity, Infinity, -Infinity, -Infinity]
  const under = [], parts = []
  let clips = 0
  const tf = { s: 1, x: 0, y: 0 }
  const p = {
    t, defs, box, under, parts, tf,
    track(...ps) {
      for (const [x, y] of ps) {
        const X = tf.x + x * tf.s, Y = tf.y + y * tf.s
        box[0] = Math.min(box[0], X); box[1] = Math.min(box[1], Y); box[2] = Math.max(box[2], X); box[3] = Math.max(box[3], Y)
      }
    },
    clip(d) { const c = `${id}c${clips++}`; defs.push(`<clipPath id="${c}"><path d="${d}"/></clipPath>`); return c },
    shape(d, pts, { fill = t.fill, tex = texture, shade = true, to = parts, stroke = 5 } = {}) {
      p.track(...pts)
      const c = p.clip(d)
      to.push(`<path d="${d}" fill="${fill}"/>`)
      if (tex) to.push(`<rect x="-4000" y="-4000" width="8000" height="8000" fill="url(#${id}${tex})" clip-path="url(#${c})"/>`)
      if (shade) to.push(`<path d="${d}" fill="url(#${id}sh)"/>`)
      if (stroke) to.push(`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${stroke}" stroke-linejoin="round"/>`)
      return c
    },
    line(d, { w = 3, color = t.line, dash, to = parts } = {}) {
      to.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`)
    },
    stitch(d, color = t.line) { p.line(d, { w: 2.2, color, dash: '8 7' }) },
    cord(d, color, w = 8) { parts.push(`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 5}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`) },
    text(x, y, s, size, width, color = t.print, rot = 0) {
      parts.push(`<text ${FONT} font-size="${r1(size)}" fill="${color}" text-anchor="middle" textLength="${r1(width)}" lengthAdjust="spacingAndGlyphs" transform="translate(${r1(x)} ${r1(y)})${rot ? ` rotate(${r1(rot)})` : ''}">${s}</text>`)
    },
    circle(x, y, r, fill, stroke = 2.5) { p.track([x - r, y - r], [x + r, y + r]); parts.push(`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${fill}"${stroke ? ` stroke="${INK}" stroke-width="${stroke}"` : ''}/>`) },
    in(c, s) { parts.push(`<g clip-path="url(#${c})">${s}</g>`) },
    group(s, x, y, fn, to = parts) { // Zeichnet fn() skaliert und verschoben (z. B. Cap auf dem Kopf)
      const old = { ...tf }
      Object.assign(tf, { s: old.s * s, x: old.x + x * old.s, y: old.y + y * old.s })
      to.push(`<g transform="translate(${r1(x)} ${r1(y)}) scale(${s})">`)
      fn()
      to.push('</g>')
      Object.assign(tf, old)
    },
  }
  return p
}

const ribs = (p, a1, a2, b1, b2, count, opt) => {
  for (let i = 1; i < count; i++) { const s = i / count; p.line(`M ${pt(lerp(a1, a2, s))} L ${pt(lerp(b1, b2, s))}`, { w: 2, ...opt }) }
}
const zip = (p, y1, y2, s = 1) => {
  p.line(`M 0 ${r1(y1)} L 0 ${r1(y2)}`, { w: 12 * s, color: INK })
  p.line(`M 0 ${r1(y1)} L 0 ${r1(y2)}`, { w: 7 * s, color: METAL, dash: `${3 * s} ${3 * s}` })
  p.parts.push(`<rect x="${r1(-8 * s)}" y="${r1(y1)}" width="${r1(16 * s)}" height="${r1(38 * s)}" rx="${r1(4 * s)}" fill="${METAL}" stroke="${INK}" stroke-width="2.5"/>`)
}

// ---------- Oberteile ----------
// Ebene Lage (Packshot): Ärmel schräg ausgebreitet. Getragen: Ärmel hängen, eigene Achselhöhe (arm).
const TOPS = {
  hoodie:     { nw: 92, sh: 235, sd: 42, bw: 248, hw: 232, len: 800, slen: 560, ang: 38, cuff: 112, rib: 70, cuffRib: 66 },
  zip:        { nw: 92, sh: 235, sd: 42, bw: 248, hw: 232, len: 800, slen: 560, ang: 38, cuff: 112, rib: 70, cuffRib: 66 },
  crew:       { nw: 90, sh: 235, sd: 42, bw: 248, hw: 232, len: 760, slen: 560, ang: 38, cuff: 108, rib: 66, cuffRib: 62 },
  tee:        { nw: 98, sh: 262, sd: 36, bw: 262, hw: 262, len: 760, slen: 250, ang: 62, cuff: 185 },
  longsleeve: { nw: 92, sh: 245, sd: 36, bw: 250, hw: 250, len: 790, slen: 590, ang: 36, cuff: 104, cuffRib: 46 },
  baby:       { nw: 86, sh: 200, sd: 30, bw: 205, hw: 210, len: 470, slen: 150, ang: 64, cuff: 130 },
  bomber:     { nw: 100, sh: 255, sd: 40, bw: 268, hw: 245, len: 700, slen: 590, ang: 36, cuff: 116, rib: 74, cuffRib: 64 },
  leather:    { nw: 100, sh: 245, sd: 40, bw: 252, hw: 250, len: 690, slen: 590, ang: 34, cuff: 112 },
  puffer:     { nw: 110, sh: 285, sd: 44, bw: 300, hw: 292, len: 720, slen: 600, ang: 38, cuff: 140 },
  knit:       { nw: 96, sh: 240, sd: 42, bw: 252, hw: 240, len: 760, slen: 580, ang: 36, cuff: 108, rib: 80, cuffRib: 80 },
  cardigan:   { nw: 96, sh: 240, sd: 42, bw: 252, hw: 252, len: 800, slen: 580, ang: 36, cuff: 108, rib: 70, cuffRib: 70 },
}

// Wie das Teil am Körper sitzt, relativ zur Grundpassform des Models.
const WORN = {
  hoodie: { bw: 1.08, sh: 1.03, len: 1.02, rib: 52, cuffRib: 46 },
  zip: { bw: 1.08, sh: 1.03, len: 1.02, rib: 52, cuffRib: 46 },
  crew: { bw: 1.05, len: 0.97, rib: 46, cuffRib: 44 },
  tee: { bw: 1.06, len: 1.0, slen: 0.4, ang: 16, cuff: 1.25 },
  longsleeve: { len: 1.0, cuffRib: 34 },
  baby: { bw: 0.95, len: 0.6, slen: 0.27, ang: 18, cuff: 1.15 },
  bomber: { bw: 1.12, sh: 1.05, len: 0.9, rib: 50, cuffRib: 44 },
  leather: { bw: 1.08, sh: 1.04, len: 0.92 },
  puffer: { bw: 1.22, sh: 1.12, len: 0.92, cuff: 1.3, nw: 1.12 },
  knit: { bw: 1.08, len: 0.98, rib: 54, cuffRib: 54 },
  cardigan: { bw: 1.08, len: 1.04, rib: 48, cuffRib: 48 },
}

function topGeo(o) {
  const a = (o.ang * Math.PI) / 180, d = [Math.sin(a), Math.cos(a)], q = [-d[1], d[0]]
  const N = [o.nw, 0], S = [o.sh, o.sd], O = add(S, d, o.slen), I = add(O, q, o.cuff)
  const A = o.arm ? [o.bw, o.arm] : [o.bw, I[1] - ((I[0] - o.bw) / d[0]) * d[1]]
  assert(A[1] > S[1] + 60 && A[1] < o.len - 40, `Achsel unplausibel: ${JSON.stringify(o)}`)
  return { ...o, d, q, N, S, O, I, A, Hb: [o.bw, o.len - (o.rib || 0)], Hm: [o.hw, o.len] }
}

function topPath(g, neck) {
  const R = [g.N, g.S, g.O, g.I, g.A, g.Hb, g.Hm]
  const L = R.map(mx).reverse()
  return {
    d: `M ${pt(mx(g.N))} ${neck} ${pt(g.N)} ${R.slice(1).map((v) => 'L ' + pt(v)).join(' ')} ${L.slice(0, -1).map((v) => 'L ' + pt(v)).join(' ')} Z`,
    pts: [...R, ...L],
  }
}

function drawTop(p, kind, g, view, opt = {}) {
  const front = view === 'front', s = g.nw / 92, t = p.t, nw = g.nw, len = g.len, bw = g.bw
  const hood = kind === 'hoodie' || kind === 'zip'
  const depth = (front ? { hoodie: 70, zip: 70, crew: 64, tee: 66, longsleeve: 62, baby: 56, bomber: 56, leather: 46, puffer: 34, knit: 64, cardigan: 0 }[kind] : 16) * s
  const vDepth = 0.42 * len
  const neck = kind === 'cardigan' && front ? `L 0 ${r1(vDepth)} L` : `Q 0 ${r1(2 * depth)}`
  const hk = opt.worn ? 0.45 : 1 // getragen liegt die Kapuze flach im Nacken
  const hoodTop = -250 * s * hk

  // Kapuze vorne liegt hinter dem Hals
  if (hood && front) {
    const d = `M ${r1(-nw - 48 * s)} ${r1(40 * s)} C ${r1(-nw - 80 * s)} ${r1(-120 * s * hk)} ${r1(-90 * s)} ${r1(hoodTop)} 0 ${r1(hoodTop)} C ${r1(90 * s)} ${r1(hoodTop)} ${r1(nw + 80 * s)} ${r1(-120 * s * hk)} ${r1(nw + 48 * s)} ${r1(40 * s)} Z`
    p.shape(d, [[-nw - 80 * s, hoodTop], [nw + 80 * s, 40 * s]], { to: p.under })
  }

  const B = topPath(g, neck)
  const body = p.shape(B.d, B.pts, { tex: kind === 'knit' || kind === 'cardigan' ? 'rib' : kind === 'leather' ? null : 'twill' })

  // Armausschnitt-Nähte
  sides((m) => p.line(`M ${pt(m(g.S))} Q ${pt(m([g.A[0] + 6 * s, (g.S[1] + g.A[1]) / 2]))} ${pt(m(g.A))}`))

  // Bündchen und Säume
  sides((m) => {
    if (g.cuffRib) {
      const O2 = add(g.O, g.d, -g.cuffRib), I2 = add(g.I, g.d, -g.cuffRib)
      p.line(`M ${pt(m(O2))} L ${pt(m(I2))}`, { w: 3 })
      ribs(p, m(O2), m(I2), m(g.O), m(g.I), 8)
    } else {
      p.stitch(`M ${pt(m(add(g.O, g.d, -18 * s)))} L ${pt(m(add(g.I, g.d, -18 * s)))}`)
    }
  })
  if (g.rib) {
    p.line(`M ${pt(mx(g.Hb))} L ${pt(g.Hb)}`, { w: 3 })
    ribs(p, mx(g.Hb), g.Hb, mx(g.Hm), g.Hm, Math.round(bw / 10))
  } else if (kind !== 'puffer') {
    p.stitch(`M ${r1(-g.hw + 12)} ${r1(len - 20 * s)} L ${r1(g.hw - 12)} ${r1(len - 20 * s)}`)
  }

  // Kragen
  const backNeck = `M ${r1(-nw)} 0 Q 0 ${r1(32 * s)} ${r1(nw)} 0 Q 0 ${r1(2 * depth)} ${r1(-nw)} 0 Z`
  if (['crew', 'tee', 'longsleeve', 'baby', 'knit'].includes(kind)) {
    const band = (kind === 'knit' ? 34 : kind === 'crew' ? 28 : 18) * s
    if (front) p.shape(backNeck, [], { fill: t.shade, tex: null, shade: false, stroke: 4 })
    const a1 = mx([nw, 0]), c1 = [0, 2 * depth], b1 = [nw, 0]
    const a2 = [-(nw + band), 4 * s], c2 = [0, 2 * depth + 2 * band], b2 = [nw + band, 4 * s]
    p.line(`M ${pt(a2)} Q ${pt(c2)} ${pt(b2)}`, { w: 3 })
    if (kind === 'knit' || kind === 'crew') for (let i = 1; i < 22; i++) p.line(`M ${pt(quad(a1, c1, b1, i / 22))} L ${pt(quad(a2, c2, b2, i / 22))}`, { w: 2 })
  }

  if (hood && front) {
    if (!opt.worn) {
    const open = `M ${r1(-nw + 6 * s)} ${r1(30 * s)} C ${r1(-nw - 10 * s)} ${r1(-110 * s)} ${r1(-60 * s)} ${r1(-185 * s)} 0 ${r1(-185 * s)} C ${r1(60 * s)} ${r1(-185 * s)} ${r1(nw + 10 * s)} ${r1(-110 * s)} ${r1(nw - 6 * s)} ${r1(30 * s)} ` +
      (kind === 'zip' ? `L 0 ${r1(80 * s)} Z` : `L ${r1(18 * s)} ${r1(110 * s)} Q 0 ${r1(126 * s)} ${r1(-18 * s)} ${r1(110 * s)} Z`)
    p.shape(open, [], { fill: t.shade, tex: null, shade: false })
    }
    const cord = opt.cord || (isDark(t.fill) ? '#efe9dc' : mix(t.fill, INK, 0.55))
    sides((m, k) => {
      const x = (kind === 'zip' ? 44 : 34) * s * k
      p.cord(`M ${r1(x)} ${r1(95 * s)} C ${r1(x * 1.15)} ${r1(170 * s)} ${r1(x * 0.85)} ${r1(240 * s)} ${r1(x * 1.2)} ${r1(300 * s)}`, cord, 7 * s)
      p.circle(x * 1.2, 306 * s, 6 * s, METAL, 2)
    })
  }
  if (hood && !front) {
    const d = `M ${r1(-nw - 52 * s)} ${r1(30 * s)} C ${r1(-nw - 85 * s)} ${r1(-130 * s * hk)} ${r1(-95 * s)} ${r1(-255 * s * hk)} 0 ${r1(-255 * s * hk)} C ${r1(95 * s)} ${r1(-255 * s * hk)} ${r1(nw + 85 * s)} ${r1(-130 * s * hk)} ${r1(nw + 52 * s)} ${r1(30 * s)} C ${r1(nw + 40 * s)} ${r1(160 * s)} ${r1(70 * s)} ${r1(250 * s)} 0 ${r1(262 * s)} C ${r1(-70 * s)} ${r1(250 * s)} ${r1(-nw - 40 * s)} ${r1(160 * s)} ${r1(-nw - 52 * s)} ${r1(30 * s)} Z`
    p.shape(d, [[-nw - 85 * s, -255 * s * hk], [nw + 85 * s, 262 * s]])
    p.line(`M 0 ${r1(-255 * s * hk)} L 0 ${r1(262 * s)}`)
  }

  // Kängurutasche
  if (hood && front) {
    const pb = len - (g.rib || 0) - 10 * s, top = pb - 0.34 * len, a = 0.6 * bw, b = 0.84 * bw, k = top + 0.36 * (pb - top)
    p.line(`M ${r1(-a)} ${r1(top)} L ${r1(a)} ${r1(top)} L ${r1(b)} ${r1(k)} L ${r1(b)} ${r1(pb)} L ${r1(-b)} ${r1(pb)} L ${r1(-b)} ${r1(k)} Z`, { w: 3.2 })
    sides((m) => p.line(`M ${pt(m([a, top]))} L ${pt(m([b, k]))}`, { w: 5, color: INK }))
    p.stitch(`M ${r1(-a + 10)} ${r1(top + 12)} L ${r1(a - 10)} ${r1(top + 12)}`)
  }

  if (kind === 'bomber') {
    const cw = nw + 20 * s, ch = 50 * s
    const collar = front
      ? `M ${r1(-cw)} ${r1(6 * s)} L ${r1(-nw - 14 * s)} ${r1(-ch)} Q 0 ${r1(-ch - 14 * s)} ${r1(nw + 14 * s)} ${r1(-ch)} L ${r1(cw)} ${r1(6 * s)} Q ${r1(nw / 2)} ${r1(depth + 10 * s)} ${r1(8 * s)} ${r1(depth + 30 * s)} L ${r1(-8 * s)} ${r1(depth + 30 * s)} Q ${r1(-nw / 2)} ${r1(depth + 10 * s)} ${r1(-cw)} ${r1(6 * s)} Z`
      : `M ${r1(-cw)} ${r1(6 * s)} L ${r1(-nw - 14 * s)} ${r1(-ch)} Q 0 ${r1(-ch - 14 * s)} ${r1(nw + 14 * s)} ${r1(-ch)} L ${r1(cw)} ${r1(6 * s)} Q 0 ${r1(42 * s)} ${r1(-cw)} ${r1(6 * s)} Z`
    p.shape(collar, [[-cw, -ch - 14 * s], [cw, depth + 30 * s]], { fill: mix(t.fill, '#000000', 0.12), tex: 'rib', shade: false })
    if (front) {
      zip(p, depth + 30 * s, len, s)
      sides((m) => {
        const y = len - (g.rib || 0)
        p.line(`M ${pt(m([0.5 * bw, y - 0.36 * len]))} L ${pt(m([0.74 * bw, y - 0.14 * len]))}`, { w: 4, color: INK })
        p.line(`M ${pt(m([0.53 * bw, y - 0.37 * len]))} L ${pt(m([0.77 * bw, y - 0.15 * len]))}`, { w: 2.5 })
      })
      const C = add(add(g.S, g.d, 0.32 * g.slen), g.q, 0.5 * g.cuff)
      const c = [add(add(C, g.d, -42 * s), g.q, -30 * s), add(add(C, g.d, 42 * s), g.q, -30 * s), add(add(C, g.d, 42 * s), g.q, 30 * s), add(add(C, g.d, -42 * s), g.q, 30 * s)]
      p.line(`M ${c.map(pt).join(' L ')} Z`, { w: 3 })
      p.line(`M ${pt(add(C, g.d, -36 * s))} L ${pt(add(C, g.d, 36 * s))}`, { w: 5, color: METAL })
    }
  }

  if (kind === 'leather') {
    if (front) {
      p.shape(backNeck, [], { fill: t.shade, tex: null, shade: false, stroke: 4 })
    }
    p.shape(`M ${r1(-nw - 8 * s)} ${r1(8 * s)} L ${r1(-nw - 2 * s)} ${r1(-42 * s)} Q 0 ${r1(-54 * s)} ${r1(nw + 2 * s)} ${r1(-42 * s)} L ${r1(nw + 8 * s)} ${r1(8 * s)} Q 0 ${r1(30 * s)} ${r1(-nw - 8 * s)} ${r1(8 * s)} Z`, [[-nw - 8 * s, -54 * s]], { tex: null })
    if (front) {
      sides((m) => {
        const leaf = [[6 * s, depth + 6 * s], [nw - 8 * s, -10 * s], [nw + 46 * s, 8 * s], [0.42 * bw, 0.24 * len]].map(m)
        p.shape(`M ${leaf.map(pt).join(' L ')} Z`, leaf, { tex: null })
        p.line(`M ${pt(m([0.42 * bw, 0.3 * len]))} L ${pt(m([0.86 * bw, 0.3 * len]))} L ${pt(m([0.86 * bw, 0.43 * len]))} L ${pt(m([0.42 * bw, 0.43 * len]))} Z`)
        p.shape(`M ${pt(m([0.4 * bw, 0.28 * len]))} L ${pt(m([0.88 * bw, 0.28 * len]))} L ${pt(m([0.88 * bw, 0.335 * len]))} L ${pt(m([0.4 * bw, 0.335 * len]))} Z`, [], { tex: null, stroke: 3 })
        p.circle(m([0.64 * bw, 0.31 * len])[0], 0.31 * len, 7 * s, METAL, 2)
      })
      zip(p, depth + 6 * s, len, s)
    } else {
      p.line(`M ${r1(-g.A[0])} ${r1(0.24 * len)} Q 0 ${r1(0.3 * len)} ${r1(g.A[0])} ${r1(0.24 * len)}`)
    }
    p.line(`M ${r1(-g.hw)} ${r1(len - 62 * s)} L ${r1(g.hw)} ${r1(len - 62 * s)}`)
    // Glanzlichter
    p.line(`M ${r1(-0.62 * bw)} ${r1(0.22 * len)} Q ${r1(-0.55 * bw)} ${r1(0.5 * len)} ${r1(-0.64 * bw)} ${r1(0.8 * len)}`, { w: 12 * s, color: 'rgba(255,255,255,.16)' })
    p.line(`M ${pt(mx(add(add(g.S, g.d, 0.15 * g.slen), g.q, 0.25 * g.cuff)))} L ${pt(mx(add(add(g.S, g.d, 0.85 * g.slen), g.q, 0.25 * g.cuff)))}`, { w: 10 * s, color: 'rgba(255,255,255,.14)' })
  }

  if (kind === 'puffer') {
    const cx = nw + 20 * s
    const collar = `M ${r1(-cx)} ${r1(40 * s)} L ${r1(-nw - 12 * s)} ${r1(-110 * s)} Q 0 ${r1(-126 * s)} ${r1(nw + 12 * s)} ${r1(-110 * s)} L ${r1(cx)} ${r1(40 * s)} Q 0 ${r1(front ? 2 * depth : 42 * s)} ${r1(-cx)} ${r1(40 * s)} Z`
    const bodyOnly = `M ${pt(mx(g.N))} Q 0 ${r1(2 * depth)} ${pt(g.N)} L ${pt(g.S)} L ${pt(g.A)} L ${pt(g.Hm)} L ${pt(mx(g.Hm))} L ${pt(mx(g.A))} L ${pt(mx(g.S))} Z`
    const bc = p.clip(bodyOnly)
    let lines = ''
    for (let y = 0.17 * len; y < len - 40 * s; y += 0.14 * len) {
      lines += `<path d="M -900 ${r1(y - 9 * s)} Q 0 ${r1(y + 13 * s)} 900 ${r1(y - 9 * s)}" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="${r1(9 * s)}"/>`
      lines += `<path d="M -900 ${r1(y)} Q 0 ${r1(y + 22 * s)} 900 ${r1(y)}" fill="none" stroke="${t.line}" stroke-width="3.5"/>`
    }
    p.in(bc, lines)
    sides((m) => {
      const sc = p.clip(`M ${[g.S, g.O, g.I, g.A].map((v) => pt(m(v))).join(' L ')} Z`)
      let sl = ''
      for (const u of [0.2, 0.4, 0.6, 0.8]) {
        const P = add(g.S, g.d, u * g.slen)
        sl += `<path d="M ${pt(m(add(P, g.q, -80)))} L ${pt(m(add(P, g.q, g.cuff + 160)))}" fill="none" stroke="${t.line}" stroke-width="3.5"/>`
      }
      p.in(sc, sl)
      p.line(`M ${pt(m([0.62 * bw, 0.5 * len]))} L ${pt(m([0.66 * bw, 0.72 * len]))}`, { w: 4, color: INK })
    })
    p.line(`M ${r1(-g.hw + 8)} ${r1(len - 22 * s)} L ${r1(g.hw - 8)} ${r1(len - 22 * s)}`)
    p.shape(collar, [[-cx, -126 * s]])
    if (front) {
      p.shape(`M ${r1(-nw + 4 * s)} ${r1(-98 * s)} Q 0 ${r1(-62 * s)} ${r1(nw - 4 * s)} ${r1(-98 * s)} Q 0 ${r1(-124 * s)} ${r1(-nw + 4 * s)} ${r1(-98 * s)} Z`, [], { fill: t.shade, tex: null, shade: false, stroke: 4 })
      zip(p, -96 * s, len, s)
    }
    p.line(`M ${r1(-cx + 4)} ${r1(-36 * s)} Q 0 ${r1(-30 * s)} ${r1(cx - 4)} ${r1(-36 * s)}`)
  }

  if (kind === 'knit' && front) {
    let cab = ''
    for (const x of [-0.42 * bw, 0, 0.42 * bw]) {
      cab += `<path d="M ${r1(x - 30 * s)} 0 V ${len} M ${r1(x + 30 * s)} 0 V ${len}" stroke="${t.line}" stroke-width="2.5" fill="none"/>`
      for (let y = 0.17 * len; y < len - (g.rib || 0) - 60 * s; y += 64 * s) {
        cab += `<path d="M ${r1(x - 18 * s)} ${r1(y)} C ${r1(x - 18 * s)} ${r1(y + 32 * s)} ${r1(x + 18 * s)} ${r1(y + 32 * s)} ${r1(x + 18 * s)} ${r1(y + 64 * s)} M ${r1(x + 18 * s)} ${r1(y)} C ${r1(x + 18 * s)} ${r1(y + 32 * s)} ${r1(x - 18 * s)} ${r1(y + 32 * s)} ${r1(x - 18 * s)} ${r1(y + 64 * s)}" stroke="${t.line}" stroke-width="3.5" fill="none"/>`
      }
    }
    p.in(p.clip(`M ${r1(-bw)} ${r1(0.15 * len)} H ${r1(bw)} V ${r1(len - (g.rib || 0))} H ${r1(-bw)} Z`), `<g clip-path="url(#${body})">${cab}</g>`)
  }

  if (kind === 'cardigan') {
    if (front) {
      p.shape(`M ${r1(-nw)} 0 Q 0 ${r1(32 * s)} ${r1(nw)} 0 L 0 ${r1(vDepth)} Z`, [], { fill: t.shade, tex: null, shade: false, stroke: 4 })
      sides((m) => p.line(`M ${pt(m([nw + 30 * s, 4 * s]))} L ${pt(m([30 * s, vDepth + 22 * s]))} L ${pt(m([30 * s, len]))}`, { w: 3 }))
      const y0 = vDepth + 50 * s, y1 = len - (g.rib || 0) - 40 * s
      for (let i = 0; i < 5; i++) {
        const y = y0 + ((y1 - y0) * i) / 4
        p.circle(0, y, 11 * s, mix(t.fill, '#000000', 0.45), 2)
      }
      sides((m) => {
        const yb = len - (g.rib || 0) - 0.06 * len, yt = yb - 0.22 * len
        p.line(`M ${pt(m([0.32 * bw, yt]))} L ${pt(m([0.8 * bw, yt]))} L ${pt(m([0.8 * bw, yb]))} L ${pt(m([0.32 * bw, yb]))} Z`, { w: 3 })
        p.line(`M ${pt(m([0.32 * bw, yt + 22 * s]))} L ${pt(m([0.8 * bw, yt + 22 * s]))}`, { w: 2 })
      })
    } else {
      p.line(`M ${r1(-nw - 26 * s)} ${r1(4 * s)} Q 0 ${r1(32 * s + 52 * s)} ${r1(nw + 26 * s)} ${r1(4 * s)}`, { w: 3 })
    }
  }

  if (kind === 'zip' && front) zip(p, 80 * s, len, s)

  // Prints
  const pc = opt.printColor || t.print
  if (front && opt.chest) {
    const x = (['zip', 'bomber'].includes(kind) ? -0.5 : 0.48) * bw
    p.text(x, 0.25 * len, 'SPÄTKAUF', 34 * s, 150 * s, opt.chestColor || pc)
  }
  if (front && opt.sleeve) {
    const P = add(add(g.S, g.d, 0.55 * g.slen), g.q, 0.5 * g.cuff)
    p.text(P[0], P[1], 'OFFEN BIS SPÄT', 30 * s, 260 * s, pc, (Math.atan2(g.d[1], g.d[0]) * 180) / Math.PI)
  }
  if (!front && opt.back === 'big') {
    const top = hood ? 0.4 * len : 0.28 * len
    p.text(0, top, 'OFFEN', 0.15 * len, 1.42 * bw, pc)
    p.text(0, top + 0.15 * len, 'BIS SPÄT', 0.15 * len, 1.42 * bw, pc)
    p.text(0, top + 0.215 * len, 'BERLIN · 24/7 · SEIT 2019', 0.034 * len, 1.0 * bw, pc)
  }
  if (!front && opt.back === 'small') p.text(0, (hood ? 0.42 : 0.17) * len, 'SPÄTKAUF', 0.05 * len, 0.9 * bw, pc)
}

// ---------- Hosen ----------
const PANTS = {
  cargo: { ww: 215, hip: 250, rise: 330, len: 1000, ho: 230, hi: 40, wb: 56 },
  wide: { ww: 200, hip: 245, rise: 310, len: 1020, ho: 300, hi: 22, wb: 62 },
  denim: { ww: 215, hip: 252, rise: 320, len: 1000, ho: 265, hi: 30, wb: 54 },
}

function drawPants(p, kind, o, view) {
  const { ww, hip, rise, len, ho, hi, wb } = o, s = ww / 215, front = view === 'front', t = p.t
  const ys = 0.26 * len
  const d = `M ${r1(-ww)} 0 L ${r1(ww)} 0 Q ${r1(hip + 4 * s)} ${r1(0.12 * len)} ${r1(hip)} ${r1(ys)} L ${r1(ho)} ${r1(len)} L ${r1(hi)} ${r1(len)} L ${r1(12 * s)} ${r1(rise + 30 * s)} Q 0 ${r1(rise)} ${r1(-12 * s)} ${r1(rise + 30 * s)} L ${r1(-hi)} ${r1(len)} L ${r1(-ho)} ${r1(len)} L ${r1(-hip)} ${r1(ys)} Q ${r1(-hip - 4 * s)} ${r1(0.12 * len)} ${r1(-ww)} 0 Z`
  const c = p.shape(d, [[-ww, 0], [ww, 0], [hip, ys], [-hip, ys], [ho, len], [-ho, len]], { tex: kind === 'denim' ? 'denim' : 'twill' })
  const st = kind === 'denim' ? '#d39a4a' : t.line
  if (kind === 'denim') {
    p.in(c, `<ellipse cx="${r1(-0.55 * hip)}" cy="${r1(0.45 * len)}" rx="${r1(0.3 * hip)}" ry="${r1(0.22 * len)}" fill="#fff" opacity=".16" filter="url(#soft)"/><ellipse cx="${r1(0.55 * hip)}" cy="${r1(0.45 * len)}" rx="${r1(0.3 * hip)}" ry="${r1(0.22 * len)}" fill="#fff" opacity=".16" filter="url(#soft)"/>`)
  }
  p.line(`M ${r1(-ww + 3)} ${r1(wb)} L ${r1(ww - 3)} ${r1(wb)}`, { w: 3 })
  if (kind === 'denim') p.stitch(`M ${r1(-ww + 6)} ${r1(wb - 10 * s)} L ${r1(ww - 6)} ${r1(wb - 10 * s)}`, st)
  for (const x of front ? [-0.82, -0.36, 0.36, 0.82] : [-0.82, -0.3, 0, 0.3, 0.82]) {
    p.parts.push(`<rect x="${r1(x * ww - 8 * s)}" y="${r1(-4 * s)}" width="${r1(16 * s)}" height="${r1(wb + 16 * s)}" fill="${t.fill}" stroke="${INK}" stroke-width="2.5"/>`)
  }
  if (front) {
    p.circle(0, wb / 2, 11 * s, METAL, 2.5)
    p.line(`M 0 ${r1(wb)} L 0 ${r1(rise - 14 * s)}`, { w: 3 })
    p.stitch(`M ${r1(-50 * s)} ${r1(wb)} L ${r1(-50 * s)} ${r1(rise - 80 * s)} Q ${r1(-50 * s)} ${r1(rise - 24 * s)} ${r1(-4 * s)} ${r1(rise - 16 * s)}`, st)
    sides((m) => p.line(`M ${pt(m([0.58 * ww, wb]))} Q ${pt(m([0.7 * ww, 0.19 * len]))} ${pt(m([hip - 4 * s, 0.21 * len]))}`, { w: 3 }))
  } else {
    p.line(`M 0 ${r1(wb)} L 0 ${r1(rise - 10 * s)}`, { w: 3 })
  }
  if (kind === 'denim') {
    if (front) {
      p.line(`M ${r1(0.62 * ww)} ${r1(wb + 18 * s)} L ${r1(0.86 * ww)} ${r1(wb + 14 * s)} L ${r1(0.88 * ww)} ${r1(wb + 72 * s)} L ${r1(0.64 * ww)} ${r1(wb + 76 * s)} Z`, { w: 2.5 })
      sides((m) => p.circle(m([0.6 * ww, wb + 8 * s])[0], wb + 8 * s, 5 * s, '#b0703a', 1.5))
    } else {
      p.line(`M ${r1(-hip * 0.98)} ${r1(0.13 * len)} L 0 ${r1(0.19 * len)} L ${r1(hip * 0.98)} ${r1(0.13 * len)}`, { w: 3 })
      sides((m) => {
        const pk = [[0.24 * hip, 0.21 * len], [0.82 * hip, 0.2 * len], [0.84 * hip, 0.37 * len], [0.54 * hip, 0.41 * len], [0.26 * hip, 0.37 * len]].map(m)
        p.line(`M ${pk.map(pt).join(' L ')} Z`, { w: 3 })
        p.stitch(`M ${pt(m([0.32 * hip, 0.3 * len]))} Q ${pt(m([0.54 * hip, 0.25 * len]))} ${pt(m([0.76 * hip, 0.3 * len]))}`, st)
      })
      p.parts.push(`<rect x="${r1(0.42 * ww)}" y="${r1(10 * s)}" width="${r1(90 * s)}" height="${r1(wb - 20 * s)}" fill="${SIGNAL}" stroke="${INK}" stroke-width="2"/>`)
    }
  }
  if (kind === 'wide') {
    if (front) {
      sides((m) => {
        p.line(`M ${pt(m([0.5 * hip, 0.3 * len]))} L ${pt(m([(ho + hi) / 2, len]))}`, { w: 2.4 })
        p.line(`M ${pt(m([0.3 * ww, wb]))} L ${pt(m([0.33 * ww, wb + 0.1 * len]))}`, { w: 3 })
      })
    } else {
      sides((m) => p.line(`M ${pt(m([0.28 * hip, 0.18 * len]))} L ${pt(m([0.72 * hip, 0.18 * len]))}`, { w: 4, color: INK }))
    }
  }
  if (kind === 'cargo') {
    sides((m) => {
      const x1 = 0.46 * hip, x2 = 0.9 * hip, y1 = 0.44 * len, y2 = 0.64 * len
      p.line(`M ${pt(m([x1, y1]))} L ${pt(m([x2, y1]))} L ${pt(m([x2, y2]))} L ${pt(m([x1, y2]))} Z`, { w: 3 })
      p.shape(`M ${pt(m([x1 - 6 * s, y1 - 24 * s]))} L ${pt(m([x2 + 6 * s, y1 - 24 * s]))} L ${pt(m([x2 + 6 * s, y1 + 22 * s]))} L ${pt(m([x1 - 6 * s, y1 + 22 * s]))} Z`, [], { stroke: 3, shade: false })
      const yc = len - 46 * s
      p.line(`M ${pt(m([hi + 2, yc]))} L ${pt(m([ho - 2, yc]))}`, { w: 3 })
      ribs(p, m([hi, yc]), m([ho, yc]), m([hi, len]), m([ho, len]), 9)
      if (!front) p.line(`M ${pt(m([0.26 * hip, 0.17 * len]))} L ${pt(m([0.72 * hip, 0.17 * len]))}`, { w: 4, color: INK })
    })
  } else {
    sides((m) => p.stitch(`M ${pt(m([hi + 4, len - 18 * s]))} L ${pt(m([ho - 4, len - 18 * s]))}`, st))
  }
}

// ---------- Accessoires ----------
function drawCap(p, view) {
  const t = p.t
  const crown = 'M -300 0 C -300 -300 300 -300 300 0 Z'
  if (view === 'front') {
    p.shape('M -318 -10 C -230 92 230 92 318 -10 C 220 28 -220 28 -318 -10 Z', [[-318, -10], [318, 70]], { fill: mix(t.fill, '#000000', 0.15) })
    p.stitch('M -260 22 C -170 70 170 70 260 22')
  }
  p.shape(crown, [[-300, -226], [300, 0]])
  p.line('M 0 -226 L 0 0', { w: 3 })
  sides((m) => p.line(`M ${pt(m([95, -214]))} Q ${pt(m([170, -110]))} ${pt(m([178, 0]))}`, { w: 3 }))
  p.circle(0, -228, 15, t.fill, 3)
  sides((m) => p.circle(m([170, -150])[0], -150, 8, t.shade, 2))
  if (view === 'front') {
    p.text(0, -78, 'SPÄTKAUF', 54, 300, t.print)
  } else {
    p.shape('M -96 0 Q -96 -118 0 -126 Q 96 -118 96 0 Z', [], { fill: BG, tex: null, shade: false })
    p.shape('M -118 -48 L 118 -48 L 118 -14 L -118 -14 Z', [], { shade: false, stroke: 3 })
    p.parts.push(`<rect x="30" y="-54" width="40" height="46" rx="4" fill="${METAL}" stroke="${INK}" stroke-width="2.5"/>`)
    p.text(0, -160, 'BERLIN', 30, 130, t.print)
  }
}

function drawTote(p, view) {
  const t = p.t
  p.cord('M -150 0 C -150 -330 150 -330 150 0', t.fill, 34)
  p.track([-160, -250])
  p.shape('M -280 0 L 280 0 L 280 640 L -280 640 Z', [[-280, 0], [280, 640]], { tex: 'canvas' })
  p.stitch('M -270 48 L 270 48')
  sides((m) => p.parts.push(`<rect x="${m([150, 0])[0] - 22}" y="0" width="44" height="70" fill="none" stroke="${t.line}" stroke-width="2.5" stroke-dasharray="7 6"/>`))
  if (view === 'front') {
    p.text(0, 300, 'SPÄTKAUF', 108, 450, t.print)
    p.text(0, 372, 'OFFEN BIS SPÄT', 36, 300, SIGNAL)
    p.text(0, 420, 'BERLIN · 24/7', 26, 200, t.print)
  } else {
    p.parts.push(`<rect x="170" y="560" width="80" height="44" fill="${SIGNAL}" stroke="${INK}" stroke-width="2"/>`)
    p.text(210, 590, 'SPK', 22, 50, '#ffffff')
  }
}

// ---------- Figuren ----------
const MODELS = {
  // Mann: Kalle
  A: {
    skin: '#8a5a3c', hair: '#151515', style: 'short', shoes: '#f3f3f1',
    top: { nw: 64, sh: 222, sd: 34, bw: 158, hw: 152, len: 560, slen: 556, ang: 7, cuff: 90, arm: 200 },
    pants: { ww: 152, hip: 168, rise: 250, len: 830, ho: 170, hi: 18, wb: 42 },
    outfit: { top: ['tee', '#f4f4f2'], pants: ['cargo', '#2a2a2a'] },
  },
  // Frau: Mira
  B: {
    skin: '#eac2a0', hair: '#7a3b1f', style: 'long', shoes: '#1c1c1c',
    top: { nw: 58, sh: 198, sd: 30, bw: 140, hw: 136, len: 520, slen: 520, ang: 7, cuff: 82, arm: 185 },
    pants: { ww: 134, hip: 152, rise: 230, len: 830, ho: 160, hi: 14, wb: 40 },
    outfit: { top: ['tee', '#f4f4f2'], pants: ['wide', '#2a2a2a'] },
  },
}

function wornTop(model, kind) {
  const b = MODELS[model].top, w = WORN[kind] || {}
  const o = { ...b }
  for (const k of ['bw', 'sh', 'len', 'slen', 'cuff', 'nw']) if (w[k]) o[k] = b[k] * w[k]
  o.hw = o.bw * (b.hw / b.bw)
  if (w.ang) o.ang = w.ang
  o.rib = w.rib || 0
  o.cuffRib = w.cuffRib || 0
  if (o.slen < b.slen * 0.6) delete o.arm
  return o
}

function wornPants(model, kind) {
  const b = MODELS[model].pants
  const k = { wide: 1.3, cargo: 0.98, denim: 1.12 }[kind] || 1
  return { ...b, ho: b.hi + (b.ho - b.hi) * k + (k > 1 ? 10 : 0) }
}

function figure(model, view, look) {
  const M = MODELS[model], front = view === 'front'
  const base = topGeo(M.top)
  const topKind = look.top[0], pantsKind = look.pants[0]
  const tg = topGeo(wornTop(model, topKind))
  const pg = wornPants(model, pantsKind)
  const waist = M.top.len * 0.8
  const layers = []

  // Haut: Hals, Rumpf, Arme, Hände
  const skin = pen(M.skin, null)
  const HEAD = 1.22 // Kopf etwas größer als realistisch, wirkt freundlicher
  if (M.style === 'long' && front) {
    skin.group(HEAD, 0, 12, () => skin.shape('M -88 -150 C -104 -258 104 -258 88 -150 L 108 40 Q 0 78 -108 40 Z', [[-108, -258], [108, 60]], { fill: M.hair, tex: null, to: skin.under }), skin.under)
  }
  skin.shape('M -30 -50 L 30 -50 L 32 20 L -32 20 Z', [])
  skin.shape(`M ${pt(mx(base.N))} L ${pt(base.N)} L ${pt(base.A)} L ${r1(base.bw)} ${r1(waist + 20)} L ${r1(-base.bw)} ${r1(waist + 20)} L ${pt(mx(base.A))} Z`, [], { stroke: 3 })
  sides((m) => {
    skin.shape(`M ${[base.S, base.O, base.I, base.A].map((v) => pt(m(v))).join(' L ')} Z`, [m(base.S), m(base.O)], { stroke: 4 })
    const h = add(lerp(base.O, base.I, 0.5), base.d, 46)
    skin.parts.push(`<ellipse cx="${r1(m(h)[0])}" cy="${r1(h[1])}" rx="34" ry="48" fill="${M.skin}" stroke="${INK}" stroke-width="4" transform="rotate(${-7 * (m === mx ? -1 : 1)} ${r1(m(h)[0])} ${r1(h[1])})"/>`)
    skin.track([m(h)[0] - 40, h[1] + 50])
  })
  layers.push(skin)

  // Schuhe
  const shoes = pen(M.shoes, null)
  sides((m) => {
    const x = m([(pg.ho + pg.hi) / 2, 0])[0], y = waist + pg.len, w = Math.max(120, (pg.ho - pg.hi) * 0.8)
    shoes.shape(`M ${r1(x - w / 2)} ${r1(y - 10)} Q ${r1(x)} ${r1(y - 70)} ${r1(x + w / 2)} ${r1(y - 10)} L ${r1(x + w / 2 + 8)} ${r1(y + 26)} L ${r1(x - w / 2 - 8)} ${r1(y + 26)} Z`, [[x - w / 2 - 8, y + 50]])
    shoes.parts.push(`<rect x="${r1(x - w / 2 - 12)}" y="${r1(y + 22)}" width="${r1(w + 24)}" height="28" rx="12" fill="#fafaf8" stroke="${INK}" stroke-width="4"/>`)
    if (front) shoes.line(`M ${r1(x - 18)} ${r1(y - 34)} L ${r1(x + 18)} ${r1(y - 34)} M ${r1(x - 20)} ${r1(y - 20)} L ${r1(x + 20)} ${r1(y - 20)}`, { w: 3 })
  })
  layers.push(shoes)

  // Hose
  const pants = pen(look.pants[1])
  pants.group(1, 0, waist, () => drawPants(pants, pantsKind, pg, view))
  layers.push(pants)

  // Oberteil
  const top = pen(look.top[1])
  drawTop(top, topKind, tg, view, { ...look.topOpt, worn: true })
  layers.push(top)

  // Kopf
  const head = pen(M.skin, null)
  head.group(HEAD, 0, 12, () => {
  const face = 'M -70 -140 A 70 86 0 1 0 70 -140 A 70 86 0 1 0 -70 -140 Z'
  if (front) sides((m) => head.shape(`M ${pt(m([62, -150]))} Q ${pt(m([92, -140]))} ${pt(m([64, -110]))} Z`, [], { stroke: 4, shade: false }))
  head.shape(face, [[-70, -226], [70, -54]])
  if (front) {
    head.parts.push(`<path d="M -56 -156 h 44 q 6 0 6 8 v 16 q 0 14 -16 14 h -20 q -18 0 -18 -16 v -14 q 0 -8 4 -8 z M 12 -156 h 44 q 4 0 4 8 v 14 q 0 16 -18 16 h -20 q -16 0 -16 -14 v -16 q 0 -8 6 -8 z" fill="${INK}"/><path d="M -6 -148 h 12" stroke="${INK}" stroke-width="5"/><path d="M -44 -146 l 14 -4 M 24 -146 l 14 -4" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/>`)
    head.line('M -2 -112 q 6 4 0 8', { w: 3, color: mix(M.skin, INK, 0.45) })
    head.line('M -18 -86 Q 0 -74 18 -86', { w: 5, color: INK })
    if (M.style === 'short') head.shape('M -74 -152 C -80 -244 80 -244 74 -152 C 58 -194 -58 -194 -74 -152 Z', [[-80, -244]], { fill: M.hair, tex: null })
    else head.shape('M -76 -150 C -74 -238 74 -238 76 -150 Q 32 -204 -6 -184 Q -46 -204 -76 -150 Z', [[-76, -238]], { fill: M.hair, tex: null })
  } else {
    if (M.style === 'short') head.shape('M -72 -120 C -82 -240 82 -240 72 -120 Q 0 -92 -72 -120 Z', [], { fill: M.hair, tex: null })
    else head.shape('M -90 -150 C -106 -262 106 -262 90 -150 L 110 60 Q 0 96 -110 60 Z', [[-110, 96]], { fill: M.hair, tex: null })
  }
  })
  layers.push(head)

  if (look.acc) {
    const [kind, color] = look.acc
    const acc = pen(color, kind === 'tote' ? 'canvas' : 'twill')
    if (kind === 'cap') acc.group(0.37, 0, -205, () => drawCap(acc, view))
    if (kind === 'tote') {
      const h = add(lerp(base.O, base.I, 0.5), base.d, 46)
      const x = front ? -h[0] : h[0]
      acc.group(0.42, x, h[1] + 0.42 * 250, () => drawTote(acc, view))
    }
    layers.push(acc)
  }
  return layers
}

// ---------- Rendern ----------
function fit(layers, [bx, by, bw, bh]) {
  const box = [Infinity, Infinity, -Infinity, -Infinity]
  for (const l of layers) { box[0] = Math.min(box[0], l.box[0]); box[1] = Math.min(box[1], l.box[1]); box[2] = Math.max(box[2], l.box[2]); box[3] = Math.max(box[3], l.box[3]) }
  const k = Math.min(bw / (box[2] - box[0]), bh / (box[3] - box[1]))
  const tx = bx + bw / 2 - (k * (box[0] + box[2])) / 2, ty = by + bh / 2 - (k * (box[1] + box[3])) / 2
  const body = `<g transform="translate(${r1(tx)} ${r1(ty)}) scale(${+k.toFixed(4)})">${layers.flatMap((l) => l.under).join('')}${layers.flatMap((l) => l.parts).join('')}</g>`
  return { defs: layers.flatMap((l) => l.defs).join(''), body, k, tx, ty, box }
}

const COMMON_DEFS = '<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>'

function productSvg(layers, label, zoom) {
  const f = fit(layers, [130, 170, 940, 1110])
  let vb = `0 0 ${W} ${H}`
  if (zoom) {
    const [zx, zy, zw] = zoom, cx = f.tx + f.k * zx, cy = f.ty + f.k * zy, w = f.k * zw
    vb = `${r1(cx - w / 2)} ${r1(cy - w * 0.625)} ${r1(w)} ${r1(w * 1.25)}`
  }
  const floor = f.ty + f.k * f.box[3]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${W}" height="${H}"><defs>${COMMON_DEFS}${f.defs}</defs>` +
    `<rect x="-3000" y="-3000" width="9000" height="9000" fill="${BG}"/>` +
    `<ellipse cx="600" cy="${r1(floor + 18)}" rx="${r1((f.k * (f.box[2] - f.box[0])) * 0.42)}" ry="26" fill="#000" opacity=".12" filter="url(#soft)"/>` +
    f.body +
    (zoom ? '' : `<text x="60" y="${H - 52}" font-family="Helvetica Neue, Arial, sans-serif" font-size="22" letter-spacing="4" fill="#9a9a96">${label}</text><text x="${W - 60}" y="${H - 52}" text-anchor="end" ${FONT} font-size="24" letter-spacing="2" fill="#9a9a96">SPÄTKAUF</text>`) +
    '</svg>\n'
}

function flat(spec, color, view) {
  const p = pen(color, spec.kind === 'tote' ? 'canvas' : 'twill')
  if (spec.type === 'top') drawTop(p, spec.kind, topGeo(TOPS[spec.kind]), view, spec)
  if (spec.type === 'pants') drawPants(p, spec.kind, PANTS[spec.kind], view)
  if (spec.kind === 'cap') drawCap(p, view)
  if (spec.kind === 'tote') drawTote(p, view)
  return [p]
}

function lookFor(spec, color, model) {
  const look = { ...MODELS[model].outfit }
  if (spec.type === 'top') look.top = [spec.kind, color], look.topOpt = spec
  if (spec.type === 'pants') look.pants = [spec.kind, color], look.top = ['tee', isDark(color) ? '#f4f4f2' : '#1f1f1f']
  if (spec.type === 'acc') {
    look.acc = [spec.kind, color]
    look.top = model === 'A' ? ['hoodie', '#55585c'] : ['knit', '#e9e3d6']
  }
  return look
}

// ---------- Produkte ----------
const SPECS = {
  'sp-01': { kind: 'hoodie', type: 'top', chest: true, back: 'big', printColor: SIGNAL, zoom: ['back', [0, 380, 600]] },
  'sp-02': { kind: 'zip', type: 'top', chest: true, back: 'small', zoom: ['front', [0, 80, 420]] },
  'sp-03': { kind: 'crew', type: 'top', chest: true, back: 'small', zoom: ['front', [110, 170, 420]] },
  'sp-04': { kind: 'tee', type: 'top', chest: true, back: 'big', zoom: ['back', [0, 280, 640]] },
  'sp-05': { kind: 'longsleeve', type: 'top', sleeve: true, back: 'small', zoom: ['front', [420, 380, 420]] },
  'sp-06': { kind: 'baby', type: 'top', chest: true, chestColor: SIGNAL, zoom: ['front', [60, 110, 320]] },
  'sp-07': { kind: 'bomber', type: 'top', back: 'small', zoom: ['front', [380, 260, 420]] },
  'sp-08': { kind: 'leather', type: 'top', zoom: ['front', [140, 180, 420]] },
  'sp-09': { kind: 'puffer', type: 'top', back: 'small', zoom: ['front', [0, -20, 480]] },
  'sp-10': { kind: 'knit', type: 'top', zoom: ['front', [0, 380, 420]] },
  'sp-11': { kind: 'cardigan', type: 'top', zoom: ['front', [60, 480, 420]] },
  'sp-12': { kind: 'cargo', type: 'pants', zoom: ['front', [170, 520, 380]] },
  'sp-13': { kind: 'wide', type: 'pants', zoom: ['front', [0, 120, 420]] },
  'sp-14': { kind: 'denim', type: 'pants', zoom: ['back', [130, 300, 380]] },
  'sp-15': { kind: 'cap', type: 'acc', zoom: ['front', [0, -100, 460]] },
  'sp-16': { kind: 'tote', type: 'acc', zoom: ['front', [0, 340, 560]] },
}

const productsFile = new URL('src/data/products.json', ROOT)
const products = JSON.parse(fs.readFileSync(productsFile))
const outDir = new URL('public/products/', ROOT)
fs.rmSync(outDir, { recursive: true, force: true })
fs.mkdirSync(outDir, { recursive: true })

let files = 0
products.forEach((prod, i) => {
  const spec = SPECS[prod.id]
  assert(spec, `Keine Zeichnung für ${prod.id}`)
  const model = prod.gender === 'herren' ? 'A' : prod.gender === 'damen' ? 'B' : i % 2 ? 'B' : 'A'
  prod.model = model
  prod.colorImages = {}
  for (const c of prod.colors) {
    const look = lookFor(spec, c.hex, model)
    const views = [
      productSvg(flat(spec, c.hex, 'front'), `${prod.id.toUpperCase()} · VORNE`),
      productSvg(figure(model, 'front', look), `${prod.id.toUpperCase()} · LOOK`),
      productSvg(figure(model, 'back', look), `${prod.id.toUpperCase()} · LOOK HINTEN`),
      productSvg(flat(spec, c.hex, 'back'), `${prod.id.toUpperCase()} · HINTEN`),
      productSvg(flat(spec, c.hex, spec.zoom[0]), '', spec.zoom[1]),
    ]
    prod.colorImages[c.name] = views.map((svg, v) => {
      const file = `${prod.id}-${slug(c.name)}-${v + 1}.svg`
      fs.writeFileSync(new URL(file, outDir), svg)
      files++
      return `/products/${file}`
    })
  }
  prod.images = prod.colorImages[prod.colors[0].name]
})
fs.writeFileSync(productsFile, JSON.stringify(products, null, 2) + '\n')

// ---------- Kampagne ----------
const campDir = new URL('public/campaign/', ROOT)
fs.mkdirSync(campDir, { recursive: true })

const LOOK_A = { top: ['hoodie', '#1c1c1c'], topOpt: { chest: true, back: 'big', printColor: SIGNAL }, pants: ['cargo', '#3a3c3f'] }
const LOOK_B = { top: ['leather', '#1c1c1c'], pants: ['wide', '#55585c'] }

function scene(w, h, bg, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${bg}${inner}</svg>\n`
}

// 1: Animierte Nachtszene vor dem Späti (ersetzt das Video). Figuren rechts, links Platz für den Text der App.
{
  const a = fit(figure('A', 'front', LOOK_A), [560, 880, 300, 840])
  const b = fit(figure('B', 'front', LOOK_B), [840, 900, 290, 820])
  const SY = 830, WY = 920, WH = 380, FY = WY + WH // Schild, Schaufenster, Gehweg
  let windows = ''
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
    const lit = (r * 6 + c) % 4 === 1, x = 70 + c * 182, y = 110 + r * 220
    windows += `<rect x="${x}" y="${y}" width="120" height="150" fill="${lit ? '#f2c66d' : '#22252e'}" opacity="${lit ? 0.85 : 1}"${(r + c) % 5 === 2 ? ' class="blink"' : ''}/>`
  }
  let shelves = ''
  for (let r = 0; r < 4; r++) {
    const y = WY + 20 + r * 88
    shelves += `<rect x="120" y="${y + 66}" width="960" height="7" fill="#7a4a20" opacity=".55"/>`
    for (let c = 0; c < 24; c++) {
      const hgt = 28 + ((c * 7 + r * 3) % 4) * 9, col = ['#3b8f5a', '#c9382b', '#f0f0f0', '#2f5fb3', '#e7b13b'][(c + r) % 5]
      shelves += `<rect x="${130 + c * 40}" y="${y + 66 - hgt}" width="24" height="${hgt}" rx="5" fill="${col}" opacity=".75"/>`
    }
  }
  const svg = scene(1200, 1800,
    `<defs>${COMMON_DEFS}${a.defs}${b.defs}
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0d14"/><stop offset="1" stop-color="#1a1e2b"/></linearGradient>
      <linearGradient id="shop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe1a8"/><stop offset="1" stop-color="#ff9d45"/></linearGradient>
      <linearGradient id="street" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16171d"/><stop offset="1" stop-color="#0a0a0d"/></linearGradient>
      <filter id="glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <pattern id="rain" width="90" height="140" patternUnits="userSpaceOnUse"><path d="M10 0l-6 34M55 60l-6 34M80 20l-6 34M32 100l-6 34" stroke="#dfe6ff" stroke-opacity=".28" stroke-width="2.5" stroke-linecap="round"/></pattern>
      <style>
        .flicker{animation:flicker 4s infinite steps(1)}
        .blink{animation:blink 6s infinite}
        .rain{animation:rain .55s linear infinite}
        @keyframes flicker{0%,18%,22%,62%,64%,100%{opacity:1}20%,63%{opacity:.25}}
        @keyframes blink{0%,70%{opacity:.85}75%,100%{opacity:.15}}
        @keyframes rain{from{transform:translateY(-140px)}to{transform:translateY(0)}}
        @media (prefers-reduced-motion:reduce){.flicker,.blink,.rain{animation:none}}
      </style></defs>
      <rect width="1200" height="1800" fill="url(#sky)"/>
      <rect y="40" width="1200" height="${SY - 40}" fill="#171920"/>${windows}
      <rect x="60" y="${SY - 20}" width="1080" height="${FY - SY + 40}" fill="#101116"/>
      <rect x="110" y="${WY}" width="980" height="${WH}" fill="url(#shop)"/>${shelves}
      <path d="M110 ${WY}h980M440 ${WY}v${WH}M760 ${WY}v${WH}" stroke="#101116" stroke-width="14"/>
      <rect x="110" y="${SY}" width="980" height="72" fill="#0c0d11"/>
      <text class="flicker" x="600" y="${SY + 58}" text-anchor="middle" ${FONT} font-size="64" textLength="520" lengthAdjust="spacingAndGlyphs" fill="${SIGNAL}" filter="url(#glow)">SPÄTKAUF</text>
      <text class="blink" x="250" y="${WY + 70}" text-anchor="middle" ${FONT} font-size="44" fill="#ff6a3d" filter="url(#glow)">24/7</text>
      <rect y="${FY}" width="1200" height="${1800 - FY}" fill="url(#street)"/>
      <ellipse cx="600" cy="${FY + 70}" rx="540" ry="60" fill="#ff9d45" opacity=".26" filter="url(#soft)"/>`,
    `${a.body}${b.body}<g class="rain"><rect y="-140" width="1200" height="1940" fill="url(#rain)"/></g>`)
  fs.writeFileSync(new URL('nacht.svg', campDir), svg)
}

// 2: Poster OFFEN BIS SPÄT
{
  const a = fit(figure('A', 'front', { top: ['hoodie', '#e9e3d6'], topOpt: { chest: true }, pants: ['denim', '#6d87a8'] }), [640, 820, 480, 940])
  const big = (y, s) => `<text x="60" y="${y}" ${FONT} font-size="260" textLength="${s.length * 175}" lengthAdjust="spacingAndGlyphs" fill="${INK}">${s}</text>`
  fs.writeFileSync(new URL('offen.svg', campDir), scene(1200, 1800, `<defs>${COMMON_DEFS}${a.defs}</defs><rect width="1200" height="1800" fill="${SIGNAL}"/>${big(300, 'OFFEN')}${big(540, 'BIS')}${big(780, 'SPÄT.')}`, a.body))
}

// 3: Poster NACHTSCHICHT
{
  const b = fit(figure('B', 'front', { top: ['puffer', '#c3c6c8'], pants: ['denim', '#3b3d42'], acc: ['tote', '#e9e3d6'] }), [270, 420, 660, 1300])
  const out = (y, s) => `<text x="600" y="${y}" text-anchor="middle" ${FONT} font-size="250" textLength="1080" lengthAdjust="spacingAndGlyphs" fill="none" stroke="#f1eee6" stroke-width="3">${s}</text>`
  fs.writeFileSync(new URL('nachtschicht.svg', campDir), scene(1200, 1800, `<defs>${COMMON_DEFS}${b.defs}</defs><rect width="1200" height="1800" fill="${INK}"/>${out(300, 'NACHT')}${out(540, 'SCHICHT')}<text x="600" y="640" text-anchor="middle" ${FONT} font-size="48" letter-spacing="10" fill="${SIGNAL}">AW26</text>`, b.body))
}

// Damen / Herren
for (const [file, model, look] of [['damen', 'B', LOOK_B], ['herren', 'A', LOOK_A]]) {
  const f = fit(figure(model, 'front', look), [150, 120, 900, 1260])
  fs.writeFileSync(new URL(`${file}.svg`, campDir), scene(1200, 1500, `<defs>${COMMON_DEFS}${f.defs}</defs><rect width="1200" height="1500" fill="${BG}"/><ellipse cx="600" cy="1390" rx="260" ry="26" fill="#000" opacity=".12" filter="url(#soft)"/>`, f.body))
}

// Selbstprüfung: jede Farbe hat 5 Bilder, alle Dateien existieren.
for (const prod of products) for (const list of Object.values(prod.colorImages)) {
  assert.equal(list.length, 5)
  for (const f of list) assert(fs.existsSync(new URL(`public${f}`, ROOT)), f)
}
console.log(`${files} Produktbilder, 5 Kampagnenbilder`)
