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

  if (apiKey && scriptLoaded) {
    return (
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn("h-11 rounded-lg border border-slate-200 bg-slate-50/50 px-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]", className)}
        autoComplete="off"
      />
    );
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => value.length >= 2 && setShowSuggestions(suggestions.length > 0)}
        placeholder={placeholder}
        list={id ? `${id}-list` : undefined}
        className={cn("h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]", className)}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => selectSuggestion(s)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
      {!apiKey && (
        <p className="mt-1 text-xs text-slate-500">
          Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for full Google Places autocomplete
        </p>
      )}
    </div>
  );
}
