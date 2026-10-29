const planets = {
  Mercury: { type: "Rocky planet", order: 1, distance: "58 million km", year: "88 Earth days", gravity: "0.38× Earth", moons: "0", temperature: 167, fact: "About the same size as Earth's Moon.\nHas no air to trap heat, so nights are freezing even though days are scorching.", kind: "Rock" },
  Venus: { type: "Rocky planet", order: 2, distance: "108 million km", year: "225 Earth days", gravity: "0.91× Earth", moons: "0", temperature: 464, fact: "The hottest planet,\neven though Mercury is closer to the Sun.\nThick clouds trap the heat.", kind: "Rock" },
  Earth: { type: "Rocky planet", order: 3, distance: "150 million km", year: "365 Earth days", gravity: "1.00× Earth", moons: "1", temperature: 15, fact: "The only planet we know of\nwith liquid water on its surface, and with life.", kind: "Rock" },
  Mars: { type: "Rocky planet", order: 4, distance: "228 million km", year: "687 Earth days", gravity: "0.38× Earth", moons: "2", temperature: -65, fact: "Looks red because its dusty surface is full of rusty iron. Home to the tallest volcano in the Solar System.", kind: "Rock" },
  Jupiter: { type: "Gas planet", order: 5, distance: "779 million km", year: "4,331 Earth days\n(about 12 years)", gravity: "2.36× Earth", moons: "95+", temperature: -110, fact: "The largest planet. One of its storms, the Great Red Spot, is wider than Earth.", kind: "Gas" },
  Saturn: { type: "Gas planet", order: 6, distance: "1,432 million km", year: "10,747 Earth days\n(about 29 years)", gravity: "0.92× Earth", moons: "270+", temperature: -140, fact: "Its rings are made of billions of pieces of ice and rock. It has more moons than any other planet.", kind: "Gas" },
  Uranus: { type: "Ice planet", order: 7, distance: "2,867 million km", year: "30,589 Earth days\n(about 84 years)", gravity: "0.89× Earth", moons: "28", temperature: -195, fact: "Spins on its side, so each pole has 42 years of daylight followed by 42 years of darkness.", kind: "Ice" },
  Neptune: { type: "Ice planet", order: 8, distance: "4,515 million km", year: "59,800 Earth days\n(about 165 years)", gravity: "1.12× Earth", moons: "16", temperature: -200, fact: "The windiest planet.\nIts winds can reach over 2,000 km/h.", kind: "Ice" }
};

const themedRoot = "Website%20build%20assets/Themed%20boxes/";
const $ = (selector) => document.querySelector(selector);
let activeSpeakerButton = null;
let earthWeightKg = 60;
let currentGravityRatio = 1;

function updatePlanetWeightReadouts() {
  $("#earth-weight-value").textContent = `${earthWeightKg} kg`;
  $("#planet-weight-value").textContent = `${Math.round(earthWeightKg * currentGravityRatio)} kg`;
}

function resetSpeakerButton(button) {
  if (!button) return;
  button.classList.remove("is-speaking");
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-label", "Read this aloud");
}

function speakPassage(button, passage) {
  if (!("speechSynthesis" in window)) return;
  const speech = window.speechSynthesis;
  if (activeSpeakerButton === button && speech.speaking) {
    speech.cancel();
    resetSpeakerButton(button);
    activeSpeakerButton = null;
    return;
  }
  speech.cancel();
  resetSpeakerButton(activeSpeakerButton);
  const copy = passage.querySelector(".read-aloud-copy");
  const clone = copy ? null : passage.cloneNode(true);
  clone?.querySelector(".read-aloud-button")?.remove();
  const text = (copy?.innerText || copy?.textContent || clone?.innerText || "").trim();
  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-AU";
  utterance.rate = .96;
  utterance.pitch = 1.04;
  const voices = speech.getVoices();
  utterance.voice = voices.find((voice) => voice.lang.toLowerCase().startsWith("en-au"))
    || voices.find((voice) => voice.lang.toLowerCase().startsWith("en-gb"))
    || voices.find((voice) => voice.lang.toLowerCase().startsWith("en-us"))
    || null;
  activeSpeakerButton = button;
  button.classList.add("is-speaking");
  button.setAttribute("aria-pressed", "true");
  button.setAttribute("aria-label", "Stop reading");
  utterance.onend = () => {
    if (activeSpeakerButton !== button) return;
    resetSpeakerButton(button);
    activeSpeakerButton = null;
  };
  utterance.onerror = utterance.onend;
  speech.speak(utterance);
}

function addReadAloudButtons() {
  const passages = [...document.querySelectorAll("p:not(.quiz-feedback):not(#quiz-result):not(.carousel-hint):not(.planet-sort-status), h1, h2, h3, .quiz-card legend")]
    .filter((passage) => !passage.closest(".group-text, .planet-info")
      && !passage.matches(".hero-copy h1, .hero-copy > p:not(.eyebrow), .intro-section .section-heading h2, .intro-section .intro-copy p, .explore-heading h2, .explore-heading > p"));
  passages.forEach((passage) => {
    const control = document.createElement("span");
    control.className = "read-aloud-wrap";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "read-aloud-button";
    if (passage.matches("h1, h2, h3, .quiz-card legend")) button.classList.add("is-heading");
    button.setAttribute("aria-label", "Read this aloud");
    button.setAttribute("aria-pressed", "false");
    button.title = "Read this aloud";
    button.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 8v4h3l4 3V5l-4 3h-3Z"/><path d="M13 7.2a4 4 0 0 1 0 5.6M15 5a7 7 0 0 1 0 10"/></svg>';
    button.disabled = !("speechSynthesis" in window);
    button.addEventListener("click", () => speakPassage(button, passage));
    const copy = document.createElement("span");
    copy.className = "read-aloud-copy";
    while (passage.firstChild) copy.append(passage.firstChild);
    control.append(button, copy);
    passage.append(control);
  });

  document.querySelectorAll(".group-text").forEach((card) => {
    const heading = card.querySelector("h3");
    const description = card.querySelector("p");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "read-aloud-button group-card-speaker";
    button.setAttribute("aria-label", `Read ${heading.textContent} card aloud`);
    button.setAttribute("aria-pressed", "false");
    button.title = `Read ${heading.textContent} card aloud`;
    button.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 8v4h3l4 3V5l-4 3h-3Z"/><path d="M13 7.2a4 4 0 0 1 0 5.6M15 5a7 7 0 0 1 0 10"/></svg>';
    button.disabled = !("speechSynthesis" in window);
    button.addEventListener("click", () => speakPassage(button, card));
    const copy = document.createElement("span");
    copy.className = "read-aloud-copy sr-only";
    copy.textContent = `${heading.textContent}. ${description.textContent}`;
    card.append(button, copy);
  });

  const sectionReadAloud = (heading, paragraphs, label) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "read-aloud-button is-heading section-read-aloud-button";
    button.setAttribute("aria-label", `Read ${label} section aloud`);
    button.setAttribute("aria-pressed", "false");
    button.title = `Read ${label} section aloud`;
    button.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 8v4h3l4 3V5l-4 3h-3Z"/><path d="M13 7.2a4 4 0 0 1 0 5.6M15 5a7 7 0 0 1 0 10"/></svg>';
    button.disabled = !("speechSynthesis" in window);
    button.addEventListener("click", () => speakPassage(button, heading));
    const copy = document.createElement("span");
    copy.className = "read-aloud-copy sr-only";
    copy.textContent = [heading.firstChild?.textContent?.trim(), ...paragraphs.map((paragraph) => paragraph.textContent.trim())].filter(Boolean).join(" ");
    heading.classList.add("section-heading-with-audio");
    heading.append(button, copy);
  };

  sectionReadAloud(
    document.querySelector(".hero-copy h1"),
    [...document.querySelectorAll(".hero-copy > p:not(.eyebrow)")],
    "The Solar System"
  );
  sectionReadAloud(
    document.querySelector(".intro-section .section-heading h2"),
    [...document.querySelectorAll(".intro-section .intro-copy p")],
    "What is the Solar System"
  );
  sectionReadAloud(
    document.querySelector(".explore-heading h2"),
    [...document.querySelectorAll(".explore-heading > p")],
    "Explore the Solar System"
  );

  const planetCardSpeaker = document.querySelector(".planet-title-speaker");
  planetCardSpeaker.disabled = !("speechSynthesis" in window);
  planetCardSpeaker.addEventListener("click", () => speakPassage(planetCardSpeaker, document.querySelector(".planet-info")));
}

