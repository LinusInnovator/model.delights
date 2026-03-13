"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Skull,
    Sparkle,
    WarningCircle,
    LinkBreak,
    Flask,
    ArrowRight,
    ChartLineUp,
    Money,
    Gear,
    RocketLaunch,
    Lightbulb,
    Target,
    Printer
} from "@phosphor-icons/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Assumption = {
    category: "Desirability" | "Viability" | "Feasibility";
    assumption: string;
    impact: number;
    evidence: number;
    leverage_score: number;
    rationale: string;
};

type ValidationData = {
    pattern_match: { historical_pattern: string; rationale: string };
    critical_assumptions: Assumption[];
    logic_chain: string[];
    experiment_sequence: {
        assumption_tested: string;
        experiment_type: string;
        setup: string;
        metric: string;
        validation_threshold: string;
    }[];
    kill_criteria_protocol?: {
        deadliest_assumption: string;
        validation_protocol: string;
        actionable_template: string;
    };
};

type TriangulationData = {
    autopsyData: ValidationData;
    catalystData: ValidationData;
    insightSummary: {
        core_tension: string;
        the_verdict: string;
        strategic_pivot: {
            action: string;
            rationale: string;
        };
        base_opportunity_score: number;
        ai_unit_economics_autopsy?: {
            gross_margin_health: "CRITICAL" | "STABLE" | "EXPONENTIAL";
            financial_verdict: string;
        };
    };
};

type Pivot = {
    title: string;
    description: string;
    new_idea: string;
    suggested_price: number;
    suggested_users: number;
};

const LOADING_SIZZLE = [
    "Spinning up Red Team Analyst (Autopsy)...",
    "Spinning up Green Team Analyst (Catalyst)...",
    "Pressure-testing desirability, viability, feasibility...",
    "Extracting exponential upside matrices...",
    "Correlating historical successes and catastrophic failures...",
    "Drafting Executive Synthesized Insight..."
];

