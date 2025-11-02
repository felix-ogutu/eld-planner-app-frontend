export interface FormData {
    currentLocation: string
    pickupLocation: string
    dropoffLocation: string
    currentCycleUsed: string
}

export interface TripResults {
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

export interface Stop {
    type: 'start' | 'pickup' | 'fuel' | 'dropoff'
    location: string
    coords?: Coordinates
    duration?: number
}

export interface Coordinates {
    lon: number
    lat: number
}