const { useEffect, useMemo, useState } = React;

const AUSTRIA_CENTER = { x: 52, y: 54 };
const AUSTRIA_LATLNG = [47.65, 14.2];
const regionLatLng = {
  BURGENLAND: [47.48, 16.55],
  "KÄRNTEN": [46.75, 14.25],
  "NIEDERÖSTERREICH": [48.25, 15.85],
  "OBERÖSTERREICH": [48.2, 13.95],
  SALZBURG: [47.65, 13.1],
  STEIERMARK: [47.18, 15.15],
  TIROL: [47.25, 11.25],
  VORARLBERG: [47.22, 9.85],
  WIEN: [48.21, 16.37]
};
const regionPositions = {
  BURGENLAND: { x: 77, y: 68 },
  "KÄRNTEN": { x: 49, y: 77 },
  "NIEDERÖSTERREICH": { x: 66, y: 43 },
  "OBERÖSTERREICH": { x: 43, y: 44 },
  SALZBURG: { x: 33, y: 61 },
  STEIERMARK: { x: 61, y: 70 },
  TIROL: { x: 20, y: 64 },
  VORARLBERG: { x: 9, y: 61 },
  WIEN: { x: 72, y: 48 }
};

const stagedAssets = [
  {
    id: "global|spanish-olive-farms",
    level: "Global Asset",
    code: "ES-OLIVE",
    name: "Spanish olive farms",
    demo: true,
    latest: {
      agriculturalLand: { year: 2026, value: 1842000 },
      farms: { year: 2026, value: 31240 },
      vineyards: { year: 2026, value: 0 },
      organicLand: { year: 2026, value: 392000 },
      erosionProtection: { year: 2026, value: 441000 }
    },
    derived: {
      organicFarmShare: 19.4,
      organicLandShare: 21.3,
      vineyardIntensity: 0,
      sustainabilityScore: 63,
      climateRisk: 78,
      droughtExposure: 88,
      waterStress: 91,
      rainfallDeficit: 64,
      biodiversityParticipation: 13.5,
      erosionMitigationParticipation: 24,
      fundingSignal: 72
    },
    metrics: {
      agriculturalLand: makeSeries(2016, 2026, 1710000, 1842000),
      farms: makeSeries(2016, 2026, 34600, 31240),
      organicLand: makeSeries(2016, 2026, 214000, 392000),
      erosionProtection: makeSeries(2016, 2026, 298000, 441000)
    }
  },
  {
    id: "global|organic-vineyards-austria",
    level: "Strategic Segment",
    code: "AT-ORGVINE",
    name: "Organic vineyards Austria",
    demo: true,
    latest: {
      agriculturalLand: { year: 2026, value: 48200 },
      farms: { year: 2026, value: 6800 },
      vineyards: { year: 2026, value: 44200 },
      organicLand: { year: 2026, value: 15100 },
      erosionProtection: { year: 2026, value: 12800 }
    },
    derived: {
      organicFarmShare: 28.6,
      organicLandShare: 31.3,
      vineyardIntensity: 91.7,
      sustainabilityScore: 72,
      climateRisk: 67,
      droughtExposure: 74,
      waterStress: 69,
      rainfallDeficit: 49,
      biodiversityParticipation: 18.1,
      erosionMitigationParticipation: 26.6,
      fundingSignal: 48
    },
    metrics: {
      agriculturalLand: makeSeries(2016, 2026, 46100, 48200),
      farms: makeSeries(2016, 2026, 7200, 6800),
      organicLand: makeSeries(2016, 2026, 9200, 15100),
      vineyards: makeSeries(2016, 2026, 43000, 44200)
    }
  }
];

const iconPaths = {
  search: "M21 21l-4.35-4.35M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z",
  satellite: "M5 14l4 4m1-13 9 9m-6-12 9 9m-16 1 8 8m1-15 5 5m-13 4 4 4m6-16 11 11-7 7L5 9l7-7Z",
  layers: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
  alert: "M12 9v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z",
  leaf: "M11 20A7 7 0 0 1 4 13c0-6 7-10 16-10 0 9-4 16-10 16-2.5 0-4.5-1-6-3m0 0c3 0 6-2 8-5",
  rain: "M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.3A7 7 0 1 0 5 15m3 4 1-2m4 2 1-2m4 2 1-2",
  chart: "M4 19V5m0 14h16M8 16v-5m4 5V8m4 8v-3",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-4a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"
};

function makeSeries(start, end, first, last) {
  const output = {};
  for (let year = start; year <= end; year++) {
    const t = (year - start) / Math.max(1, end - start);
    const seasonal = Math.sin(year * 1.7) * Math.abs(last - first) * 0.025;
    output[String(year)] = Math.max(0, Math.round(first + (last - first) * t + seasonal));
  }
  return output;
}

