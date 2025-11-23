import React from 'react';
import { Clock, MapPin, Train, Utensils, Camera, Info, Navigation, Ticket } from 'lucide-react';

const EventIcon = ({ type }) => {
    switch (type) {
        case 'transport': return <Train size={20} />;
        case 'meal': return <Utensils size={20} />;
        case 'visit': return <Camera size={20} />;
        default: return <Info size={20} />;
    }
};

const EventCard = ({ event, city, previousLocation }) => {
    // Smart Navigation Logic
    let mapUrl;
    let mapLabel = "Map";
    let mapIcon = <MapPin size={12} />;

    // If we have a specific location for this event
    const currentLocation = event.location || event.description;

    if (previousLocation && event.location) {
        // Navigation Mode: From Previous -> Current
        const origin = encodeURIComponent(previousLocation);
        const destination = encodeURIComponent(currentLocation + ' ' + city);
        mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`;
        mapLabel = "Navigate";
        mapIcon = <Navigation size={12} />;
    } else {
        // Fallback: Simple Search
        const query = encodeURIComponent(currentLocation + ' ' + city);
        mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    }

    // Italo Integration Logic
    const isItalo = event.type === 'transport' &&
        (event.description.toLowerCase().includes('italo') ||
            event.description.toLowerCase().includes('train') ||
            event.description.includes('火車') ||
            event.description.includes('高鐵'));

    return (
        <div className="relative pl-8 pb-8 border-l-2 border-gray-200 last:border-0">
            <div className="absolute -left-[11px] top-0 bg-white p-1 rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)]">
                <EventIcon type={event.type} />
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-[var(--color-secondary)] font-semibold">
                        <Clock size={16} />
                        {event.time}
                    </div>

                    <div className="flex gap-2">
                        {isItalo && (
                            <a
                                href="https://www.italotreno.it/en"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100 transition-colors flex items-center gap-1 font-medium"
                            >
                                <Ticket size={12} /> Book Ticket
                            </a>
                        )}

                        <a
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                            {mapIcon} {mapLabel}
                        </a>
                    </div>
                </div>

                <h4 className="text-lg font-bold mb-2">{event.description}</h4>

                {event.detailsId && (
                    <div className="mt-3">
                        <a href={`/museum/${event.detailsId}`} className="text-sm text-[var(--color-primary)] underline underline-offset-2">
                            View Guide & History →
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Timeline({ events, city }) {
    // We need to track the "real" location of the previous event to calculate routes
    let lastRealLocation = null;

    return (
        <div className="mt-8">
            {events.map(event => {
                // Capture the location BEFORE updating it for the next iteration
                const prevLoc = lastRealLocation;

                // Update for next time if this event has a location
                if (event.location) {
                    lastRealLocation = event.location;
                } else if (event.type === 'visit' || event.type === 'meal') {
                    // Infer location from description if type implies a place
                    lastRealLocation = event.description;
                }

                return (
                    <EventCard
                        key={event.id}
                        event={event}
                        city={city}
                        previousLocation={prevLoc}
                    />
                );
            })}
        </div>
    );
}