const temperatureColorStops = [
  { at: 0, rgb: [246, 161, 75] },
  { at: .35, rgb: [230, 93, 132] },
  { at: .65, rgb: [145, 114, 235] },
  { at: 1, rgb: [80, 189, 226] }
];

function temperatureColor(temperature) {
  const position = Math.max(0, Math.min(1, (464 - temperature) / 664));
  let lower = temperatureColorStops[0];
  let upper = temperatureColorStops[temperatureColorStops.length - 1];
  for (let index = 1; index < temperatureColorStops.length; index += 1) {
    if (position <= temperatureColorStops[index].at) {
      lower = temperatureColorStops[index - 1];
      upper = temperatureColorStops[index];
      break;
    }
  }
  const amount = (position - lower.at) / (upper.at - lower.at);
  const rgb = lower.rgb.map((channel, index) => Math.round(channel + (upper.rgb[index] - channel) * amount));
  const [red, green, blue] = rgb;
  return {
    solid: `rgb(${red}, ${green}, ${blue})`,
    line: `rgba(${red}, ${green}, ${blue}, .3)`,
    glow: `rgba(${red}, ${green}, ${blue}, .4)`,
    strongGlow: `rgba(${red}, ${green}, ${blue}, .8)`,
    band: `rgba(${red}, ${green}, ${blue}, .14)`
  };
}

function updateOrbitTemperatureBand() {
  if (!orbitTemperatureBand) return;
  const selectedIndex = orbitPlanets.findIndex((button) => button.classList.contains("is-selected"));
  const selectedRing = orbitRings[selectedIndex];
  const outerRadius = Number.parseFloat(selectedRing?.style.width) / 2;
  if (selectedIndex < 0 || !Number.isFinite(outerRadius) || outerRadius <= 0) {
    orbitTemperatureBand.hidden = true;
    return;
  }

  const sun = carouselStage.querySelector(".carousel-sun");
  const sunRadius = sun.getBoundingClientRect().width / 2;
  const firstOrbitRadius = Number.parseFloat(orbitRings[0].style.width) / 2;
  const nextOrbitRadius = Number.parseFloat(orbitRings[1].style.width) / 2;
  const orbitSpacing = nextOrbitRadius - firstOrbitRadius;
  // One ring interval makes Earth's wash fade out by Venus.
  const innerRadius = Math.max(sunRadius + 8, outerRadius - orbitSpacing);
  const innerStop = Math.max(0, Math.min(99, (innerRadius / outerRadius) * 100));
  const selectedName = orbitPlanets[selectedIndex].dataset.planet;
  const color = temperatureColor(planets[selectedName].temperature);
  const centerX = carouselStage.querySelector(".carousel-origin").offsetLeft;
  const centerY = carouselStage.clientHeight / 2;

  orbitTemperatureBand.style.width = `${outerRadius * 2}px`;
  orbitTemperatureBand.style.height = `${outerRadius * 2}px`;
  orbitTemperatureBand.style.left = `${centerX}px`;
  orbitTemperatureBand.style.top = `${centerY}px`;
  orbitTemperatureBand.style.background = `radial-gradient(circle closest-side, transparent 0%, transparent ${innerStop}%, ${color.band} 100%)`;
  orbitTemperatureBand.hidden = false;
}

function selectPlanet(name, revealCard = true) {
  const data = planets[name];
  if (!data) return;
  $("#planet-name .planet-name-label").textContent = name;
  $(".planet-title-speaker").setAttribute("aria-label", `Read the ${name} planet card aloud`);
  $("#planet-type").textContent = data.type.toUpperCase();
  $("#gravity-value").textContent = data.gravity;
  const gravityRatio = Number.parseFloat(data.gravity);
  currentGravityRatio = gravityRatio;
  updatePlanetWeightReadouts();
  $("#year-value").textContent = data.year;
  $("#temperature-label").textContent = `${data.temperature < 0 ? "−" : ""}${Math.abs(data.temperature)}°C`;
  $("#moons-value").textContent = data.moons;
  $("#planet-fact").textContent = data.fact;
  $("#type-art").src = `${themedRoot}theme%20-%20${data.kind}.svg`;
  const temperatureProgress = Math.max(0, Math.min(100, ((464 - data.temperature) / 664) * 100));
  $("#temperature-marker").style.left = `${temperatureProgress}%`;

  document.querySelectorAll(".orbit-planet").forEach((button) => {
    const selected = button.dataset.planet === name;
    const planetData = planets[button.dataset.planet];
    const color = temperatureColor(planetData.temperature);
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    button.classList.toggle("has-landed", selected && revealCard);
    button.querySelector(".planet-landing-astronaut")?.remove();
    if (selected && revealCard) {
      const landedAstronaut = document.createElement("span");
      landedAstronaut.className = "planet-landing-astronaut astronaut-tint-wrap";
      const landedAstronautArt = document.createElement("img");
      landedAstronautArt.className = "gravity-astronaut";
      landedAstronautArt.src = gravityRatio > 1
        ? "Website%20build%20assets/Astro%20character%20kneeling.svg"
        : "Website%20build%20assets/Astro%20character%20standing.svg";
      landedAstronautArt.alt = "";
      landedAstronautArt.setAttribute("aria-hidden", "true");
      landedAstronaut.append(landedAstronautArt);
      landedAstronaut.setAttribute("aria-hidden", "true");
      landedAstronaut.classList.toggle("is-hot", data.temperature > 15);
      landedAstronaut.classList.toggle("is-cold", data.temperature < 15);
      landedAstronaut.style.setProperty("--astronaut-mask", `url("${landedAstronautArt.getAttribute("src")}")`);
      button.append(landedAstronaut);
    }
    button.style.setProperty("--planet-temperature-glow", color.glow);
    button.style.setProperty("--planet-temperature-glow-strong", color.strongGlow);
    const orbit = orbitRings.find((ring) => Number(ring.dataset.orbit) === planetData.order - 1);
    orbit.style.setProperty("--orbit-temperature-color", color.solid);
    orbit.style.setProperty("--orbit-temperature-line", color.line);
    orbit.style.setProperty("--orbit-temperature-glow", color.glow);
  });
  startStandingAstronautJumps(gravityRatio, revealCard);
  orbitRings.forEach((ring) => ring.classList.toggle("is-selected", Number(ring.dataset.orbit) === data.order - 1));
  updateOrbitTemperatureBand();
  if (revealCard) {
    planetCardOpen = true;
    planetInfo.hidden = false;
    explorer.classList.remove("is-card-hidden");
    carouselStage.classList.remove("has-astronaut-cursor");
    exploreAstronautCursor.classList.remove("is-visible");
    showDistanceGuide(name);
  } else {
    planetInfo.hidden = true;
    explorer.classList.add("is-card-hidden");
    hideDistanceGuide();
  }
}

