// Figura anatômica simplificada (frente e costas) com os grupos musculares destacados.
(function () {
  const MUSCLES = {
    peitoral: "Peitoral",
    deltoide_ant: "Deltoide anterior",
    deltoide_lat: "Deltoide lateral",
    deltoide_post: "Deltoide posterior",
    trapezio: "Trapézio",
    romboides: "Romboides / trapézio médio",
    dorsal: "Dorsal (latíssimo)",
    lombar: "Lombar (eretores da espinha)",
    biceps: "Bíceps",
    triceps: "Tríceps",
    antebraco: "Antebraço",
    abdomen: "Abdômen (reto abdominal)",
    obliquos: "Oblíquos",
    gluteo: "Glúteo máximo",
    gluteo_medio: "Glúteo médio (abdutores)",
    quadriceps: "Quadríceps",
    adutores: "Adutores",
    posteriores: "Posteriores de coxa",
    panturrilha: "Panturrilha"
  };

  // Espelha um path de x para (2*cx - x) — paths escritos só com comandos absolutos M L Q C Z.
  function mirror(d, cx) {
    return d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, x, y) => `${(2 * cx - parseFloat(x)).toFixed(1)},${y}`);
  }
  function pair(d, cx) { return [d, mirror(d, cx)]; }

  // ---------- Vista frontal (eixo x = 50) ----------
  const F = 50;
  const frontBase = [
    // cabeça e pescoço
    `<ellipse cx="50" cy="14" rx="8.5" ry="10.5"/>`,
    `<path d="M45,22 L55,22 L56,31 L44,31 Z"/>`,
    // tronco
    `<path d="M37,31 L63,31 Q70,33 71,42 L67,58 L64,74 Q63,86 66,96 L34,96 Q37,86 36,74 L33,58 L29,42 Q30,33 37,31 Z"/>`,
    // braços
    ...pair(`M29,40 Q24,44 23,56 L21,72 L18,92 L16,104 L21,106 L25,93 L29,74 L32,60 Z`, F).map(d => `<path d="${d}"/>`),
    // mãos
    `<ellipse cx="17.5" cy="109" rx="3.6" ry="5"/>`, `<ellipse cx="82.5" cy="109" rx="3.6" ry="5"/>`,
    // pernas
    ...pair(`M34,94 L50,97 L49,120 L47,140 L46,164 L45,184 L38,186 L37,164 L35,142 L33,120 Z`, F).map(d => `<path d="${d}"/>`)
  ];
  const frontMuscles = {
    trapezio: pair(`M45,24 L44,31 L37,32 Z`, F),
    deltoide_ant: pair(`M37,32 Q31,33 29.5,40 L31,48 Q34,42 38,38 Z`, F),
    deltoide_lat: pair(`M30,34 Q25,37 25,46 L28.5,49 Q28,40 32,35 Z`, F),
    peitoral: pair(`M49.3,34 L39,34 Q33,38 32.5,46 Q34,53 41,54.5 Q47,54 49.3,51 Z`, F),
    biceps: pair(`M27.5,50 Q23.5,55 23.5,63 Q24,69 26.5,71 Q30,64 30.5,55 Z`, F),
    antebraco: pair(`M23,73 Q19.5,80 18.5,92 L20.5,96 Q25,86 27,76 Z`, F),
    abdomen: [`M44.5,56 L55.5,56 L55.5,90 Q50,94 44.5,90 Z`],
    obliquos: pair(`M43.5,56 L37.5,57 Q36,68 37.5,80 L43.5,89 Z`, F),
    quadriceps: pair(`M36,99 Q34,112 36,128 Q38,138 42,140 Q47,137 48,126 L48.5,108 Q45,100 36,99 Z`, F),
    adutores: pair(`M49.5,99 L46,103 Q44.5,112 47.5,123 L49.5,114 Z`, F),
    panturrilha: pair(`M38,150 Q36,160 38.5,172 L42,173 Q45.5,162 45,150 Q41.5,146 38,150 Z`, F)
  };

  // ---------- Vista posterior (eixo x = 150) ----------
  const B = 150;
  const shift = d => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, x, y) => `${(parseFloat(x) + 100).toFixed(1)},${y}`);
  const backBase = [
    `<ellipse cx="150" cy="14" rx="8.5" ry="10.5"/>`,
    `<path d="M145,22 L155,22 L156,31 L144,31 Z"/>`,
    `<path d="${shift(`M37,31 L63,31 Q70,33 71,42 L67,58 L64,74 Q63,86 66,96 L34,96 Q37,86 36,74 L33,58 L29,42 Q30,33 37,31 Z`)}"/>`,
    ...pair(shift(`M29,40 Q24,44 23,56 L21,72 L18,92 L16,104 L21,106 L25,93 L29,74 L32,60 Z`), B).map(d => `<path d="${d}"/>`),
    `<ellipse cx="117.5" cy="109" rx="3.6" ry="5"/>`, `<ellipse cx="182.5" cy="109" rx="3.6" ry="5"/>`,
    ...pair(shift(`M34,94 L50,97 L49,120 L47,140 L46,164 L45,184 L38,186 L37,164 L35,142 L33,120 Z`), B).map(d => `<path d="${d}"/>`)
  ];
  const backMuscles = {
    trapezio: [shift(`M50,22 L45,24 L44,30 L36,33 L44,37 L50,44 L56,37 L64,33 L56,30 L55,24 Z`)],
    romboides: [shift(`M50,45 L44,38.5 L41,40 L42,52 L50,60 L58,52 L59,40 L56,38.5 Z`)],
    deltoide_post: pair(shift(`M36.5,33 Q30,34 29,41 L31,48 Q34,40 40,37.5 Z`), B),
    deltoide_lat: pair(shift(`M30,34 Q25,37 25,46 L28.5,49 Q28,40 32,35 Z`), B),
    triceps: pair(shift(`M27.5,49 Q23.5,55 23.5,63 Q24,69 26.5,71 Q30.5,63 30.5,54 Z`), B),
    antebraco: pair(shift(`M23,73 Q19.5,80 18.5,92 L20.5,96 Q25,86 27,76 Z`), B),
    dorsal: pair(shift(`M40.5,41 L34,44 Q34,58 38,70 L45.5,76 L48.5,66 L41.5,54 Z`), B),
    lombar: pair(shift(`M49.3,62 L46.5,70 L45.5,88 L49.3,90 Z`), B),
    gluteo_medio: pair(shift(`M36,86 Q34,92 36,97 L42,92 Q40,87 36,86 Z`), B),
    gluteo: pair(shift(`M49.5,92 Q42,89 37,96 Q35,104 39,110 Q45,113 49.5,110 Z`), B),
    posteriores: pair(shift(`M37,114 Q35,126 37.5,138 Q41,142 44,141 Q48,132 48.5,116 Q43,112 37,114 Z`), B),
    panturrilha: pair(shift(`M37.5,148 Q35.5,158 38.5,170 L42,171 Q46,160 45.5,148 Q41.5,143 37.5,148 Z`), B),
    adutores: pair(shift(`M49.5,114 L48.6,124 L49.5,128 Z`), B)
  };

  function svg(primary, secondary, opts) {
    opts = opts || {};
    const P = new Set(primary || []), S = new Set(secondary || []);
    const cls = k => P.has(k) ? "m-p" : S.has(k) ? "m-s" : "m-o";
    const paths = (group) => Object.entries(group).map(([k, ds]) =>
      ds.map(d => `<path class="${cls(k)}" d="${d}"><title>${MUSCLES[k]}</title></path>`).join("")).join("");
    const labels = opts.labels ? `<text x="50" y="198" class="m-lbl">frente</text><text x="150" y="198" class="m-lbl">costas</text>` : "";
    return `<svg class="corpo" viewBox="10 0 180 ${opts.labels ? 202 : 190}" role="img" aria-label="Músculos trabalhados">` +
      `<g class="m-base">${frontBase.join("")}${backBase.join("")}</g>` +
      paths(frontMuscles) + paths(backMuscles) + labels + `</svg>`;
  }

  window.Corpo = { MUSCLES, svg };
})();
