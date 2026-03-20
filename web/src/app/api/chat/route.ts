import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const LITELLM_API_KEY = process.env.LITELLM_API_KEY || "sk-rJBmfDcKnIb9yY3qCevViQ";
const LITELLM_BASE_URL = process.env.LITELLM_BASE_URL || "https://scb-dai-metered-llm2.thankfultree-428e76a1.southeastasia.azurecontainerapps.io";
const LITELLM_MODEL = process.env.LITELLM_MODEL || "gpt-5-mini";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Haversine distance calculation
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

async function fetchProductContext(supabase: Awaited<ReturnType<typeof createClient>>, userLat?: number, userLng?: number) {
  const { data: products } = await supabase
    .from("products")
    .select("id, name, name_th, description, category, price, image_url");

  const { data: inventory } = await supabase
    .from("branch_inventory")
    .select("product_id, branch_id, quantity")
    .gt("quantity", 0);

  const { data: branches } = await supabase
    .from("branches")
    .select("id, name_th, address_th, opening_hours, latitude, longitude");

  const { data: promotions } = await supabase
    .from("promotions")
    .select("product_id, title_th, discount_percent, discount_amount, valid_until");

  // Build branch info with distance from user
  const branchesWithDistance = (branches || []).map((branch) => ({
    ...branch,
    distance_km: userLat && userLng
      ? haversineDistance(userLat, userLng, branch.latitude, branch.longitude)
      : null,
  })).sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));

  // Build product context with availability
  const productContext = (products || []).map((product) => {
    const productInventory = (inventory || []).filter(
      (inv) => inv.product_id === product.id
    );
    const availableBranches = productInventory
      .map((inv) => {
        const branch = branchesWithDistance.find((b) => b.id === inv.branch_id);
        if (!branch) return null;
        const distanceStr = branch.distance_km != null ? ` ห่าง ${branch.distance_km} km` : "";
        return `${branch.name_th} (${inv.quantity} ชิ้น${distanceStr})`;
      })
      .filter(Boolean);

    const productPromos = (promotions || []).filter(
      (p) => p.product_id === product.id || !p.product_id
    );

    return {
      id: product.id,
      name: product.name,
      name_th: product.name_th,
      description: product.description,
      category: product.category,
      price: product.price,
      image_url: product.image_url,
      available_at: availableBranches,
      total_stock: productInventory.reduce((sum, inv) => sum + inv.quantity, 0),
      promotions: productPromos.map(
        (p) =>
          `${p.title_th}${p.discount_percent ? ` ลด ${p.discount_percent}%` : ""}${p.discount_amount ? ` ลด ${p.discount_amount} บาท` : ""}`
      ),
    };
  });

  // Build nearby branches summary for location-based queries
  const nearbyBranches = branchesWithDistance.slice(0, 10).map((b) => ({
    name_th: b.name_th,
    address_th: b.address_th,
    opening_hours: b.opening_hours,
    distance_km: b.distance_km,
  }));

  return { productContext, nearbyBranches };
}