function Icon({ name, className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={iconPaths[name] || iconPaths.target} />
    </svg>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("Burgenland");
  const [activeLayer, setActiveLayer] = useState("NDVI");
  const [view, setView] = useState("dashboard");

  useEffect(() => {
    fetch("./data/dashboard-data.json")
      .then((response) => response.json())
      .then((payload) => {
        setData(payload);
        const burgenland = payload.entities.find((entity) => normalize(entity.name) === "burgenland");
        setSelectedId(burgenland?.id || payload.bundesland?.[0]?.id);
      })
      .catch(() => {
        const fallback = fallbackData();
        setData(fallback);
        setSelectedId(fallback.bundesland[0].id);
      });
  }, []);

  const entities = useMemo(() => {
    if (!data) return stagedAssets;
    return [...data.entities, ...stagedAssets];
  }, [data]);

  const selected = useMemo(() => entities.find((entity) => entity.id === selectedId) || entities[0], [entities, selectedId]);
  const searchResults = useMemo(() => searchEntities(entities, query), [entities, query]);

  if (!data || !selected) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen text-ink">
      <TopBar
        query={query}
        setQuery={setQuery}
        results={searchResults}
        onSelect={setSelectedId}
        selected={selected}
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        view={view}
        setView={setView}
      />
      {view === "dashboard" ? (
        <Dashboard data={data} selected={selected} setSelectedId={setSelectedId} activeLayer={activeLayer} />
      ) : (
        <PitchSection data={data} setView={setView} />
      )}
    </main>
  );
}

