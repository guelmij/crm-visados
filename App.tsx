import React, { useState, useMemo, useEffect } from "react";
// Importamos la librería de Supabase
import { createClient } from "@supabase/supabase-js";

// ── CONEXIÓN A TU BASE DE DATOS DE SUPABASE ──────────────────────────────────
const SUPABASE_URL = "https://vnvuhkwbqxhadbaqkjxe.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_YeyE4EdNeiw3G-iUKZ7IOQ_peLFZk-E";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── CONSTANTES ────────────────────────────────────────────────────────────────
const ETAPAS = [
  {
    id: "contacto",
    label: "1er Contacto",
    short: "Contacto",
    color: "#6B7280",
    icon: "📞",
  },
  {
    id: "primera_cuota",
    label: "1ª Cuota",
    short: "1ª Cuota",
    color: "#F59E0B",
    icon: "💳",
  },
  {
    id: "cita",
    label: "Cita Concertada",
    short: "Cita",
    color: "#8B5CF6",
    icon: "📅",
  },
  {
    id: "documentacion",
    label: "Documentación",
    short: "Docs",
    color: "#3B82F6",
    icon: "📁",
  },
  {
    id: "presentacion",
    label: "Presentación",
    short: "Consulado",
    color: "#EC4899",
    icon: "🏛️",
  },
  {
    id: "concedida",
    label: "Concedida",
    short: "Concedida",
    color: "#10B981",
    icon: "✅",
  },
  {
    id: "denegada",
    label: "Denegada",
    short: "Denegada",
    color: "#EF4444",
    icon: "❌",
  },
];
const ETAPAS_FLUJO = ETAPAS.slice(0, 5);

const DOC_MAIN = [
  { id: "pasaporte", label: "Pasaporte vigente", icon: "🛂" },
  { id: "seguro", label: "Seguro de viaje", icon: "🛡️" },
  { id: "plan_viaje", label: "Plan de viaje", icon: "🗺️" },
  { id: "hotel", label: "Reserva de hotel", icon: "🏨" },
  { id: "avion", label: "Reserva de avión", icon: "✈️" },
];
const DOC_EXTRAS = [
  { id: "tour", label: "Tours y actividades", icon: "🌊" },
  { id: "taxi", label: "Traslados / Taxis", icon: "🚕" },
];
const DOC_ALL = [...DOC_MAIN, ...DOC_EXTRAS];

