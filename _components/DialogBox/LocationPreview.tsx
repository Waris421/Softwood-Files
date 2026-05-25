import { ExternalLinkIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

interface LocationData {
  Name: string;
  Latitude: number | string;
  Longitude: number | string;
}

interface LocationPreviewDialogProps {
  location: LocationData | null;
  onClose: () => void;
}

export default function LocatinPreview({ location, onClose }: LocationPreviewDialogProps) {
    if (!location) return null;

    const embedUrl = `https://maps.google.com/maps?q=${location.Latitude},${location.Longitude}&z=15&output=embed`;

    const externalUrl = `https://www.google.com/maps/search/?api=1&query=${location.Latitude},${location.Longitude}`;

    return (
        <Dialog open={!!location} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-150">
                <DialogHeader>
                  <DialogTitle>{location.Name}</DialogTitle>
                  <DialogDescription>
                    Previewing location at {location.Latitude}, {location.Longitude}
                  </DialogDescription>
                </DialogHeader>
                <div className="w-full aspect-video rounded-md overflow-hidden border bg-muted">
                  <iframe
                    title={`Map of ${location.Name}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={embedUrl}
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    Open in Google Maps
                    <ExternalLinkIcon />
                  </a>
                </div>
            </DialogContent>
        </Dialog>
    )
}