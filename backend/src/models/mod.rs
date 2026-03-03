use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Product {
    pub id: Uuid,
    pub name: String,
    pub name_th: String,
    pub description: Option<String>,
    pub category: String,
    pub image_url: Option<String>,
    pub price: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Branch {
    pub id: Uuid,
    pub name: String,
    pub name_th: String,
    pub address: String,
    pub address_th: String,
    pub latitude: f64,
    pub longitude: f64,
    pub opening_hours: String,
    pub phone: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BranchInventory {
    pub id: Uuid,
    pub branch_id: Uuid,
    pub product_id: Uuid,
    pub quantity: i32,
    pub last_updated: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Promotion {
    pub id: Uuid,
    pub product_id: Option<Uuid>,
    pub title: String,
    pub title_th: String,
    pub description: Option<String>,
    pub discount_percent: Option<i32>,
    pub discount_amount: Option<f64>,
    pub valid_until: Option<String>,
    pub is_twodirect_exclusive: bool,
}

// API Response types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BranchWithStock {
    pub branch: Branch,
    pub quantity: i32,
    pub distance_km: f64,
    pub promotions: Vec<Promotion>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub product: Product,
    pub branches: Vec<BranchWithStock>,
}

// Request types
#[derive(Debug, Clone, Deserialize)]
pub struct SearchQuery {
    pub query: Option<String>,
    pub lat: Option<f64>,
    pub lng: Option<f64>,
    pub radius_km: Option<f64>,
}
