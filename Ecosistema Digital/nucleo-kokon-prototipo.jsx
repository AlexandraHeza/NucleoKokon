import React, { useState, useMemo } from "react";
import {
  Home, BookOpen, Activity, Wrench, Library, Users, MessageCircle,
  Sparkles, User, Lock, CheckCircle2, Circle, Sun, Moon, Battery,
  Calendar, Timer, ListChecks, TrendingUp, ChevronRight, Bell
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip
} from "recharts";

// ---------------------------------------------------------------------------
// TOKENS — Identidad: "Sabia + Cuidadora"
// Fondo cálido musgo-hueso (no crema estándar), tinta verde-noche profunda,
// acento ocre (calidez/cuidado) y una paleta semafórica propia de la
// Metodología de Sostenibilidad Humana (rojo ladrillo / ámbar / verde musgo / azul autonomía)
// ---------------------------------------------------------------------------
const TOKENS = {
  bg: "#EDEAE0",
  bgPanel: "#F7F5EE",
  ink: "#1F2A24",
  inkSoft: "#4A5A50",
  border: "#D9D4C4",
  pine: "#3E5C50",
  pineDeep: "#2C4038",
  ochre: "#B8863E",
  semaforo: {
    atencion: "#B4573F",
    construccion: "#D9A441",
    sostenimiento: "#5B8C5A",
    autonomia: "#3E6B8C",
  },
};

const MASLOW_DIMENSIONS = [
  { key: "biologico", label: "Biológico", icon: "🫁" },
  { key: "seguridad", label: "Seguridad", icon: "🛡" },
  { key: "vinculacion", label: "Vinculación", icon: "🤝" },
  { key: "operatividad", label: "Operatividad", icon: "🧠" },
  { key: "autorrealizacion", label: "Autorrealización", icon: "🚀" },
];

const CICLOS = ["Diagnosticar", "Estabilizar", "Estructurar", "Consolidar", "Autonomizar"];

// Estado simulado de una usuaria en Ciclo II · Estabilizar
const MOCK_USER = {
  nombre: "Renata",
  cicloActual: 1, // índice en CICLOS -> Estabilizar
  indice: [
    { dimension: "Biológico", valor: 42, estado: "atencion" },
    { dimension: "Seguridad", valor: 58, estado: "construccion" },
    { dimension: "Vinculación", valor: 66, estado: "construccion" },
    { dimension: "Operatividad", valor: 35, estado: "atencion" },
    { dimension: "Autorrealización", valor: 70, estado: "sostenimiento" },
  ],
};

const HERRAMIENTAS = [
  { nombre: "Calendario", criterio: "Dificultad para visualizar compromisos", desbloqueada: true },
  { nombre: "Recordatorios", criterio: "Descarga de carga mental", desbloqueada: true },
  { nombre: "Pomodoro", criterio: "Dificultad para iniciar tareas", desbloqueada: false },
  { nombre: "Matriz 20/80", criterio: "Exceso de actividades con poco impacto", desbloqueada: false },
  { nombre: "Planeación semanal", criterio: "Se habilita en Ciclo III · Estructurar", desbloqueada: false },
  { nombre: "Gestión por proyectos", criterio: "Múltiples proyectos compitiendo", desbloqueada: false },
];

const BITACORA = [
  {
    fecha: "12 ago",
    estado: "Llegó cansada, con la agenda saturada",
    tema: "Sobrecarga de tareas administrativas",
    avance: "Registró por primera vez su calendario real vs. planeado",
    siguiente: "Observar patrón de sueño 5 días",
  },
  {
    fecha: "5 ago",
    estado: "Llegó con claridad sobre su proyecto, pero dispersa en el día a día",
    tema: "Diagnóstico psico-operativo inicial",
    avance: "Se construyó el Mapa de Sostenibilidad Individual",
    siguiente: "Priorizar 3 hábitos biológicos mínimos",
  },
];

function pill(estado) {
  const map = {
    atencion: { bg: "#F3E2DC", fg: TOKENS.semaforo.atencion, label: "Atención" },
    construccion: { bg: "#F6EAD3", fg: TOKENS.semaforo.construccion, label: "Construcción" },
    sostenimiento: { bg: "#E2EAE0", fg: TOKENS.semaforo.sostenimiento, label: "Sostenimiento" },
    autonomia: { bg: "#DEE6EC", fg: TOKENS.semaforo.autonomia, label: "Autonomía" },
  };
  return map[estado] || map.construccion;
}

