'use client';

import { useState } from 'react';
import {
    MapPin,
    Truck,
    Fuel,
    Coffee,
    AlertCircle,
    CheckCircle,
    Loader2,
    ChevronDown,
    ChevronUp,
    Navigation,
    Clock,
    Gauge,
    FileText,
} from 'lucide-react';
import { API_BASE, apiUrl } from './lib/api.ts';

// ──────────────────────────────────────────────────────────────
// Types (unchanged – kept exactly as you defined them)
// ──────────────────────────────────────────────────────────────
interface FormData {
    currentLocation: string;
    pickupLocation: string;
    dropoffLocation: string;
    currentCycleUsed: string;
}
interface Coordinates {
    lon: number;
    lat: number;
}
interface Stop {
    type: 'start' | 'pickup' | 'fuel' | 'dropoff';
    location: string;
    coords?: Coordinates;
    duration?: number;
}
interface TripResults {
    totalDistance: number;
    drivingTime: number;
    totalTripTime: number;
    fuelStops: number;
    restBreaks: number;
    hoursAvailable: number;
    totalHoursUsed: number;
    compliant: boolean;
    mapUrl: string;
    eldLogUrl: string;
    stops: Stop[];
}

// ──────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────
export default function App() {
    const [formData, setFormData] = useState<FormData>({
        currentLocation: '',
        pickupLocation: '',
        dropoffLocation: '',
        currentCycleUsed: '',
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [results, setResults] = useState<TripResults | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showMap, setShowMap] = useState(true);

    // ────── Handlers (unchanged) ──────
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(apiUrl('/api/calculate-trip/'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentLocation: formData.currentLocation,
                    pickupLocation: formData.pickupLocation,
                    dropoffLocation: formData.dropoffLocation,
                    currentCycleUsed: Number(formData.currentCycleUsed),
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error ?? 'Failed to calculate trip');
            setResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleViewELDLog = async () => {
        if (!results?.eldLogUrl) {
            setError('ELD log URL not available');
            return;
        }
        try {
            const fullLogEndpoint = apiUrl(results.eldLogUrl);
            const response = await fetch(fullLogEndpoint);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate ELD log');
            }
            const data = await response.json();

            const pdfFullUrl =
                import.meta.env.DEV
                    ? data.pdfUrl
                    : `${API_BASE}${data.pdfUrl}`;

            window.open(pdfFullUrl, '_blank', 'noopener,noreferrer');
        } catch (err) {
            console.error('Error loading ELD log:', err);
            setError(err instanceof Error ? err.message : 'Failed to load ELD log');
        }
    };

    const inputClass =
        'peer w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all';

    const labelClass =
        'absolute left-4 -top-2.5 bg-white dark:bg-slate-800 px-1 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600';


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
            <div className="container mx-auto px-4 py-8">

                {/* Header */}
                <header className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <Truck className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                            ELD Trip Planner
                        </h1>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Smart routing with HOS compliance & real-time ELD logging
                    </p>
                </header>

                {/*Main Grid */}
                <div className="w-full">
                    <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">

                        {/* ───── Form Card ───── */}
                        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700">
                            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white mb-6">
                                <MapPin className="w-6 h-6 text-indigo-600" />
                                Enter Trip Details
                            </h2>

                            <div className="space-y-6">

                                {/* ---- Location fields ---- */}
                                {[
                                    { name: 'currentLocation', label: 'Current Location', placeholder: 'e.g., Los Angeles, CA' },
                                    { name: 'pickupLocation', label: 'Pickup Location', placeholder: 'e.g., Phoenix, AZ' },
                                    { name: 'dropoffLocation', label: 'Dropoff Location', placeholder: 'e.g., Dallas, TX' },
                                ].map((f) => (
                                    <div key={f.name} className="relative">
                                        <input
                                            type="text"
                                            name={f.name}
                                            value={formData[f.name as keyof FormData]}
                                            onChange={handleInputChange}
                                            placeholder=" "
                                            className={inputClass}
                                        />
                                        <label className={labelClass}>{f.label}</label>
                                    </div>
                                ))}

                                {/* ---- Cycle hours ---- */}
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="currentCycleUsed"
                                        value={formData.currentCycleUsed}
                                        onChange={handleInputChange}
                                        placeholder=" "
                                        min="0"
                                        max="70"
                                        step="0.5"
                                        className={inputClass}
                                    />
                                    <label className={labelClass}>Current Cycle Used (Hours)</label>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        70-hour/8-day cycle (Max: 70 hours)
                                    </p>
                                </div>

                                {/* ---- Submit ---- */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin w-5 h-5" />
                                            Calculating…
                                        </>
                                    ) : (
                                        <>
                                            <Navigation className="w-5 h-5" />
                                            Calculate Trip Plan
                                        </>
                                    )}
                                </button>

                                {/* ---- Error ---- */}
                                {error && (
                                    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-sm">{error}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Summary Card */}
                        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700">
                            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white mb-6">
                                <Gauge className="w-6 h-6 text-indigo-600" />
                                Trip Summary
                            </h2>

                            {!results ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                                    <MapPin className="w-12 h-12 mb-3 opacity-50" />
                                    <p>Enter trip details to see your route plan</p>
                                </div>
                            ) : (
                                <div className="space-y-5">

                                    {/* ---- Route Overview ---- */}
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl">
                                        <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-2">Route Overview</h3>
                                        <dl className="grid grid-cols-1 gap-2 text-sm">
                                            <div className="flex justify-between"><dt className="font-medium">Distance</dt><dd>{results.totalDistance} mi</dd></div>
                                            <div className="flex justify-between"><dt className="font-medium">Driving</dt><dd>{results.drivingTime} h</dd></div>
                                            <div className="flex justify-between"><dt className="font-medium">Total Time</dt><dd>{results.totalTripTime} h</dd></div>
                                        </dl>
                                    </div>

                                    {/* ---- Fuel Stops ---- */}
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl flex items-center gap-3">
                                        <Fuel className="w-6 h-6 text-green-700 dark:text-green-300" />
                                        <div>
                                            <h3 className="font-semibold text-green-900 dark:text-green-200">Fuel Stops</h3>
                                            <p className="text-sm">Required: {results.fuelStops}</p>
                                        </div>
                                    </div>

                                    {/* ---- Rest Breaks ---- */}
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl flex items-center gap-3">
                                        <Coffee className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                                        <div>
                                            <h3 className="font-semibold text-amber-900 dark:text-amber-200">Rest Breaks</h3>
                                            <p className="text-sm">Required: {results.restBreaks}</p>
                                        </div>
                                    </div>

                                    {/* ---- HOS Status ---- */}
                                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                                        <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">HOS Status</h3>
                                        <dl className="grid grid-cols-1 gap-2 text-sm">
                                            <div className="flex justify-between"><dt className="font-medium">Available</dt><dd>{results.hoursAvailable} h</dd></div>
                                            <div className="flex justify-between"><dt className="font-medium">Used</dt><dd>{results.totalHoursUsed} h</dd></div>
                                            <div className="mt-2">
                                                {results.compliant ? (
                                                    <p className="flex items-center gap-1 text-green-700 dark:text-green-300 font-medium">
                                                        <CheckCircle className="w-5 h-5" />
                                                        HOS Compliant
                                                    </p>
                                                ) : (
                                                    <p className="flex items-center gap-1 text-red-700 dark:text-red-300 font-medium">
                                                        <AlertCircle className="w-5 h-5" />
                                                        HOS Violation Risk
                                                    </p>
                                                )}
                                            </div>
                                        </dl>
                                    </div>

                                    {/* ---- ELD Log button ---- */}
                                    <button
                                        onClick={handleViewELDLog}
                                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
                                    >
                                        <FileText className="w-5 h-5" />
                                        View ELD Logs
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Map Section (collapsible) */}
                    {results && (
                        <section className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setShowMap((s) => !s)}
                                className="flex w-full items-center justify-between text-2xl font-bold text-gray-800 dark:text-white mb-4"
                            >
                <span className="flex items-center gap-2">
                  <Navigation className="w-6 h-6 text-indigo-600" />
                  Route Map
                </span>
                                {showMap ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>

                            {showMap && (
                                <div className="relative rounded-xl overflow-hidden h-96 bg-gray-100 dark:bg-gray-700">
                                    <iframe
                                        src={results.mapUrl}
                                        title="Route Map"
                                        className="absolute inset-0 w-full h-full"
                                        loading="lazy"
                                    />
                                </div>
                            )}
                        </section>
                    )}

                    {/* Stop Timeline (optional)  */}
                    {results?.stops && results.stops.length > 0 && (
                        <section className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
                            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white mb-5">
                                <Clock className="w-6 h-6 text-indigo-600" />
                                Stop Timeline
                            </h2>
                            <ol className="relative border-l-2 border-indigo-200 dark:border-indigo-800 ml-3">
                                {results.stops.map((stop, idx) => (
                                    <li key={idx} className="mb-6 ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full -left-4 ring-8 ring-white dark:ring-slate-800">
                      {stop.type === 'start' && <MapPin className="w-4 h-4 text-indigo-600" />}
                        {stop.type === 'pickup' && <Truck className="w-4 h-4 text-indigo-600" />}
                        {stop.type === 'fuel' && <Fuel className="w-4 h-4 text-indigo-600" />}
                        {stop.type === 'dropoff' && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                    </span>
                                        <div className="ml-4">
                                            <h3 className="font-semibold capitalize">{stop.type}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{stop.location}</p>
                                            {stop.duration !== undefined && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {stop.duration} h stop
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}