const carouselStage = $("#carousel-stage");
const explorer = $(".explorer");
const planetInfo = $(".planet-info");
const orbitPlanets = [...document.querySelectorAll(".orbit-planet")];
const orbitRings = [...document.querySelectorAll(".orbit-ring")];
const orbitTemperatureBand = $("#orbit-temperature-band");
const distanceGuide = $("#distance-guide");
const distanceGuideLine = $("#distance-guide-line");
const distanceCallout = $("#distance-callout");
const orbitPhases = [-35, 4, -12, 72, 145, 210, 265, 290];
const orbitPeriods = [88, 225, 365, 687, 4331, 10747, 30589, 59800];
// Preserve the real speed order while compressing the range so every orbit remains visible.
const orbitSpeeds = orbitPeriods.map((period) => .65 * Math.pow(59800 / period, .35));
const orbitalAngles = orbitPlanets.map(() => 0);
// Keep Earth's initial position at roughly 2 o'clock (Earth's phase is -12°).
let carouselRotation = -18;
let dragState = null;
let suppressPlanetClick = false;
let carouselAnimation = 0;
let planetCardOpen = false;
let pointerOverPlanet = false;
let carouselIsVisible = false;
let autoRotationFrame = 0;
let previousAutoTime = 0;
const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const heroMercuryOrbit = $(".hero-mercury-orbit");
const heroMercury = $(".hero-mercury");
const exploreAstronautCursor = $(".explore-astronaut-cursor");
let heroMercuryIsVisible = false;
let heroMercuryFrame = 0;
const heroMercuryEpoch = performance.now();
let astronautJumpTimer = 0;
let astronautJumpAnimation = null;
let selectedGravityRatio = 1;

function renderHeroMercury(now) {
  if (!heroMercuryIsVisible || reducedMotionPreference.matches) return;
  const width = heroMercuryOrbit.clientWidth;
  const height = heroMercuryOrbit.clientHeight;
  const radiusX = (width - 1) / 2;
  const radiusY = (height - 1) / 2;
  const angle = ((now - heroMercuryEpoch) / 34000) * Math.PI * 2;
  heroMercury.style.left = `${radiusX * (1 + Math.sin(angle))}px`;
  heroMercury.style.top = `${radiusY * (1 - Math.cos(angle))}px`;
  heroMercuryFrame = requestAnimationFrame(renderHeroMercury);
}

function startHeroMercuryOrbit() {
  if (!heroMercuryIsVisible || reducedMotionPreference.matches || heroMercuryFrame) return;
  heroMercuryFrame = requestAnimationFrame(renderHeroMercury);
}

function stopHeroMercuryOrbit() {
  if (heroMercuryFrame) cancelAnimationFrame(heroMercuryFrame);
  heroMercuryFrame = 0;
}

function stopStandingAstronautJumps() {
  window.clearTimeout(astronautJumpTimer);
  astronautJumpTimer = 0;
  if (astronautJumpAnimation) astronautJumpAnimation.cancel();
  astronautJumpAnimation = null;
}

function startStandingAstronautJumps(gravityRatio, enabled) {
  stopStandingAstronautJumps();
  selectedGravityRatio = gravityRatio;
  if (!enabled || gravityRatio > 1 || reducedMotionPreference.matches) return;

  const scheduleJump = (delay) => {
    astronautJumpTimer = window.setTimeout(() => {
      if (!planetCardOpen || selectedGravityRatio > 1 || reducedMotionPreference.matches) return;
      const astronaut = $(".orbit-planet.is-selected .planet-landing-astronaut .gravity-astronaut");
      if (!astronaut) {
        scheduleJump(250);
        return;
      }
      const airtime = Math.max(360, Math.min(2100, 800 / selectedGravityRatio));
      const jumpHeight = Math.max(8, Math.min(28, 12 / selectedGravityRatio));
      astronautJumpAnimation = astronaut.animate([
        { transform: "translateY(0)", easing: "cubic-bezier(.28,.72,.36,1)" },
        { transform: `translateY(-${jumpHeight}px)`, offset: .42, easing: "cubic-bezier(.52,0,.86,.36)" },
        { transform: "translateY(0)" }
      ], { duration: airtime, fill: "none" });
      scheduleJump(4000);
    }, delay);
  };

  scheduleJump(1000);
}

function pointerAngle(event) {
  const origin = carouselStage.querySelector(".carousel-origin").getBoundingClientRect();
  return Math.atan2(event.clientY - origin.top, event.clientX - origin.left);
}

function wrapAngleDelta(delta) {
  return Math.atan2(Math.sin(delta), Math.cos(delta));
}

function stopAutoRotation() {
  if (autoRotationFrame) cancelAnimationFrame(autoRotationFrame);
  autoRotationFrame = 0;
  previousAutoTime = 0;
}

function runAutoRotation(now) {
  if (!autoRotationFrame) return;
  if (previousAutoTime) {
    const elapsed = Math.min(40, now - previousAutoTime);
    const elapsedSeconds = elapsed / 1000;
    orbitalAngles.forEach((angle, index) => {
      orbitalAngles[index] = (angle + orbitSpeeds[index] * elapsedSeconds) % 360;
    });
    renderCarousel();
  }
  previousAutoTime = now;
  autoRotationFrame = requestAnimationFrame(runAutoRotation);
}

