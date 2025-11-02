import { useState } from 'react'
import './App.css'

// Define types inline
interface FormData {
    currentLocation: string
    pickupLocation: string
    dropoffLocation: string
    currentCycleUsed: string
}

interface TripResults {
    totalDistance: number
    drivingTime: number
    totalTripTime: number
    fuelStops: number
    restBreaks: number
    hoursAvailable: number
    totalHoursUsed: number
    compliant: boolean
    mapUrl: string
    eldLogUrl: string
    stops: Stop[]
}

interface Stop {
    type: 'start' | 'pickup' | 'fuel' | 'dropoff'
    location: string
    coords?: Coordinates
    duration?: number
}

interface Coordinates {
    lon: number
    lat: number
}

function App() {
    const [formData, setFormData] = useState<FormData>({
        currentLocation: '',
        pickupLocation: '',
        dropoffLocation: '',
        currentCycleUsed: ''
    })
    const [loading, setLoading] = useState<boolean>(false)
    const [results, setResults] = useState<TripResults | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (): Promise<void> => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('https://eld-planner-app-backend/api/calculate-trip/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to calculate trip')
            }

            setResults(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleViewELDLog = async () => {
        if (!results) return

        try {
            const response = await fetch(`https://eld-planner-app-backend${results.eldLogUrl}`)
            const data = await response.json()

            // Open the PDF URL in new tab
            window.open(`http://localhost:8000${data.pdfUrl}`, '_blank')
        } catch (err) {
            console.error('Error loading ELD log:', err)
        }
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <h1 className="text-4xl font-bold text-gray-800">ELD Trip Planner</h1>
                        </div>
                        <p className="text-gray-600">Plan your route with HOS compliance and ELD logs</p>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                                    Enter Trip Details
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Location
                                        </label>
                                        <input
                                            type="text"
                                            name="currentLocation"
                                            value={formData.currentLocation}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Los Angeles, CA"
                                            className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pickup Location
                                        </label>
                                        <input
                                            type="text"
                                            name="pickupLocation"
                                            value={formData.pickupLocation}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Phoenix, AZ"
                                            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Dropoff Location
                                        </label>
                                        <input
                                            type="text"
                                            name="dropoffLocation"
                                            value={formData.dropoffLocation}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Dallas, TX"
                                            className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Cycle Used (Hours)
                                        </label>
                                        <input
                                            type="number"
                                            name="currentCycleUsed"
                                            value={formData.currentCycleUsed}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 15"
                                            min="0"
                                            max="70"
                                            step="0.5"
                                            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            70-hour/8-day cycle (Max: 70 hours)
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {loading ? '⏳ Calculating...' : '🚀 Calculate Trip Plan'}
                                    </button>
                                </div>

                                {error && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-700 text-sm">❌ {error}</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                                    Trip Summary
                                </h2>

                                {!results ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">Enter trip details to see your route plan</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-indigo-50 p-4 rounded-lg">
                                            <h3 className="font-semibold text-indigo-900 mb-2"> Route Overview</h3>
                                            <div className="space-y-2 text-sm">
                                                <p><span className="font-medium text-black">Total Distance:</span> {results.totalDistance} miles</p>
                                                <p><span className="font-medium text-black">Driving Time:</span> {results.drivingTime} hours</p>
                                                <p><span className="font-medium text-black">Total Trip Time:</span> {results.totalTripTime} hours</p>
                                            </div>
                                        </div>

                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                                                Fuel Stops
                                            </h3>
                                            <p className="text-sm text-black">Required stops: {results.fuelStops}</p>
                                        </div>

                                        <div className="bg-amber-50 p-4 rounded-lg">
                                            <h3 className="font-semibold text-amber-900 mb-2 flex items-center">
                                                <span className="mr-2">☕</span>
                                                Rest Breaks
                                            </h3>
                                            <p className="text-sm text-black">Required breaks: {results.restBreaks}</p>
                                        </div>

                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <h3 className="font-semibold text-purple-900 mb-2">HOS Status</h3>
                                            <div className="space-y-1 text-sm">
                                                <p><span className="font-medium text-black">Hours Available:</span> {results.hoursAvailable} hrs</p>
                                                <p><span className="font-medium text-black">Total Hours Used:</span> {results.totalHoursUsed} hrs</p>
                                                {results.compliant ? (
                                                    <p className="text-green-700 font-medium">✅ HOS Compliant</p>
                                                ) : (
                                                    <p className="text-red-700 font-medium">⚠️ HOS Violation Risk</p>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleViewELDLog}
                                            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                        >
                                            View ELD Logs
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {results && (
                            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                                    Route Map
                                </h2>
                                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                                    <iframe
                                        src={results.mapUrl}
                                        className="w-full h-full rounded-lg"
                                        title="Route Map"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default App