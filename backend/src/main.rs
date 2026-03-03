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
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use db::SupabaseClient;
use handlers::*;
use models::*;

#[derive(OpenApi)]
#[openapi(
    info(
        title = "twodirect API",
        version = "1.0.0",
        description = "ค้นหาสินค้า → ตรงไปหยิบ | Product location finder API for retail stores in Thailand",
        contact(name = "twodirect", url = "https://twodirect.app"),
        license(name = "MIT")
    ),
    servers(
        (url = "https://twodirect-production.up.railway.app", description = "Production"),
        (url = "http://localhost:8080", description = "Local development")
    ),
    paths(
        handlers::health_check,
        handlers::get_products,
        handlers::search_products,
        handlers::get_branches,
        handlers::get_branch,
        handlers::get_promotions,
    ),
    components(schemas(
        Product,
        Branch,
        BranchInventory,
        Promotion,
        BranchWithStock,
        SearchResult,
        SearchQuery,
    )),
    tags(
        (name = "Health", description = "Health check endpoints"),
        (name = "Products", description = "Product search and listing"),
        (name = "Branches", description = "Store branch information"),
        (name = "Promotions", description = "Discounts and promotions")
    )
)]
struct ApiDoc;

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

    // Build router with Swagger UI
    let app = Router::new()
        .merge(SwaggerUi::new("/docs").url("/api-docs/openapi.json", ApiDoc::openapi()))
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
    tracing::info!("📚 Swagger UI available at http://{}/docs", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