export default function ValidatorFeature({ initialIdea = "", autoStart = false }: { initialIdea?: string, autoStart?: boolean }) {
    const [mode, setMode] = useState<"insight" | "autopsy" | "catalyst">("insight");
    const [idea, setIdea] = useState(initialIdea);
    const [users, setUsers] = useState<number>(1000);
    const [price, setPrice] = useState<number>(20);
    const [inference, setInference] = useState<number>(500);
    const [showEconomics, setShowEconomics] = useState<boolean>(false);
    const [ventureType, setVentureType] = useState<"zero_to_one" | "challenger">("zero_to_one");
    const [incumbentTarget, setIncumbentTarget] = useState("");
    const [riskMitigation, setRiskMitigation] = useState<number>(50);
    const [growthExecution, setGrowthExecution] = useState<number>(50);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState(0);
    const [data, setData] = useState<TriangulationData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPivoting, setIsPivoting] = useState(false);
    const [pivots, setPivots] = useState<Pivot[] | null>(null);
    const hasAutoStarted = useRef(false);

    useEffect(() => {
        if (autoStart && idea && !hasAutoStarted.current) {
            hasAutoStarted.current = true;
            // Delay slightly to let the UI settle and show the loading state properly
            setTimeout(() => {
                handleValidate();
            }, 100);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoStart, idea]);

    const handleValidate = async () => {
        if (!idea.trim()) return;
        setIsLoading(true);
        setError(null);
        setData(null);
        setMode("insight"); // Reset to default synthesis view when executing
        setRiskMitigation(50); // Reset confidence sliders
        setGrowthExecution(50);

        const interval = setInterval(() => {
            setLoadingStage((prev) => (prev + 1) % LOADING_SIZZLE.length);
        }, 2000);

        try {
            const res = await fetch("/api/validate-triangulation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idea, users, price, inference, includeEconomics: showEconomics, ventureType, incumbentTarget }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Triangulation orchestrator failed.");
            }
            const result = await res.json();
            setData(result);
        } catch (err: unknown) {
            setError((err as Error).message || "The Triangulation Engine encountered a critical exception. Please try again.");
        } finally {
            clearInterval(interval);
            setIsLoading(false);
        }
    };

    const generatePivots = async () => {
        setIsPivoting(true);
        try {
            const res = await fetch("/api/generate-pivots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idea,
                    ventureType,
                    originalScore: data?.insightSummary?.base_opportunity_score || 0
                }),
            });
            const result = await res.json();
            setPivots(result.pivots || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsPivoting(false);
        }
    };

    const adoptPivot = (pivotIdea: string, pivotPrice: number, pivotUsers: number) => {
        setIdea(pivotIdea);
        setPrice(pivotPrice);
        setUsers(pivotUsers);
        setPivots(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    // Helper to get active raw dataset
    const activeData = mode === "autopsy" ? data?.autopsyData : data?.catalystData;

    // Napkin Math Generator
    const generateNapkinMath = () => {
        if (!showEconomics) return [];
        const chartData = [];
        let currentUsers = users;
        for (let i = 1; i <= 36; i++) {
            const revenue = currentUsers * price;
            const aiCost = (currentUsers * inference / 1000000) * 5; // Assumed $5/1M Tokens blended
            const mrr = revenue - aiCost;
            const valuation = mrr > 0 ? (mrr * 12 * 10) : 0; // 10x ARR multiple
            chartData.push({
                name: `M${i}`,
                Revenue: Math.round(revenue),
                AICost: Math.round(aiCost),
                Valuation: Math.round(valuation)
            });
            currentUsers = Math.round(currentUsers * 1.15); // Aggressive 15% MoM
        }
        return chartData;
    };
    const napkinData = showEconomics ? generateNapkinMath() : [];

    return (
        <div className={`min-h-screen text-zinc-300 font-sans transition-colors duration-500 pb-32 ${mode === 'autopsy' ? 'bg-[#0a0000] selection:bg-red-900' :
            mode === 'catalyst' ? 'bg-[#000a05] selection:bg-emerald-900' :
                'bg-black selection:bg-purple-900'
            } selection:text-white print:bg-white print:text-black print:overflow-visible`}>
            <div className="max-w-4xl mx-auto px-6 py-20 print:p-0">

                {/* Hero Top */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
                        <Target weight="fill" className="text-purple-500" />
                        TRIANGULATED VENTURE ENGINE v2.0
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 lowercase">
                        Tell us your idea. <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-indigo-500 to-emerald-400">
                            We&apos;ll show you the truth.
                        </span>
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Execute a parallel strategy session. The Red Team will map how it dies. The Green Team will map how it scales. The Insight Engine synthesizes the ultimate path forward.
                    </p>
                </motion.div>

                {/* Input Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-16 relative"
                >
                    {/* The Engine Fork Toggle */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-zinc-950/80 p-1.5 rounded-full border border-zinc-800/80 shadow-2xl flex items-center gap-1 relative z-20 w-full max-w-sm">
                            <button
                                onClick={() => setVentureType("zero_to_one")}
                                className={`relative flex-1 py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${ventureType === "zero_to_one" ? "text-white" : "text-zinc-600 hover:text-zinc-400"}`}
                            >
                                {ventureType === "zero_to_one" && (
                                    <motion.div layoutId="venture-pill" className="absolute inset-0 bg-zinc-800 rounded-full" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                                )}
                                <span className="relative z-10">New Category</span>
                            </button>
                            <button
                                onClick={() => setVentureType("challenger")}
                                className={`relative flex-1 py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${ventureType === "challenger" ? "text-white" : "text-zinc-600 hover:text-zinc-400"}`}
                            >
                                {ventureType === "challenger" && (
                                    <motion.div layoutId="venture-pill" className="absolute inset-0 bg-red-900/50 border border-red-800/50 rounded-full" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                                )}
                                <span className="relative z-10">Attack Winner</span>
                            </button>
                        </div>
                        <AnimatePresence>
                            {ventureType === "challenger" && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: "auto" }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="w-full max-w-sm mt-3 overflow-hidden"
                                >
                                    <input 
                                        type="text"
                                        placeholder="Who are you attacking? (e.g. Notion)"
                                        value={incumbentTarget}
                                        onChange={e => setIncumbentTarget(e.target.value)}
                                        className="w-full bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-3 text-sm text-red-100 placeholder-red-900/50 focus:outline-none focus:border-red-500/50 transition-colors"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* The 24-Month Unit Economics Sliders Toggle */}
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={() => setShowEconomics(!showEconomics)}
                            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-xs font-bold uppercase tracking-widest transition-colors z-20 relative"
                        >
                            <Gear weight="fill" className={showEconomics ? "text-purple-500" : ""} />
                            Configure Unit Economics
                        </button>
                    </div>

                    <AnimatePresence>
                        {showEconomics && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row gap-4 mb-4 text-sm font-mono text-zinc-400">
                                    <div className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center gap-2 relative group overflow-hidden">
                                        <label className="flex justify-between items-center z-10 relative">
                                            <span className="uppercase text-xs tracking-widest text-zinc-500 font-bold">Est. Monthly Users</span>
                                            <span className="text-white font-bold">{users.toLocaleString()}</span>
                                        </label>
                                        <input type="range" min="10" max="100000" step="10" value={users} onChange={e => setUsers(Number(e.target.value))} className="w-full accent-zinc-300 relative z-10" />
                                    </div>
                                    <div className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center gap-2 relative group overflow-hidden">
                                        <label className="flex justify-between items-center z-10 relative">
                                            <span className="uppercase text-xs tracking-widest text-emerald-700 font-bold">Monthly Price ($)</span>
                                            <span className="text-emerald-400 font-bold">${price}</span>
                                        </label>
                                        <input type="range" min="0" max="500" step="1" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full accent-emerald-500 relative z-10" />
                                    </div>
                                    <div className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center gap-2 relative group overflow-hidden">
                                        <label className="flex justify-between items-center z-10 relative">
                                            <span className="uppercase text-xs tracking-widest text-red-700 font-bold">AI Req / User / Mo</span>
                                            <span className="text-red-400 font-bold">{inference.toLocaleString()} reqs</span>
                                        </label>
                                        <input type="range" min="10" max="10000" step="10" value={inference} onChange={e => setInference(Number(e.target.value))} className="w-full accent-red-500 relative z-10" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Search Input Box */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-indigo-600 to-emerald-600 rounded-2xl blur opacity-20 transition-all duration-500"></div>
                        <div className="relative bg-zinc-950 p-2 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col md:flex-row gap-2">
                            <textarea
                                value={idea}
                                onChange={(e) => setIdea(e.target.value)}
                                placeholder={ventureType === 'challenger' ? "e.g., A faster, AI-native version of Jira built specifically for marketing agencies..." : "e.g., A marketplace connecting freelance AI engineers with local dental clinics..."}
                                className="flex-1 bg-transparent text-white p-4 h-32 md:h-16 resize-none focus:outline-none placeholder-zinc-600 text-lg leading-snug"
                            />
                            <button
                                onClick={handleValidate}
                                disabled={isLoading || !idea.trim()}
                                className="bg-white text-black px-8 py-4 rounded-xl font-bold tracking-tight hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <Sparkle weight="fill" className="animate-spin" />
                                ) : (
                                    "Initiate Triangulation"
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Loading State */}
                <AnimatePresence mode="wait">
                    {isLoading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="py-12 border border-zinc-800 rounded-2xl bg-zinc-900 inner-shadow-lg flex flex-col items-center justify-center text-center px-4"
                        >
                            <div className="w-10 h-10 mb-6 border-4 border-zinc-800 border-t-purple-500 rounded-full animate-spin"></div>
                            <h3 className="text-white font-mono text-lg mb-2">ENGAGING MULTI-AGENT ORCHESTRATOR</h3>
                            <p className="text-zinc-500 font-mono text-sm animate-pulse">
                                &gt; {LOADING_SIZZLE[loadingStage]}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <div className="p-4 border border-red-900 bg-red-950/20 text-red-400 rounded-lg text-center mb-8 font-mono">
                        {error}
                    </div>
                )}

                {/* The Renders */}
                <AnimatePresence mode="wait">
                    {!isLoading && data && mode === "insight" && (
                        <motion.div
                            key="insight"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-12 max-w-3xl mx-auto"
                        >
                            <motion.div variants={itemVariants} className="space-y-6">
                                {/* Verdict Card */}
                                <div className="p-8 md:p-10 rounded-3xl bg-zinc-900 border border-purple-900/40 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                        <Lightbulb weight="fill" className="text-purple-500 text-9xl" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-inner">
                                                <Lightbulb weight="fill" className="text-white text-2xl" />
                                            </div>
                                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Executive Verdict</h2>
                                        </div>
                                        <p className="text-xl md:text-2xl text-zinc-200 font-medium leading-relaxed">
                                            &quot;{data.insightSummary.the_verdict}&quot;
                                        </p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Core Tension */}
                                    <div className="p-8 rounded-3xl bg-zinc-950/50 border border-zinc-800 flex flex-col">
                                        <div className="flex items-center gap-2 mb-4 text-zinc-400">
                                            <WarningCircle weight="fill" className="text-orange-500" />
                                            <h3 className="uppercase font-bold tracking-wider text-sm">The Core Tension</h3>
                                        </div>
                                        <p className="text-lg text-zinc-300 leading-relaxed flex-1">
                                            {data.insightSummary.core_tension}
                                        </p>
                                    </div>

                                    {/* Strategic Pivot */}
                                    <div className="p-8 rounded-3xl bg-zinc-950/50 border border-zinc-800 flex flex-col">
                                        <div className="flex items-center gap-2 mb-4 text-zinc-400">
                                            <Target weight="fill" className="text-indigo-400" />
                                            <h3 className="uppercase font-bold tracking-wider text-sm">Strategic Pivot</h3>
                                        </div>
                                        <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-4 mb-4">
                                            <p className="font-bold text-indigo-300">{data.insightSummary.strategic_pivot.action}</p>
                                        </div>
                                        <p className="text-zinc-400 leading-relaxed text-sm flex-1">
                                            <strong className="text-zinc-300">Why: </strong>
                                            {data.insightSummary.strategic_pivot.rationale}
                                        </p>
                                    </div>
                                    
                                    {/* AI Unit Economics Simulator Verdict */}
                                    {data.insightSummary.ai_unit_economics_autopsy && (
                                        <div className="p-8 rounded-3xl bg-zinc-950/50 border border-zinc-800 flex flex-col md:col-span-2 print:border-black print:bg-white print:text-black">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2 text-zinc-400 print:text-black">
                                                    <Money weight="fill" className={data.insightSummary.ai_unit_economics_autopsy.gross_margin_health === 'CRITICAL' ? 'text-red-500 print:text-black' : data.insightSummary.ai_unit_economics_autopsy.gross_margin_health === 'EXPONENTIAL' ? 'text-emerald-400 print:text-black' : 'text-yellow-500 print:text-black'} />
                                                    <h3 className="uppercase font-bold tracking-wider text-sm flex items-center gap-2">
                                                        AI Unit Economics Autopsy
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className={`border rounded-xl p-4 mb-4 font-mono font-bold tracking-widest text-sm inline-block self-start print:bg-white print:border-black print:text-black ${data.insightSummary.ai_unit_economics_autopsy.gross_margin_health === 'CRITICAL' ? 'bg-red-950/20 border-red-900/40 text-red-500' : data.insightSummary.ai_unit_economics_autopsy.gross_margin_health === 'EXPONENTIAL' ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-500' : 'bg-yellow-950/20 border-yellow-900/40 text-yellow-500'}`}>
                                                VERDICT: {data.insightSummary.ai_unit_economics_autopsy.gross_margin_health}
                                            </div>
                                            <p className="text-zinc-300 print:text-black leading-relaxed text-lg pb-6">
                                                {data.insightSummary.ai_unit_economics_autopsy.financial_verdict}
                                            </p>

                                            {/* Napkin Math Recharts */}
                                            {napkinData.length > 0 && (
                                                <div className="border border-zinc-800/50 bg-black/30 rounded-2xl p-6 print:border-black print:bg-white">
                                                    <h4 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-6 print:text-black">36-Month Valuation Projection (15% MoM Default)</h4>
                                                    <div className="h-64 w-full">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={napkinData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                                                <defs>
                                                                    <linearGradient id="colorValuation" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                                                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                                                { }
                                                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => `$${value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`} />
                                                                { }
                                                                <Tooltip
                                                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                                                                    itemStyle={{ color: '#e4e4e7' }}
                                                                    formatter={(value: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)}
                                                                />
                                                                <Area type="monotone" dataKey="Valuation" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorValuation)" />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Execution Confidence Engine */}
                                    {data.insightSummary.base_opportunity_score && (
                                        <div className="p-8 md:p-10 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col md:col-span-2 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                                <Target weight="fill" className="text-white text-9xl" />
                                            </div>
                                            
                                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                                                <div className="flex-1 w-full space-y-8">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white mb-2">Execution Confidence</h3>
                                                        <p className="text-zinc-400 text-sm leading-relaxed mb-6">Dial in your ability to execute against the AI&apos;s findings. The structural base score assumes average execution capability (50%).</p>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center text-sm font-bold">
                                                                <span className="text-red-400 uppercase tracking-widest text-xs flex items-center gap-2"><Skull weight="fill" /> Mitigate Kill Criteria</span>
                                                                <span className="text-white">{riskMitigation}%</span>
                                                            </div>
                                                            <input type="range" min="0" max="100" value={riskMitigation} onChange={(e) => setRiskMitigation(Number(e.target.value))} className="w-full accent-red-500 bg-zinc-900 rounded-full h-2 appearance-none cursor-pointer" />
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center text-sm font-bold">
                                                                <span className="text-emerald-400 uppercase tracking-widest text-xs flex items-center gap-2"><RocketLaunch weight="fill" /> Execute Scaling Blueprint</span>
                                                                <span className="text-white">{growthExecution}%</span>
                                                            </div>
                                                            <input type="range" min="0" max="100" value={growthExecution} onChange={(e) => setGrowthExecution(Number(e.target.value))} className="w-full accent-emerald-500 bg-zinc-900 rounded-full h-2 appearance-none cursor-pointer" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 w-full md:w-48 flex flex-col items-center justify-center pt-8 md:pt-0 md:pl-8 md:border-l border-zinc-800 border-t md:border-t-0">
                                                    <div className="text-zinc-500 text-xs font-bold tracking-widest uppercase mb-4 text-center">Worth a Shot?</div>
                                                    <div className="relative flex items-center justify-center">
                                                        <div className={`text-6xl md:text-7xl font-black tracking-tighter ${
                                                            Math.min(100, Math.round(data.insightSummary.base_opportunity_score * (((riskMitigation + growthExecution) / 2) / 50))) >= 80 ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]' :
                                                            Math.min(100, Math.round(data.insightSummary.base_opportunity_score * (((riskMitigation + growthExecution) / 2) / 50))) >= 50 ? 'text-yellow-400' :
                                                            'text-red-500'
                                                        }`}>
                                                            {Math.min(100, Math.round(data.insightSummary.base_opportunity_score * (((riskMitigation + growthExecution) / 2) / 50)))}
                                                        </div>
                                                    </div>
                                                    <div className="text-zinc-500 text-xs font-mono mt-4 text-center">Base Score: {data.insightSummary.base_opportunity_score}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </motion.div>

                            {/* Insight Upsell */}
                            <motion.div variants={itemVariants} className="mt-20 pt-12 border-t border-zinc-800 pb-12">
                                
                                {/* The Idea Refiner (Pivot Engine) */}
                                {data.insightSummary.base_opportunity_score < 70 && (
                                    <div className="mb-20 py-12 border-b border-red-900/30">
                                        <div className="text-center mb-8">
                                            <h3 className="text-2xl font-black text-rose-500 mb-2">Red Team Reality Check</h3>
                                            <p className="text-zinc-400 max-w-xl mx-auto">This idea scored {data.insightSummary.base_opportunity_score}/100. It requires structural remediation before coding. Run the Pivot Engine to extract 3 mathematical ways to fix the business model.</p>
                                            
                                            {!pivots && (
                                                <button 
                                                    onClick={generatePivots}
                                                    disabled={isPivoting}
                                                    className="mt-6 px-6 py-3 bg-red-950 text-red-400 font-bold rounded-xl border border-red-900 hover:bg-red-900 transition-colors disabled:opacity-50 inline-flex items-center gap-2 relative z-10"
                                                >
                                                    {isPivoting ? <Sparkle weight="fill" className="animate-spin" /> : <WarningCircle weight="bold" />}
                                                    {isPivoting ? "Generating Pivots..." : "Refine Idea (Generate 3 Pivots)"}
                                                </button>
                                            )}
                                        </div>

                                        {pivots && (
                                            <div className="grid md:grid-cols-3 gap-6 mt-8 relative z-10">
                                                {pivots.map((p, i) => (
                                                    <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col hover:border-red-500/50 transition-colors text-left shadow-2xl">
                                                        <div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-3">{p.title}</div>
                                                        <p className="text-sm text-zinc-400 mb-4 pb-4 border-b border-zinc-800">{p.description}</p>
                                                        <p className="font-medium text-white mb-4 flex-1">&quot;{p.new_idea}&quot;</p>
                                                        <div className="flex justify-between items-center mb-6 font-mono text-xs text-zinc-500 border border-zinc-800 rounded-lg p-3 bg-black">
                                                            <div className="flex flex-col">
                                                                <span className="uppercase text-[10px] tracking-widest mb-1">Price</span>
                                                                <span className="text-emerald-400 text-sm font-bold">${p.suggested_price}/mo</span>
                                                            </div>
                                                            <div className="flex flex-col text-right">
                                                                <span className="uppercase text-[10px] tracking-widest mb-1">Users</span>
                                                                <span className="text-zinc-300 text-sm font-bold">{p.suggested_users} target</span>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => adoptPivot(p.new_idea, p.suggested_price, p.suggested_users)}
                                                            className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-white hover:text-black transition-colors"
                                                        >
                                                            Adopt This Pivot
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
                                    <h2 className="text-3xl font-black text-white mb-4 relative z-10">Convinced to build it?</h2>
                                    <p className="text-zinc-400 text-lg mb-8 relative z-10 max-w-xl mx-auto">
                                        You&apos;ve triangulated the risk and the upside. Now you need serious infrastructure to deliver. Auto-generate your stack with zero middleware.
                                    </p>
                                    <a
                                        href={`/super-architect?idea=${encodeURIComponent(idea)}&pivot=${encodeURIComponent(data?.insightSummary?.strategic_pivot?.action || '')}`}
                                        className="inline-flex items-center gap-3 bg-white text-black font-bold text-lg px-8 py-4 rounded-xl hover:bg-zinc-200 transition-colors relative z-10"
                                    >
                                        Auto-Generate Backend Architecture
                                        <ArrowRight weight="bold" />
                                    </a>
                                </div>
                                <div className="mt-8 flex flex-wrap justify-center gap-4">
                                    <button
                                        onClick={() => {
                                            const url = new URL('https://model.delights.pro/v');
                                            url.searchParams.set('ide', idea);
                                            url.searchParams.set('ro', data.autopsyData.pattern_match.rationale);
                                            url.searchParams.set('to', data.catalystData.pattern_match.rationale);
                                            url.searchParams.set('ex', data.insightSummary.strategic_pivot.action);
                                            
                                            const shareText = `I just ran my startup idea through the @ModelDelights autonomous Red/Green teams... brutal but necessary 🚀\n\n`;
                                            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url.toString())}`;
                                            window.open(twitterUrl, '_blank');
                                        }}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#000000] text-white border border-[#333] hover:bg-[#111] transition-colors font-medium shadow-lg"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.004 3.93H5.078z" />
                                        </svg>
                                        Share Verdict on X
                                    </button>
                                    <button
                                        onClick={() => {
                                            const url = new URL('https://model.delights.pro/v');
                                            url.searchParams.set('ide', idea);
                                            url.searchParams.set('ro', data.autopsyData.pattern_match.rationale);
                                            url.searchParams.set('to', data.catalystData.pattern_match.rationale);
                                            url.searchParams.set('ex', data.insightSummary.strategic_pivot.action);
                                            
                                            const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url.toString())}`;
                                            window.open(linkedInUrl, '_blank');
                                        }}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0a66c2] text-white border border-[#004182] hover:bg-[#004182] transition-colors font-medium shadow-lg"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                        </svg>
                                        Share on LinkedIn
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white border border-purple-500 hover:bg-purple-500 transition-colors font-medium shadow-lg print:hidden"
                                    >
                                        <Printer weight="bold" size={18} />
                                        Export Executive Dossier (PDF)
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {!isLoading && data && (
                        <>
                            {/* Desktop/Web UI (Only shows active tab) */}
                            <motion.div
                                key="rawdata"
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-12 print:hidden"
                            >
                                {mode !== "insight" && activeData && (
                                    <>
                                        {/* Pattern Match Insight */}
                                        <motion.div variants={itemVariants} className={`p-6 md:p-8 rounded-2xl border ${mode === 'autopsy' ? 'bg-red-950/20 border-red-900/50' : 'bg-emerald-950/20 border-emerald-900/50'}`}>
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-xl ${mode === 'autopsy' ? 'bg-red-900/30' : 'bg-emerald-900/30'}`}>
                                                    {mode === 'autopsy' ? (
                                                        <WarningCircle size={32} weight="fill" className="text-red-500" />
                                                    ) : (
                                                        <RocketLaunch size={32} weight="fill" className="text-emerald-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h2 className="text-white font-bold text-xl mb-1">
                                                        {mode === 'autopsy' ? 'Critical Pattern Match:' : 'Exponential Pattern Match:'} {activeData.pattern_match.historical_pattern}
                                                    </h2>
                                                    <p className={`leading-relaxed text-lg ${mode === 'autopsy' ? 'text-red-200/80' : 'text-emerald-200/80'}`}>
                                                        {activeData.pattern_match.rationale}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* DVF Risks/Levers */}
                                        <motion.div variants={itemVariants}>
                                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                                {mode === 'autopsy' ? 'Top 5 Kill-Switch Assumptions' : 'Top 5 Exponential Growth Levers'}
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                {activeData.critical_assumptions.map((assump, idx) => (
                                                    <div key={idx} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group hover:border-zinc-600 transition-colors">
                                                        <div className={`absolute top-0 left-0 w-1 h-full ${assump.category === 'Desirability' ? 'bg-blue-500' :
                                                            assump.category === 'Viability' ? 'bg-green-500' : 'bg-orange-500'
                                                            }`} />

                                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pl-2">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className={`text-xs font-bold uppercase tracking-widest ${assump.category === 'Desirability' ? 'text-blue-400' :
                                                                        assump.category === 'Viability' ? 'text-green-400' : 'text-orange-400'
                                                                        }`}>
                                                                        {assump.category === 'Desirability' && <ChartLineUp className="inline mr-1" />}
                                                                        {assump.category === 'Viability' && <Money className="inline mr-1" />}
                                                                        {assump.category === 'Feasibility' && <Gear className="inline mr-1" />}
                                                                        {assump.category}
                                                                    </span>
                                                                </div>
                                                                <h4 className="text-white font-medium text-lg mb-2">&quot;{assump.assumption}&quot;</h4>
                                                                <div className="text-zinc-400 text-sm leading-relaxed mb-4">{assump.rationale}</div>
                                                                <div className="flex items-center gap-6">
                                                                    <div>
                                                                        <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Impact</div>
                                                                        <div className="text-white font-bold">{assump.impact}/5</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Evidence</div>
                                                                        <div className="text-white font-bold">{assump.evidence}/5</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-4 md:flex-col shrink-0 mt-4 md:mt-0">
                                                                <div className={`text-center rounded-lg p-3 border w-32 ${mode === 'autopsy' ? 'bg-red-950/20 border-red-900/30' : 'bg-emerald-950/20 border-emerald-900/30'}`}>
                                                                    <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">
                                                                        {mode === 'autopsy' ? 'Risk Score' : 'Leverage Score'}
                                                                    </div>
                                                                    <div className={`text-2xl font-black ${mode === 'autopsy' ? 'text-red-400' : 'text-emerald-400'}`}>
                                                                        {assump.leverage_score}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>

                            {/* Core Chain */}
                            <motion.div variants={itemVariants} className="bg-zinc-900/50 rounded-2xl p-6 md:p-8 border border-zinc-800">
                                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                                    <LinkBreak weight="fill" className="text-zinc-500" />
                                    {mode === 'autopsy' ? 'Failure Domino Chain' : 'Blueprint to Scale'}
                                </h3>
                                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                                    {activeData.logic_chain.map((step, idx) => (
                                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                <span className="text-xs font-mono">{idx + 1}</span>
                                            </div>
                                            <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border ${mode === 'autopsy' ? 'bg-red-950/10 border-red-900/30' : 'bg-emerald-950/10 border-emerald-900/30'}`}>
                                                <div className="text-zinc-300 text-sm md:text-base leading-snug">{step}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Experiment Roadmap */}
                            <motion.div variants={itemVariants}>
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Flask weight="fill" className={mode === 'autopsy' ? "text-indigo-400" : "text-emerald-400"} />
                                    {mode === 'autopsy' ? 'Test Sequence & Kill Criteria' : 'Test Sequence & Validation Milestones'}
                                </h3>
                                <div className="space-y-4">
                                    {activeData.experiment_sequence.map((exp, idx) => (
                                        <div key={idx} className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden p-6 md:p-8">
                                            <div className="flex flex-col md:flex-row gap-8">
                                                <div className="flex-1">
                                                    <div className="uppercase tracking-widest text-xs font-bold text-indigo-400 mb-2">
                                                        Test {idx + 1}: {exp.experiment_type}
                                                    </div>
                                                    <h4 className="text-xl font-bold text-white mb-4">Testing: &quot;{exp.assumption_tested}&quot;</h4>
                                                    <div className="bg-zinc-950/50 rounded p-4 border border-zinc-800 mb-4">
                                                        <span className="text-zinc-500 text-sm block mb-1">Setup Protocol</span>
                                                        <span className="text-zinc-300">{exp.setup}</span>
                                                    </div>
                                                    <div className="bg-zinc-950/50 rounded p-4 border border-zinc-800 mb-4">
                                                        <span className="text-zinc-500 text-sm block mb-1">Metric</span>
                                                        <span className="text-zinc-300">{exp.metric}</span>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 md:w-1/3">
                                                    <div className={`border rounded-xl p-5 h-full flex flex-col justify-center ${mode === 'autopsy' ? 'bg-red-950/20 border-red-900/50' : 'bg-emerald-950/20 border-emerald-900/50'}`}>
                                                        <div className={`flex items-center gap-2 font-bold uppercase tracking-wider text-sm mb-2 ${mode === 'autopsy' ? 'text-red-500' : 'text-emerald-400'}`}>
                                                            {mode === 'autopsy' ? (
                                                                <><Skull weight="fill" /> Kill Criteria</>
                                                            ) : (
                                                                <><Sparkle weight="fill" /> Validation Target</>
                                                            )}
                                                        </div>
                                                        <p className={mode === 'autopsy' ? "text-red-200" : "text-emerald-200"}>{exp.validation_threshold}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Kill Protocol Injection */}
                            {activeData.kill_criteria_protocol && (
                                <motion.div variants={itemVariants} className={`p-8 rounded-3xl border ${mode === 'autopsy' ? 'bg-red-950/20 border-red-900/50 shadow-[0_0_30px_rgba(255,0,0,0.1)]' : 'bg-emerald-950/20 border-emerald-900/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]'}`}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`p-3 rounded-xl ${mode === 'autopsy' ? 'bg-red-900/30' : 'bg-emerald-900/30'}`}>
                                            {mode === 'autopsy' ? <Skull weight="fill" className="text-red-500 text-2xl" /> : <RocketLaunch weight="fill" className="text-emerald-400 text-2xl" />}
                                        </div>
                                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                                            {mode === 'autopsy' ? 'Strict 48-Hour Kill Protocol' : 'Strict 48-Hour Scaling Protocol'}
                                        </h3>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">Deadliest Assumption</div>
                                            <p className={`text-lg font-medium ${mode === 'autopsy' ? 'text-red-200' : 'text-emerald-200'}`}>&quot;{activeData.kill_criteria_protocol.deadliest_assumption}&quot;</p>
                                        </div>
                                        
                                        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800">
                                            <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">Execution Protocol</div>
                                            <p className="text-zinc-300 leading-relaxed text-lg">{activeData.kill_criteria_protocol.validation_protocol}</p>
                                        </div>

                                        <div>
                                            <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">Actionable Template (Copy/Paste Tonight)</div>
                                            <div className="relative group">
                                                <div className="absolute inset-0 bg-zinc-900 rounded-xl"></div>
                                                <pre className="relative p-6 font-mono text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed border border-zinc-800 rounded-xl overflow-x-auto">
                                                    {activeData.kill_criteria_protocol.actionable_template}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                                    </>
                                )}
                        </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* PDF Export Section for Autopsy & Catalyst (Hidden in Web UI, Block in Print) */}
                {data && (
                    <div className="hidden print:block print:w-full space-y-12 shrink-0">
                        {/* Autopsy Print */}
                        <div className="break-inside-avoid pt-12">
                            <h2 className="text-3xl font-black mb-6 flex items-center gap-3 print:text-black uppercase">
                                <WarningCircle weight="fill" className="text-red-500" />
                                Red Team Analysis (Autopsy)
                            </h2>
                            
                            <div className="p-6 border border-zinc-800 rounded-xl mb-8 print:border-black print:bg-white print:text-black mt-8">
                                <h3 className="font-bold mb-2 uppercase text-sm tracking-widest text-zinc-500 print:text-black">Critical Pattern Match</h3>
                                <p className="text-xl mb-2"><strong>{data.autopsyData.pattern_match.historical_pattern}</strong></p>
                                <p className="font-medium">{data.autopsyData.pattern_match.rationale}</p>
                            </div>

                            <h3 className="font-bold mb-4 uppercase text-sm tracking-widest text-zinc-500 print:text-black mt-8">Top Kill-Switch Assumptions</h3>
                            <div className="space-y-4 mb-8">
                                {data.autopsyData.critical_assumptions.slice(0, 3).map((a, i) => (
                                    <div key={i} className="p-4 border border-zinc-800 rounded-lg print:border-black print:bg-white print:text-black break-inside-avoid">
                                        <p className="font-bold text-lg mb-1">&quot;{a.assumption}&quot;</p>
                                        <p className="text-sm mb-2">{a.rationale}</p>
                                        <div className="text-xs uppercase font-mono mt-4">
                                            Impact: {a.impact}/5 | Evidence: {a.evidence}/5 | Risk Leverage: {a.leverage_score} ({a.category})
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {data.autopsyData.kill_criteria_protocol && (
                                <div className="p-6 border border-zinc-800 rounded-xl mb-8 print:border-black print:bg-white print:text-black break-inside-avoid mt-8">
                                    <h3 className="font-bold mb-2 uppercase text-sm tracking-widest text-zinc-500 print:text-black">Strict 48-Hour Kill Protocol</h3>
                                    <p className="font-bold text-lg mb-2 text-red-700 print:text-black">&quot;{data.autopsyData.kill_criteria_protocol.deadliest_assumption}&quot;</p>
                                    <p className="mb-4">{data.autopsyData.kill_criteria_protocol.validation_protocol}</p>
                                    <div className="p-4 bg-zinc-100 print:bg-zinc-100 print:text-black font-mono text-xs rounded-lg whitespace-pre-wrap mt-4">
                                        {data.autopsyData.kill_criteria_protocol.actionable_template}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Catalyst Print */}
                        <div className="break-inside-avoid pt-12 pb-12">
                            <h2 className="text-3xl font-black mb-6 flex items-center gap-3 print:text-black uppercase mt-12">
                                <RocketLaunch weight="fill" className="text-emerald-500" />
                                Green Team Analysis (Catalyst)
                            </h2>
                            
                            <div className="p-6 border border-zinc-800 rounded-xl mb-8 print:border-black print:bg-white print:text-black mt-8">
                                <h3 className="font-bold mb-2 uppercase text-sm tracking-widest text-zinc-500 print:text-black">Exponential Pattern Match</h3>
                                <p className="text-xl mb-2"><strong>{data.catalystData.pattern_match.historical_pattern}</strong></p>
                                <p className="font-medium">{data.catalystData.pattern_match.rationale}</p>
                            </div>

                            <h3 className="font-bold mb-4 uppercase text-sm tracking-widest text-zinc-500 print:text-black mt-8">Top Exponential Growth Levers</h3>
                            <div className="space-y-4 mb-8">
                                {data.catalystData.critical_assumptions.slice(0, 3).map((a, i) => (
                                    <div key={i} className="p-4 border border-zinc-800 rounded-lg print:border-black print:bg-white print:text-black break-inside-avoid">
                                        <p className="font-bold text-lg mb-1">&quot;{a.assumption}&quot;</p>
                                        <p className="text-sm mb-2">{a.rationale}</p>
                                        <div className="text-xs uppercase font-mono mt-4">
                                            Impact: {a.impact}/5 | Evidence: {a.evidence}/5 | Growth Leverage: {a.leverage_score} ({a.category})
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Dock */}
            <AnimatePresence>
                {!isLoading && data && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.5 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex"
                    >
                        <div className="bg-black/80 backdrop-blur-xl border border-zinc-800 shadow-2xl shadow-black/50 p-1.5 rounded-full flex items-center w-max min-w-[320px]">
                            <button
                                onClick={() => setMode("autopsy")}
                                className={`flex-1 flex justify-center items-center gap-2 py-3 px-6 rounded-full text-sm font-bold transition-all ${mode === 'autopsy' ? 'bg-red-950 text-red-400 border border-red-900/50' : 'text-zinc-500 hover:text-white'
                                    }`}
                            >
                                <WarningCircle weight={mode === 'autopsy' ? "fill" : "regular"} size={18} />
                                <span className="hidden sm:inline">Autopsy</span>
                            </button>

                            <button
                                onClick={() => setMode("insight")}
                                className={`flex-1 flex justify-center items-center gap-2 py-3 px-6 rounded-full text-sm font-bold transition-all ${mode === 'insight' ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30' : 'text-zinc-500 hover:text-white'
                                    }`}
                            >
                                <Lightbulb weight={mode === 'insight' ? "fill" : "regular"} size={18} />
                                Insight
                            </button>

                            <button
                                onClick={() => setMode("catalyst")}
                                className={`flex-1 flex justify-center items-center gap-2 py-3 px-6 rounded-full text-sm font-bold transition-all ${mode === 'catalyst' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50' : 'text-zinc-500 hover:text-white'
                                    }`}
                            >
                                <RocketLaunch weight={mode === 'catalyst' ? "fill" : "regular"} size={18} />
                                <span className="hidden sm:inline">Catalyst</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
