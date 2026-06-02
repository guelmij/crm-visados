import { useState, useMemo } from "react";

// ── CONSTANTES ────────────────────────────────────────────────────────────────
const ETAPAS = [
  { id: "contacto",      label: "1er Contacto",   short: "Contacto",  color: "#6B7280", icon: "📞" },
  { id: "primera_cuota", label: "1ª Cuota",        short: "1ª Cuota",  color: "#F59E0B", icon: "💳" },
  { id: "cita",          label: "Cita Concertada", short: "Cita",      color: "#8B5CF6", icon: "📅" },
  { id: "documentacion", label: "Documentación",   short: "Docs",      color: "#3B82F6", icon: "📁" },
  { id: "presentacion",  label: "Presentación",    short: "Consulado", color: "#EC4899", icon: "🏛️" },
  { id: "concedida",     label: "Concedida",       short: "Concedida", color: "#10B981", icon: "✅" },
  { id: "denegada",      label: "Denegada",        short: "Denegada",  color: "#EF4444", icon: "❌" },
];
const ETAPAS_FLUJO = ETAPAS.slice(0, 5);

// Docs principales (cuentan para la barra de progreso)
const DOC_MAIN = [
  { id: "pasaporte",  label: "Pasaporte vigente", icon: "🛂" },
  { id: "seguro",     label: "Seguro de viaje",   icon: "🛡️" },
  { id: "plan_viaje", label: "Plan de viaje",     icon: "🗺️" },
  { id: "hotel",      label: "Reserva de hotel",  icon: "🏨" },
  { id: "avion",      label: "Reserva de avión",  icon: "✈️" },
];
// Docs extras (NO cuentan para la barra de progreso)
const DOC_EXTRAS = [
  { id: "tour", label: "Tours y actividades", icon: "🌊" },
  { id: "taxi", label: "Traslados / Taxis",   icon: "🚕" },
];
const DOC_ALL = [...DOC_MAIN, ...DOC_EXTRAS];

const MONEDAS = [
  { id: "EUR", symbol: "€",   label: "Euro",            flag: "🇪🇺" },
  { id: "USD", symbol: "$",   label: "Dólar",           flag: "🇺🇸" },
  { id: "DOP", symbol: "RD$", label: "Peso Dominicano", flag: "🇩🇴" },
];

