import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  PlusCircle,
  BarChart3,
  Settings,
  FileText,
  ChevronDown,
  Calendar,
  Leaf,
  Users,
  Truck,
  Coins,
  Factory,
  Plus,
} from "lucide-react";
type DivProps = React.HTMLAttributes<HTMLDivElement>;
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

function Card({ className = "", ...props }: DivProps) {
  return <div className={`bg-white ${className}`} {...props} />;
}

function CardContent({ className = "", ...props }: DivProps) {
  return <div className={className} {...props} />;
}

function CardHeader({ className = "", ...props }: DivProps) {
  return <div className={className} {...props} />;
}

function CardTitle({ className = "", ...props }: DivProps) {
  return <h2 className={`font-semibold text-slate-900 ${className}`} {...props} />;
}

function Button({ className = "", type = "button", ...props }: BtnProps) {
  return <button type={type} className={className} {...props} />;
}

function Input({ className = "", ...props }: InputProps) {
  return <input className={`w-full border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-green-200 ${className}`} {...props} />;
}

function Tabs({ className = "", ...props }: DivProps) {
  return <div className={className} {...props} />;
}

function TabsList({ className = "", ...props }: DivProps) {
  return <div className={className} {...props} />;
}

function TabsTrigger({ className = "", active = false, ...props }: BtnProps & { active?: boolean }) {
  return (
    <button
      type="button"
      className={`${className} ${active ? "bg-white text-green-700 shadow-sm" : "text-slate-500"}`}
      {...props}
    />
  );
}

function Progress({ value = 0, className = "" }: { value?: number; className?: string }) {
  return (
    <div className={`w-full rounded-full bg-slate-200 overflow-hidden ${className}`}>
      <div className="h-full rounded-full bg-green-600" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

const blocks = [
  { name: "Sinonin", factory: "Sireet" },
  { name: "Sangalo", factory: "Sireet" },
  { name: "Bitonin", factory: "Sireet" },
  { name: "Cheptabach", factory: "Sireet" },
];

const pluckers = [
  "Gladys Yego",
  "Sheila Jesang",
  "Frankline Kirwa",
  "Stanley Kosgei",
  "Caren Jepngetich",
  "Eunice Koech",
  "Contractors",
];

const initialFactoryRates = {
  Sireet: { price: 25, transport: 3.99, cess: 0.22, bonus: 0.5, wage: 9.5, shares: 5 },
  "Sang'alo": { price: 25.5, transport: 0, cess: 0.22, bonus: 0, wage: 8, shares: 0 },
  Chebut: { price: 26, transport: 5, cess: 0.22, bonus: 0, wage: 7, shares: 0 },
  Kapchorua: { price: 23, transport: 0, cess: 0.22, bonus: 0, wage: 10, shares: 0 },
};

type FactoryRates = typeof initialFactoryRates;
type FactoryName = keyof FactoryRates;

const sampleEntries = [
  { date: "2026-04-20", block: "Sinonin", plucker: "Gladys Yego", kg: 11, factory: "Sireet" },
  { date: "2026-04-20", block: "Sinonin", plucker: "Sheila Jesang", kg: 14, factory: "Sireet" },
  { date: "2026-04-20", block: "Sinonin", plucker: "Frankline Kirwa", kg: 16, factory: "Sireet" },
  { date: "2026-04-20", block: "Sinonin", plucker: "Caren Jepngetich", kg: 21, factory: "Sireet" },
  { date: "2026-04-20", block: "Sangalo", plucker: "Contractors", kg: 13, factory: "Sireet" },
  { date: "2026-04-20", block: "Sangalo", plucker: "Stanley Kosgei", kg: 13, factory: "Sireet" },
  { date: "2026-04-20", block: "Sangalo", plucker: "Eunice Koech", kg: 12, factory: "Sireet" },
];

function fmtMoney(value: number) {
  return `KSh ${Math.round(value).toLocaleString("en-KE")}`;
}

function getFactoryRate(factoryRates: FactoryRates, factory: string) {
  return factoryRates[factory as FactoryName] || { price: 0, transport: 0, cess: 0, bonus: 0, wage: 0, shares: 0 };
}

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <Card className="rounded-2xl shadow-sm border-0">
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{title}</div>
        <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
        {subtitle ? <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div> : null}
      </CardContent>
    </Card>
  );
}

