import { MapPin } from "lucide-react"

export function VenueMapPlaceholder() {
  return (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
      <MapPin className="h-8 w-8 text-purple-500 mb-2" />
      <p className="text-muted-foreground text-center">
        Google Maps integration will be added here
        <br />
        to recommend venues based on location and event type
      </p>
    </div>
  )
}