function TopBar({ query, setQuery, results, onSelect, selected, activeLayer, setActiveLayer, view, setView }) {
  const [focused, setFocused] = useState(false);
  const layers = ["NDVI", "Drought", "Vineyards", "Sustainability", "Risk"];
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/86 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:px-6">
        <button onClick={() => setView("dashboard")} className="flex items-center gap-3 text-left">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white shadow-premium">
            <Icon name="satellite" className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">The Satellite Project</span>
            <span className="block text-xs text-slate-500">External Verification Infrastructure for Agricultural Intelligence</span>
          </span>
        </button>

        <div className="relative min-w-0 flex-1 lg:mx-5">
          <div className="flex items-center rounded-lg border border-slate-300 bg-white px-3 shadow-sm transition focus-within:border-slate-500">
            <Icon name="search" className="h-4 w-4 text-slate-400" />
            <input
              className="h-11 w-full bg-transparent px-3 text-sm outline-none placeholder:text-slate-400"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 160)}
              placeholder="Search municipalities, vineyards, climate risks, programs..."
            />
          </div>
          {focused && results.length > 0 && (
            <div className="absolute left-0 right-0 top-12 z-50 max-h-80 overflow-auto rounded-lg border border-slate-200 bg-white p-2 shadow-premium">
              {results.slice(0, 8).map((entity) => (
                <button key={entity.id} onClick={() => onSelect(entity.id)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-slate-50">
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">{titleCase(entity.name)}</span>
                    <span className="text-xs text-slate-500">{entity.level} · {entity.demo ? "demo intelligence asset" : entity.code}</span>
                  </span>
                  <span className="text-xs font-semibold text-teal-700">{Math.round(entity.derived?.climateRisk || 0)} risk</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setView(view === "dashboard" ? "pitch" : "dashboard")} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            {view === "dashboard" ? "Pitch view" : "Dashboard"}
          </button>
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">DEMO LIVE</span>
          <select value={activeLayer} onChange={(event) => setActiveLayer(event.target.value)} className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700">
            {layers.map((layer) => <option key={layer}>{layer}</option>)}
          </select>
        </div>
      </div>
    </header>
  );
}

function Dashboard({ data, selected, setSelectedId, activeLayer }) {
  const bundesland = data.bundesland || [];
  const chartSeries = buildChartSeries(selected);
  const insights = makeInsights(selected, data);
  const rankings = data.topMunicipalities || {};

  return (
    <div className="mx-auto grid max-w-[1800px] gap-4 px-4 py-4 xl:grid-cols-[320px_minmax(440px,1fr)_350px] 2xl:grid-cols-[340px_minmax(520px,1fr)_380px] lg:px-6">
      <aside className="space-y-4">
        <RegionalPanel selected={selected} />
        <TrendPanel selected={selected} chartSeries={chartSeries} />
      </aside>

      <section className="min-w-0 space-y-4">
        <MapPanel selected={selected} bundesland={bundesland} setSelectedId={setSelectedId} activeLayer={activeLayer} data={data} />
        <AnalyticsGrid selected={selected} chartSeries={chartSeries} rankings={rankings} setSelectedId={setSelectedId} />
      </section>

      <aside className="space-y-4">
        <InsightEngine selected={selected} insights={insights} />
        <LiveFeed selected={selected} />
      </aside>
    </div>
  );
}

function RegionalPanel({ selected }) {
  const latest = selected.latest || {};
  const derived = selected.derived || {};
  const cards = [
    ["Agricultural land", formatNumber(latest.agriculturalLand?.value, "ha"), latest.agriculturalLand?.year, "leaf"],
    ["Organic farm share", `${formatFixed(derived.organicFarmShare)}%`, "derived", "target"],
    ["Vineyard area", formatNumber(latest.vineyards?.value, "ha"), latest.vineyards?.year, "satellite"],
    ["Climate risk", `${formatFixed(derived.climateRisk)}/100`, "composite", "alert"]
  ];

  return (
    <section className="glass rounded-xl p-4 shadow-premium">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Regional Intelligence</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{titleCase(selected.name)}</h1>
          <p className="text-sm text-slate-500">{selected.level} · {selected.demo ? "staged global scenario" : `code ${selected.code}`}</p>
        </div>
        <RiskRing value={derived.climateRisk || 0} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map(([label, value, meta, icon]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="mb-3 flex items-center justify-between text-slate-400">
              <Icon name={icon} className="h-4 w-4" />
              <span className="text-[10px] font-semibold uppercase">{meta || "latest"}</span>
            </div>
            <p className="text-xl font-semibold tracking-tight text-ink">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <MetricBar label="Sustainability participation" value={derived.sustainabilityScore || 0} tone="emerald" />
        <MetricBar label="Drought exposure" value={derived.droughtExposure || 0} tone="amber" />
        <MetricBar label="Water stress" value={derived.waterStress || 0} tone="sky" />
        <MetricBar label="Biodiversity participation" value={derived.biodiversityParticipation || 0} tone="violet" />
      </div>
    </section>
  );
}

function TrendPanel({ selected, chartSeries }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Agricultural Structure Trend</h2>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">2000-2026</span>
      </div>
      <div className="h-48">
        <DualLineChart data={chartSeries} primary="agriculturalLand" secondary="farms" primaryColor="#0f766e" secondaryColor="#334155" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <MiniStat label="Organic land" value={`${formatFixed(selected.derived?.organicLandShare)}%`} />
        <MiniStat label="Rain deficit" value={`${formatFixed(selected.derived?.rainfallDeficit)} mm`} />
        <MiniStat label="Erosion mit." value={`${formatFixed(selected.derived?.erosionMitigationParticipation)}%`} />
      </div>
    </section>
  );
}

function MapPanel({ selected, bundesland, setSelectedId, activeLayer, data }) {
  const [zoom, setZoom] = useState(1);
  const isGlobal = selected.demo && selected.name.toLowerCase().includes("spanish");

  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-premium">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Operational Geospatial View</h2>
          <p className="text-xs text-slate-500">{activeLayer} layer · simulated Sentinel/NDVI panel · {selected.demo ? "global demo asset" : "Austria data-backed"}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(Math.max(0.8, zoom - 0.1))} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-sm font-semibold">−</button>
          <span className="w-14 text-center text-xs font-semibold text-slate-600">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-sm font-semibold">+</button>
        </div>
      </div>

      <div className="relative h-[560px] overflow-hidden bg-slate-100 lg:h-[620px]">
        <LeafletAustriaMap
          selected={selected}
          bundesland={bundesland}
          setSelectedId={setSelectedId}
          activeLayer={activeLayer}
          data={data}
          zoomFactor={zoom}
          isGlobal={isGlobal}
        />
        <SafeOverlay activeLayer={activeLayer} selected={selected} isGlobal={isGlobal} />
      </div>
    </section>
  );
}

function LeafletAustriaMap({ selected, bundesland, setSelectedId, activeLayer, data, zoomFactor, isGlobal }) {
  const mapRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const layersRef = React.useRef([]);
  const geoJsonRef = React.useRef(null);
  const entityByRegion = useMemo(() => {
    const map = {};
    for (const region of bundesland || []) map[normalize(region.name)] = region;
    return map;
  }, [bundesland]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !window.L) return;
    const map = window.L.map(containerRef.current, {
      center: AUSTRIA_LATLNG,
      zoom: 7,
      minZoom: 6,
      maxZoom: 11,
      zoomControl: false,
      scrollWheelZoom: true
    });
    window.L.control.zoom({ position: "bottomright" }).addTo(map);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    mapRef.current = map;

    fetch("./data/austria-bundeslander.geojson")
      .then((response) => response.json())
      .then((geojson) => {
        geoJsonRef.current = geojson;
        renderLeafletLayers(map, geojson, entityByRegion, bundesland, selected, activeLayer, setSelectedId, layersRef, data);
      });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoJsonRef.current) return;
    renderLeafletLayers(map, geoJsonRef.current, entityByRegion, bundesland, selected, activeLayer, setSelectedId, layersRef, data);
  }, [entityByRegion, bundesland, selected, activeLayer, setSelectedId, data]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const targetZoom = Math.max(6, Math.min(9, Math.round(6 + zoomFactor * 1.5)));
    const selectedCenter = isGlobal ? [40.25, -3.7] : getEntityLatLng(selected);
    map.flyTo(selectedCenter, targetZoom, { duration: 0.7 });
  }, [selected, zoomFactor, isGlobal]);

  return <div ref={containerRef} className="absolute inset-0 z-0" aria-label="Leaflet OpenStreetMap Austria intelligence map" />;
}