function startAutoRotation() {
  if (!carouselIsVisible || reducedMotionPreference.matches || planetCardOpen || pointerOverPlanet || dragState || autoRotationFrame) return;
  previousAutoTime = 0;
  autoRotationFrame = requestAnimationFrame(runAutoRotation);
}

reducedMotionPreference.addEventListener?.("change", (event) => {
  if (event.matches) {
    stopAutoRotation();
    stopStandingAstronautJumps();
    stopHeroMercuryOrbit();
  } else {
    startAutoRotation();
    startStandingAstronautJumps(selectedGravityRatio, planetCardOpen);
    startHeroMercuryOrbit();
  }
});

function clearPlanetSelection() {
  orbitPlanets.forEach((button) => {
    button.classList.remove("is-selected");
    button.classList.remove("has-landed");
    button.querySelector(".planet-landing-astronaut")?.remove();
    button.setAttribute("aria-pressed", "false");
  });
  orbitRings.forEach((ring) => ring.classList.remove("is-selected"));
  orbitTemperatureBand.hidden = true;
}

function closeCardAndResume() {
  planetCardOpen = false;
  stopStandingAstronautJumps();
  planetInfo.hidden = true;
  explorer.classList.add("is-card-hidden");
  hideDistanceGuide();
  clearPlanetSelection();
  startAutoRotation();
}

function updateDistanceGuidePosition() {
  const selectedButton = orbitPlanets.find((button) => button.classList.contains("is-selected"));
  if (!selectedButton || distanceCallout.hidden) return;
  const stageWidth = carouselStage.clientWidth;
  const stageHeight = carouselStage.clientHeight;
  const centerX = carouselStage.querySelector(".carousel-origin").offsetLeft;
  const centerY = stageHeight / 2;
  const planetX = centerX + Number.parseFloat(selectedButton.style.getPropertyValue("--orbit-offset-x"));
  const planetY = centerY + Number.parseFloat(selectedButton.style.getPropertyValue("--orbit-offset-y"));
  const planetRadius = Number.parseFloat(selectedButton.style.width) / 2;
  const sunRadius = carouselStage.querySelector(".carousel-sun").getBoundingClientRect().width / 2;
  const dx = planetX - centerX;
  const dy = planetY - centerY;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const x1 = centerX + ux * (sunRadius + 9);
  const y1 = centerY + uy * (sunRadius + 9);
  const x2 = planetX - ux * (planetRadius + 8);
  const y2 = planetY - uy * (planetRadius + 8);
  distanceGuide.setAttribute("viewBox", `0 0 ${stageWidth} ${stageHeight}`);
  distanceGuideLine.setAttribute("x1", x1);
  distanceGuideLine.setAttribute("y1", y1);
  distanceGuideLine.setAttribute("x2", x2);
  distanceGuideLine.setAttribute("y2", y2);
  const calloutRect = distanceCallout.getBoundingClientRect();
  const calloutWidth = calloutRect.width;
  const calloutHeight = calloutRect.height;
  const stageRect = carouselStage.getBoundingClientRect();
  const selectedRect = selectedButton.getBoundingClientRect();
  const selectedCenterX = selectedRect.left - stageRect.left + selectedRect.width / 2;
  const selectedCenterY = selectedRect.top - stageRect.top + selectedRect.height / 2;
  const selectedRadiusX = selectedRect.width / 2;
  const selectedRadiusY = selectedRect.height / 2;
  const selectedLabel = selectedButton.querySelector(".orbit-planet-label");
  const selectedLabelRect = selectedLabel.getBoundingClientRect();
  const selectedLabelLeft = selectedLabelRect.left - stageRect.left;
  const selectedLabelBottom = selectedLabelRect.bottom - stageRect.top;
  const padding = 10;
  const clamp = (value, max) => Math.max(padding, Math.min(max - calloutWidth - padding, value));
  const clampTop = (value) => Math.max(padding, Math.min(stageHeight - calloutHeight - padding, value));
  const candidateOffsets = [
    [selectedLabelLeft, selectedLabelBottom + 8],
    [selectedCenterX + selectedRadiusX + 14, selectedCenterY - calloutHeight / 2],
    [selectedCenterX - selectedRadiusX - calloutWidth - 14, selectedCenterY - calloutHeight / 2],
    [selectedCenterX - calloutWidth / 2, selectedCenterY - selectedRadiusY - calloutHeight - 14],
    [selectedCenterX - calloutWidth / 2, selectedCenterY + selectedRadiusY + 14],
    [selectedCenterX + selectedRadiusX + 14, selectedCenterY - selectedRadiusY - calloutHeight - 10],
    [selectedCenterX + selectedRadiusX + 14, selectedCenterY + selectedRadiusY + 10],
    [selectedCenterX - selectedRadiusX - calloutWidth - 14, selectedCenterY - selectedRadiusY - calloutHeight - 10],
    [selectedCenterX - selectedRadiusX - calloutWidth - 14, selectedCenterY + selectedRadiusY + 10]
  ];
  const planetRects = orbitPlanets.map((button) => {
    const rect = button.getBoundingClientRect();
    return {
      left: rect.left - stageRect.left - 8,
      top: rect.top - stageRect.top - 8,
      right: rect.right - stageRect.left + 8,
      bottom: rect.bottom - stageRect.top + 8,
      weight: 1
    };
  });
  const visibleNameTags = orbitPlanets.flatMap((button) => {
    if (!button.classList.contains("is-selected") && !button.matches(":hover, :focus-visible")) return [];
    const label = button.querySelector(".orbit-planet-label");
    if (!label) return [];
    const rect = label.getBoundingClientRect();
    return [{
      left: rect.left - stageRect.left - 5,
      top: rect.top - stageRect.top - 5,
      right: rect.right - stageRect.left + 5,
      bottom: rect.bottom - stageRect.top + 5,
      weight: 8
    }];
  });
  const sunRect = carouselStage.querySelector(".carousel-sun").getBoundingClientRect();
  const sunObstacle = [{
    left: sunRect.left - stageRect.left - 24,
    top: sunRect.top - stageRect.top - 24,
    right: sunRect.right - stageRect.left + 24,
    bottom: sunRect.bottom - stageRect.top + 24,
    weight: 8
  }];
  const obstacles = [...sunObstacle, ...planetRects, ...visibleNameTags];
  const candidates = candidateOffsets.map(([left, top], index) => ({
    left: clamp(left, stageWidth),
    top: clampTop(top),
    preference: index
  }));
  const scoreCandidate = (candidate) => obstacles.reduce((score, obstacle) => {
    const overlapWidth = Math.max(0, Math.min(candidate.left + calloutWidth, obstacle.right) - Math.max(candidate.left, obstacle.left));
    const overlapHeight = Math.max(0, Math.min(candidate.top + calloutHeight, obstacle.bottom) - Math.max(candidate.top, obstacle.top));
    return score + overlapWidth * overlapHeight * obstacle.weight;
  }, candidate.preference * 0.01);
  const placement = candidates.reduce((best, candidate) => scoreCandidate(candidate) < scoreCandidate(best) ? candidate : best);
  distanceCallout.style.left = `${placement.left}px`;
  distanceCallout.style.top = `${placement.top}px`;
}

