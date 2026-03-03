mod db;
mod handlers;
mod models;

use axum::{
    routing::get,
    Router,
};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use db::SupabaseClient;
use handlers::*;

#[tokio::main]
async fn main() {
    // Load environment variables
    dotenvy::dotenv().ok();

    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Initialize Supabase client
    let db = Arc::new(SupabaseClient::new());

    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build router
    let app = Router::new()
        .route("/api/health", get(health_check))
        .route("/api/products", get(get_products))
        .route("/api/products/search", get(search_products))
        .route("/api/branches", get(get_branches))
        .route("/api/branches/{id}", get(get_branch))
        .route("/api/promotions", get(get_promotions))
        .layer(cors)
        .with_state(db);

    let addr = "0.0.0.0:8080";
    tracing::info!("🚀 twodirect API server running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