function renderLeafletLayers(map, geojson, entityByRegion, bundesland, selected, activeLayer, setSelectedId, layersRef, data) {
  layersRef.current.forEach((layer) => map.removeLayer(layer));
  layersRef.current = [];

  const metric = layerMetric(activeLayer);
  const regionValues = (bundesland || []).map((region) => Number(metric(region) || 0));
  const min = Math.min(...regionValues, 0);
  const max = Math.max(...regionValues, 1);

  const boundaryLayer = window.L.geoJSON(geojson, {
    style: (feature) => {
      const region = entityByRegion[normalize(feature.properties.name)];
      const value = Number(metric(region) || 0);
      const selectedMatch = region && region.id === selected.id;
      return {
        color: selectedMatch ? "#0f172a" : "#334155",
        weight: selectedMatch ? 2.2 : 1,
        opacity: 0.72,
        fillColor: choroplethColor(value, min, max, activeLayer),
        fillOpacity: selectedMatch ? 0.52 : 0.34
      };
    },
    onEachFeature: (feature, layer) => {
      const region = entityByRegion[normalize(feature.properties.name)];
      if (!region) return;
      layer.bindTooltip(`${titleCase(region.name)} · ${activeLayer}: ${formatFixed(metric(region))}`, { sticky: true });
      layer.on("click", () => setSelectedId(region.id));
    }
  }).addTo(map);
  layersRef.current.push(boundaryLayer);

  for (const region of bundesland || []) {
    const latlng = getEntityLatLng(region);
    const bubbleValue = Number(metric(region) || 0);
    const radius = 9000 + Math.min(52000, Math.sqrt(Math.max(1, bubbleValue)) * 1800);
    const circle = window.L.circle(latlng, {
      radius,
      color: region.id === selected.id ? "#0f172a" : "#0f766e",
      weight: region.id === selected.id ? 2 : 1,
      fillColor: bubbleColor(activeLayer),
      fillOpacity: region.id === selected.id ? 0.46 : 0.25
    }).addTo(map);
    circle.bindPopup(`
      <strong>${titleCase(region.name)}</strong><br/>
      ${activeLayer}: ${formatFixed(metric(region))}<br/>
      Climate risk: ${formatFixed(region.derived?.climateRisk)}/100<br/>
      Organic land: ${formatFixed(region.derived?.organicLandShare)}%
    `);
    circle.on("click", () => setSelectedId(region.id));
    layersRef.current.push(circle);
  }

  const topRisk = (data.topMunicipalities?.risk || []).slice(0, 14);
  for (const municipality of topRisk) {
    const marker = window.L.circleMarker(getEntityLatLng(municipality), {
      radius: 4 + Math.min(8, (municipality.derived?.climateRisk || 0) / 16),
      color: "#991b1b",
      weight: 1,
      fillColor: "#ef4444",
      fillOpacity: 0.58
    }).addTo(map);
    marker.bindTooltip(`${titleCase(municipality.name)} · risk ${formatFixed(municipality.derived?.climateRisk)}`, { sticky: true });
    marker.on("click", () => setSelectedId(municipality.id));
    layersRef.current.push(marker);
  }

  if (!selected.level?.includes("Bundesland")) {
    const marker = window.L.circleMarker(getEntityLatLng(selected), {
      radius: 10,
      color: "#0f172a",
      weight: 2,
      fillColor: "#22c55e",
      fillOpacity: 0.75
    }).addTo(map);
    marker.bindPopup(`<strong>${titleCase(selected.name)}</strong><br/>${selected.level}<br/>Climate risk: ${formatFixed(selected.derived?.climateRisk)}/100`).openPopup();
    layersRef.current.push(marker);
  }
}

