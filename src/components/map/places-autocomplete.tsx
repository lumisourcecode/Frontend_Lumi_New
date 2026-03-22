"use client";

import { useRef, useEffect, useState } from "react";
import { useScript } from "@/lib/use-script";
import { cn } from "@/lib/utils";

const AUSTRALIAN_PLACES = [
  "Sydney NSW", "Melbourne VIC", "Brisbane QLD", "Perth WA", "Adelaide SA",
  "Gold Coast QLD", "Newcastle NSW", "Canberra ACT", "Sunshine Coast QLD", "Wollongong NSW",
  "Hobart TAS", "Geelong VIC", "Townsville QLD", "Cairns QLD", "Darwin NT",
  "Toowoomba QLD", "Ballarat VIC", "Bendigo VIC", "Launceston TAS", "Mackay QLD",
  "Rockhampton QLD", "Bundaberg QLD", "Coffs Harbour NSW", "Wagga Wagga NSW", "Port Macquarie NSW",
  "Orange NSW", "Dubbo NSW", "Tamworth NSW", "Albury NSW", "Nowra NSW",
  "Bathurst NSW", "Warrnambool VIC", "Busselton WA", "Geraldton WA", "Kalgoorlie WA",
  "Alice Springs NT", "Mount Gambier SA", "Whyalla SA", "Port Augusta SA",
  "Royal Melbourne Hospital", "Sydney Hospital", "Monash Medical Centre", "Westmead Hospital",
  "Princess Alexandra Hospital Brisbane", "Fiona Stanley Hospital Perth",
];

type PlacesAutocompleteProps = {
  value: string;
  onChange: (value: string, place?: { lat?: number; lng?: number; formatted_address?: string }) => void;
  placeholder?: string;
  className?: string;
  id?: string;
};

export function PlacesAutocomplete({
  value,
  onChange,
  placeholder = "Search location in Australia...",
  className,
  id,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const scriptLoaded = useScript(
    apiKey ? `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places` : null,
  );

  useEffect(() => {
    if (!apiKey || !scriptLoaded || !inputRef.current || typeof google === "undefined") return;

    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "au" },
        fields: ["formatted_address", "geometry", "name"],
        types: ["establishment", "geocode"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const addr = place.formatted_address || place.name || "";
        const lat = place.geometry?.location?.lat();
        const lng = place.geometry?.location?.lng();
        onChange(addr, { lat, lng, formatted_address: addr });
      });
    } catch (e) {
      console.error("Google Maps Autocomplete failed to initialize", e);
    }
  }, [apiKey, scriptLoaded, onChange]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    onChange(v);
    if (!apiKey && v.length >= 2) {
      const filtered = AUSTRALIAN_PLACES.filter((p) =>
        p.toLowerCase().includes(v.toLowerCase()),
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }

  function selectSuggestion(s: string) {
    onChange(s);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  const inputClasses = cn(
    "h-12 w-full rounded-2xl border border-white/5 bg-slate-900/50 px-4 text-sm text-slate-100 placeholder:text-slate-500 transition-all focus:bg-slate-900 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 outline-none",
    className
  );

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => !apiKey && value.length >= 2 && setShowSuggestions(suggestions.length > 0)}
        placeholder={placeholder}
        className={inputClasses}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-white/10 bg-slate-900/90 p-1 shadow-2xl backdrop-blur-xl">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => selectSuggestion(s)}
                className="w-full px-4 py-3 text-left text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white rounded-xl"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
      {!apiKey && (
        <p className="mt-1.5 px-1 text-[10px] font-medium text-amber-500/80 uppercase tracking-wider">
          Offline Mode: Using local presets
        </p>
      )}
    </div>
  );
}