function showDistanceGuide(name) {
  const data = planets[name];
  if (!data) return;
  $("#distance-callout-value").textContent = data.distance;
  distanceGuide.hidden = false;
  distanceCallout.hidden = false;
  updateDistanceGuidePosition();
}

function hideDistanceGuide() {
  distanceGuide.hidden = true;
  distanceCallout.hidden = true;
}

function renderCarousel() {
  if (!carouselStage) return;
  const stageWidth = carouselStage.clientWidth;
  const stageHeight = carouselStage.clientHeight;
  const origin = carouselStage.querySelector(".carousel-origin");
  const centerX = origin.offsetLeft;
  const centerY = stageHeight / 2;
  const sun = carouselStage.querySelector(".carousel-sun");
  const sunRadius = sun.getBoundingClientRect().width / 2;
  const sizeScale = stageWidth < 480 ? 1.3 : stageWidth < 900 ? 1.45 : 1.55;
  const buttonSizes = orbitPlanets.map((button) => (Number.parseFloat(button.style.getPropertyValue("--planet-size")) || 32) * sizeScale);
  const maxNodeRadius = Math.max(...buttonSizes) / 2;
  const firstRadius = sunRadius + 24;
  // A little more radial room between rings, while preserving a safe edge for
  // the outer planet and the distance callout near the info card.
  const outerLimit = Math.min(stageHeight / 2 - maxNodeRadius - 8, stageWidth - centerX - maxNodeRadius - 18);
  const lastRadius = Math.max(firstRadius + (orbitPlanets.length - 1) * 12, outerLimit);
  const radialStep = (lastRadius - firstRadius) / (orbitPlanets.length - 1);
  const rotationRadians = (carouselRotation * Math.PI) / 180;

  orbitPlanets.forEach((button, index) => {
    const size = buttonSizes[index];
    const radius = firstRadius + radialStep * index;
    const angle = rotationRadians + ((orbitPhases[index] + orbitalAngles[index]) * Math.PI) / 180;
    button.style.setProperty("--orbit-offset-x", `${Math.cos(angle) * radius}px`);
    button.style.setProperty("--orbit-offset-y", `${Math.sin(angle) * radius}px`);
    if (button.style.width !== `${size}px`) button.style.width = `${size}px`;
    if (button.style.height !== `${size}px`) button.style.height = `${size}px`;
    const planetLayer = String(10 + index);
    if (button.style.zIndex !== planetLayer) button.style.zIndex = planetLayer;
  });

  orbitRings.forEach((ring, index) => {
    const ringRadius = firstRadius + radialStep * index;
    ring.style.width = `${ringRadius * 2}px`;
    ring.style.height = `${ringRadius * 2}px`;
    ring.style.left = `${centerX}px`;
    ring.style.top = `${centerY}px`;
  });
  updateOrbitTemperatureBand();
  updateDistanceGuidePosition();
}

function focusPlanet(name) {
  planetCardOpen = true;
  stopAutoRotation();
  if (carouselAnimation) cancelAnimationFrame(carouselAnimation);
  hideDistanceGuide();
  const start = carouselRotation;
  const index = orbitPlanets.findIndex((button) => button.dataset.planet === name);
  const targetRotation = -(orbitPhases[index] + orbitalAngles[index]);
  const shortestTurn = (((targetRotation - start + 180) % 360) + 360) % 360 - 180;
  const settledRotation = start + shortestTurn;
  const prefersReducedMotion = reducedMotionPreference.matches;
  if (Math.abs(shortestTurn) < 1 || prefersReducedMotion) {
    carouselRotation = settledRotation;
    renderCarousel();
    selectPlanet(name);
    return;
  }

  const startedAt = performance.now();
  const duration = 620;
  const animate = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    carouselRotation = start + shortestTurn * eased;
    renderCarousel();
    if (progress < 1) carouselAnimation = requestAnimationFrame(animate);
    else {
      carouselAnimation = 0;
      carouselRotation = settledRotation;
      renderCarousel();
      selectPlanet(name);
    }
  };
  carouselAnimation = requestAnimationFrame(animate);
}

orbitPlanets.forEach((button) => {
  button.addEventListener("click", (event) => {
    if (suppressPlanetClick) {
      event.preventDefault();
      suppressPlanetClick = false;
      return;
    }
    focusPlanet(button.dataset.planet);
  });
  button.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "touch") return;
    pointerOverPlanet = true;
    stopAutoRotation();
  });
  button.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "touch") return;
    pointerOverPlanet = false;
    startAutoRotation();
  });
});

explorer.addEventListener("click", (event) => {
  if (event.target.closest(".orbit-planet, .planet-info")) return;
  closeCardAndResume();
});

carouselStage.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
  stopAutoRotation();
  if (carouselAnimation) {
    cancelAnimationFrame(carouselAnimation);
    carouselAnimation = 0;
  }
  hideDistanceGuide();
  const angle = pointerAngle(event);
  dragState = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, lastAngle: angle, lastTime: performance.now(), velocity: 0, moved: false, capture: event.target.closest(".orbit-planet") || carouselStage };
  dragState.capture.setPointerCapture?.(event.pointerId);
  carouselStage.classList.add("is-dragging");
});

carouselStage.addEventListener("pointermove", (event) => {
  if (!dragState || dragState.pointerId !== event.pointerId) return;
  const totalMovement = Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY);
  if (totalMovement > 5) dragState.moved = true;
  if (dragState.moved) {
    const now = performance.now();
    const delta = wrapAngleDelta(pointerAngle(event) - dragState.lastAngle);
    const elapsed = Math.max(1, now - dragState.lastTime);
    const instantaneousVelocity = Math.max(-1.2, Math.min(1.2, (delta * 180 / Math.PI) / elapsed));
    dragState.velocity = dragState.velocity * .68 + instantaneousVelocity * .32;
    carouselRotation += delta * 180 / Math.PI;
    renderCarousel();
    dragState.lastTime = now;
  }
  dragState.lastAngle = pointerAngle(event);
});

