import { NextRequest, NextResponse } from "next/server";

// Bangkok districts with their approximate coordinate boundaries
const BANGKOK_DISTRICTS: Array<{
  name: string;
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
}> = [
  // Southern Bangkok
  { name: "ราษฎร์บูรณะ", latMin: 13.65, latMax: 13.70, lngMin: 100.48, lngMax: 100.53 },
  { name: "บางขุนเทียน", latMin: 13.60, latMax: 13.68, lngMin: 100.40, lngMax: 100.48 },
  { name: "จอมทอง", latMin: 13.68, latMax: 13.72, lngMin: 100.45, lngMax: 100.50 },
  { name: "ทุ่งครุ", latMin: 13.62, latMax: 13.68, lngMin: 100.48, lngMax: 100.55 },
  { name: "บางบอน", latMin: 13.65, latMax: 13.70, lngMin: 100.38, lngMax: 100.45 },

  // Central Bangkok
  { name: "สีลม", latMin: 13.72, latMax: 13.74, lngMin: 100.52, lngMax: 100.54 },
  { name: "บางรัก", latMin: 13.72, latMax: 13.74, lngMin: 100.51, lngMax: 100.53 },
  { name: "สาทร", latMin: 13.70, latMax: 13.73, lngMin: 100.52, lngMax: 100.55 },
  { name: "ปทุมวัน", latMin: 13.73, latMax: 13.76, lngMin: 100.52, lngMax: 100.55 },
  { name: "สยาม", latMin: 13.74, latMax: 13.76, lngMin: 100.53, lngMax: 100.55 },
  { name: "ราชเทวี", latMin: 13.75, latMax: 13.77, lngMin: 100.53, lngMax: 100.55 },

  // Eastern Bangkok
  { name: "สุขุมวิท", latMin: 13.72, latMax: 13.75, lngMin: 100.55, lngMax: 100.60 },
  { name: "คลองเตย", latMin: 13.70, latMax: 13.73, lngMin: 100.55, lngMax: 100.59 },
  { name: "วัฒนา", latMin: 13.72, latMax: 13.75, lngMin: 100.56, lngMax: 100.60 },
  { name: "พระโขนง", latMin: 13.69, latMax: 13.72, lngMin: 100.59, lngMax: 100.63 },
  { name: "บางนา", latMin: 13.66, latMax: 13.70, lngMin: 100.60, lngMax: 100.65 },

  // Northern Bangkok
  { name: "จตุจักร", latMin: 13.79, latMax: 13.83, lngMin: 100.54, lngMax: 100.58 },
  { name: "ลาดพร้าว", latMin: 13.78, latMax: 13.82, lngMin: 100.58, lngMax: 100.62 },
  { name: "บางเขน", latMin: 13.83, latMax: 13.88, lngMin: 100.58, lngMax: 100.62 },
  { name: "หลักสี่", latMin: 13.87, latMax: 13.92, lngMin: 100.58, lngMax: 100.62 },
  { name: "ดอนเมือง", latMin: 13.90, latMax: 13.95, lngMin: 100.58, lngMax: 100.62 },

  // Western Bangkok
  { name: "บางกอกน้อย", latMin: 13.75, latMax: 13.78, lngMin: 100.47, lngMax: 100.50 },
  { name: "บางกอกใหญ่", latMin: 13.72, latMax: 13.75, lngMin: 100.47, lngMax: 100.50 },
  { name: "ธนบุรี", latMin: 13.71, latMax: 13.74, lngMin: 100.48, lngMax: 100.51 },
  { name: "คลองสาน", latMin: 13.72, latMax: 13.74, lngMin: 100.50, lngMax: 100.52 },
  { name: "ตลิ่งชัน", latMin: 13.77, latMax: 13.81, lngMin: 100.43, lngMax: 100.48 },

  // Central-North
  { name: "พญาไท", latMin: 13.76, latMax: 13.79, lngMin: 100.53, lngMax: 100.56 },
  { name: "ดินแดง", latMin: 13.76, latMax: 13.79, lngMin: 100.55, lngMax: 100.58 },
  { name: "ห้วยขวาง", latMin: 13.76, latMax: 13.79, lngMin: 100.57, lngMax: 100.60 },
  { name: "อารีย์", latMin: 13.77, latMax: 13.80, lngMin: 100.54, lngMax: 100.56 },
];

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

  // Use local coordinate lookup - no external API needed
  const locationName = getLocationName(latNum, lngNum);

  return NextResponse.json({
    name: locationName,
    lat: latNum,
    lng: lngNum,
    cached: true,
  });
}

function getLocationName(lat: number, lng: number): string {
  // Check each district
  for (const district of BANGKOK_DISTRICTS) {
    if (
      lat >= district.latMin &&
      lat <= district.latMax &&
      lng >= district.lngMin &&
      lng <= district.lngMax
    ) {
      return district.name;
    }
  }

  // Fallback for greater Bangkok area
  if (lat >= 13.5 && lat <= 14.2 && lng >= 100.3 && lng <= 100.9) {
    return "กรุงเทพฯ";
  }

  // Outside Bangkok
  if (lat >= 13.0 && lat <= 15.0 && lng >= 99.5 && lng <= 101.5) {
    return "ปริมณฑล";
  }

  return "ตำแหน่งปัจจุบัน";
}