function SafeOverlay({ activeLayer, selected, isGlobal }) {
  const intensity = Math.min(1, (selected.derived?.climateRisk || 50) / 100);
  const droughtColor = `rgba(217,119,6,${0.18 + intensity * 0.34})`;
  const riskColor = `rgba(220,38,38,${0.12 + intensity * 0.34})`;
  const ndviColor = `rgba(16,185,129,${0.17 + (1 - intensity) * 0.18})`;
  const vineyard = selected.derived?.vineyardIntensity || 0;
  const blobs = [
    { left: "22%", top: "28%", width: "34%", color: activeLayer === "Drought" ? droughtColor : ndviColor },
    { left: "55%", top: "18%", width: "28%", color: activeLayer === "Risk" ? riskColor : "rgba(59,130,246,0.18)" },
    { left: "58%", top: "58%", width: "36%", color: activeLayer === "Sustainability" ? "rgba(20,184,166,0.34)" : "rgba(250,204,21,0.16)" },
    { left: "13%", top: "62%", width: "26%", color: activeLayer === "Vineyards" ? `rgba(147,51,234,${0.22 + Math.min(0.36, vineyard / 180)})` : "rgba(15,23,42,0.12)" }
  ];
  return (
    <div className="map-overlay-veil absolute inset-0 z-[410]">
      {blobs.map((blob, index) => (
        <div
          key={index}
          className="absolute rounded-full blur-3xl transition-all duration-700"
          style={{ left: blob.left, top: blob.top, width: blob.width, aspectRatio: "1/0.68", background: blob.color }}
        />
      ))}
      {isGlobal && (
        <div className="absolute inset-x-[10%] top-[32%] h-[34%] rounded-[45%] border border-white/40 bg-amber-300/18 backdrop-blur-[2px]" />
      )}
      <div className="absolute bottom-4 left-4 rounded-lg border border-white/70 bg-white/86 px-3 py-2 text-xs font-semibold text-slate-700 shadow-premium backdrop-blur">
        OSM base map · local Austria GeoJSON · simulated {activeLayer} overlay
      </div>
    </div>
  );
}

function SelectedMapCard({ selected, center, activeLayer }) {
  return (
    <div className="absolute rounded-xl border border-white/50 bg-white/86 p-3 shadow-premium backdrop-blur-xl" style={{ left: `${Math.min(78, center.x + 5)}%`, top: `${Math.max(8, center.y - 20)}%`, width: 250 }}>
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-md bg-slate-950 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">{activeLayer}</span>
        <span className="text-[11px] font-semibold text-slate-500">confidence 0.86</span>
      </div>
      <p className="text-sm font-semibold text-slate-900">{titleCase(selected.name)}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">
        Crop-health signal indicates {riskWord(selected.derived?.climateRisk)} exposure with {formatFixed(selected.derived?.rainfallDeficit)} mm rainfall deficit and {formatFixed(selected.derived?.sustainabilityScore)} sustainability score.
      </p>
    </div>
  );
}

function AnalyticsGrid({ selected, chartSeries, rankings, setSelectedId }) {
  const riskData = chartSeries.map((point) => ({
    year: point.year,
    drought: Math.max(20, Math.min(95, (selected.derived?.droughtExposure || 50) + Math.sin(Number(point.year) * 0.8) * 8)),
    rainfall: Math.max(0, Math.min(80, (selected.derived?.rainfallDeficit || 30) + Math.cos(Number(point.year) * 0.6) * 7))
  })).slice(-10);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartCard title="Drought Severity Timeline" subtitle="Mock climate layer calibrated from regional risk">
        <div className="h-[220px]">
          <DualLineChart data={riskData} primary="drought" secondary="rainfall" primaryColor="#d97706" secondaryColor="#0ea5e9" percent />
        </div>
      </ChartCard>

      <ChartCard title="Organic & Vineyard Positioning" subtitle="Latest available GeDaBa indicators">
        <div className="h-[220px]">
          <BarViz data={[
            { name: "Organic farms", value: selected.derived?.organicFarmShare || 0 },
            { name: "Organic land", value: selected.derived?.organicLandShare || 0 },
            { name: "Vineyards", value: selected.derived?.vineyardIntensity || 0 },
            { name: "Biodiversity", value: selected.derived?.biodiversityParticipation || 0 }
          ]} />
        </div>
      </ChartCard>

      <RankingTable title="High Drought-Risk Municipalities" rows={rankings.risk || []} metric={(row) => `${formatFixed(row.derived?.climateRisk)}/100`} onSelect={setSelectedId} />
      <RankingTable title="Sustainability Leaders" rows={rankings.sustainability || []} metric={(row) => `${formatFixed(row.derived?.sustainabilityScore)}/100`} onSelect={setSelectedId} />
    </div>
  );
}