function finishCarouselDrag(event) {
  if (!dragState || dragState.pointerId !== event.pointerId) return;
  if (dragState.moved) {
    suppressPlanetClick = true;
    window.setTimeout(() => { suppressPlanetClick = false; }, 80);
  }
  if (dragState.capture.hasPointerCapture?.(event.pointerId)) dragState.capture.releasePointerCapture(event.pointerId);
  const finalVelocity = dragState.moved ? dragState.velocity : 0;
  dragState = null;
  carouselStage.classList.remove("is-dragging");
  if (Math.abs(finalVelocity) > .025) {
    let velocity = finalVelocity;
    let previousTime = performance.now();
    const glide = (now) => {
      const elapsed = Math.min(40, now - previousTime);
      previousTime = now;
      carouselRotation += velocity * elapsed;
      velocity *= Math.exp(-.008 * elapsed);
      renderCarousel();
      if (Math.abs(velocity) > .015) carouselAnimation = requestAnimationFrame(glide);
      else {
        carouselAnimation = 0;
        const selected = orbitPlanets.find((button) => button.classList.contains("is-selected"));
        if (selected && !planetInfo.hidden) showDistanceGuide(selected.dataset.planet);
        else hideDistanceGuide();
        startAutoRotation();
      }
    };
    carouselAnimation = requestAnimationFrame(glide);
  } else {
    const selected = orbitPlanets.find((button) => button.classList.contains("is-selected"));
    if (selected && !planetInfo.hidden) showDistanceGuide(selected.dataset.planet);
    else hideDistanceGuide();
    startAutoRotation();
  }
}

carouselStage.addEventListener("pointerup", finishCarouselDrag);
carouselStage.addEventListener("pointercancel", finishCarouselDrag);
carouselStage.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  carouselRotation += event.key === "ArrowRight" ? 15 : -15;
  renderCarousel();
});

window.addEventListener("resize", renderCarousel);
if ("ResizeObserver" in window) new ResizeObserver(renderCarousel).observe(carouselStage);
if ("IntersectionObserver" in window) {
  const carouselVisibilityObserver = new IntersectionObserver((entries) => {
    carouselIsVisible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= .05);
    if (carouselIsVisible) startAutoRotation();
    else stopAutoRotation();
  }, { threshold: [0, .05] });
  carouselVisibilityObserver.observe(carouselStage);
} else {
  carouselIsVisible = true;
}
renderCarousel();

const planetStrip = $(".solar-line");
const planetSortStatus = $(".planet-sort-status");
const sortTokens = [...document.querySelectorAll(".sortable-planet")];
const dropZones = [...document.querySelectorAll(".planet-dropzone")];
const sortSources = new Map(sortTokens.map((token) => [token, token.parentElement]));
const sortResetButton = $(".planet-sort-reset");
const sortCelebration = $(".planet-sort-celebration");
let selectedSortToken = null;
let activePlanetDrag = null;
let suppressSortClick = false;
let placedPlanetCount = 0;
let completionFadeTimer = 0;

function setSortStatus(message) {
  planetSortStatus.textContent = message;
}

function getDropZoneAtPoint(x, y) {
  return dropZones.find((zone) => {
    const bounds = zone.getBoundingClientRect();
    return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
  }) || null;
}

function celebratePlanetOrder() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  sortCelebration.replaceChildren();
  for (let index = 0; index < 7; index += 1) {
    const star = document.createElement("span");
    star.className = "sort-shooting-star";
    const movingUp = index % 2 === 1;
    const top = movingUp ? 72 + Math.random() * 18 : 4 + Math.random() * 18;
    const angle = movingUp ? -(8 + Math.random() * 4) : 8 + Math.random() * 4;
    star.style.setProperty("--star-top", `${top}%`);
    star.style.setProperty("--star-angle", `${angle}deg`);
    star.style.setProperty("--star-delay", `${index * 420 + Math.random() * 180}ms`);
    star.style.setProperty("--star-duration", `${1500 + Math.random() * 900}ms`);
    sortCelebration.append(star);
    star.addEventListener("animationend", () => star.remove(), { once: true });
  }
}

function resetPlanetOrder() {
  window.clearTimeout(completionFadeTimer);
  if (activePlanetDrag) {
    activePlanetDrag.hoverZone?.classList.remove("is-drop-target");
    activePlanetDrag.token.classList.remove("is-dragging");
    activePlanetDrag.token.style.removeProperty("--drag-x");
    activePlanetDrag.token.style.removeProperty("--drag-y");
    activePlanetDrag = null;
  }
  sortTokens.forEach((token) => {
    token.classList.remove("is-placed", "is-keyboard-selected", "is-dragging");
    token.style.removeProperty("--drag-x");
    token.style.removeProperty("--drag-y");
    token.setAttribute("aria-label", `${token.dataset.planet}, drag to its place`);
    sortSources.get(token).append(token);
  });
  document.querySelectorAll(".planet-target-cell").forEach((cell) => {
    cell.classList.remove("is-filled", "is-wrong");
    const zone = cell.querySelector(".planet-dropzone");
    zone.setAttribute("aria-label", Number(cell.dataset.slot) === 1
      ? "Position 1, closest to the Sun"
      : Number(cell.dataset.slot) === 8
        ? "Position 8, farthest from the Sun"
        : `Position ${cell.dataset.slot} from the Sun`);
  });
  selectedSortToken = null;
  placedPlanetCount = 0;
  sortCelebration.replaceChildren();
  planetSortStatus.classList.remove("is-fading");
  setSortStatus("Drag each planet into its correct place from the Sun.");
}

sortResetButton.addEventListener("click", resetPlanetOrder);

function placePlanetInOrder(token, zone) {
  if (!token || !zone) return false;
  const targetCell = zone.closest(".planet-target-cell");
  const targetHadFocus = document.activeElement === zone;
  if (targetCell.classList.contains("is-filled")) return false;
  if (Number(token.dataset.order) !== Number(targetCell.dataset.slot)) {
    targetCell.classList.remove("is-wrong");
    void targetCell.offsetWidth;
    targetCell.classList.add("is-wrong");
    window.setTimeout(() => targetCell.classList.remove("is-wrong"), 500);
    setSortStatus("Not quite. Try a different position for that planet.");
    return false;
  }

  targetCell.append(token);
  targetCell.classList.add("is-filled");
  token.classList.add("is-placed");
  token.classList.remove("is-keyboard-selected");
  token.style.removeProperty("--drag-x");
  token.style.removeProperty("--drag-y");
  token.setAttribute("aria-label", `${token.dataset.planet}, correctly placed`);
  zone.setAttribute("aria-label", `${token.dataset.planet}, correctly placed in position ${targetCell.dataset.slot} from the Sun`);
  placedPlanetCount += 1;
  selectedSortToken = null;
  if (placedPlanetCount === sortTokens.length) {
    setSortStatus("Great work! All eight planets are in order from the Sun.");
    celebratePlanetOrder();
    completionFadeTimer = window.setTimeout(() => planetSortStatus.classList.add("is-fading"), 2000);
  } else {
    setSortStatus(`${token.dataset.planet} is in the right place. ${placedPlanetCount} of 8 planets placed.`);
  }
  if (targetHadFocus) sortTokens.find((item) => !item.classList.contains("is-placed"))?.focus();
  return true;
}