const NAV = [
  { key: "hoy", label: "Inicio / Hoy", icon: Home },
  { key: "bitacora", label: "Bitácora", icon: BookOpen },
  { key: "progreso", label: "Progreso", icon: Activity },
  { key: "herramientas", label: "Herramientas", icon: Wrench },
  { key: "materiales", label: "Materiales", icon: Library },
  { key: "acompanamiento", label: "Acompañamiento", icon: Users },
  { key: "comunidad", label: "Comunidad", icon: MessageCircle },
  { key: "nki", label: "NK Intelligence", icon: Sparkles },
];

export default function App() {
  const [view, setView] = useState("hoy");
  const [checkIn, setCheckIn] = useState({ emocional: null, energia: null });

  const radarData = useMemo(
    () => MOCK_USER.indice.map((d) => ({ dimension: d.dimension, valor: d.valor })),
    []
  );

  return (
    <div
      className="w-full min-h-screen flex font-sans"
      style={{ background: TOKENS.bg, color: TOKENS.ink }}
    >
      {/* SIDEBAR */}
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 border-r"
        style={{ borderColor: TOKENS.border, background: TOKENS.bgPanel }}
      >
        <div className="px-5 pt-6 pb-4">
          <div className="font-serif text-lg tracking-tight" style={{ color: TOKENS.pineDeep }}>
            Núcleo Kokón
          </div>
          <div className="text-[11px] uppercase tracking-widest mt-0.5" style={{ color: TOKENS.inkSoft }}>
            Sostenibilidad Humana™
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
                style={{
                  background: active ? TOKENS.pine : "transparent",
                  color: active ? "#F7F5EE" : TOKENS.inkSoft,
                }}
              >
                <Icon size={16} />
                <span className="text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 mx-3 mb-4 rounded-xl" style={{ background: "#E2E7DE" }}>
          <div className="text-[11px] uppercase tracking-widest" style={{ color: TOKENS.inkSoft }}>
            Ciclo actual
          </div>
          <div className="font-serif text-base mt-1" style={{ color: TOKENS.pineDeep }}>
            II · Estabilizar
          </div>
          <CycleTrack activeIndex={MOCK_USER.cicloActual} />
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-5 md:px-8 py-6">
          {view === "hoy" && <ViewHoy checkIn={checkIn} setCheckIn={setCheckIn} />}
          {view === "bitacora" && <ViewBitacora />}
          {view === "progreso" && <ViewProgreso radarData={radarData} />}
          {view === "herramientas" && <ViewHerramientas />}
          {view === "materiales" && <ViewPlaceholder titulo="Materiales" texto="Clases, masterclasses y recursos descargables, curados según tu ciclo y diagnóstico." />}
          {view === "acompanamiento" && <ViewPlaceholder titulo="Acompañamiento" texto="Sesiones de mentoría, videollamadas y documentos compartidos con tu facilitadora." />}
          {view === "comunidad" && <ViewPlaceholder titulo="Comunidad" texto="Espacio de co-sostenimiento: publicaciones, encuentros y aprendizaje colectivo." />}
          {view === "nki" && <ViewNKI />}
        </main>
      </div>
    </div>
  );
}

function CycleTrack({ activeIndex }) {
  return (
    <div className="flex items-center gap-1 mt-3">
      {CICLOS.map((c, i) => (
        <div
          key={c}
          title={c}
          className="h-1.5 flex-1 rounded-full"
          style={{
            background: i <= activeIndex ? TOKENS.pine : "#C9CFC3",
            opacity: i === activeIndex ? 1 : i < activeIndex ? 0.6 : 0.35,
          }}
        />
      ))}
    </div>
  );
}