const SYSTEM_PROMPT = `คุณคือ "น้องใด" ผู้ช่วยแนะนำสินค้าของ TwoDirect แพลตฟอร์มค้นหาสินค้าในร้านสะดวกซื้อ 7-Eleven
หน้าที่ของคุณคือช่วยผู้ใช้ค้นหาและแนะนำสินค้าที่มีในระบบ พูดจาน่ารัก เป็นกันเอง ใช้ค่ะ/ครับ

กฎสำคัญ:
1. ตอบเป็นภาษาไทยเสมอ (ยกเว้นชื่อสินค้าภาษาอังกฤษ)
2. เมื่อแนะนำสินค้า ให้ใส่ข้อมูลในรูปแบบ [PRODUCT_CARD:product_id] เพื่อแสดง product card
3. บอกราคา จำนวนสาขาที่มี และโปรโมชั่นถ้ามี
4. ถ้าผู้ใช้ถามสินค้าที่ไม่มีในระบบ ให้บอกตรงๆ ว่าไม่มี และแนะนำสินค้าที่ใกล้เคียง
5. ตอบสั้นกระชับ ไม่ยาวเกินไป
6. ถ้าผู้ใช้ถามเรื่องทั่วไปที่ไม่เกี่ยวกับสินค้า ให้ตอบสั้นๆ แล้วพยายามแนะนำสินค้าที่เกี่ยวข้อง
7. แนะนำตัวว่าเป็น "น้องใด" เสมอเมื่อถูกถามว่าชื่ออะไร
8. เมื่อผู้ใช้ถามเรื่องสาขาใกล้ฉัน หรือสาขาที่ใกล้ที่สุด ให้ดูจากข้อมูล "สาขาใกล้ผู้ใช้" ที่มี distance_km แล้วแนะนำสาขาที่ใกล้ที่สุด พร้อมบอกระยะทาง ที่อยู่ และเวลาเปิด-ปิด
9. เมื่อแนะนำสินค้า ให้บอกด้วยว่ามีที่สาขาไหนที่ใกล้ผู้ใช้บ้าง (ถ้ามีข้อมูลระยะทาง)

ตัวอย่างการตอบ:
- "แนะนำเครื่องดื่มเย็นๆ" → แนะนำ Coke Zero, นม Meiji ฯลฯ พร้อม [PRODUCT_CARD:id]
- "มีอะไรกินบ้าง" → แนะนำอาหารพร้อมทาน พร้อม [PRODUCT_CARD:id]
- "หิวน้ำ" → แนะนำเครื่องดื่มที่มี พร้อม [PRODUCT_CARD:id]
- "สาขาใกล้ฉัน" → บอกสาขาที่ใกล้ที่สุดพร้อมระยะทาง ที่อยู่ เวลาเปิด-ปิด`;

export async function POST(request: NextRequest) {
  try {
    const { messages, lat, lng } = (await request.json()) as {
      messages: ChatMessage[];
      lat?: number;
      lng?: number;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { productContext, nearbyBranches } = await fetchProductContext(supabase, lat, lng);

    const contextMessage = `ข้อมูลสินค้าในระบบ TwoDirect:\n${JSON.stringify(productContext, null, 0)}`;
    const branchMessage = nearbyBranches.length > 0
      ? `\n\nสาขาใกล้ผู้ใช้ (เรียงจากใกล้ไปไกล):\n${JSON.stringify(nearbyBranches, null, 0)}`
      : "";

    const llmMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: contextMessage + branchMessage },
      ...messages.slice(-10),
    ];

    const response = await fetch(`${LITELLM_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LITELLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: LITELLM_MODEL,
        messages: llmMessages,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LiteLLM error:", errorText);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "ขออภัย ไม่สามารถตอบได้ในขณะนี้";

    // Extract product IDs from [PRODUCT_CARD:id] markers
    const productCardRegex = /\[PRODUCT_CARD:([^\]]+)\]/g;
    const mentionedProductIds: string[] = [];
    let match;
    while ((match = productCardRegex.exec(assistantMessage)) !== null) {
      mentionedProductIds.push(match[1]);
    }

    // Get full product data for mentioned products
    const mentionedProducts = productContext
      .filter((p) => mentionedProductIds.includes(p.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        name_th: p.name_th,
        description: p.description,
        category: p.category,
        price: p.price,
        image_url: p.image_url,
        total_stock: p.total_stock,
        branch_count: p.available_at.length,
        promotions: p.promotions,
      }));

    // Clean the message (remove PRODUCT_CARD markers)
    const cleanMessage = assistantMessage.replace(
      /\[PRODUCT_CARD:[^\]]+\]/g,
      ""
    ).replace(/\n{3,}/g, "\n\n").trim();

    return NextResponse.json({
      message: cleanMessage,
      products: mentionedProducts,
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