sortTokens.forEach((token) => {
  token.addEventListener("click", () => {
    if (suppressSortClick) {
      suppressSortClick = false;
      return;
    }
    if (token.classList.contains("is-placed")) return;
    sortTokens.forEach((item) => item.classList.toggle("is-keyboard-selected", item === token));
    selectedSortToken = token;
    setSortStatus(`${token.dataset.planet} selected. Choose its position from the Sun.`);
  });

  token.addEventListener("pointerdown", (event) => {
    if (token.classList.contains("is-placed") || event.button > 0) return;
    selectedSortToken = null;
    sortTokens.forEach((item) => item.classList.remove("is-keyboard-selected"));
    activePlanetDrag = { token, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false, hoverZone: null };
    token.classList.add("is-dragging");
    token.setPointerCapture(event.pointerId);
  });

  token.addEventListener("pointermove", (event) => {
    if (!activePlanetDrag || activePlanetDrag.token !== token || activePlanetDrag.pointerId !== event.pointerId) return;
    const dx = event.clientX - activePlanetDrag.startX;
    const dy = event.clientY - activePlanetDrag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) activePlanetDrag.moved = true;
    token.style.setProperty("--drag-x", `${dx}px`);
    token.style.setProperty("--drag-y", `${dy}px`);
    const nextZone = getDropZoneAtPoint(event.clientX, event.clientY);
    activePlanetDrag.hoverZone?.classList.remove("is-drop-target");
    activePlanetDrag.hoverZone = nextZone;
    nextZone?.classList.add("is-drop-target");
  });

  token.addEventListener("pointerup", (event) => {
    if (!activePlanetDrag || activePlanetDrag.token !== token || activePlanetDrag.pointerId !== event.pointerId) return;
    const drag = activePlanetDrag;
    const zone = getDropZoneAtPoint(event.clientX, event.clientY);
    drag.hoverZone?.classList.remove("is-drop-target");
    token.classList.remove("is-dragging");
    token.style.removeProperty("--drag-x");
    token.style.removeProperty("--drag-y");
    activePlanetDrag = null;
    if (drag.moved) {
      suppressSortClick = true;
      window.setTimeout(() => { suppressSortClick = false; }, 80);
      if (zone) placePlanetInOrder(token, zone);
    }
  });

  token.addEventListener("pointercancel", () => {
    if (!activePlanetDrag || activePlanetDrag.token !== token) return;
    activePlanetDrag.hoverZone?.classList.remove("is-drop-target");
    token.classList.remove("is-dragging");
    token.style.removeProperty("--drag-x");
    token.style.removeProperty("--drag-y");
    activePlanetDrag = null;
  });
});

dropZones.forEach((zone) => {
  zone.addEventListener("click", () => {
    if (zone.closest(".planet-target-cell").classList.contains("is-filled")) return;
    if (!selectedSortToken) {
      setSortStatus("Choose a planet, then choose where it belongs from the Sun.");
      return;
    }
    placePlanetInOrder(selectedSortToken, zone);
  });
});

document.querySelectorAll(".group-unit").forEach((group) => {
  const type = ["rock-group", "gas-group", "ice-group"].find((name) => group.classList.contains(name))?.replace("-group", "");
  if (!type) return;
  const trigger = group.querySelector(".group-trigger");
  const card = group.querySelector(".group-card");
  const close = group.querySelector(".group-close");
  trigger.addEventListener("click", () => {
    group.classList.add("is-open");
    trigger.hidden = true;
    trigger.setAttribute("aria-expanded", "true");
    card.hidden = false;
    close.focus();
  });
  close.addEventListener("click", () => {
    card.hidden = true;
    trigger.hidden = false;
    trigger.setAttribute("aria-expanded", "false");
    group.classList.remove("is-open");
    trigger.focus();
  });
  group.addEventListener("pointerenter", () => planetStrip.classList.add("is-hover-" + type));
  group.addEventListener("pointerleave", () => planetStrip.classList.remove("is-hover-" + type));
});

const mnemonicDialog = $("#mnemonic-dialog");
document.querySelectorAll("[data-open-mnemonic]").forEach((button) => {
  button.addEventListener("click", () => mnemonicDialog.showModal());
});
$("[data-close-dialog]").addEventListener("click", () => mnemonicDialog.close());
mnemonicDialog.addEventListener("click", (event) => {
  if (event.target === mnemonicDialog) mnemonicDialog.close();
});

const sunQuestion = document.querySelector('[data-question="2"]');
const sunDragButton = sunQuestion.querySelector(".sun-drag-button");
const sunInteractionStatus = $("#sun-interaction-status");
const sunAnswerTargets = [...sunQuestion.querySelectorAll(".sun-answer-target")];
let sunDrag = null;
let suppressSunClick = false;

function resetSunDrag() {
  sunDragButton.classList.remove("is-dragging");
  sunDragButton.style.removeProperty("--drag-x");
  sunDragButton.style.removeProperty("--drag-y");
  sunAnswerTargets.forEach((target) => target.classList.remove("is-drop-target"));
  sunDrag = null;
}

function placeSunInTarget(target) {
  if (!target) return;
  const interactionBounds = sunQuestion.querySelector(".sun-question-interaction").getBoundingClientRect();
  const placedBounds = target.querySelector(".answer-circle").getBoundingClientRect();
  sunDragButton.classList.add("is-placement-instant");
  sunDragButton.style.setProperty("--placed-x", `${placedBounds.left + placedBounds.width / 2 - interactionBounds.left}px`);
  sunDragButton.style.setProperty("--placed-y", `${placedBounds.top + placedBounds.height / 2 - interactionBounds.top}px`);
  sunDragButton.classList.add("is-placed");
  sunQuestion.querySelector(".sun-question-interaction").classList.add("has-placed-sun");
  requestAnimationFrame(() => {
    const renderedSun = sunDragButton.getBoundingClientRect();
    const renderedCircle = target.querySelector(".answer-circle").getBoundingClientRect();
    const currentX = Number.parseFloat(sunDragButton.style.getPropertyValue("--placed-x")) || 0;
    const currentY = Number.parseFloat(sunDragButton.style.getPropertyValue("--placed-y")) || 0;
    sunDragButton.style.setProperty("--placed-x", `${currentX + renderedCircle.left + renderedCircle.width / 2 - renderedSun.left - renderedSun.width / 2}px`);
    sunDragButton.style.setProperty("--placed-y", `${currentY + renderedCircle.top + renderedCircle.height / 2 - renderedSun.top - renderedSun.height / 2}px`);
    requestAnimationFrame(() => sunDragButton.classList.remove("is-placement-instant"));
  });
}

sunDragButton.addEventListener("click", () => {
  if (suppressSunClick) {
    suppressSunClick = false;
    return;
  }
  const armed = sunDragButton.getAttribute("aria-pressed") !== "true";
  sunDragButton.setAttribute("aria-pressed", String(armed));
  sunInteractionStatus.textContent = armed
    ? "Sun selected. Choose True, False, or I don't know."
    : "Sun is ready to drag to an answer.";
});