function TopBar() {
  return (
    <header
      className="flex items-center justify-between px-5 md:px-8 py-4 border-b"
      style={{ borderColor: TOKENS.border, background: TOKENS.bgPanel }}
    >
      <div>
        <div className="text-sm" style={{ color: TOKENS.inkSoft }}>Hola,</div>
        <div className="font-serif text-xl" style={{ color: TOKENS.pineDeep }}>{MOCK_USER.nombre}</div>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full" style={{ background: TOKENS.bg }}>
          <Bell size={16} style={{ color: TOKENS.inkSoft }} />
        </button>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: TOKENS.pine, color: "#F7F5EE" }}
        >
          <User size={16} />
        </div>
      </div>
    </header>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${className}`}
      style={{ borderColor: TOKENS.border, background: TOKENS.bgPanel }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div className="mb-4">
      <h2 className="font-serif text-2xl" style={{ color: TOKENS.pineDeep }}>{children}</h2>
      {sub && <p className="text-sm mt-1" style={{ color: TOKENS.inkSoft }}>{sub}</p>}
    </div>
  );
}

// ----------------------------- VISTA: INICIO / HOY -----------------------------
function ViewHoy({ checkIn, setCheckIn }) {
  return (
    <div className="max-w-4xl">
      <SectionTitle sub="¿Qué necesitas saber y hacer hoy para sostener tu sistema?">
        Inicio
      </SectionTitle>

      <Card className="mb-5">
        <div className="text-sm font-medium mb-3" style={{ color: TOKENS.inkSoft }}>Check-in diario</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CheckField
            label="Estado emocional"
            icon={checkIn.emocional === "alto" ? Sun : Moon}
            options={["bajo", "medio", "alto"]}
            value={checkIn.emocional}
            onChange={(v) => setCheckIn((c) => ({ ...c, emocional: v }))}
          />
          <CheckField
            label="Energía"
            icon={Battery}
            options={["bajo", "medio", "alto"]}
            value={checkIn.energia}
            onChange={(v) => setCheckIn((c) => ({ ...c, energia: v }))}
          />
          <CheckField
            label="Estado corporal"
            icon={Activity}
            options={["tenso", "neutro", "ligero"]}
            value={checkIn.corporal}
            onChange={(v) => setCheckIn((c) => ({ ...c, corporal: v }))}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} style={{ color: TOKENS.pine }} />
            <div className="text-sm font-medium">Agenda de hoy</div>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Bloque de trabajo — propuesta cliente</span><span style={{ color: TOKENS.inkSoft }}>09:30</span></li>
            <li className="flex justify-between"><span>Pausa corporal (10 min)</span><span style={{ color: TOKENS.inkSoft }}>11:15</span></li>
            <li className="flex justify-between"><span>Sesión de mentoría</span><span style={{ color: TOKENS.inkSoft }}>17:00</span></li>
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <ListChecks size={16} style={{ color: TOKENS.pine }} />
            <div className="text-sm font-medium">Hábitos de hoy</div>
          </div>
          <ul className="space-y-2 text-sm">
            {["Dormir 7+ horas", "Registro de gastos", "Pausa sin pantallas"].map((h, i) => (
              <li key={h} className="flex items-center gap-2">
                {i === 0 ? <CheckCircle2 size={16} style={{ color: TOKENS.semaforo.sostenimiento }} /> : <Circle size={16} style={{ color: TOKENS.inkSoft }} />}
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} style={{ color: TOKENS.ochre }} />
          <div className="text-sm font-medium">Recomendación de NK Intelligence</div>
        </div>
        <p className="text-sm" style={{ color: TOKENS.inkSoft }}>
          Tu dimensión Biológica está en atención desde hace 5 días. Antes de sumar una tarea nueva,
          te sugerimos proteger tu bloque de sueño esta noche.
        </p>
      </Card>
    </div>
  );
}

function CheckField({ label, icon: Icon, options, value, onChange }) {
  return (
    <div className="rounded-xl p-3" style={{ background: TOKENS.bg }}>
      <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: TOKENS.inkSoft }}>
        <Icon size={13} /> {label}
      </div>
      <div className="flex gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className="flex-1 text-xs py-1.5 rounded-lg capitalize"
            style={{
              background: value === o ? TOKENS.pine : TOKENS.bgPanel,
              color: value === o ? "#F7F5EE" : TOKENS.inkSoft,
              border: `1px solid ${TOKENS.border}`,
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ----------------------------- VISTA: BITÁCORA -----------------------------
function ViewBitacora() {
  return (
    <div className="max-w-3xl">
      <SectionTitle sub="Memoria longitudinal del acompañamiento: sesiones, avances, bloqueos y decisiones.">
        Bitácora
      </SectionTitle>
      <div className="relative pl-6">
        <div className="absolute left-[7px] top-1 bottom-1 w-px" style={{ background: TOKENS.border }} />
        {BITACORA.map((entry) => (
          <div key={entry.fecha} className="relative mb-6">
            <div
              className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2"
              style={{ background: TOKENS.bg, borderColor: TOKENS.pine }}
            />
            <Card>
              <div className="flex items-center justify-between mb-2">
                <div className="font-serif" style={{ color: TOKENS.pineDeep }}>{entry.tema}</div>
                <div className="text-xs" style={{ color: TOKENS.inkSoft }}>{entry.fecha}</div>
              </div>
              <p className="text-sm mb-1"><span style={{ color: TOKENS.inkSoft }}>Llegada: </span>{entry.estado}</p>
              <p className="text-sm mb-1"><span style={{ color: TOKENS.inkSoft }}>Avance: </span>{entry.avance}</p>
              <p className="text-sm"><span style={{ color: TOKENS.inkSoft }}>Próxima sesión: </span>{entry.siguiente}</p>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------- VISTA: PROGRESO -----------------------------
function ViewProgreso({ radarData }) {
  return (
    <div className="max-w-4xl">
      <SectionTitle sub="Índice de Sostenibilidad por dimensión — no es una racha de días, es la evolución del sistema.">
        Progreso
      </SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-3">
          <div className="text-sm font-medium mb-2">Índice de Sostenibilidad (Maslow Operativo)</div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke={TOKENS.border} />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: TOKENS.inkSoft, fontSize: 11 }} />
                <Radar dataKey="valor" stroke={TOKENS.pine} fill={TOKENS.pine} fillOpacity={0.35} />
                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${TOKENS.border}` }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-3">
          {MOCK_USER.indice.map((d) => {
            const p = pill(d.estado);
            const dim = MASLOW_DIMENSIONS.find((m) => m.label === d.dimension);
            return (
              <Card key={d.dimension} className="!p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span>{dim?.icon}</span>
                    <span>{d.dimension}</span>
                  </div>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{ background: p.bg, color: p.fg }}
                  >
                    {p.label}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ----------------------------- VISTA: HERRAMIENTAS -----------------------------
function ViewHerramientas() {
  return (
    <div className="max-w-4xl">
      <SectionTitle sub="Andamiaje pedagógico adaptativo: no se entrega todo desde el inicio; se desbloquea según el diagnóstico.">
        Herramientas
      </SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {HERRAMIENTAS.map((h) => (
          <Card key={h.nombre} className={!h.desbloqueada ? "opacity-70" : ""}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-serif text-lg" style={{ color: TOKENS.pineDeep }}>{h.nombre}</div>
                <p className="text-xs mt-1" style={{ color: TOKENS.inkSoft }}>{h.criterio}</p>
              </div>
              {h.desbloqueada ? (
                <ChevronRight size={18} style={{ color: TOKENS.pine }} />
              ) : (
                <Lock size={16} style={{ color: TOKENS.inkSoft }} />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ----------------------------- VISTA: NK INTELLIGENCE -----------------------------
function ViewNKI() {
  return (
    <div className="max-w-3xl">
      <SectionTitle sub="Recopilar → estructurar → relacionar → detectar → sugerir → aprender.">
        Núcleo Kokón Intelligence
      </SectionTitle>
      <div className="space-y-4">
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} style={{ color: TOKENS.ochre }} />
            <div className="text-sm font-medium">Patrón detectado</div>
          </div>
          <p className="text-sm" style={{ color: TOKENS.inkSoft }}>
            En las últimas 2 semanas, tus tareas de mayor prioridad se completan con más frecuencia
            los días en que registraste 7+ horas de sueño. La correlación es fuerte en tu Bitácora.
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Timer size={16} style={{ color: TOKENS.ochre }} />
            <div className="text-sm font-medium">Sugerencia de herramienta</div>
          </div>
          <p className="text-sm" style={{ color: TOKENS.inkSoft }}>
            Detectamos dificultad recurrente para iniciar tareas de escritura. Podrías beneficiarte
            de desbloquear <strong>Pomodoro</strong> como dispositivo experimental de observación.
          </p>
        </Card>
      </div>
    </div>
  );
}

function ViewPlaceholder({ titulo, texto }) {
  return (
    <div className="max-w-3xl">
      <SectionTitle sub={texto}>{titulo}</SectionTitle>
      <Card>
        <p className="text-sm" style={{ color: TOKENS.inkSoft }}>
          Vista en construcción para este prototipo — su alcance funcional está definido en la
          sección correspondiente del APR y de la Metodología de Sostenibilidad Humana™.
        </p>
      </Card>
    </div>
  );
}
