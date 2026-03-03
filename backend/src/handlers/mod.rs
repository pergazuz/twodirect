use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use std::sync::Arc;

use crate::db::SupabaseClient;
use crate::models::*;

pub type AppState = Arc<SupabaseClient>;

// Helper function to calculate distance using Haversine formula
fn haversine_distance(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    let r = 6371.0; // Earth's radius in km
    let d_lat = (lat2 - lat1).to_radians();
    let d_lon = (lon2 - lon1).to_radians();
    let lat1_rad = lat1.to_radians();
    let lat2_rad = lat2.to_radians();

    let a = (d_lat / 2.0).sin().powi(2)
        + lat1_rad.cos() * lat2_rad.cos() * (d_lon / 2.0).sin().powi(2);
    let c = 2.0 * a.sqrt().asin();
    r * c
}

/// Health check endpoint
#[utoipa::path(
    get,
    path = "/api/health",
    tag = "Health",
    responses(
        (status = 200, description = "Service is healthy", body = String)
    )
)]
pub async fn health_check() -> &'static str {
    "OK"
}

/// Get all products
#[utoipa::path(
    get,
    path = "/api/products",
    tag = "Products",
    responses(
        (status = 200, description = "List of all products", body = Vec<Product>),
        (status = 500, description = "Internal server error")
    )
)]
pub async fn get_products(State(db): State<AppState>) -> Result<Json<Vec<Product>>, StatusCode> {
    match db.get_products().await {
        Ok(products) => Ok(Json(products)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

/// Search products by name and find nearby branches with stock
#[utoipa::path(
    get,
    path = "/api/products/search",
    tag = "Products",
    params(
        ("query" = Option<String>, Query, description = "Search query (product name in English or Thai)"),
        ("lat" = Option<f64>, Query, description = "User's latitude (default: 13.7563 Bangkok)"),
        ("lng" = Option<f64>, Query, description = "User's longitude (default: 100.5018 Bangkok)"),
        ("radius_km" = Option<f64>, Query, description = "Search radius in kilometers (default: 5)")
    ),
    responses(
        (status = 200, description = "Search results with products and nearby branches", body = Vec<SearchResult>),
        (status = 500, description = "Internal server error")
    )
)]
pub async fn search_products(
    State(db): State<AppState>,
    Query(params): Query<SearchQuery>,
) -> Result<Json<Vec<SearchResult>>, StatusCode> {
    let query = params.query.unwrap_or_default();
    if query.is_empty() {
        return Ok(Json(vec![]));
    }

    let products = db.search_products(&query).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let branches = db.get_branches().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let all_promotions = db.get_promotions().await.unwrap_or_default();

    let user_lat = params.lat.unwrap_or(13.7563);
    let user_lng = params.lng.unwrap_or(100.5018);
    let radius = params.radius_km.unwrap_or(5.0);

    let mut results = Vec::new();

    for product in products {
        let inventory = db
            .get_inventory_for_product(&product.id.to_string())
            .await
            .unwrap_or_default();

        let mut branches_with_stock: Vec<BranchWithStock> = Vec::new();

        for inv in inventory {
            if let Some(branch) = branches.iter().find(|b| b.id == inv.branch_id) {
                let distance = haversine_distance(user_lat, user_lng, branch.latitude, branch.longitude);

                if distance <= radius {
                    let promos: Vec<Promotion> = all_promotions
                        .iter()
                        .filter(|p| p.product_id.is_none() || p.product_id == Some(product.id))
                        .cloned()
                        .collect();

                    branches_with_stock.push(BranchWithStock {
                        branch: branch.clone(),
                        quantity: inv.quantity,
                        distance_km: (distance * 100.0).round() / 100.0,
                        promotions: promos,
                    });
                }
            }
        }

        branches_with_stock.sort_by(|a, b| a.distance_km.partial_cmp(&b.distance_km).unwrap());

        if !branches_with_stock.is_empty() {
            results.push(SearchResult {
                product: product.clone(),
                branches: branches_with_stock,
            });
        }
    }

    Ok(Json(results))
}

/// Get all branches
#[utoipa::path(
    get,
    path = "/api/branches",
    tag = "Branches",
    responses(
        (status = 200, description = "List of all branches", body = Vec<Branch>),
        (status = 500, description = "Internal server error")
    )
)]
pub async fn get_branches(State(db): State<AppState>) -> Result<Json<Vec<Branch>>, StatusCode> {
    match db.get_branches().await {
        Ok(branches) => Ok(Json(branches)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

/// Get a specific branch by ID
#[utoipa::path(
    get,
    path = "/api/branches/{id}",
    tag = "Branches",
    params(
        ("id" = String, Path, description = "Branch UUID")
    ),
    responses(
        (status = 200, description = "Branch details", body = Branch),
        (status = 404, description = "Branch not found"),
        (status = 500, description = "Internal server error")
    )
)]
pub async fn get_branch(
    State(db): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Branch>, StatusCode> {
    match db.get_branch(&id).await {
        Ok(Some(branch)) => Ok(Json(branch)),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

/// Get all promotions
#[utoipa::path(
    get,
    path = "/api/promotions",
    tag = "Promotions",
    responses(
        (status = 200, description = "List of all promotions", body = Vec<Promotion>),
        (status = 500, description = "Internal server error")
    )
)]
pub async fn get_promotions(State(db): State<AppState>) -> Result<Json<Vec<Promotion>>, StatusCode> {
    match db.get_promotions().await {
        Ok(promotions) => Ok(Json(promotions)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

