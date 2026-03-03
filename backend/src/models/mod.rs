use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct Product {
    /// Unique product ID
    pub id: Uuid,
    /// Product name in English
    pub name: String,
    /// Product name in Thai
    pub name_th: String,
    /// Product description
    pub description: Option<String>,
    /// Product category (e.g., beverages, snacks)
    pub category: String,
    /// URL to product image
    pub image_url: Option<String>,
    /// Price in Thai Baht
    pub price: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct Branch {
    /// Unique branch ID
    pub id: Uuid,
    /// Branch name in English
    pub name: String,
    /// Branch name in Thai
    pub name_th: String,
    /// Address in English
    pub address: String,
    /// Address in Thai
    pub address_th: String,
    /// Latitude coordinate
    pub latitude: f64,
    /// Longitude coordinate
    pub longitude: f64,
    /// Opening hours (e.g., "24 ชั่วโมง")
    pub opening_hours: String,
    /// Contact phone number
    pub phone: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct BranchInventory {
    pub id: Uuid,
    pub branch_id: Uuid,
    pub product_id: Uuid,
    pub quantity: i32,
    pub last_updated: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct Promotion {
    /// Unique promotion ID
    pub id: Uuid,
    /// Associated product ID (null for store-wide promotions)
    pub product_id: Option<Uuid>,
    /// Promotion title in English
    pub title: String,
    /// Promotion title in Thai
    pub title_th: String,
    /// Promotion description
    pub description: Option<String>,
    /// Discount percentage (e.g., 10 for 10% off)
    pub discount_percent: Option<i32>,
    /// Fixed discount amount in Baht
    pub discount_amount: Option<f64>,
    /// Promotion expiry date
    pub valid_until: Option<String>,
    /// Whether this promotion is exclusive to twodirect
    pub is_twodirect_exclusive: bool,
}

// API Response types
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct BranchWithStock {
    /// Branch information
    pub branch: Branch,
    /// Available quantity at this branch
    pub quantity: i32,
    /// Distance from user in kilometers
    pub distance_km: f64,
    /// Available promotions
    pub promotions: Vec<Promotion>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct SearchResult {
    /// Product information
    pub product: Product,
    /// Branches that have this product in stock
    pub branches: Vec<BranchWithStock>,
}

// Request types
#[derive(Debug, Clone, Deserialize, ToSchema)]
pub struct SearchQuery {
    /// Search query (product name in English or Thai)
    pub query: Option<String>,
    /// User's latitude
    pub lat: Option<f64>,
    /// User's longitude
    pub lng: Option<f64>,
    /// Search radius in kilometers (default: 5)
    pub radius_km: Option<f64>,
}