const DEMO_CLIENTS = [
  {
    id: 1, nombre: "María García", telefono: "+34 611 222 333", email: "maria@email.com",
    destino: "Punta Cana", consulado: "Madrid", fechaCita: "2025-07-15",
    totalPrecio: 1200, moneda: "EUR",
    pagoPrimera: true,  fechaPagoPrimera: "2025-05-10",
    pagoSegunda: false, fechaPagoSegunda: "",
    seguroPagado: true, precioSeguro: 85, etapa: "cita",
    docs: { pasaporte: true, seguro: true, plan_viaje: true, hotel: true, avion: false, tour: false, taxi: false },
    notas: "Espera confirmación de cita",
  },
  {
    id: 2, nombre: "Carlos López", telefono: "+34 622 333 444", email: "carlos@email.com",
    destino: "Punta Cana", consulado: "Barcelona", fechaCita: "2025-07-20",
    totalPrecio: 950, moneda: "EUR",
    pagoPrimera: true,  fechaPagoPrimera: "2025-04-15",
    pagoSegunda: true,  fechaPagoSegunda: "2025-07-21",
    seguroPagado: true, precioSeguro: 90, etapa: "concedida",
    docs: { pasaporte: true, seguro: true, plan_viaje: true, hotel: true, avion: true, tour: true, taxi: true },
    notas: "Visado concedido 10 años",
  },
  {
    id: 3, nombre: "Ana Martínez", telefono: "+34 633 444 555", email: "ana@email.com",
    destino: "Punta Cana", consulado: "Madrid", fechaCita: "",
    totalPrecio: 45000, moneda: "DOP",
    pagoPrimera: false, fechaPagoPrimera: "",
    pagoSegunda: false, fechaPagoSegunda: "",
    seguroPagado: false, precioSeguro: 0, etapa: "contacto",
    docs: { pasaporte: false, seguro: false, plan_viaje: false, hotel: false, avion: false, tour: false, taxi: false },
    notas: "Primer contacto realizado",
  },
  {
    id: 4, nombre: "Pedro Sánchez", telefono: "+34 644 555 666", email: "pedro@email.com",
    destino: "Punta Cana", consulado: "Valencia", fechaCita: "2025-08-01",
    totalPrecio: 1100, moneda: "USD",
    pagoPrimera: true,  fechaPagoPrimera: "2025-06-01",
    pagoSegunda: false, fechaPagoSegunda: "",
    seguroPagado: false, precioSeguro: 75, etapa: "documentacion",
    docs: { pasaporte: true, seguro: false, plan_viaje: true, hotel: true, avion: true, tour: false, taxi: false },
    notas: "Falta seguro de viaje",
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const etapaInfo  = (id) => ETAPAS.find((e) => e.id === id) || ETAPAS[0];
const etapaIndex = (id) => ETAPAS_FLUJO.findIndex((e) => e.id === id);
// Solo DOC_MAIN cuenta para el progreso
const docProgress = (docs) => {
  const total = DOC_MAIN.length;
  const done  = DOC_MAIN.filter((d) => docs[d.id]).length;
  return { done, total, pct: Math.round((done / total) * 100) };
};
const formatMoney = (amount, moneda) => {
  const m = MONEDAS.find((x) => x.id === moneda) || MONEDAS[0];
  const n = Number(amount).toLocaleString("es-ES", { minimumFractionDigits: 0 });
  return `${m.symbol}${n}`;
};
const fmtDate = (iso) => iso
  ? new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
  : "";

// ── BASE STYLE ────────────────────────────────────────────────────────────────
const IS = {
  background: "#1A2234", border: "1px solid #2D3A50", color: "#F9FAFB",
  borderRadius: 8, padding: "8px 12px", fontSize: 13, width: "100%",
  boxSizing: "border-box", outline: "none",
};

// ── BADGE ─────────────────────────────────────────────────────────────────────
function Badge({ etapa }) {
  const info = etapaInfo(etapa);
  return (
    <span style={{
      background: info.color + "22", color: info.color,
      border: `1px solid ${info.color}55`,
      borderRadius: 6, padding: "2px 9px",
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>{info.icon} {info.label}</span>
  );
}

// ── MINI PIPELINE (tarjeta) ────────────────────────────────────────────────────
function MiniPipeline({ etapa }) {
  const activeIdx = etapaIndex(etapa);
  const isResult  = ["concedida", "denegada"].includes(etapa);
  const resultInfo = isResult ? etapaInfo(etapa) : null;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {ETAPAS_FLUJO.map((e, i) => {
          const done   = isResult || activeIdx > i;
          const active = !isResult && activeIdx === i;
          const col    = done || active ? e.color : "#2D3748";
          return (
            <div key={e.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: done ? e.color : active ? e.color + "30" : "#1A2234",
                  border: `2px solid ${col}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 800, color: done ? "#fff" : col,
                  boxShadow: active ? `0 0 9px ${e.color}88` : "none",
                  transition: "all .3s",
                }}>
                  {done ? "✓" : i + 1}
                </div>
                <div style={{
                  fontSize: 8, marginTop: 3, color: active ? e.color : done ? "#6B7280" : "#374151",
                  fontWeight: active ? 700 : 400, textAlign: "center", lineHeight: 1.2, maxWidth: 44,
                }}>{e.short}</div>
              </div>
              {i < ETAPAS_FLUJO.length - 1 && (
                <div style={{ flex: 1, height: 2, marginBottom: 14, background: done ? e.color : "#1F2937", transition: "background .3s" }} />
              )}
            </div>
          );
        })}
      </div>
      {resultInfo && (
        <div style={{
          marginTop: 6, textAlign: "center",
          background: resultInfo.color + "18", border: `1px solid ${resultInfo.color}44`,
          borderRadius: 8, padding: "5px 10px", color: resultInfo.color, fontWeight: 700, fontSize: 12,
        }}>{resultInfo.icon} {resultInfo.label}</div>
      )}
    </div>
  );
}

// ── DOC PROGRESS BAR ─────────────────────────────────────────────────────────
function DocProgress({ docs }) {
  const { done, total, pct } = docProgress(docs);
  const color = pct === 100 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3 }}>
        <span style={{ color: "#6B7280" }}>Documentación</span>
        <span style={{ color, fontWeight: 700 }}>{done}/{total}</span>
      </div>
      <div style={{ background: "#1F2937", borderRadius: 4, height: 5, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width .4s" }} />
      </div>
    </div>
  );
}

// ── PAGO CHIP ─────────────────────────────────────────────────────────────────
function PagoChip({ pagado, label, fecha }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 1,
      padding: "4px 9px", borderRadius: 8,
      background: pagado ? "#10B98118" : "#EF444418",
      border: `1px solid ${pagado ? "#10B98145" : "#EF444445"}`,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: pagado ? "#10B981" : "#EF4444" }}>
        {pagado ? "✓" : "✗"} {label}
      </span>
      {pagado && fecha && <span style={{ fontSize: 9, color: "#6B7280" }}>{fmtDate(fecha)}</span>}
    </div>
  );
}

// ── PAGO ROW CHECKLIST ────────────────────────────────────────────────────────
function PagoRow({ label, sublabel, checked, fecha, onCheck, onFecha, amount, moneda }) {
  return (
    <div style={{
      border: `2px solid ${checked ? "#10B98166" : "#2D3A50"}`,
      borderRadius: 12,
      background: checked ? "linear-gradient(135deg,#10B98110,#064E3B18)" : "#111827",
      padding: "14px 16px", transition: "all .3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, cursor: "pointer" }} onClick={onCheck}>
          <div style={{
            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
            background: checked ? "#10B981" : "transparent",
            border: `2px solid ${checked ? "#10B981" : "#4B5563"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .25s",
          }}>
            {checked && <span style={{ color: "#fff", fontSize: 14, fontWeight: 900, lineHeight: 1 }}>✓</span>}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: checked ? "#D1FAE5" : "#9CA3AF", transition: "color .3s" }}>{label}</div>
            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>{sublabel}</div>
          </div>
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: checked ? "#10B981" : "#4B5563", transition: "color .3s" }}>
          {formatMoney(amount, moneda)}
        </div>
      </div>
      {checked && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #10B98130", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#6B7280", whiteSpace: "nowrap" }}>📅 Fecha de pago:</span>
          <input type="date" value={fecha} onChange={(e) => onFecha(e.target.value)}
            style={{ ...IS, flex: 1, fontSize: 12, padding: "5px 10px" }} />
          {fecha && <span style={{ fontSize: 11, color: "#10B981", fontWeight: 600, whiteSpace: "nowrap" }}>{fmtDate(fecha)}</span>}
        </div>
      )}
    </div>
  );
}

// ── ETAPA SELECTOR (botones) ──────────────────────────────────────────────────
function EtapaSelector({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Fila flujo principal */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {ETAPAS_FLUJO.map((e) => {
          const active = value === e.id;
          return (
            <button key={e.id} onClick={() => onChange(e.id)} style={{
              flex: 1, minWidth: 80, padding: "8px 6px",
              background: active ? e.color + "30" : "#1A2234",
              border: `2px solid ${active ? e.color : "#2D3A50"}`,
              borderRadius: 10, cursor: "pointer", transition: "all .2s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            }}>
              <span style={{ fontSize: 16 }}>{e.icon}</span>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? e.color : "#6B7280", lineHeight: 1.2, textAlign: "center" }}>
                {e.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Fila resultado */}
      <div style={{ display: "flex", gap: 6 }}>
        {ETAPAS.slice(5).map((e) => {
          const active = value === e.id;
          return (
            <button key={e.id} onClick={() => onChange(e.id)} style={{
              flex: 1, padding: "8px 12px",
              background: active ? e.color + "25" : "#1A2234",
              border: `2px solid ${active ? e.color : "#2D3A50"}`,
              borderRadius: 10, cursor: "pointer", transition: "all .2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <span style={{ fontSize: 14 }}>{e.icon}</span>
              <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? e.color : "#6B7280" }}>{e.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── FULL PIPELINE (modal) ─────────────────────────────────────────────────────
function EtapaFullPipeline({ etapa }) {
  const activeIdx = etapaIndex(etapa);
  const isResult  = ["concedida", "denegada"].includes(etapa);
  const resultInfo = isResult ? etapaInfo(etapa) : null;
  return (
    <div style={{ padding: "10px 0 4px" }}>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {ETAPAS_FLUJO.map((e, i) => {
          const done   = isResult || activeIdx > i;
          const active = !isResult && activeIdx === i;
          const col    = done || active ? e.color : "#374151";
          return (
            <div key={e.id} style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: done ? e.color : active ? e.color + "30" : "#1A2234",
                  border: `2.5px solid ${col}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: done ? 15 : 14, fontWeight: 800, color: done ? "#fff" : col,
                  boxShadow: active ? `0 0 16px ${e.color}99` : "none", transition: "all .35s",
                }}>
                  {done ? "✓" : e.icon}
                </div>
                <div style={{
                  fontSize: 10, marginTop: 6, textAlign: "center", lineHeight: 1.3,
                  color: active ? e.color : done ? "#9CA3AF" : "#4B5563",
                  fontWeight: active ? 700 : 400, maxWidth: 64,
                }}>{e.label}</div>
              </div>
              {i < ETAPAS_FLUJO.length - 1 && (
                <div style={{ flex: 0.6, height: 3, marginTop: 16, background: done ? e.color : "#1F2937", transition: "background .35s", borderRadius: 2 }} />
              )}
            </div>
          );
        })}
      </div>
      {resultInfo && (
        <div style={{
          marginTop: 12, textAlign: "center",
          background: resultInfo.color + "18", border: `1.5px solid ${resultInfo.color}50`,
          borderRadius: 10, padding: "8px 14px", color: resultInfo.color, fontWeight: 700, fontSize: 14,
        }}>{resultInfo.icon} Resultado: {resultInfo.label}</div>
      )}
    </div>
  );
}

// ── DOC CHECKLIST ITEM ────────────────────────────────────────────────────────
function DocItem({ doc, checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      display: "flex", alignItems: "center", gap: 10,
      background: checked ? "#10B98112" : "#111827",
      border: `1.5px solid ${checked ? "#10B98150" : "#2D3A50"}`,
      borderRadius: 10, padding: "10px 13px", cursor: "pointer", transition: "all .2s",
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 5, flexShrink: 0,
        background: checked ? "#10B981" : "transparent",
        border: `2px solid ${checked ? "#10B981" : "#4B5563"}`,
        display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s",
      }}>
        {checked && <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>✓</span>}
      </div>
      <span style={{ fontSize: 13 }}>{doc.icon}</span>
      <span style={{ fontSize: 12, color: checked ? "#D1FAE5" : "#9CA3AF", fontWeight: 500, flex: 1 }}>{doc.label}</span>
    </div>
  );
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function ClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState({ ...client, docs: { ...client.docs }, precioSeguro: client.precioSeguro || 0 });
  const set    = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setDoc = (k, v) => setForm((f) => ({ ...f, docs: { ...f.docs, [k]: v } }));

  const { done, total, pct } = docProgress(form.docs);
  const docsColor = pct === 100 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444";
  const half = form.totalPrecio / 2;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000000bb", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, backdropFilter: "blur(6px)",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#0B0F1A", border: "1px solid #1F2937",
        borderRadius: 20, width: "100%", maxWidth: 720,
        maxHeight: "93vh", overflowY: "auto",
        boxShadow: "0 40px 80px #000e",
      }}>
        {/* Sticky header */}
        <div style={{
          padding: "18px 24px 14px", borderBottom: "1px solid #1F2937",
          position: "sticky", top: 0, background: "#0B0F1A", zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#F9FAFB" }}>{form.nombre || "Nuevo cliente"}</div>
            <div style={{ marginTop: 5, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Badge etapa={form.etapa} />
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#1F2937", border: "none", color: "#9CA3AF", width: 36, height: 36, borderRadius: 8, fontSize: 20, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* ETAPA */}
          <Sec title="📍 Etapa del Proceso">
            <EtapaSelector value={form.etapa} onChange={(v) => set("etapa", v)} />
            <div style={{ marginTop: 14 }}>
              <EtapaFullPipeline etapa={form.etapa} />
            </div>
          </Sec>

          {/* DATOS */}
          <Sec title="👤 Datos del Cliente">
            <G2>
              <Fld label="Nombre completo"><Inp value={form.nombre} onChange={(v) => set("nombre", v)} placeholder="Nombre del cliente" /></Fld>
              <Fld label="Teléfono"><Inp value={form.telefono} onChange={(v) => set("telefono", v)} placeholder="+34 600 000 000" /></Fld>
              <Fld label="Email"><Inp value={form.email} onChange={(v) => set("email", v)} placeholder="email@ejemplo.com" /></Fld>
              <Fld label="Consulado"><Inp value={form.consulado} onChange={(v) => set("consulado", v)} placeholder="Ciudad del consulado" /></Fld>
              <Fld label="Fecha de Cita Consular"><Inp type="date" value={form.fechaCita} onChange={(v) => set("fechaCita", v)} /></Fld>
              <Fld label="Destino"><Inp value={form.destino} onChange={(v) => set("destino", v)} /></Fld>
            </G2>
          </Sec>

          {/* PAGOS */}
          <Sec title="💰 Pagos">
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <Fld label="Precio Total">
                <Inp type="number" value={form.totalPrecio} onChange={(v) => set("totalPrecio", Number(v))} />
              </Fld>
              <Fld label="Moneda">
                <select value={form.moneda} onChange={(e) => set("moneda", e.target.value)} style={IS}>
                  {MONEDAS.map((m) => <option key={m.id} value={m.id}>{m.flag} {m.symbol} — {m.label}</option>)}
                </select>
              </Fld>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <PagoRow
                label="1ª Cuota — 50% inicial" sublabel="Necesario para iniciar el proceso"
                checked={form.pagoPrimera} fecha={form.fechaPagoPrimera}
                onCheck={() => set("pagoPrimera", !form.pagoPrimera)}
                onFecha={(v) => set("fechaPagoPrimera", v)}
                amount={half} moneda={form.moneda}
              />
              <PagoRow
                label="2ª Cuota — 50% restante" sublabel="Se cobra cuando se concede el visado"
                checked={form.pagoSegunda} fecha={form.fechaPagoSegunda}
                onCheck={() => set("pagoSegunda", !form.pagoSegunda)}
                onFecha={(v) => set("fechaPagoSegunda", v)}
                amount={half} moneda={form.moneda}
              />

              {/* Seguro con precio */}
              <div style={{
                border: `2px solid ${form.seguroPagado ? "#3B82F666" : "#2D3A50"}`,
                borderRadius: 12, background: form.seguroPagado ? "linear-gradient(135deg,#1E3A5F18,#1E40AF12)" : "#111827",
                padding: "14px 16px", transition: "all .3s",
              }}>
                {/* Fila superior: checkbox + label + importe */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => set("seguroPagado", !form.seguroPagado)}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                    background: form.seguroPagado ? "#3B82F6" : "transparent",
                    border: `2px solid ${form.seguroPagado ? "#3B82F6" : "#4B5563"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all .25s",
                  }}>
                    {form.seguroPagado && <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: form.seguroPagado ? "#BFDBFE" : "#9CA3AF", transition: "color .3s" }}>
                      🛡️ Seguro de viaje pagado
                    </div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>Requerido para la presentación consular</div>
                  </div>
                  {form.precioSeguro > 0 && (
                    <div style={{ fontSize: 16, fontWeight: 800, color: form.seguroPagado ? "#3B82F6" : "#6B7280", transition: "color .3s" }}>
                      {formatMoney(form.precioSeguro, form.moneda)}
                    </div>
                  )}
                </div>
                {/* Campo precio — siempre visible */}
                <div style={{
                  marginTop: 12, paddingTop: 10,
                  borderTop: `1px solid ${form.seguroPagado ? "#3B82F635" : "#2D3A5070"}`,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 11, color: "#6B7280", whiteSpace: "nowrap" }}>💰 Precio del seguro:</span>
                  <input
                    type="number" value={form.precioSeguro || ""}
                    onChange={(e) => { e.stopPropagation(); set("precioSeguro", Number(e.target.value)); }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="0"
                    style={{ ...IS, flex: 1, fontSize: 13, padding: "6px 10px" }}
                  />
                  <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>
                    {MONEDAS.find((m) => m.id === form.moneda)?.flag} {form.moneda}
                  </span>
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div style={{ marginTop: 12, background: "#111827", border: "1px solid #1F2937", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#6B7280" }}>Total cobrado</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: "#F9FAFB" }}>
                {formatMoney((form.pagoPrimera ? half : 0) + (form.pagoSegunda ? half : 0), form.moneda)}
                <span style={{ fontSize: 11, color: "#4B5563", fontWeight: 400 }}> / {formatMoney(form.totalPrecio, form.moneda)}</span>
              </span>
            </div>
          </Sec>

          {/* DOCUMENTACIÓN */}
          <Sec title={`📁 Documentación — ${done}/${total} completados`}>
            <div style={{ background: "#1A2234", borderRadius: 8, height: 8, marginBottom: 14, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: docsColor, borderRadius: 8, transition: "width .4s" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              {DOC_MAIN.map((doc) => (
                <DocItem key={doc.id} doc={doc} checked={form.docs[doc.id]} onChange={(v) => setDoc(doc.id, v)} />
              ))}
            </div>
            {/* Sección Otros (no cuenta para progreso) */}
            <div style={{ background: "#111827", border: "1px solid #1F2937", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#4B5563", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Otros (opcional · no afecta al progreso)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {DOC_EXTRAS.map((doc) => (
                  <DocItem key={doc.id} doc={doc} checked={form.docs[doc.id]} onChange={(v) => setDoc(doc.id, v)} />
                ))}
              </div>
            </div>
          </Sec>

          {/* NOTAS */}
          <Sec title="📝 Notas">
            <textarea value={form.notas} onChange={(e) => set("notas", e.target.value)}
              rows={3} placeholder="Observaciones del cliente..."
              style={{ ...IS, resize: "vertical", width: "100%", boxSizing: "border-box" }} />
          </Sec>

          {/* ACCIONES */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "10px 20px", background: "#1A2234", border: "1px solid #2D3A50", color: "#9CA3AF", borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Cancelar</button>
            <button onClick={() => { onSave(form); onClose(); }} style={{ padding: "10px 26px", background: "linear-gradient(135deg,#0EA5E9,#6366F1)", border: "none", color: "#fff", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>💾 Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HELPERS MODAL ─────────────────────────────────────────────────────────────
function Sec({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1.2 }}>{title}</div>
      {children}
    </div>
  );
}
function G2({ children }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>; }
function Fld({ label, children }) {
  return <div><label style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>{children}</div>;
}
function Inp({ value, onChange, type = "text", placeholder }) {
  return <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={IS} />;
}

// ── DOC BADGE INLINE ──────────────────────────────────────────────────────────
function DocBadge({ ok, label }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 6,
      background: ok ? "#10B98115" : "#EF444415",
      color: ok ? "#10B981" : "#EF4444",
      border: `1px solid ${ok ? "#10B98135" : "#EF444435"}`,
      whiteSpace: "nowrap",
    }}>{ok ? "✓" : "✗"} {label}</span>
  );
}

// ── TARJETA CLIENTE ───────────────────────────────────────────────────────────
function ClientCard({ client, onClick, showDocs }) {
  const ei   = etapaInfo(client.etapa);
  const prog = docProgress(client.docs);
  const half = client.totalPrecio / 2;
  const m    = MONEDAS.find((x) => x.id === (client.moneda || "EUR")) || MONEDAS[0];

  return (
    <div onClick={onClick} style={{
      background: "#0D1117", border: "1px solid #1A2234",
      borderRadius: 16, padding: "18px 18px 14px", cursor: "pointer",
      transition: "all .22s", position: "relative", overflow: "hidden",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 10px 35px ${ei.color}20`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1A2234"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${ei.color}, ${ei.color}88)` }} />

      {/* Nombre */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#F9FAFB" }}>{client.nombre}</div>
          <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
            📍 {client.consulado || "Sin consulado"}
            {client.fechaCita ? ` · 📅 ${fmtDate(client.fechaCita)}` : " · Sin cita"}
          </div>
        </div>
        <Badge etapa={client.etapa} />
      </div>

      {/* Pipeline */}
      <div style={{ background: "#080C14", borderRadius: 10, padding: "10px 12px 6px", marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: "#4B5563", marginBottom: 6, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase" }}>Progreso del proceso</div>
        <MiniPipeline etapa={client.etapa} />
      </div>

      {/* Pagos */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        <PagoChip pagado={client.pagoPrimera} label={`1ª ${formatMoney(half, client.moneda || "EUR")}`} fecha={client.fechaPagoPrimera} />
        <PagoChip pagado={client.pagoSegunda} label={`2ª ${formatMoney(half, client.moneda || "EUR")}`} fecha={client.fechaPagoSegunda} />
        <PagoChip pagado={client.seguroPagado} label={client.precioSeguro > 0 ? `Seg. ${formatMoney(client.precioSeguro, client.moneda || "EUR")}` : "Seguro"} />
      </div>

      {/* Panel de documentación expandido si showDocs */}
      {showDocs && (
        <div style={{ background: "#080C14", border: "1px solid #1A2234", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#4B5563", marginBottom: 8, fontWeight: 700, letterSpacing: 0.9, textTransform: "uppercase" }}>
            📋 Estado de documentación
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {DOC_MAIN.map((doc) => {
              const ok = client.docs[doc.id];
              return (
                <div key={doc.id} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "5px 8px", borderRadius: 7,
                  background: ok ? "#10B98110" : "#EF444410",
                  border: `1px solid ${ok ? "#10B98128" : "#EF444428"}`,
                }}>
                  <span style={{ fontSize: 11 }}>{doc.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, flex: 1, color: ok ? "#D1FAE5" : "#FCA5A5" }}>{doc.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: ok ? "#10B981" : "#EF4444" }}>{ok ? "✓" : "✗"}</span>
                </div>
              );
            })}
            {/* Otros */}
            <div style={{ marginTop: 4, paddingTop: 6, borderTop: "1px solid #1F2937" }}>
              <div style={{ fontSize: 9, color: "#4B5563", marginBottom: 4, fontWeight: 600 }}>OTROS (opcional)</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {DOC_EXTRAS.map((doc) => {
                  const ok = client.docs[doc.id];
                  return (
                    <span key={doc.id} style={{
                      fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                      background: ok ? "#10B98115" : "#1A2234",
                      color: ok ? "#10B981" : "#4B5563",
                      border: `1px solid ${ok ? "#10B98130" : "#2D3A50"}`,
                    }}>{doc.icon} {doc.label} {ok ? "✓" : "—"}</span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <DocProgress docs={client.docs} />
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#F9FAFB" }}>{formatMoney(client.totalPrecio, client.moneda || "EUR")}</div>
          <div style={{ fontSize: 10, color: "#4B5563" }}>{m.flag} {m.id}</div>
        </div>
      </div>
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ value, label, color }) {
  return (
    <div style={{ background: "#0D1117", border: "1px solid #1A2234", borderRadius: 12, padding: "14px 18px", flex: 1, minWidth: 110 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [clients, setClients]     = useState(DEMO_CLIENTS);
  const [selected, setSelected]   = useState(null);
  const [filterEtapa, setFilterEtapa] = useState("all");
  const [filterPago, setFilterPago]   = useState("all");
  const [filterDoc, setFilterDoc]     = useState("all"); // all | pendiente | completa
  const [search, setSearch]           = useState("");
  const [showDocsInCard, setShowDocsInCard] = useState(false);

  const filtered = useMemo(() => clients.filter((c) => {
    if (filterEtapa !== "all" && c.etapa !== filterEtapa) return false;
    if (filterPago === "pendiente1"       && c.pagoPrimera) return false;
    if (filterPago === "pendiente2"       && (!c.pagoPrimera || c.pagoSegunda)) return false;
    if (filterPago === "pendiente_seguro" && c.seguroPagado) return false;
    if (filterDoc === "pendiente" && docProgress(c.docs).pct === 100) return false;
    if (filterDoc === "completa"  && docProgress(c.docs).pct < 100) return false;
    if (search && !c.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [clients, filterEtapa, filterPago, filterDoc, search]);

  const stats = useMemo(() => ({
    total:           clients.length,
    pendiente1:      clients.filter((c) => !c.pagoPrimera).length,
    pendiente2:      clients.filter((c) => c.pagoPrimera && !c.pagoSegunda).length,
    pendienteSeguro: clients.filter((c) => !c.seguroPagado).length,
    concedidas:      clients.filter((c) => c.etapa === "concedida").length,
    docsPendiente:   clients.filter((c) => docProgress(c.docs).pct < 100).length,
  }), [clients]);

  const blank = {
    id: Date.now(), nombre: "", telefono: "", email: "",
    destino: "Punta Cana", consulado: "", fechaCita: "",
    totalPrecio: 800, moneda: "EUR",
    pagoPrimera: false, fechaPagoPrimera: "",
    pagoSegunda: false, fechaPagoSegunda: "",
    seguroPagado: false, precioSeguro: 0, etapa: "contacto",
    docs: Object.fromEntries(DOC_ALL.map((d) => [d.id, false])),
    notas: "",
  };

  const save = (upd) => setClients((cs) =>
    cs.some((c) => c.id === upd.id) ? cs.map((c) => c.id === upd.id ? upd : c) : [...cs, { ...upd, id: Date.now() }]
  );

  const anyFilter = filterEtapa !== "all" || filterPago !== "all" || filterDoc !== "all" || search;

  return (
    <div style={{ minHeight: "100vh", background: "#080C14", fontFamily: "'Sora','DM Sans',system-ui,sans-serif", color: "#F9FAFB" }}>

      {/* HEADER */}
      <div style={{ background: "#0B0F1A", borderBottom: "1px solid #1A2234", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: "linear-gradient(135deg,#0EA5E9,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🌴</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.3 }}>Punta Cana Visados</div>
            <div style={{ fontSize: 11, color: "#4B5563" }}>Gestión de clientes · Agencia de viajes</div>
          </div>
        </div>
        <button onClick={() => setSelected(blank)} style={{ background: "linear-gradient(135deg,#0EA5E9,#6366F1)", border: "none", color: "#fff", borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Nuevo Cliente</button>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 28px" }}>

        {/* STATS */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
          <StatCard value={stats.total}           label="Total clientes"      color="#F9FAFB" />
          <StatCard value={stats.pendiente1}      label="Pdte. 1ª cuota"     color="#F59E0B" />
          <StatCard value={stats.pendiente2}      label="Pdte. 2ª cuota"     color="#EC4899" />
          <StatCard value={stats.pendienteSeguro} label="Sin seguro"          color="#EF4444" />
          <StatCard value={stats.docsPendiente}   label="Docs pendientes"     color="#8B5CF6" />
          <StatCard value={stats.concedidas}      label="Visados concedidos"  color="#10B981" />
        </div>

        {/* PIPELINE CLICKABLE */}
        <div style={{ display: "flex", marginBottom: 22, background: "#0B0F1A", border: "1px solid #1A2234", borderRadius: 14, overflow: "hidden" }}>
          {ETAPAS.map((e, i) => {
            const count  = clients.filter((c) => c.etapa === e.id).length;
            const active = filterEtapa === e.id;
            return (
              <button key={e.id} onClick={() => setFilterEtapa(active ? "all" : e.id)}
                style={{ flex: 1, padding: "11px 4px", background: active ? e.color + "22" : "transparent", border: "none", borderRight: i < ETAPAS.length - 1 ? "1px solid #1A2234" : "none", cursor: "pointer", transition: "background .2s" }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: e.color }}>{count}</div>
                <div style={{ fontSize: 8.5, color: active ? e.color : "#6B7280", marginTop: 2, lineHeight: 1.3 }}>{e.icon} {e.short}</div>
              </button>
            );
          })}
        </div>

        {/* FILTROS */}
        <div style={{ background: "#0B0F1A", border: "1px solid #1A2234", borderRadius: 12, padding: "12px 16px", marginBottom: 18, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Buscar cliente..."
            style={{ ...IS, flex: 1, minWidth: 150, maxWidth: 220 }} />

          <select value={filterEtapa} onChange={(e) => setFilterEtapa(e.target.value)} style={{ ...IS, width: "auto" }}>
            <option value="all">Todas las etapas</option>
            {ETAPAS.map((e) => <option key={e.id} value={e.id}>{e.icon} {e.label}</option>)}
          </select>

          <select value={filterPago} onChange={(e) => setFilterPago(e.target.value)} style={{ ...IS, width: "auto" }}>
            <option value="all">Todos los pagos</option>
            <option value="pendiente1">Pdte. 1ª cuota</option>
            <option value="pendiente2">Pdte. 2ª cuota</option>
            <option value="pendiente_seguro">Sin seguro</option>
          </select>

          {/* Filtro docs con toggle de mostrar en tarjeta */}
          <select value={filterDoc} onChange={(e) => {
            const v = e.target.value;
            setFilterDoc(v);
            if (v !== "all") setShowDocsInCard(true);
          }} style={{ ...IS, width: "auto" }}>
            <option value="all">Toda la documentación</option>
            <option value="pendiente">📋 Docs pendientes</option>
            <option value="completa">✅ Docs completas</option>
          </select>

          {/* Botón para mostrar/ocultar docs en tarjetas */}
          <button onClick={() => setShowDocsInCard((v) => !v)} style={{
            padding: "8px 12px", borderRadius: 8,
            border: `1px solid ${showDocsInCard ? "#8B5CF6" : "#2D3A50"}`,
            background: showDocsInCard ? "#8B5CF620" : "#1A2234",
            color: showDocsInCard ? "#8B5CF6" : "#6B7280",
            cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
            transition: "all .2s",
          }}>
            {showDocsInCard ? "📋 Ocultar docs" : "📋 Ver docs en tarjetas"}
          </button>

          {anyFilter && (
            <button onClick={() => { setFilterEtapa("all"); setFilterPago("all"); setFilterDoc("all"); setSearch(""); setShowDocsInCard(false); }}
              style={{ background: "#1A2234", border: "1px solid #2D3A50", color: "#9CA3AF", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 12 }}>
              ✕ Limpiar
            </button>
          )}
          <span style={{ fontSize: 12, color: "#4B5563", marginLeft: "auto" }}>
            {filtered.length} cliente{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* GRID */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "#4B5563", padding: "60px 0", fontSize: 15 }}>No hay clientes que coincidan con los filtros</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
            {filtered.map((c) => (
              <ClientCard key={c.id} client={c} onClick={() => setSelected(c)} showDocs={showDocsInCard} />
            ))}
          </div>
        )}
      </div>

      {selected && <ClientModal client={selected} onClose={() => setSelected(null)} onSave={save} />}
    </div>
  );
}