sunDragButton.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  sunDrag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
  sunDragButton.setPointerCapture(event.pointerId);
});

sunDragButton.addEventListener("pointermove", (event) => {
  if (!sunDrag || sunDrag.pointerId !== event.pointerId) return;
  const dx = event.clientX - sunDrag.x;
  const dy = event.clientY - sunDrag.y;
  if (!sunDrag.moved && Math.hypot(dx, dy) < 6) return;
  sunDrag.moved = true;
  sunDragButton.classList.add("is-dragging");
  sunDragButton.style.setProperty("--drag-x", `${dx}px`);
  sunDragButton.style.setProperty("--drag-y", `${dy}px`);
  const hit = document.elementFromPoint(event.clientX, event.clientY)?.closest(".sun-answer-target");
  sunAnswerTargets.forEach((target) => target.classList.toggle("is-drop-target", target === hit));
});

sunDragButton.addEventListener("pointerup", (event) => {
  if (!sunDrag || sunDrag.pointerId !== event.pointerId) return;
  const moved = sunDrag.moved;
  const dropTarget = moved
    ? document.elementFromPoint(event.clientX, event.clientY)?.closest(".sun-answer-target")
    : null;
  if (dropTarget && sunQuestion.contains(dropTarget)) {
    const answer = dropTarget.querySelector('input[type="radio"]');
    answer.checked = true;
    placeSunInTarget(dropTarget);
    sunDragButton.setAttribute("aria-pressed", "false");
    sunInteractionStatus.textContent = `Answer selected: ${dropTarget.querySelector("span:last-child").textContent}.`;
  }
  if (moved) {
    suppressSunClick = true;
    window.setTimeout(() => { suppressSunClick = false; }, 0);
  }
  resetSunDrag();
});

sunDragButton.addEventListener("pointercancel", resetSunDrag);
sunQuestion.querySelectorAll('input[name="sun"]').forEach((input) => {
  input.addEventListener("change", () => {
    const label = input.closest(".sun-answer-target");
    placeSunInTarget(label);
    sunInteractionStatus.textContent = `Answer selected: ${label.querySelector("span:last-child").textContent}.`;
    sunDragButton.setAttribute("aria-pressed", "false");
  });
});

const quizForm = $("#quiz-form");
quizForm.addEventListener("submit", (event) => {
  event.preventDefault();
  let correct = 0;
  let answered = 0;
  document.querySelectorAll(".quiz-card[data-question]").forEach((card) => {
    const feedback = card.querySelector(".quiz-feedback");
    feedback.classList.remove("is-right", "is-wrong");
    if (card.dataset.question === "3") {
      const answer = $("#written-answer").value.trim();
      if (!answer) {
        feedback.textContent = "Add your own description, then check again.";
        feedback.classList.add("is-wrong");
      } else {
        answered += 1;
        feedback.textContent = "Nice work putting it into your own words! The Solar System is the Sun and everything that travels around it.";
        feedback.classList.add("is-right");
      }
      return;
    }
    const selected = card.querySelector("input:checked");
    if (!selected) {
      feedback.textContent = "Choose an answer to check this one.";
      feedback.classList.add("is-wrong");
      return;
    }
    answered += 1;
    const isCorrect = selected.value === "right";
    if (isCorrect) correct += 1;
    feedback.textContent = isCorrect
      ? "That's right!"
      : card.dataset.question === "1"
        ? "Not quite. The rocky planets are Mercury, Venus, Earth and Mars."
        : "Not quite. The Sun is a star, not a planet.";
    feedback.classList.add(isCorrect ? "is-right" : "is-wrong");
  });
  const result = $("#quiz-result");
  result.textContent = answered === 3
    ? `You got ${correct} of 2 scored questions right — and shared your own explanation. ${correct === 2 ? "Fantastic exploring!" : "Keep exploring and give it another go!"}`
    : "Answer all three questions to finish your check-in.";
});

addReadAloudButtons();
const earthWeightSlider = $("#earth-weight-slider");
const weightSliderControl = earthWeightSlider.closest(".weight-slider-control");
const updateWeightDragHint = () => {
  const min = Number(earthWeightSlider.min);
  const max = Number(earthWeightSlider.max);
  const progress = (Number(earthWeightSlider.value) - min) / (max - min);
  const thumbSize = 13;
  const thumbCenter = thumbSize / 2 + (weightSliderControl.clientWidth - thumbSize) * progress;
  weightSliderControl.style.setProperty("--weight-hint-x", `${thumbCenter}px`);
};
earthWeightSlider.addEventListener("input", () => {
  earthWeightKg = Number(earthWeightSlider.value);
  updatePlanetWeightReadouts();
  updateWeightDragHint();
});
new ResizeObserver(updateWeightDragHint).observe(weightSliderControl);
updateWeightDragHint();
if ("IntersectionObserver" in window) {
  const heroMercuryObserver = new IntersectionObserver((entries) => {
    heroMercuryIsVisible = entries.some((entry) => entry.isIntersecting);
    if (heroMercuryIsVisible) startHeroMercuryOrbit();
    else stopHeroMercuryOrbit();
  }, { threshold: 0 });
  heroMercuryObserver.observe(heroMercuryOrbit.closest(".hero"));
} else {
  heroMercuryIsVisible = true;
  startHeroMercuryOrbit();
}

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const exploreAstronautCursorArt = exploreAstronautCursor.querySelector("img");
const floatingAstronautArt = "Website%20build%20assets/Astro%20character%20Floating.svg";
const standingAstronautArt = "Website%20build%20assets/Astro%20character%20standing.svg";
function updateExploreAstronautPose(event) {
  const hoveredPlanet = event.target instanceof Element && event.target.closest(".orbit-planet");
  const pose = hoveredPlanet ? "standing" : "floating";
  if (exploreAstronautCursor.dataset.pose === pose) return;
  exploreAstronautCursor.dataset.pose = pose;
  exploreAstronautCursorArt.src = pose === "standing" ? standingAstronautArt : floatingAstronautArt;
}
function moveExploreAstronautCursor(event) {
  if (!finePointer.matches || event.pointerType === "touch") return;
  updateExploreAstronautPose(event);
  carouselStage.classList.add("has-astronaut-cursor");
  exploreAstronautCursor.style.left = `${event.clientX}px`;
  exploreAstronautCursor.style.top = `${event.clientY}px`;
  exploreAstronautCursor.classList.add("is-visible");
}
carouselStage.addEventListener("pointerenter", moveExploreAstronautCursor);
carouselStage.addEventListener("pointermove", moveExploreAstronautCursor);
carouselStage.addEventListener("pointerleave", () => {
  carouselStage.classList.remove("has-astronaut-cursor");
  exploreAstronautCursor.classList.remove("is-visible");
});

selectPlanet("Earth", false);
clearPlanetSelection();
startAutoRotation();