function InsightEngine({ selected, insights }) {
  return (
    <section className="glass rounded-xl p-4 shadow-premium">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">AI Insight Engine</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Institutional Summary</h2>
        </div>
        <span className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white">AI</span>
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <article key={index} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${insight.tone}`}>{insight.type}</span>
              <span className="text-[11px] font-semibold text-slate-400">{insight.confidence}</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{insight.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LiveFeed({ selected }) {
  const feed = [
    ["Drought alert", `${titleCase(selected.name)} rainfall deficit increased to ${formatFixed(selected.derived?.rainfallDeficit)} mm across high-value agricultural zones.`, "amber"],
    ["Crop health", "NDVI composite suggests moderate stress in exposed parcels; vineyard-heavy areas require closer weekly monitoring.", "emerald"],
    ["Funding signal", "Environmental payment participation remains a useful proxy for climate-adaptation readiness.", "slate"],
    ["Frost watch", "Short-range frost risk remains below seasonal threshold; no enterprise escalation required.", "sky"],
    ["ESG update", "Biodiversity participation improved relative to the five-year regional baseline in comparable municipalities.", "violet"]
  ];
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Live Intelligence Feed</h2>
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
      </div>
      <div className="space-y-3">
        {feed.map(([title, body, tone], index) => (
          <div key={title} className="flex gap-3">
            <div className={`mt-1 h-2 w-2 rounded-full ${toneDot(tone)}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-slate-900">{title}</p>
                <span className="text-[10px] text-slate-400">T-{index * 7 + 3}m</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PitchSection({ data, setView }) {
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-8 lg:px-6">
      <div className="relative min-h-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-premium">
        <div className="absolute inset-0 satellite-field opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/76 to-slate-950/18" />
        <div className="relative flex min-h-[560px] max-w-4xl flex-col justify-center px-6 py-12 lg:px-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">External Verification Infrastructure</p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl">Transforming Agricultural Data Into Operational Climate Intelligence.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
            A unified intelligence layer for satellite crop-health signals, climate risk, sustainability participation, and AI-generated regional recommendations.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => setView("dashboard")} className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950">Open dashboard</button>
            <span className="rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white">{data.entities.length.toLocaleString()} Austrian data entities ingested</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["Geospatial Operations", "Interactive layers for NDVI, drought, vineyards, municipality risk, and sustainability intensity."],
          ["AI Insight Engine", "Consultancy-grade summaries translate raw indicators into investable operational narratives."],
          ["ESG Verification", "Municipality-level participation, biodiversity, organic farming, and climate adaptation signals in one view."]
        ].map(([title, body]) => (
          <div key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskRing({ value }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#dc2626 ${v * 3.6}deg, #e2e8f0 0deg)` }}>
      <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-sm font-semibold text-slate-900">{Math.round(v)}</div>
    </div>
  );
}

function MetricBar({ label, value, tone }) {
  const color = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    sky: "bg-sky-500",
    violet: "bg-violet-500"
  }[tone] || "bg-slate-500";
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{formatFixed(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function DualLineChart({ data, primary, secondary, primaryColor, secondaryColor, percent = false }) {
  const width = 720;
  const height = 250;
  const pad = { left: 44, right: 18, top: 18, bottom: 32 };
  const values = data.flatMap((point) => [Number(point[primary] || 0), Number(point[secondary] || 0)]).filter((value) => Number.isFinite(value));
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const scaleX = (index) => pad.left + (index / Math.max(1, data.length - 1)) * (width - pad.left - pad.right);
  const scaleY = (value) => height - pad.bottom - ((value - min) / Math.max(1, max - min)) * (height - pad.top - pad.bottom);
  const line = (key) => data.map((point, index) => `${index === 0 ? "M" : "L"} ${scaleX(index).toFixed(1)} ${scaleY(Number(point[key] || 0)).toFixed(1)}`).join(" ");
  const area = `${line(primary)} L ${scaleX(data.length - 1)} ${height - pad.bottom} L ${pad.left} ${height - pad.bottom} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => min + (max - min) * t);

  return (
    <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img">
      <defs>
        <linearGradient id={`fill-${primary}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.22" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {ticks.map((tick, index) => (
        <g key={index}>
          <line x1={pad.left} x2={width - pad.right} y1={scaleY(tick)} y2={scaleY(tick)} stroke="#e2e8f0" strokeDasharray="4 5" />
          <text x={8} y={scaleY(tick) + 4} fill="#94a3b8" fontSize="11">{percent ? `${Math.round(tick)}` : compactNumber(tick)}</text>
        </g>
      ))}
      <path d={area} fill={`url(#fill-${primary})`} />
      <path d={line(primary)} fill="none" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={line(secondary)} fill="none" stroke={secondaryColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {data.map((point, index) => index % Math.ceil(data.length / 5) === 0 || index === data.length - 1 ? (
        <text key={point.year} x={scaleX(index)} y={height - 9} textAnchor="middle" fill="#64748b" fontSize="11">{point.year}</text>
      ) : null)}
    </svg>
  );
}

function BarViz({ data }) {
  const max = Math.max(1, ...data.map((item) => Number(item.value || 0)));
  return (
    <div className="flex h-full items-end gap-4 px-2 pt-6">
      {data.map((item) => (
        <div key={item.name} className="flex h-full min-w-0 flex-1 flex-col justify-end">
          <div className="mb-2 text-center text-xs font-semibold text-slate-700">{formatFixed(item.value)}%</div>
          <div className="relative mx-auto w-full max-w-[70px] flex-1 rounded-t-lg bg-slate-100">
            <div
              className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-gradient-to-t from-teal-700 to-emerald-400"
              style={{ height: `${Math.max(5, (Number(item.value || 0) / max) * 100)}%` }}
            />
          </div>
          <p className="mt-2 min-h-8 text-center text-[11px] leading-4 text-slate-500">{item.name}</p>
        </div>
      ))}
    </div>
  );
}

function RankingTable({ title, rows, metric, onSelect }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      <div className="max-h-[260px] space-y-1 overflow-auto no-scrollbar">
        {rows.slice(0, 8).map((row, index) => (
          <button key={row.id} onClick={() => onSelect(row.id)} className="grid w-full grid-cols-[28px_1fr_auto] items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-slate-50">
            <span className="text-xs font-semibold text-slate-400">{index + 1}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-slate-800">{titleCase(row.name)}</span>
              <span className="text-[11px] text-slate-500">{row.level}</span>
            </span>
            <span className="text-xs font-semibold text-slate-900">{metric(row)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2">
      <p className="font-semibold text-slate-900">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

function buildChartSeries(entity) {
  const metrics = entity.metrics || {};
  const years = new Set();
  ["agriculturalLand", "farms", "organicLand", "vineyards", "erosionProtection"].forEach((key) => {
    Object.keys(metrics[key] || {}).forEach((year) => years.add(year));
  });
  const ordered = [...years].map(Number).sort((a, b) => a - b).slice(-18);
  return ordered.map((year) => ({
    year,
    agriculturalLand: Number(metrics.agriculturalLand?.[year] || metrics.organicLand?.[year] || 0),
    farms: Number(metrics.farms?.[year] || 0),
    organicLand: Number(metrics.organicLand?.[year] || 0),
    vineyards: Number(metrics.vineyards?.[year] || 0)
  }));
}

function makeInsights(selected, data) {
  const d = selected.derived || {};
  const name = titleCase(selected.name);
  const vineyardPhrase = d.vineyardIntensity > 8 ? "high-value vineyard concentration" : "mixed agricultural land use";
  return [
    {
      type: "Strategic",
      confidence: "0.91 confidence",
      tone: "bg-slate-100 text-slate-700",
      text: `${name} demonstrates ${d.organicLandShare > 20 ? "above-average" : "emerging"} organic land penetration while maintaining ${riskWord(d.climateRisk)} climate-risk exposure across ${vineyardPhrase}.`
    },
    {
      type: "Risk",
      confidence: "0.87 confidence",
      tone: "bg-red-50 text-red-700",
      text: `Satellite-derived crop-health indicators suggest ${riskWord(d.droughtExposure)} drought sensitivity, with rainfall deficit estimated at ${formatFixed(d.rainfallDeficit)} mm for the current monitoring window.`
    },
    {
      type: "ESG",
      confidence: "0.84 confidence",
      tone: "bg-emerald-50 text-emerald-700",
      text: `Sustainability participation score is ${formatFixed(d.sustainabilityScore)}/100; biodiversity participation and erosion mitigation should be benchmarked against peer municipalities before investment screening.`
    },
    {
      type: "Action",
      confidence: "0.79 confidence",
      tone: "bg-amber-50 text-amber-700",
      text: `Recommended next action: prioritize weekly NDVI monitoring, drought anomaly alerts, and a focused review of water stress in agricultural parcels with high economic exposure.`
    }
  ];
}

function searchEntities(entities, query) {
  const q = normalize(query);
  if (!q) return entities.slice(0, 10);
  const direct = entities
    .map((entity) => {
      const haystack = normalize(`${entity.name} ${entity.level} ${entity.code}`);
      let score = haystack.includes(q) ? 100 : 0;
      if (q.includes("drought") || q.includes("risk")) score += entity.derived?.climateRisk || 0;
      if (q.includes("organic")) score += entity.derived?.organicFarmShare || 0;
      if (q.includes("vineyard") || q.includes("wein")) score += entity.derived?.vineyardIntensity || 0;
      if (q.includes("sustain")) score += entity.derived?.sustainabilityScore || 0;
      if (q.includes("spanish") && normalize(entity.name).includes("spanish")) score += 160;
      return { entity, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.entity);
  return direct.length ? direct : entities.slice(0, 10);
}

function layerMetric(activeLayer) {
  if (activeLayer === "Drought") return (entity) => entity?.derived?.droughtExposure || 0;
  if (activeLayer === "Vineyards") return (entity) => entity?.derived?.vineyardIntensity || entity?.latest?.vineyards?.value || 0;
  if (activeLayer === "Sustainability") return (entity) => entity?.derived?.sustainabilityScore || 0;
  if (activeLayer === "Risk") return (entity) => entity?.derived?.climateRisk || 0;
  return (entity) => {
    const risk = entity?.derived?.climateRisk || 50;
    const sustainability = entity?.derived?.sustainabilityScore || 45;
    return Math.max(0, Math.min(100, 76 - risk * 0.35 + sustainability * 0.24));
  };
}

function choroplethColor(value, min, max, activeLayer) {
  const t = Math.max(0, Math.min(1, (Number(value || 0) - min) / Math.max(1, max - min)));
  if (activeLayer === "Drought") return interpolateColor([254, 243, 199], [217, 119, 6], t);
  if (activeLayer === "Risk") return interpolateColor([254, 226, 226], [185, 28, 28], t);
  if (activeLayer === "Vineyards") return interpolateColor([237, 233, 254], [109, 40, 217], t);
  if (activeLayer === "Sustainability") return interpolateColor([209, 250, 229], [15, 118, 110], t);
  return interpolateColor([220, 252, 231], [22, 101, 52], t);
}

function bubbleColor(activeLayer) {
  if (activeLayer === "Drought") return "#f59e0b";
  if (activeLayer === "Risk") return "#ef4444";
  if (activeLayer === "Vineyards") return "#8b5cf6";
  if (activeLayer === "Sustainability") return "#14b8a6";
  return "#22c55e";
}

function interpolateColor(a, b, t) {
  const channel = (index) => Math.round(a[index] + (b[index] - a[index]) * t);
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

function getEntityLatLng(entity) {
  if (!entity) return AUSTRIA_LATLNG;
  if (entity.demo && normalize(entity.name).includes("spanish")) return [38.35, -4.2];
  const region = regionLatLng[entity.name];
  if (region) return region;
  const seed = hashString(`${entity.code}-${entity.name}`);
  const lat = 46.55 + ((seed % 2500) / 2500) * 2.25;
  const lng = 9.7 + (((seed / 2500) % 1) * 7.3);
  return [Number(lat.toFixed(4)), Number(lng.toFixed(4))];
}

function hashString(value) {
  let hash = 2166136261;
  for (const char of String(value || "")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function fallbackData() {
  const burgenland = {
    id: "Bundesland|1",
    level: "Bundesland",
    code: "1",
    name: "BURGENLAND",
    latest: {
      farms: { year: 2025, value: 4534 },
      organicFarms: { year: 2025, value: 1120 },
      agriculturalLand: { year: 2026, value: 183000 },
      vineyards: { year: 2026, value: 13200 },
      organicLand: { year: 2025, value: 42200 },
      erosionProtection: { year: 2025, value: 18200 }
    },
    derived: {
      organicFarmShare: 24.7,
      organicLandShare: 23.1,
      vineyardIntensity: 7.2,
      sustainabilityScore: 61,
      climateRisk: 69,
      droughtExposure: 75,
      waterStress: 66,
      rainfallDeficit: 60,
      biodiversityParticipation: 11,
      erosionMitigationParticipation: 9.9,
      fundingSignal: 42
    },
    metrics: {
      agriculturalLand: makeSeries(2009, 2026, 178000, 183000),
      farms: makeSeries(2009, 2025, 6354, 4534),
      organicLand: makeSeries(2009, 2025, 27000, 42200),
      vineyards: makeSeries(2009, 2026, 12300, 13200)
    }
  };
  return {
    generatedAt: new Date().toISOString(),
    entities: [burgenland, ...stagedAssets],
    bundesland: [burgenland],
    topMunicipalities: { risk: [burgenland], sustainability: [burgenland] }
  };
}

function normalize(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function titleCase(value) {
  return String(value || "").toLocaleLowerCase("de-AT").replace(/(^|\s|-|\()(\p{L})/gu, (match) => match.toLocaleUpperCase("de-AT"));
}

function formatNumber(value, suffix = "") {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "n/a";
  return `${Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}${suffix ? ` ${suffix}` : ""}`;
}

function formatFixed(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "0.0";
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
}

function compactNumber(value) {
  const number = Number(value || 0);
  if (Math.abs(number) >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (Math.abs(number) >= 1000) return `${Math.round(number / 1000)}k`;
  return `${Math.round(number)}`;
}

function riskWord(value) {
  const v = Number(value || 0);
  if (v >= 75) return "elevated";
  if (v >= 55) return "moderate";
  return "contained";
}

function toneDot(tone) {
  return {
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    slate: "bg-slate-500",
    sky: "bg-sky-500",
    violet: "bg-violet-500"
  }[tone] || "bg-slate-400";
}

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-mist">
      <div className="text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-slate-950 text-white shadow-premium">
          <Icon name="satellite" className="h-7 w-7" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Loading The Satellite Project</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