const MONEDAS = [
  { id: "EUR", symbol: "€", label: "Euro", flag: "🇪🇺" },
  { id: "USD", symbol: "$", label: "Dólar", flag: "🇺🇸" },
  { id: "DOP", symbol: "RD$", label: "Peso Dominicano", flag: "🇩🇴" },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const etapaInfo = (id) => ETAPAS.find((e) => e.id === id) || ETAPAS[0];
const etapaIndex = (id) => ETAPAS_FLUJO.findIndex((e) => e.id === id);
const docProgress = (docs) => {
  if (!docs) return { done: 0, total: DOC_MAIN.length, pct: 0 };
  const total = DOC_MAIN.length;
  const done = DOC_MAIN.filter((d) => docs[d.id]).length;
  return { done, total, pct: Math.round((done / total) * 100) };
};
const formatMoney = (amount, moneda) => {
  const m = MONEDAS.find((x) => x.id === moneda) || MONEDAS[0];
  const n = Number(amount || 0).toLocaleString("es-ES", {
    minimumFractionDigits: 0,
  });
  return `${m.symbol}${n}`;
};
const fmtDate = (iso) =>
  iso
    ? new Date(iso + "T00:00:00").toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

const IS = {
  background: "#1A2234",
  border: "1px solid #2D3A50",
  color: "#F9FAFB",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 13,
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
};

// ── COMPONENTES VISUALES ──────────────────────────────────────────────────────
function Badge({ etapa }) {
  const info = etapaInfo(etapa);
  return (
    <span
      style={{
        background: info.color + "22",
        color: info.color,
        border: `1px solid ${info.color}55`,
        borderRadius: 6,
        padding: "2px 9px",
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {info.icon} {info.label}
    </span>
  );
}

function MiniPipeline({ etapa }) {
  const activeIdx = etapaIndex(etapa);
  const isResult = ["concedida", "denegada"].includes(etapa);
  const resultInfo = isResult ? etapaInfo(etapa) : null;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {ETAPAS_FLUJO.map((e, i) => {
          const done = isResult || activeIdx > i;
          const active = !isResult && activeIdx === i;
          const col = done || active ? e.color : "#2D3748";
          return (
            <div
              key={e.id}
              style={{ display: "flex", alignItems: "center", flex: 1 }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: done
                      ? e.color
                      : active
                      ? e.color + "30"
                      : "#1A2234",
                    border: `2px solid ${col}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 800,
                    color: done ? "#fff" : col,
                    boxShadow: active ? `0 0 9px ${e.color}88` : "none",
                    transition: "all .3s",
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    marginTop: 3,
                    color: active ? e.color : done ? "#6B7280" : "#374151",
                    fontWeight: active ? 700 : 400,
                    textAlign: "center",
                    lineHeight: 1.2,
                    maxWidth: 44,
                  }}
                >
                  {e.short}
                </div>
              </div>
              {i < ETAPAS_FLUJO.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    marginBottom: 14,
                    background: done ? e.color : "#1F2937",
                    transition: "background .3s",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {resultInfo && (
        <div
          style={{
            marginTop: 6,
            textAlign: "center",
            background: resultInfo.color + "18",
            border: `1px solid ${resultInfo.color}44`,
            borderRadius: 8,
            padding: "5px 10px",
            color: resultInfo.color,
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          {resultInfo.icon} {resultInfo.label}
        </div>
      )}
    </div>
  );
}

function DocProgress({ docs }) {
  const { done, total, pct } = docProgress(docs);
  const color = pct === 100 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          marginBottom: 3,
        }}
      >
        <span style={{ color: "#6B7280" }}>Documentación</span>
        <span style={{ color, fontWeight: 700 }}>
          {done}/{total}
        </span>
      </div>
      <div
        style={{
          background: "#1F2937",
          borderRadius: 4,
          height: 5,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 4,
            transition: "width .4s",
          }}
        />
      </div>
    </div>
  );
}

function PagoChip({ pagado, label, fecha }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        padding: "4px 9px",
        borderRadius: 8,
        background: pagado ? "#10B98118" : "#EF444418",
        border: `1px solid ${pagado ? "#10B98145" : "#EF444445"}`,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: pagado ? "#10B981" : "#EF4444",
        }}
      >
        {pagado ? "✓" : "✗"} {label}
      </span>
      {pagado && fecha && (
        <span style={{ fontSize: 9, color: "#6B7280" }}>{fmtDate(fecha)}</span>
      )}
    </div>
  );
}

function PagoRow({
  label,
  sublabel,
  checked,
  fecha,
  onCheck,
  onFecha,
  amount,
  moneda,
}) {
  return (
    <div
      style={{
        border: `2px solid ${checked ? "#10B98166" : "#2D3A50"}`,
        borderRadius: 12,
        background: checked
          ? "linear-gradient(135deg,#10B98110,#064E3B18)"
          : "#111827",
        padding: "14px 16px",
        transition: "all .3s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flex: 1,
            cursor: "pointer",
          }}
          onClick={onCheck}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              flexShrink: 0,
              background: checked ? "#10B981" : "transparent",
              border: `2px solid ${checked ? "#10B981" : "#4B5563"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {checked && (
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>
                ✓
              </span>
            )}
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: checked ? "#D1FAE5" : "#9CA3AF",
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>
              {sublabel}
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: checked ? "#10B981" : "#4B5563",
          }}
        >
          {formatMoney(amount, moneda)}
        </div>
      </div>
      {checked && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px solid #10B98130",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{ fontSize: 11, color: "#6B7280", whiteSpace: "nowrap" }}
          >
            📅 Fecha de pago:
          </span>
          <input
            type="date"
            value={fecha || ""}
            onChange={(e) => onFecha(e.target.value)}
            style={{ ...IS, flex: 1, fontSize: 12, padding: "5px 10px" }}
          />
        </div>
      )}
    </div>
  );
}

function EtapaSelector({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {ETAPAS_FLUJO.map((e) => {
          const active = value === e.id;
          return (
            <button
              type="button"
              key={e.id}
              onClick={() => onChange(e.id)}
              style={{
                flex: 1,
                minWidth: 80,
                padding: "8px 6px",
                background: active ? e.color + "30" : "#1A2234",
                border: `2px solid ${active ? e.color : "#2D3A50"}`,
                borderRadius: 10,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              <span style={{ fontSize: 16 }}>{e.icon}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: active ? 700 : 500,
                  color: active ? e.color : "#6B7280",
                  textAlign: "center",
                }}
              >
                {e.label}
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {ETAPAS.slice(5).map((e) => {
          const active = value === e.id;
          return (
            <button
              type="button"
              key={e.id}
              onClick={() => onChange(e.id)}
              style={{
                flex: 1,
                padding: "8px 12px",
                background: active ? e.color + "25" : "#1A2234",
                border: `2px solid ${active ? e.color : "#2D3A50"}`,
                borderRadius: 10,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 14 }}>{e.icon}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  color: active ? e.color : "#6B7280",
                }}
              >
                {e.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EtapaFullPipeline({ etapa }) {
  const activeIdx = etapaIndex(etapa);
  const isResult = ["concedida", "denegada"].includes(etapa);
  const resultInfo = isResult ? etapaInfo(etapa) : null;
  return (
    <div style={{ padding: "10px 0 4px" }}>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {ETAPAS_FLUJO.map((e, i) => {
          const done = isResult || activeIdx > i;
          const active = !isResult && activeIdx === i;
          const col = done || active ? e.color : "#374151";
          return (
            <div
              key={e.id}
              style={{ display: "flex", alignItems: "flex-start", flex: 1 }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: done
                      ? e.color
                      : active
                      ? e.color + "30"
                      : "#1A2234",
                    border: `2.5px solid ${col}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: done ? 15 : 14,
                    fontWeight: 800,
                    color: done ? "#fff" : col,
                  }}
                >
                  {done ? "✓" : e.icon}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    marginTop: 6,
                    textAlign: "center",
                    color: active ? e.color : done ? "#9CA3AF" : "#4B5563",
                  }}
                >
                  {e.label}
                </div>
              </div>
              {i < ETAPAS_FLUJO.length - 1 && (
                <div
                  style={{
                    flex: 0.6,
                    height: 3,
                    marginTop: 16,
                    background: done ? e.color : "#1F2937",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {resultInfo && (
        <div
          style={{
            marginTop: 12,
            textAlign: "center",
            background: resultInfo.color + "18",
            border: `1.5px solid ${resultInfo.color}50`,
            borderRadius: 10,
            padding: "8px 14px",
            color: resultInfo.color,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {resultInfo.icon} Resultado: {resultInfo.label}
        </div>
      )}
    </div>
  );
}

function DocItem({ doc, checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: checked ? "#10B98112" : "#111827",
        border: `1.5px solid ${checked ? "#10B98150" : "#2D3A50"}`,
        borderRadius: 10,
        padding: "10px 13px",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          flexShrink: 0,
          background: checked ? "#10B981" : "transparent",
          border: `2px solid ${checked ? "#10B981" : "#4B5563"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && (
          <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>
            ✓
          </span>
        )}
      </div>
      <span style={{ fontSize: 13 }}>{doc.icon}</span>
      <span
        style={{
          fontSize: 12,
          color: checked ? "#D1FAE5" : "#9CA3AF",
          flex: 1,
        }}
      >
        {doc.label}
      </span>
    </div>
  );
}

// ── MODAL FORMULARIO ─────────────────────────────────────────────────────────
function ClientModal({ client, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    ...client,
    docs: client.docs || Object.fromEntries(DOC_ALL.map((d) => [d.id, false])),
    precioSeguro: client.precioSeguro || 0,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setDoc = (k, v) =>
    setForm((f) => ({ ...f, docs: { ...f.docs, [k]: v } }));

  const { done, total, pct } = docProgress(form.docs);
  const docsColor = pct === 100 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444";
  const half = (form.totalPrecio || 0) / 2;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000bb",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0B0F1A",
          border: "1px solid #1F2937",
          borderRadius: 20,
          width: "100%",
          maxWidth: 720,
          maxHeight: "93vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "18px 24px 14px",
            borderBottom: "1px solid #1F2937",
            position: "sticky",
            top: 0,
            background: "#0B0F1A",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#F9FAFB" }}>
              {form.nombre || "Nuevo cliente"}
            </div>
            <div style={{ marginTop: 5 }}>
              <Badge etapa={form.etapa} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#1F2937",
              border: "none",
              color: "#9CA3AF",
              width: 36,
              height: 36,
              borderRadius: 8,
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <Sec title="📍 Etapa del Proceso">
            <EtapaSelector
              value={form.etapa}
              onChange={(v) => set("etapa", v)}
            />
            <div style={{ marginTop: 14 }}>
              <EtapaFullPipeline etapa={form.etapa} />
            </div>
          </Sec>

          <Sec title="👤 Datos del Cliente">
            <G2>
              <Fld label="Nombre completo *">
                <Inp
                  value={form.nombre || ""}
                  onChange={(v) => set("nombre", v)}
                  placeholder="Nombre del cliente"
                />
              </Fld>
              <Fld label="Teléfono">
                <Inp
                  value={form.telefono || ""}
                  onChange={(v) => set("telefono", v)}
                  placeholder="+34 600 000 000"
                />
              </Fld>
              <Fld label="Email">
                <Inp
                  value={form.email || ""}
                  onChange={(v) => set("email", v)}
                  placeholder="email@ejemplo.com"
                />
              </Fld>
              <Fld label="Consulado">
                <Inp
                  value={form.consulado || ""}
                  onChange={(v) => set("consulado", v)}
                  placeholder="Ciudad del consulado"
                />
              </Fld>
              <Fld label="Fecha de Cita Consular">
                <Inp
                  type="date"
                  value={form.fechaCita || ""}
                  onChange={(v) => set("fechaCita", v)}
                />
              </Fld>
              <Fld label="Destino">
                <Inp
                  value={form.destino || ""}
                  onChange={(v) => set("destino", v)}
                />
              </Fld>
            </G2>
          </Sec>

          <Sec title="💰 Pagos">
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <Fld label="Precio Total">
                <Inp
                  type="number"
                  value={form.totalPrecio || 0}
                  onChange={(v) => set("totalPrecio", Number(v))}
                />
              </Fld>
              <Fld label="Moneda">
                <select
                  value={form.moneda || "EUR"}
                  onChange={(e) => set("moneda", e.target.value)}
                  style={IS}
                >
                  {MONEDAS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.flag} {m.symbol} — {m.label}
                    </option>
                  ))}
                </select>
              </Fld>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <PagoRow
                label="1ª Cuota — 50%"
                checked={form.pagoPrimera}
                fecha={form.fechaPagoPrimera}
                onCheck={() => set("pagoPrimera", !form.pagoPrimera)}
                onFecha={(v) => set("fechaPagoPrimera", v)}
                amount={half}
                moneda={form.moneda}
              />
              <PagoRow
                label="2ª Cuota — 50%"
                checked={form.pagoSegunda}
                fecha={form.fechaPagoSegunda}
                onCheck={() => set("pagoSegunda", !form.pagoSegunda)}
                onFecha={(v) => set("fechaPagoSegunda", v)}
                amount={half}
                moneda={form.moneda}
              />

              <div
                style={{
                  border: `2px solid ${
                    form.seguroPagado ? "#3B82F666" : "#2D3A50"
                  }`,
                  borderRadius: 12,
                  background: form.seguroPagado ? "#1E3A5F18" : "#111827",
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                  }}
                  onClick={() => set("seguroPagado", !form.seguroPagado)}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: form.seguroPagado ? "#3B82F6" : "transparent",
                      border: `2px solid ${
                        form.seguroPagado ? "#3B82F6" : "#4B5563"
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {form.seguroPagado && (
                      <span style={{ color: "#fff", fontSize: 14 }}>✓</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: form.seguroPagado ? "#BFDBFE" : "#9CA3AF",
                      }}
                    >
                      🛡️ Seguro de viaje pagado
                    </div>
                  </div>
                  {form.precioSeguro > 0 && (
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#3B82F6",
                      }}
                    >
                      {formatMoney(form.precioSeguro, form.moneda)}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: "1px solid #2D3A5070",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 11, color: "#6B7280" }}>
                    💰 Precio Seguro:
                  </span>
                  <input
                    type="number"
                    value={form.precioSeguro || ""}
                    onChange={(e) =>
                      set("precioSeguro", Number(e.target.value))
                    }
                    style={IS}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </Sec>

          <Sec title={`📁 Documentación — ${done}/${total} completados`}>
            <div
              style={{
                background: "#1A2234",
                borderRadius: 8,
                height: 8,
                marginBottom: 14,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: docsColor,
                }}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {DOC_MAIN.map((doc) => (
                <DocItem
                  key={doc.id}
                  doc={doc}
                  checked={form.docs?.[doc.id]}
                  onChange={(v) => setDoc(doc.id, v)}
                />
              ))}
            </div>
            <div
              style={{
                background: "#111827",
                border: "1px solid #1F2937",
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#4B5563",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Otros (Opcional)
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {DOC_EXTRAS.map((doc) => (
                  <DocItem
                    key={doc.id}
                    doc={doc}
                    checked={form.docs?.[doc.id]}
                    onChange={(v) => setDoc(doc.id, v)}
                  />
                ))}
              </div>
            </div>
          </Sec>

          <Sec title="📝 Notas">
            <textarea
              value={form.notas || ""}
              onChange={(e) => set("notas", e.target.value)}
              rows={3}
              placeholder="Observaciones..."
              style={IS}
            />
          </Sec>

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <div>
              {form.id && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        "¿Eliminar este cliente definitivamente de la base de datos?"
                      )
                    ) {
                      onDelete(form.id);
                      onClose();
                    }
                  }}
                  style={{
                    padding: "10px 16px",
                    background: "#EF444415",
                    border: "1px solid #EF444450",
                    color: "#EF4444",
                    borderRadius: 9,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  🗑️ Eliminar
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "10px 20px",
                  background: "#1A2234",
                  color: "#9CA3AF",
                  border: "1px solid #2D3A50",
                  borderRadius: 9,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!form.nombre) {
                    alert("El nombre es obligatorio");
                    return;
                  }
                  onSave(form);
                  onClose();
                }}
                style={{
                  padding: "10px 26px",
                  background: "linear-gradient(135deg,#0EA5E9,#6366F1)",
                  border: "none",
                  color: "#fff",
                  borderRadius: 9,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                💾 Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sec({ title, children }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#6B7280",
          marginBottom: 10,
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
function G2({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {children}
    </div>
  );
}
function Fld({ label, children }) {
  return (
    <div>
      <label
        style={{
          fontSize: 11,
          color: "#6B7280",
          display: "block",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
function Inp({ value, onChange, type = "text", placeholder }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={IS}
    />
  );
}

// ── TARJETA INDIVIDUAL DE CLIENTE (CON BOTÓN DE BORRADO DIRECTO) ──────────────────────────────
function ClientCard({ client, onClick, showDocs, onDeleteDirect }) {
  const ei = etapaInfo(client.etapa);
  const half = (client.totalPrecio || 0) / 2;
  const m =
    MONEDAS.find((x) => x.id === (client.moneda || "EUR")) || MONEDAS[0];

  return (
    <div
      onClick={onClick}
      style={{
        background: "#0D1117",
        border: "1px solid #1A2234",
        borderRadius: 16,
        padding: "18px 18px 14px",
        cursor: "pointer",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: ei.color,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#F9FAFB" }}>
            {client.nombre}
          </div>
          <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
            📍 {client.consulado || "Sin consulado"}{" "}
            {client.fechaCita
              ? `· 📅 ${fmtDate(client.fechaCita)}`
              : " · Sin cita"}
          </div>
        </div>
        <Badge etapa={client.etapa} />
      </div>

      <div
        style={{
          background: "#080C14",
          borderRadius: 10,
          padding: "10px 12px 6px",
          marginBottom: 12,
        }}
      >
        <MiniPipeline etapa={client.etapa} />
      </div>

      <div
        style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}
      >
        <PagoChip
          pagado={client.pagoPrimera}
          label={`1ª ${formatMoney(half, client.moneda || "EUR")}`}
          fecha={client.fechaPagoPrimera}
        />
        <PagoChip
          pagado={client.pagoSegunda}
          label={`2ª ${formatMoney(half, client.moneda || "EUR")}`}
          fecha={client.fechaPagoSegunda}
        />
        <PagoChip
          pagado={client.seguroPagado}
          label={
            client.precioSeguro > 0
              ? `Seg. ${formatMoney(
                  client.precioSeguro,
                  client.moneda || "EUR"
                )}`
              : "Seguro"
          }
        />
      </div>

      {showDocs && (
        <div
          style={{
            background: "#080C14",
            border: "1px solid #1A2234",
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {DOC_MAIN.map((doc) => {
              const ok = client.docs?.[doc.id];
              return (
                <div
                  key={doc.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: ok ? "#10B981" : "#EF4444",
                  }}
                >
                  <span>
                    {doc.icon} {doc.label}
                  </span>
                  <span>{ok ? "✓" : "✗"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <DocProgress docs={client.docs} />
        <div
          style={{
            textTransform: "uppercase",
            fontSize: 14,
            fontWeight: 800,
            color: "#F9FAFB",
            textAlign: "right",
          }}
        >
          <div>{formatMoney(client.totalPrecio, client.moneda || "EUR")}</div>
          <div style={{ fontSize: 9, color: "#4B5563" }}>
            {m.flag} {m.id}
          </div>
        </div>
      </div>

      {/* BOTÓN DE BORRADO INTEGRADO EN LA ESQUINA INFERIOR DE LA TARJETA */}
      <div
        style={{
          borderTop: "1px solid #1F2937",
          marginTop: 12,
          paddingTop: 10,
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation(); // Evita que se abra el modal al hacer clic en borrar
            if (
              confirm(
                `¿Estás seguro de que quieres eliminar a ${client.nombre} de la base de datos?`
              )
            ) {
              onDeleteDirect(client.id);
            }
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "#EF4444",
            cursor: "pointer",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 8px",
            borderRadius: 6,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#EF444415")}
          onMouseLeave={(e) => (e.target.style.background = "transparent")}
        >
          🗑️ Eliminar Cliente
        </button>
      </div>
    </div>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div
      style={{
        background: "#0D1117",
        border: "1px solid #1A2234",
        borderRadius: 12,
        padding: "14px 18px",
        flex: 1,
        minWidth: 130,
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function App() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterEtapa, setFilterEtapa] = useState("all");
  const [filterPago, setFilterPago] = useState("all");
  const [filterDoc, setFilterDoc] = useState("all");
  const [search, setSearch] = useState("");
  const [showDocsInCard, setShowDocsInCard] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  // 1. LEER LOS CLIENTES DESDE SUPABASE REAL
  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("clientes").select("*");
      if (error) throw error;
      if (data) {
        const formateados = data.map((c) => ({
          id: c.id,
          nombre: c.nombre || "",
          telefono: c.telefono || "",
          email: c.email || "",
          destino: c.destino || "Punta Cana",
          consulado: c.consulado || "",
          fechaCita: c.fecha_cita || "",
          totalPrecio: Number(c.total_precio || 0),
          moneda: c.moneda || "EUR",
          pagoPrimera: !!c.pago_primera,
          fechaPagoPrimera: c.fecha_pago_primera || "",
          pagoSegunda: !!c.pago_segunda,
          fechaPagoSegunda: c.fecha_pago_segunda || "",
          seguroPagado: !!c.seguro_pagado,
          precioSeguro: Number(c.precio_seguro || 0),
          etapa: c.etapa || "contacto",
          docs: c.docs || {},
          notas: c.notas || "",
        }));
        setClients(formateados);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. GUARDAR / ACTUALIZAR CLIENTE
  const saveClient = async (clientForm) => {
    const isNew = !clientForm.id;

    const dbPayload = {
      nombre: clientForm.nombre,
      telefono: clientForm.telefono || "",
      email: clientForm.email || "",
      consulado: clientForm.consulado || "",
      fecha_cita: clientForm.fechaCita || "",
      destino: clientForm.destino || "Punta Cana",
      total_precio: Number(clientForm.totalPrecio || 0),
      moneda: clientForm.moneda || "EUR",
      pago_primera: !!clientForm.pagoPrimera,
      fecha_pago_primera: clientForm.fechaPagoPrimera || "",
      pago_segunda: !!clientForm.pagoSegunda,
      fecha_pago_segunda: clientForm.fechaPagoSegunda || "",
      seguro_pagado: !!clientForm.seguroPagado,
      precio_seguro: Number(clientForm.precioSeguro || 0),
      etapa: clientForm.etapa || "contacto",
      docs: clientForm.docs || {},
      notas: clientForm.notas || "",
    };

    try {
      if (isNew) {
        const { error } = await supabase.from("clientes").insert([dbPayload]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("clientes")
          .update(dbPayload)
          .eq("id", clientForm.id);
        if (error) throw error;
      }
      fetchClients();
    } catch (err) {
      alert("⚠️ Error al guardar en Supabase: " + err.message);
    }
  };

  // 3. ELIMINAR CLIENTE POR UUID
  const deleteClient = async (id) => {
    try {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
      fetchClients();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  // FILTROS AVANZADOS
  const filtered = useMemo(
    () =>
      clients.filter((c) => {
        if (filterEtapa !== "all" && c.etapa !== filterEtapa) return false;
        if (filterPago === "pendiente1" && c.pagoPrimera) return false;
        if (filterPago === "pendiente2" && (!c.pagoPrimera || c.pagoSegunda))
          return false;
        if (filterPago === "pendiente_seguro" && c.seguroPagado) return false;
        if (filterDoc === "pendiente" && docProgress(c.docs).pct === 100)
          return false;
        if (filterDoc === "completa" && docProgress(c.docs).pct < 100)
          return false;
        if (
          search &&
          !c.nombre?.toLowerCase().includes(search.toLowerCase()) &&
          !c.telefono?.includes(search)
        )
          return false;
        return true;
      }),
    [clients, filterEtapa, filterPago, filterDoc, search]
  );

  const stats = useMemo(
    () => ({
      total: clients.length,
      pendiente1: clients.filter((c) => !c.pagoPrimera).length,
      pendiente2: clients.filter((c) => c.pagoPrimera && !c.pagoSegunda).length,
      pendienteSeguro: clients.filter((c) => !c.seguroPagado).length,
      concedidas: clients.filter((c) => c.etapa === "concedida").length,
    }),
    [clients]
  );

  const blank = {
    nombre: "",
    telefono: "",
    email: "",
    destino: "Punta Cana",
    consulado: "",
    fechaCita: "",
    totalPrecio: 800,
    moneda: "EUR",
    pagoPrimera: false,
    fechaPagoPrimera: "",
    pagoSegunda: false,
    fechaPagoSegunda: "",
    seguroPagado: false,
    precioSeguro: 0,
    etapa: "contacto",
    docs: Object.fromEntries(DOC_ALL.map((d) => [d.id, false])),
    notas: "",
  };

  const anyFilter =
    filterEtapa !== "all" ||
    filterPago !== "all" ||
    filterDoc !== "all" ||
    search;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080C14",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#F9FAFB",
        paddingBottom: 40,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: "#0B0F1A",
          borderBottom: "1px solid #1A2234",
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 11,
              background: "linear-gradient(135deg,#0EA5E9,#6366F1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            🌴
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.3 }}>
              Punta Cana Visados
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#10B981",
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              ⚡ Gestión Activa de Clientes
            </div>
          </div>
        </div>
        <button
          onClick={() => setSelected(blank)}
          style={{
            background: "linear-gradient(135deg,#0EA5E9,#6366F1)",
            border: "none",
            color: "#fff",
            borderRadius: 10,
            padding: "9px 18px",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          + Nuevo Cliente
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 28px" }}>
        {/* STATS */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          <StatCard
            value={stats.total}
            label="Total clientes"
            color="#F9FAFB"
          />
          <StatCard
            value={stats.pendiente1}
            label="Pdte. 1ª cuota"
            color="#F59E0B"
          />
          <StatCard
            value={stats.pendiente2}
            label="Pdte. 2ª cuota"
            color="#EC4899"
          />
          <StatCard
            value={stats.pendienteSeguro}
            label="Sin seguro"
            color="#EF4444"
          />
          <StatCard
            value={stats.concedidas}
            label="Visados concedidos"
            color="#10B981"
          />
        </div>

        {/* PIPELINE CLICKABLE */}
        <div
          style={{
            display: "flex",
            marginBottom: 22,
            background: "#0B0F1A",
            border: "1px solid #1A2234",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {ETAPAS.map((e, i) => {
            const count = clients.filter((c) => c.etapa === e.id).length;
            const active = filterEtapa === e.id;
            return (
              <button
                key={e.id}
                onClick={() => setFilterEtapa(active ? "all" : e.id)}
                style={{
                  flex: 1,
                  padding: "11px 4px",
                  background: active ? e.color + "22" : "transparent",
                  border: "none",
                  borderRight:
                    i < ETAPAS.length - 1 ? "1px solid #1A2234" : "none",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 17, fontWeight: 800, color: e.color }}>
                  {count}
                </div>
                <div
                  style={{
                    fontSize: 8.5,
                    color: active ? e.color : "#6B7280",
                    marginTop: 2,
                  }}
                >
                  {e.icon} {e.short}
                </div>
              </button>
            );
          })}
        </div>

        {/* FILTROS */}
        <div
          style={{
            background: "#0B0F1A",
            border: "1px solid #1A2234",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 18,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Buscar cliente..."
            style={{ ...IS, flex: 1, minWidth: 150, maxWidth: 220 }}
          />

          <select
            value={filterEtapa}
            onChange={(e) => setFilterEtapa(e.target.value)}
            style={{ ...IS, width: "auto" }}
          >
            <option value="all">Todas las etapas</option>
            {ETAPAS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.icon} {e.label}
              </option>
            ))}
          </select>

          <select
            value={filterPago}
            onChange={(e) => setFilterPago(e.target.value)}
            style={{ ...IS, width: "auto" }}
          >
            <option value="all">Todos los pagos</option>
            <option value="pendiente1">Pdte. 1ª cuota</option>
            <option value="pendiente2">Pdte. 2ª cuota</option>
            <option value="pendiente_seguro">Sin seguro</option>
          </select>

          <select
            value={filterDoc}
            onChange={(e) => {
              setFilterDoc(e.target.value);
              if (e.target.value !== "all") setShowDocsInCard(true);
            }}
            style={{ ...IS, width: "auto" }}
          >
            <option value="all">Toda la documentación</option>
            <option value="pendiente">📋 Docs pendientes</option>
            <option value="completa">✅ Docs completas</option>
          </select>

          <button
            onClick={() => setShowDocsInCard(!showDocsInCard)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${showDocsInCard ? "#8B5CF6" : "#2D3A50"}`,
              background: showDocsInCard ? "#8B5CF620" : "#1A2234",
              color: showDocsInCard ? "#8B5CF6" : "#6B7280",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {showDocsInCard ? "📋 Ocultar docs" : "📋 Ver docs en tarjetas"}
          </button>

          {anyFilter && (
            <button
              onClick={() => {
                setFilterEtapa("all");
                setFilterPago("all");
                setFilterDoc("all");
                setSearch("");
                setShowDocsInCard(false);
              }}
              style={{
                background: "#1A2234",
                border: "1px solid #2D3A50",
                color: "#9CA3AF",
                borderRadius: 8,
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              ✕ Limpiar
            </button>
          )}
        </div>

        {/* GRID DE CLIENTES */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: "#6B7280",
              padding: "60px",
              fontSize: 14,
            }}
          >
            ⚡ Sincronizando con la base de datos...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#4B5563",
              padding: "60px 0",
              fontSize: 15,
            }}
          >
            No hay clientes que coincidan con los filtros.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 14,
            }}
          >
            {filtered.map((c) => (
              <ClientCard
                key={c.id}
                client={c}
                onClick={() => setSelected(c)}
                showDocs={showDocsInCard}
                onDeleteDirect={deleteClient}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selected && (
        <ClientModal
          client={selected}
          onClose={() => setSelected(null)}
          onSave={saveClient}
          onDelete={deleteClient}
        />
      )}
    </div>
  );
}
