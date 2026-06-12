// Пока JavaScript почти не нужен.
// Оставляем файл для будущих анимаций, меню и интерактивов.

console.log("Харцызский молодёжный центр — сайт загружен");
/* =========================
   ЖИВОЙ СВЕТОВОЙ СГУСТОК
========================= */

(() => {
  const canvas = document.getElementById("liquidGlowCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let renderScale = 0.62;
  let animationId = null;
  let lastTime = 0;

  const TAU = Math.PI * 2;

  let orbitalPhase = Math.random() * TAU;

  const masses = [
    { x: -0.18, y: -0.03, rx: 0.42, ry: 0.30, hue: 178, alpha: 0.55, speed: 1.08, seed: 1.4 },
    { x:  0.10, y: -0.12, rx: 0.38, ry: 0.34, hue: 212, alpha: 0.48, speed: 1.22, seed: 3.1 },
    { x: -0.22, y:  0.22, rx: 0.44, ry: 0.32, hue: 252, alpha: 0.50, speed: 1.16, seed: 5.2 },
    { x:  0.22, y:  0.16, rx: 0.40, ry: 0.26, hue: 164, alpha: 0.36, speed: 1.34, seed: 7.7 },
    { x:  0.00, y:  0.04, rx: 0.26, ry: 0.20, hue: 288, alpha: 0.36, speed: 1.62, seed: 9.6 }
  ];

  const rays = [
    {
      angle: -18,
      phase: 0.1,
      speed: 0.70,
      length: 0.62,
      width: 0.16,
      flashPhase: 1.2,
      flashSpeed: 0.38
    },
    {
      angle: 38,
      phase: 1.7,
      speed: 0.62,
      length: 0.58,
      width: 0.14,
      flashPhase: 4.8,
      flashSpeed: 0.31
    },
    {
      angle: 118,
      phase: 2.8,
      speed: 0.66,
      length: 0.54,
      width: 0.13,
      flashPhase: 7.4,
      flashSpeed: 0.35
    },
    {
      angle: 208,
      phase: 4.2,
      speed: 0.58,
      length: 0.60,
      width: 0.15,
      flashPhase: 10.6,
      flashSpeed: 0.28
    },
    {
      angle: 292,
      phase: 5.4,
      speed: 0.64,
      length: 0.52,
      width: 0.13,
      flashPhase: 13.1,
      flashSpeed: 0.33
    },
    {
      angle: 72,
      phase: 8.8,
      speed: 0.52,
      length: 0.44,
      width: 0.11,
      flashPhase: 16.2,
      flashSpeed: 0.24
    },
    {
      angle: 252,
      phase: 11.4,
      speed: 0.49,
      length: 0.46,
      width: 0.12,
      flashPhase: 19.7,
      flashSpeed: 0.27
    }
  ];

  let spin = {
    active: false,
    start: 0,
    duration: 0,
    nextAt: 0,
    turns: 0,
    tilt: 0,
    depth: 0,
    ellipseX: 1,
    ellipseY: 1,
    phaseBase: 0
  };

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function scheduleNextSpin(nowSec) {
    spin.nextAt = nowSec + randomRange(35, 70);
  }

  function startSpin(nowSec) {
    spin.active = true;
    spin.start = nowSec;

    spin.duration = randomRange(9.0, 13.0);
    spin.turns = randomRange(1.6, 2.7);

    spin.tilt = randomRange(-1.05, 1.05);
    spin.depth = randomRange(0.38, 0.78);
    spin.ellipseX = randomRange(0.96, 1.24);
    spin.ellipseY = randomRange(0.60, 0.88);

    spin.phaseBase = orbitalPhase;
  }

  function smootherStep(x) {
    const v = Math.min(1, Math.max(0, x));
    return v * v * v * (v * (v * 6 - 15) + 10);
  }

  function smoothPulse(x) {
    return smootherStep(Math.sin(Math.PI * Math.min(1, Math.max(0, x))));
  }

  function getSpinState(nowSec) {
    if (!spin.active) {
      return {
        force: 0,
        angle: orbitalPhase,
        orbitTilt: 0,
        velocity: 0,
        depth: 0
      };
    }

    const p = (nowSec - spin.start) / spin.duration;

    if (p >= 1) {
      orbitalPhase = spin.phaseBase + spin.turns * TAU;
      spin.active = false;
      scheduleNextSpin(nowSec);

      return {
        force: 0,
        angle: orbitalPhase,
        orbitTilt: 0,
        velocity: 0,
        depth: 0
      };
    }

    const force = smoothPulse(p);
    const progress = smootherStep(p);
    const angle = spin.phaseBase + progress * spin.turns * TAU;
    const velocity = smoothPulse(p);

    return {
      force,
      angle,
      orbitTilt: spin.tilt,
      velocity,
      depth: spin.depth
    };
  }

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);

    canvas.width = Math.round(width * renderScale * dpr);
    canvas.height = Math.round(height * renderScale * dpr);

    canvas.style.width = "100vw";
    canvas.style.height = "100vh";

    ctx.setTransform(renderScale * dpr, 0, 0, renderScale * dpr, 0, 0);
  }

  function organicPath(cx, cy, rx, ry, t, seed, stretch = 0, stretchAngle = 0) {
    const points = 22;
    const coords = [];

    const dirX = Math.cos(stretchAngle);
    const dirY = Math.sin(stretchAngle);

    for (let i = 0; i < points; i++) {
      const angle = (TAU * i) / points;

      const waveA = Math.sin(i * 1.65 + t * 1.20 + seed) * 0.15;
      const waveB = Math.sin(i * 3.05 - t * 0.78 + seed * 2.1) * 0.08;
      const waveC = Math.cos(i * 2.25 + t * 0.52 + seed * 0.8) * 0.06;

      const dot = Math.cos(angle) * dirX + Math.sin(angle) * dirY;
      const directionalStretch = 1 + stretch * Math.max(0, dot);

      const r = (1 + waveA + waveB + waveC) * directionalStretch;

      coords.push({
        x: cx + Math.cos(angle) * rx * r,
        y: cy + Math.sin(angle) * ry * r
      });
    }

    ctx.beginPath();

    for (let i = 0; i < coords.length; i++) {
      const current = coords[i];
      const next = coords[(i + 1) % coords.length];

      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;

      if (i === 0) {
        ctx.moveTo(midX, midY);
      } else {
        ctx.quadraticCurveTo(current.x, current.y, midX, midY);
      }
    }

    ctx.closePath();
  }

  function drawMass(cx, cy, rx, ry, hue, alpha, t, seed, stretch = 0, stretchAngle = 0) {
    organicPath(cx, cy, rx, ry, t, seed, stretch, stretchAngle);

    const gradient = ctx.createRadialGradient(
      cx - rx * 0.16,
      cy - ry * 0.18,
      0,
      cx,
      cy,
      Math.max(rx, ry) * 1.14
    );

    gradient.addColorStop(0, `hsla(${hue + 10}, 100%, 84%, ${alpha * 0.95})`);
    gradient.addColorStop(0.20, `hsla(${hue}, 98%, 66%, ${alpha})`);
    gradient.addColorStop(0.48, `hsla(${hue + 22}, 95%, 56%, ${alpha * 0.66})`);
    gradient.addColorStop(0.74, `hsla(${hue - 18}, 90%, 50%, ${alpha * 0.25})`);
    gradient.addColorStop(1, `hsla(${hue}, 90%, 45%, 0)`);

    ctx.fillStyle = gradient;
    ctx.fill();
  }

  function getOrbitPoint(radius, angle, tilt, ellipseX, ellipseY, depth) {
    const x = Math.cos(angle) * radius * ellipseX;
    const y = Math.sin(angle) * radius * ellipseY;

    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);

    const rx = x * cosT - y * sinT;
    const ry = x * sinT + y * cosT;

    const depthWave = Math.sin(angle);
    const zScale = 1 + depthWave * depth * 0.22;

    return {
      x: rx,
      y: ry,
      zScale,
      depthWave
    };
  }

  function getOrbitTangent(radius, angle, tilt, ellipseX, ellipseY) {
    const a1 = getOrbitPoint(radius, angle, tilt, ellipseX, ellipseY, 0);
    const a2 = getOrbitPoint(radius, angle + 0.02, tilt, ellipseX, ellipseY, 0);

    return Math.atan2(a2.y - a1.y, a2.x - a1.x);
  }

  function drawSpinTrail(cx, cy, base, angle, hue, force, velocity, zScale) {
    if (force < 0.04) return;

    const length = base * (0.26 + velocity * 0.30) * zScale;
    const thickness = base * (0.055 + velocity * 0.035) * zScale;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.globalAlpha = force * velocity * 0.34;
    ctx.filter = `blur(${20 + velocity * 16}px)`;

    const gradient = ctx.createLinearGradient(-length, 0, length * 0.20, 0);

    gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0)`);
    gradient.addColorStop(0.34, `hsla(${hue + 12}, 100%, 72%, .18)`);
    gradient.addColorStop(0.62, `hsla(${hue + 26}, 100%, 80%, .38)`);
    gradient.addColorStop(1, `hsla(${hue + 40}, 100%, 90%, 0)`);

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(-length, -thickness * 0.22);
    ctx.bezierCurveTo(
      -length * 0.55,
      -thickness * 1.00,
      -length * 0.10,
      -thickness * 0.64,
      length * 0.18,
      -thickness * 0.18
    );
    ctx.bezierCurveTo(
      -length * 0.02,
      thickness * 0.66,
      -length * 0.54,
      thickness * 0.94,
      -length,
      thickness * 0.20
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawSpinHalo(cx, cy, base, spinState) {
    if (spinState.force < 0.03) return;

    ctx.save();

    ctx.translate(cx, cy);
    ctx.rotate(spinState.orbitTilt);

    ctx.globalAlpha = spinState.force * 0.24;
    ctx.filter = "blur(22px)";
    ctx.lineWidth = base * 0.035;
    ctx.strokeStyle = "rgba(129,216,208,.34)";

    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      base * 0.44 * (spin.ellipseX || 1),
      base * 0.30 * (spin.ellipseY || 0.76),
      0,
      0,
      TAU
    );
    ctx.stroke();

    ctx.globalAlpha = spinState.force * 0.14;
    ctx.lineWidth = base * 0.060;
    ctx.strokeStyle = "rgba(115,45,221,.26)";

    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      base * 0.50 * (spin.ellipseX || 1),
      base * 0.34 * (spin.ellipseY || 0.76),
      0,
      0,
      TAU
    );
    ctx.stroke();

    ctx.restore();
  }

  function drawSoftRay(cx, cy, base, ray, t, spinForce, spinVelocity) {
    const ambientRaw = Math.sin(t * ray.speed + ray.phase);
    const ambientPulse = Math.pow(Math.max(0, ambientRaw), 1.7);

    const flashRaw = Math.sin(t * ray.flashSpeed + ray.flashPhase);
    const flash = Math.pow(Math.max(0, flashRaw), 9.5);

    const power =
      0.10 +
      ambientPulse * 0.34 +
      flash * 0.72 +
      spinForce * 0.52;

    if (power < 0.05) return;

    const angle =
      (
        ray.angle +
        Math.sin(t * 0.28 + ray.phase) * 8 +
        Math.sin(t * 0.11 + ray.flashPhase) * 5 +
        spinVelocity * 12
      ) * Math.PI / 180;

    const length =
      base *
      ray.length *
      (
        0.78 +
        ambientPulse * 0.22 +
        flash * 0.42 +
        spinForce * 0.26
      );

    const rayWidth =
      base *
      ray.width *
      (
        0.78 +
        ambientPulse * 0.34 +
        flash * 0.85 +
        spinForce * 0.42
      );

    const startShift = base * 0.045;

    ctx.save();

    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.translate(startShift, 0);

    /*
      Широкий мягкий световой пробой
    */
    ctx.globalAlpha = power * 0.42;
    ctx.filter = `blur(${24 + flash * 18 + spinForce * 12}px)`;

    let gradient = ctx.createLinearGradient(0, 0, length, 0);

    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.14, "rgba(255,255,255,.10)");
    gradient.addColorStop(0.30, "rgba(255,255,255,.30)");
    gradient.addColorStop(0.48, "rgba(129,216,208,.34)");
    gradient.addColorStop(0.66, "rgba(78,168,222,.22)");
    gradient.addColorStop(0.82, "rgba(115,45,221,.16)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(0, -rayWidth * 0.16);

    ctx.bezierCurveTo(
      length * 0.18,
      -rayWidth * 1.22,
      length * 0.58,
      -rayWidth * 0.44,
      length,
      -rayWidth * 0.10
    );

    ctx.bezierCurveTo(
      length * 0.76,
      rayWidth * 0.48,
      length * 0.22,
      rayWidth * 0.80,
      0,
      rayWidth * 0.16
    );

    ctx.closePath();
    ctx.fill();

    /*
      Короткая яркая вспышка внутри луча
    */
    if (flash > 0.04) {
      ctx.globalAlpha = flash * (0.42 + spinForce * 0.25);
      ctx.filter = `blur(${8 + flash * 10}px)`;

      const flashLength = length * (0.44 + flash * 0.26);
      const flashWidth = rayWidth * (0.28 + flash * 0.18);

      gradient = ctx.createLinearGradient(0, 0, flashLength, 0);

      gradient.addColorStop(0, "rgba(255,255,255,0)");
      gradient.addColorStop(0.20, "rgba(255,255,255,.18)");
      gradient.addColorStop(0.42, "rgba(255,255,255,.62)");
      gradient.addColorStop(0.60, "rgba(129,216,208,.42)");
      gradient.addColorStop(0.84, "rgba(255,255,255,.12)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.moveTo(0, -flashWidth * 0.14);

      ctx.bezierCurveTo(
        flashLength * 0.18,
        -flashWidth * 0.82,
        flashLength * 0.60,
        -flashWidth * 0.32,
        flashLength,
        -flashWidth * 0.08
      );

      ctx.bezierCurveTo(
        flashLength * 0.74,
        flashWidth * 0.36,
        flashLength * 0.24,
        flashWidth * 0.54,
        0,
        flashWidth * 0.12
      );

      ctx.closePath();
      ctx.fill();
    }

    /*
      Свет у основания луча
    */
    ctx.globalAlpha = ambientPulse * 0.12 + flash * 0.34 + spinForce * 0.14;
    ctx.filter = `blur(${18 + flash * 10}px)`;

    const coreGradient = ctx.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      rayWidth * 1.45
    );

    coreGradient.addColorStop(0, "rgba(255,255,255,.32)");
    coreGradient.addColorStop(0.34, "rgba(129,216,208,.22)");
    coreGradient.addColorStop(0.72, "rgba(115,45,221,.10)");
    coreGradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = coreGradient;

    ctx.beginPath();
    ctx.arc(0, 0, rayWidth * 1.45, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  function drawFrame(time) {
    const t = time * 0.001;
    const dt = lastTime ? Math.min(0.05, t - lastTime) : 0;
    lastTime = t;

    ctx.clearRect(0, 0, width, height);

    const isMobile = width <= 700;
    const nowSec = t;

    if (!spin.nextAt) scheduleNextSpin(nowSec);

    if (!spin.active && nowSec >= spin.nextAt && !prefersReducedMotion) {
      startSpin(nowSec);
    }

    if (!spin.active) {
      orbitalPhase += dt * 0.055;
    }

    const spinState = prefersReducedMotion
      ? { force: 0, angle: orbitalPhase, orbitTilt: 0, velocity: 0, depth: 0 }
      : getSpinState(nowSec);

    const centerX =
      width * 0.5 +
      Math.sin(t * 0.30) * (isMobile ? 18 : 30) +
      Math.sin(t * 0.13) * (isMobile ? 12 : 24);

    const centerY =
      height * (isMobile ? 0.34 : 0.40) +
      Math.cos(t * 0.27) * (isMobile ? 16 : 26);

    const base = Math.min(width * (isMobile ? 0.84 : 0.48), isMobile ? 520 : 660);

    const globalColorShift =
      Math.sin(t * 0.22) * 28 +
      Math.sin(t * 0.071) * 18;

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    /*
      Общая оболочка.
      Она делает пятна частью одного сгустка.
    */
    ctx.filter = `blur(${34 + spinState.force * 10}px) saturate(${1.30 + spinState.force * 0.28}) contrast(${1.08 + spinState.force * 0.12})`;

    drawMass(
      centerX,
      centerY,
      base * (0.60 + spinState.force * 0.07),
      base * (0.43 + spinState.force * 0.05),
      196 + globalColorShift,
      0.36 + spinState.force * 0.06,
      t * 0.78,
      12.3,
      spinState.force * 0.10,
      spinState.angle + 0.2
    );

    drawSpinHalo(centerX, centerY, base, spinState);

    const orbitRadius = base * (0.22 + spinState.force * 0.18);

    const drawItems = masses.map((mass, index) => {
      const driftX =
        Math.sin(t * (mass.speed * 1.20) + mass.seed) * base * 0.090 +
        Math.sin(t * 0.44 + index) * base * 0.038;

      const driftY =
        Math.cos(t * (mass.speed * 1.08) + mass.seed) * base * 0.082 +
        Math.cos(t * 0.33 + index) * base * 0.032;

      const stableAngle = orbitalPhase * 0.45 + index * (TAU / masses.length);

      const stableX =
        Math.cos(stableAngle) * base * 0.035 +
        Math.sin(t * 0.22 + mass.seed) * base * 0.022;

      const stableY =
        Math.sin(stableAngle) * base * 0.026 +
        Math.cos(t * 0.18 + mass.seed) * base * 0.020;

      const stableCx =
        centerX +
        mass.x * base +
        driftX +
        stableX;

      const stableCy =
        centerY +
        mass.y * base +
        driftY +
        stableY;

      const clusterAngle =
        spinState.angle + index * (TAU / masses.length);

      const orb = getOrbitPoint(
        orbitRadius,
        clusterAngle,
        spinState.orbitTilt,
        spin.ellipseX || 1,
        spin.ellipseY || 0.76,
        spin.depth || 0.5
      );

      const orbitCx = centerX + orb.x;
      const orbitCy = centerY + orb.y;

      const cx =
        stableCx * (1 - spinState.force) +
        orbitCx * spinState.force;

      const cy =
        stableCy * (1 - spinState.force) +
        orbitCy * spinState.force;

      let rx =
        base *
        mass.rx *
        (0.92 + Math.sin(t * 0.86 + mass.seed) * 0.12);

      let ry =
        base *
        mass.ry *
        (0.92 + Math.cos(t * 0.78 + mass.seed) * 0.12);

      rx *= 1 + spinState.force * 0.18 + (orb.zScale - 1) * 0.66;
      ry *= 1 + spinState.force * 0.08 - (orb.zScale - 1) * 0.34;

      const hue =
        mass.hue +
        globalColorShift +
        Math.sin(t * 0.58 + mass.seed) * 30 +
        Math.cos(t * 0.19 + index) * 14 +
        spinState.force * 10;

      const tangent = getOrbitTangent(
        orbitRadius,
        clusterAngle,
        spinState.orbitTilt,
        spin.ellipseX || 1,
        spin.ellipseY || 0.76
      );

      const stretch =
        spinState.force *
        (0.14 + spinState.velocity * 0.70);

      return {
        cx,
        cy,
        rx,
        ry,
        hue,
        alpha: mass.alpha,
        seed: mass.seed,
        stretch,
        tangent,
        z: orb.zScale,
        index
      };
    });

    /*
      Псевдо-глубина:
      дальние пятна рисуются раньше,
      ближние позже.
    */
    drawItems.sort((a, b) => a.z - b.z);

    drawItems.forEach((item) => {
      drawSpinTrail(
        item.cx,
        item.cy,
        base,
        item.tangent,
        item.hue,
        spinState.force,
        spinState.velocity,
        item.z
      );

      drawMass(
        item.cx,
        item.cy,
        item.rx,
        item.ry,
        item.hue,
        item.alpha,
        t * 1.08,
        item.seed,
        item.stretch,
        item.tangent
      );
    });

    /*
      Светящееся ядро.
    */
    ctx.filter = `blur(${22 + spinState.force * 8}px) saturate(${1.22 + spinState.force * 0.20})`;

    drawMass(
      centerX + Math.sin(t * 1.08) * base * 0.050,
      centerY + Math.cos(t * 0.92) * base * 0.044,
      base * (0.20 + spinState.force * 0.05),
      base * (0.14 + spinState.force * 0.03),
      190 + globalColorShift * 0.6,
      0.32 + spinState.force * 0.06,
      t * 1.7,
      21.8,
      spinState.force * 0.16,
      spinState.angle
    );

    /*
      Лучи усиливаются во время вращения,
      а в спокойном режиме иногда дают мягкие вспышки.
    */
    ctx.filter = "none";

    rays.forEach((ray) => {
      drawSoftRay(
        centerX,
        centerY,
        base,
        ray,
        t,
        spinState.force,
        spinState.velocity
      );
    });

    ctx.restore();

    if (!prefersReducedMotion) {
      animationId = requestAnimationFrame(drawFrame);
    }
  }

  function start() {
    resizeCanvas();
    lastTime = 0;

    if (animationId) {
      cancelAnimationFrame(animationId);
    }

    requestAnimationFrame(drawFrame);
  }

  window.addEventListener("resize", start);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    } else {
      start();
    }
  });

  start();
})();

/* =========================
   ПЕРЕХОД В ПОРТАЛЫ
========================= */

(() => {
  const portalLinks = document.querySelectorAll(".portal-card");

  if (!portalLinks.length) return;

  let layer = document.querySelector(".portal-transition-layer");

  if (!layer) {
    layer = document.createElement("div");
    layer.className = "portal-transition-layer";
    document.body.appendChild(layer);
  }

  let isTransitionRunning = false;

  function prepareFadeItems(clickedLink) {
    const items = [
      {
        element: clickedLink,
        delay: 0
      },
      {
        element: document.querySelector(".portal-area"),
        delay: 0.04
      },
      {
        element: document.querySelector(".museum-card"),
        delay: 0.08
      },
      {
        element: document.querySelector(".hero"),
        delay: 0.12
      },
      {
        element: document.querySelector(".ogbi-block"),
        delay: 0.16
      },
      {
        element: document.querySelector(".footer"),
        delay: 0.18
      }
    ];

    items.forEach((item) => {
      if (!item.element) return;

      item.element.classList.add("portal-fade-item");
      item.element.style.setProperty("--portal-delay", `${item.delay}s`);
    });

    clickedLink.classList.add("portal-source");
  }

  function clearPortalState() {
    isTransitionRunning = false;

    document.body.classList.remove("portal-transitioning");
    document.body.classList.remove("portal-dissolve");
    document.body.classList.remove("portal-fall");

    document.querySelectorAll(".portal-fade-item").forEach((item) => {
      item.classList.remove("portal-fade-item");
      item.classList.remove("portal-source");
      item.style.removeProperty("--portal-delay");
    });
  }

  function startPortalTransition(link) {
    const href = link.href;

    if (!href || isTransitionRunning) return;

    isTransitionRunning = true;

    prepareFadeItems(link);

    document.body.classList.add("portal-transitioning");
    document.body.classList.add("portal-dissolve");

    /*
      Фаза 1:
      элементы исчезают быстро.
    */
    window.setTimeout(() => {
      document.body.classList.add("portal-fall");
    }, 760);

    /*
      Фаза 2:
      плавное погружение в свечение.
    */
    window.setTimeout(() => {
      window.location.href = href;
    }, 3600);
  }

  portalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();
      startPortalTransition(link);
    });
  });

  window.addEventListener("pageshow", clearPortalState);
})();