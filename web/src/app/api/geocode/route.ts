import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Missing lat or lng parameter" },
      { status: 400 }
    );
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  try {
    // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latNum}&lon=${lngNum}&zoom=14&accept-language=th`,
      {
        headers: {
          "User-Agent": "TwoDirect App (contact@twodirect.app)",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Nominatim API error");
    }

    const data = await response.json();

    // Extract location name from response
    let locationName = "ตำแหน่งปัจจุบัน";

    if (data.address) {
      // Try to get the most specific Thai location name
      locationName =
        data.address.suburb ||
        data.address.neighbourhood ||
        data.address.quarter ||
        data.address.district ||
        data.address.subdistrict ||
        data.address.city_district ||
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.state ||
        "ตำแหน่งปัจจุบัน";
    }

    return NextResponse.json({
      name: locationName,
      lat: latNum,
      lng: lngNum,
      source: "nominatim",
      fullAddress: data.display_name,
    });
  } catch (error) {
    console.error("Geocoding error:", error);

    // Fallback: return generic location name based on coordinates
    let fallbackName = "ตำแหน่งปัจจุบัน";

    // Check if in Bangkok area
    if (latNum >= 13.5 && latNum <= 14.2 && lngNum >= 100.3 && lngNum <= 100.9) {
      fallbackName = "กรุงเทพฯ";
    }

    return NextResponse.json({
      name: fallbackName,
      lat: latNum,
      lng: lngNum,
      source: "fallback",
    });
  }
}

