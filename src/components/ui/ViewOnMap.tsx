import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  location: string;
  label?: string;
}

export function ViewOnMap({ location, label = "View on Map" }: Props) {
  const encodedLocation = encodeURIComponent(location);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;

  return (
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-sm"
    >
      <MapPin className="w-4 h-4" />
      {label}
    </a>
  );
}


// using in a table
// {/* <ViewOnMap location={`${farmer.location}, ${farmer.province}`} /> */}