function SectionTitle({ icon: Icon, title, action }: { icon: any; title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-1">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-green-700" />
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      {action ? <button className="text-xs text-green-700 font-medium">{action}</button> : null}
    </div>
  );
}

function HomeScreen({ entries, factoryRates }: { entries: typeof sampleEntries; factoryRates: FactoryRates }) {
  const totals = useMemo(() => {
    const kg = entries.reduce((sum, e) => sum + e.kg, 0);
    const gross = entries.reduce((sum, e) => sum + e.kg * getFactoryRate(factoryRates, e.factory).price, 0);
    const transport = entries.reduce((sum, e) => sum + e.kg * getFactoryRate(factoryRates, e.factory).transport, 0);
    const cess = entries.reduce((sum, e) => sum + e.kg * getFactoryRate(factoryRates, e.factory).cess, 0);
    const bonus = entries.reduce((sum, e) => sum + e.kg * getFactoryRate(factoryRates, e.factory).bonus, 0);
    const labour = entries.reduce((sum, e) => sum + e.kg * getFactoryRate(factoryRates, e.factory).wage, 0);
    const shares = entries.reduce((sum, e) => sum + e.kg * getFactoryRate(factoryRates, e.factory).shares, 0);
    const netCash = gross - transport - cess - shares;
    return { kg, bonus, labour, shares, netCash, totalValue: netCash + bonus };
  }, [entries, factoryRates]);

  const blockTotals = blocks
    .map((b) => ({
      name: b.name,
      kg: entries.filter((e) => e.block === b.name).reduce((s, e) => s + e.kg, 0),
    }))
    .sort((a, b) => b.kg - a.kg);

  const pluckerTotals = Object.entries(
    entries.reduce((acc: Record<string, number>, e) => {
      acc[e.plucker] = (acc[e.plucker] || 0) + e.kg;
      return acc;
    }, {})
  )
    .map(([name, kg]) => ({ name, kg }))
    .sort((a, b) => b.kg - a.kg);

  const topBlock = blockTotals[0]?.kg || 1;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-green-800 via-green-700 to-lime-600 text-white p-5 shadow-lg">
        <div className="text-sm opacity-90">Good morning</div>
        <div className="text-2xl font-bold mt-1">Sinonin Harvest Tracker</div>
        <div className="text-sm mt-2 opacity-90">Track greenleaf, labour, deductions, and expected value by block, plucker, and factory.</div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-2xl bg-white/15 p-3">
            <div className="text-xs uppercase opacity-80">This month</div>
            <div className="text-2xl font-bold mt-1">{totals.kg.toLocaleString("en-KE")} kg</div>
          </div>
          <div className="rounded-2xl bg-white/15 p-3">
            <div className="text-xs uppercase opacity-80">Cash pay</div>
            <div className="text-2xl font-bold mt-1">{fmtMoney(totals.netCash)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Bonus retained" value={fmtMoney(totals.bonus)} subtitle="Accrued" />
        <StatCard title="Labour" value={fmtMoney(totals.labour)} subtitle="Current entries" />
        <StatCard title="Total value" value={fmtMoney(totals.totalValue)} subtitle="Cash + bonus" />
        <StatCard title="Shares retained" value={fmtMoney(totals.shares)} subtitle="Factory share contribution" />
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-4">
          <SectionTitle icon={Leaf} title="Block performance" action="See all" />
          <div className="space-y-4">
            {blockTotals.map((b) => (
              <div key={b.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-800">{b.name}</span>
                  <span className="text-slate-600">{b.kg.toLocaleString("en-KE")} kg</span>
                </div>
                <Progress value={(b.kg / topBlock) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-4">
          <SectionTitle icon={Users} title="Top pluckers" action="Full ranking" />
          <div className="space-y-3">
            {pluckerTotals.slice(0, 4).map((p, i) => (
              <div key={p.name} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-800">{i + 1}. {p.name}</div>
                  <div className="text-xs text-slate-500">Estimated wage {fmtMoney(p.kg * getFactoryRate(factoryRates, "Sireet").wage)}</div>
                </div>
                <div className="text-sm font-semibold text-green-700">{p.kg} kg</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AddScreen({ onAdd, factoryRates }: { onAdd: (entry: any) => void; factoryRates: FactoryRates }) {
  const [mode, setMode] = useState("quick");
  const [block, setBlock] = useState("Sinonin");
  const [plucker, setPlucker] = useState("Gladys Yego");
  const [kg, setKg] = useState("");
  const [batch, setBatch] = useState([
    { plucker: "Gladys Yego", kg: "" },
    { plucker: "Sheila Jesang", kg: "" },
    { plucker: "Frankline Kirwa", kg: "" },
  ]);

  const activeFactory = blocks.find((b) => b.name === block)?.factory || "Sireet";
  const activeRates = getFactoryRate(factoryRates, activeFactory);

  const saveQuick = () => {
    const numericKg = Number(kg);
    if (!numericKg) return;
    onAdd({ date: "2026-04-22", block, plucker, kg: numericKg, factory: activeFactory });
    setKg("");
  };

  const saveBatch = () => {
    const validRows = batch.filter((row) => Number(row.kg) > 0);
    validRows.forEach((row) => {
      onAdd({ date: "2026-04-22", block, plucker: row.plucker, kg: Number(row.kg), factory: activeFactory });
    });
    setBatch(batch.map((r) => ({ ...r, kg: "" })));
  };

  return (
    <div className="space-y-4">
      <Tabs className="w-full">
        <TabsList className="grid grid-cols-2 rounded-2xl w-full bg-slate-200 p-1">
          <TabsTrigger value="quick" active={mode === "quick"} className="rounded-2xl py-2" onClick={() => setMode("quick")}>Quick Entry</TabsTrigger>
          <TabsTrigger value="batch" active={mode === "batch"} className="rounded-2xl py-2" onClick={() => setMode("batch")}>Batch Entry</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="rounded-3xl border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{mode === "quick" ? "Add harvest" : "Batch harvest entry"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-between rounded-2xl border p-3 text-sm">
              <span>{block}</span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
            <button className="flex items-center justify-between rounded-2xl border p-3 text-sm">
              <span>{activeFactory}</span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          {mode === "quick" ? (
            <>
              <button className="flex items-center justify-between rounded-2xl border p-3 text-sm w-full">
                <span>{plucker}</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>

              <div className="rounded-3xl bg-slate-50 p-4 border">
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Kg input</div>
                <Input
                  value={kg}
                  onChange={(e) => setKg(e.target.value)}
                  placeholder="Enter kg plucked"
                  inputMode="decimal"
                  className="h-16 text-3xl font-bold rounded-2xl border-0 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border p-3 flex items-center gap-2"><Calendar className="h-4 w-4 text-green-700" />22/04/2026</div>
                <div className="rounded-2xl border p-3 flex items-center gap-2"><Truck className="h-4 w-4 text-green-700" />Factory delivered</div>
              </div>

              <Button className="w-full h-12 rounded-2xl bg-green-700 hover:bg-green-800" onClick={saveQuick}>
                Save entry
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-3">
                {batch.map((row, idx) => (
                  <div key={row.plucker} className="grid grid-cols-[1fr_120px] gap-3 items-center">
                    <div className="rounded-2xl border p-3 text-sm">{row.plucker}</div>
                    <Input
                      value={row.kg}
                      onChange={(e) => {
                        const copy = [...batch];
                        copy[idx].kg = e.target.value;
                        setBatch(copy);
                      }}
                      placeholder="kg"
                      inputMode="decimal"
                      className="h-12 rounded-2xl text-right"
                    />
                  </div>
                ))}
              </div>

              <Button className="w-full h-12 rounded-2xl bg-green-700 hover:bg-green-800" onClick={saveBatch}>
                Save all
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-4">
          <SectionTitle icon={Coins} title="Current factory economics" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-slate-50 p-3">Price/kg: <span className="font-semibold">KSh {activeRates.price}</span></div>
            <div className="rounded-2xl bg-slate-50 p-3">Transport: <span className="font-semibold">KSh {activeRates.transport}</span></div>
            <div className="rounded-2xl bg-slate-50 p-3">Tea cess: <span className="font-semibold">KSh {activeRates.cess}</span></div>
            <div className="rounded-2xl bg-slate-50 p-3">Bonus/kg: <span className="font-semibold">KSh {activeRates.bonus}</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RecordsScreen({ entries, factoryRates }: { entries: typeof sampleEntries; factoryRates: FactoryRates }) {
  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-4">
          <SectionTitle icon={FileText} title="Recent records" />
          <div className="space-y-3">
            {entries.slice().reverse().map((e, idx) => {
              const rate = getFactoryRate(factoryRates, e.factory);
              return (
                <div key={`${e.date}-${e.block}-${e.plucker}-${idx}`} className="rounded-2xl border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-800">{e.plucker}</div>
                      <div className="text-sm text-slate-500">{e.date} • {e.block} • {e.factory}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-700">{e.kg} kg</div>
                      <div className="text-xs text-slate-500">Net cash {fmtMoney(e.kg * (rate.price - rate.transport - rate.cess - rate.shares))}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InsightsScreen({ entries, factoryRates }: { entries: typeof sampleEntries; factoryRates: FactoryRates }) {
  const byBlock = blocks.map((b) => {
    const blockEntries = entries.filter((e) => e.block === b.name);
    const kg = blockEntries.reduce((sum, e) => sum + e.kg, 0);
    const net = blockEntries.reduce((sum, e) => {
      const rate = getFactoryRate(factoryRates, e.factory);
      return sum + e.kg * (rate.price - rate.transport - rate.cess - rate.shares);
    }, 0);
    const labour = blockEntries.reduce((sum, e) => sum + e.kg * getFactoryRate(factoryRates, e.factory).wage, 0);
    return { block: b.name, kg, net, labour, margin: net - labour };
  });

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-4">
          <SectionTitle icon={BarChart3} title="Block economics" />
          <div className="space-y-3">
            {byBlock.map((b) => (
              <div key={b.block} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-800">{b.block}</div>
                  <div className="text-sm font-medium text-green-700">{b.kg} kg</div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-slate-600">
                  <div>Net cash<br /><span className="font-semibold text-slate-900">{fmtMoney(b.net)}</span></div>
                  <div>Labour<br /><span className="font-semibold text-slate-900">{fmtMoney(b.labour)}</span></div>
                  <div>Margin<br /><span className="font-semibold text-slate-900">{fmtMoney(b.margin)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsScreen({ factoryRates, setFactoryRates }: { factoryRates: FactoryRates; setFactoryRates: React.Dispatch<React.SetStateAction<FactoryRates>> }) {
  const [newFactoryName, setNewFactoryName] = useState("");

  const updateFactoryRate = (factoryName: string, field: string, value: string) => {
    setFactoryRates((prev) => ({
      ...prev,
      [factoryName]: {
        ...(prev[factoryName as FactoryName] || { price: 0, transport: 0, cess: 0.22, bonus: 0, wage: 0, shares: 0 }),
        [field]: Number(value) || 0,
      },
    }));
  };

  const addFactory = () => {
    const cleanName = newFactoryName.trim();
    if (!cleanName || factoryRates[cleanName as FactoryName]) return;
    setFactoryRates((prev) => ({
      ...prev,
      [cleanName]: { price: 0, transport: 0, cess: 0.22, bonus: 0, wage: 0, shares: 0 },
    } as FactoryRates));
    setNewFactoryName("");
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <SectionTitle icon={Factory} title="Factory data entries" />
          <div className="space-y-4">
            {Object.entries(factoryRates).map(([factoryName, rates]) => (
              <div key={factoryName} className="rounded-2xl border p-4 space-y-3">
                <div className="font-semibold text-slate-900">{factoryName}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Price per kg</div>
                    <Input value={String(rates.price)} onChange={(e) => updateFactoryRate(factoryName, "price", e.target.value)} className="rounded-2xl" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Transport</div>
                    <Input value={String(rates.transport)} onChange={(e) => updateFactoryRate(factoryName, "transport", e.target.value)} className="rounded-2xl" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Tea cess</div>
                    <Input value={String(rates.cess)} onChange={(e) => updateFactoryRate(factoryName, "cess", e.target.value)} className="rounded-2xl" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Bonus per kg</div>
                    <Input value={String(rates.bonus)} onChange={(e) => updateFactoryRate(factoryName, "bonus", e.target.value)} className="rounded-2xl" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Wage per kg</div>
                    <Input value={String(rates.wage)} onChange={(e) => updateFactoryRate(factoryName, "wage", e.target.value)} className="rounded-2xl" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Shares contribution</div>
                    <Input value={String(rates.shares)} onChange={(e) => updateFactoryRate(factoryName, "shares", e.target.value)} className="rounded-2xl" />
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-2xl bg-slate-50 p-3 border border-dashed">
              <div className="text-xs text-slate-500 mb-2">Add factory</div>
              <div className="flex gap-2">
                <Input value={newFactoryName} onChange={(e) => setNewFactoryName(e.target.value)} placeholder="e.g. Kapsabet Tea Factory" className="rounded-2xl" />
                <Button onClick={addFactory} className="rounded-2xl bg-green-700 hover:bg-green-800 px-4">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-4">
          <SectionTitle icon={Users} title="Pluckers & blocks" />
          <div className="text-sm text-slate-600 leading-7">
            <div><span className="font-medium text-slate-900">Blocks:</span> Sinonin, Sangalo, Bitonin, Cheptabach</div>
            <div><span className="font-medium text-slate-900">Pluckers:</span> managed from master list</div>
            <div><span className="font-medium text-slate-900">Currency:</span> KSh</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [entries, setEntries] = useState(sampleEntries);
  const [factoryRates, setFactoryRates] = useState(initialFactoryRates);

  const addEntry = (entry: typeof sampleEntries[number]) => {
    setEntries((prev) => [...prev, entry]);
    setTab("home");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-slate-100"
      >
        <div className="sticky top-0 z-10 bg-slate-100/90 backdrop-blur pb-3 pt-1">
          <div className="text-center text-xs text-slate-500 mb-2">Prototype</div>
        </div>

        {tab === "home" && <HomeScreen entries={entries} factoryRates={factoryRates} />}
        {tab === "add" && <AddScreen onAdd={addEntry} factoryRates={factoryRates} />}
        {tab === "records" && <RecordsScreen entries={entries} factoryRates={factoryRates} />}
        {tab === "insights" && <InsightsScreen entries={entries} factoryRates={factoryRates} />}
        {tab === "settings" && <SettingsScreen factoryRates={factoryRates} setFactoryRates={setFactoryRates} />}

        <div className="h-24" />

        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
          <div className="bg-white rounded-3xl shadow-lg border p-2 grid grid-cols-5 gap-1">
            {[
              { key: "home", icon: Home, label: "Home" },
              { key: "records", icon: FileText, label: "Records" },
              { key: "add", icon: PlusCircle, label: "Add" },
              { key: "insights", icon: BarChart3, label: "Insights" },
              { key: "settings", icon: Settings, label: "Settings" },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-xs ${tab === key ? "bg-green-50 text-green-700" : "text-slate-500"}`}
              >
                <Icon className={`h-5 w-5 ${key === "add" ? "h-6 w-6" : ""}`} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
