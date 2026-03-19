import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/geocode/search?q=สุขุมวิท
 *
 * Forward geocoding: text query → location results
 * Uses OpenStreetMap Nominatim (free, no API key required)
 * Limited to Thailand results
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=th&limit=5&accept-language=th&addressdetails=1`,
      {
        headers: {
          "User-Agent": "TwoDirect App (contact@twodirect.app)",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json([]);
    }

    const data = await response.json();

    const results = data.map((item: any) => {
      const addr = item.address || {};
      const name =
        addr.suburb ||
        addr.neighbourhood ||
        addr.quarter ||
        addr.district ||
        addr.subdistrict ||
        addr.city_district ||
        addr.city ||
        addr.town ||
        addr.village ||
        item.display_name.split(",")[0];

      return {
        name,
        fullAddress: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Forward geocoding error:", error);
    return NextResponse.json([]);
  }
}
