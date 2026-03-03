use crate::models::*;
use reqwest::Client;
use serde_json::Value;
use std::env;

pub struct SupabaseClient {
    client: Client,
    url: String,
    api_key: String,
}

impl SupabaseClient {
    pub fn new() -> Self {
        let url = env::var("SUPABASE_URL").expect("SUPABASE_URL must be set");
        let api_key = env::var("SUPABASE_ANON_KEY").expect("SUPABASE_ANON_KEY must be set");

        Self {
            client: Client::new(),
            url,
            api_key,
        }
    }

    async fn request(&self, table: &str, query: &str) -> Result<Value, reqwest::Error> {
        let url = format!("{}/rest/v1/{}?{}", self.url, table, query);
        let response = self
            .client
            .get(&url)
            .header("apikey", &self.api_key)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .send()
            .await?
            .json::<Value>()
            .await?;
        Ok(response)
    }

    pub async fn get_products(&self) -> Result<Vec<Product>, reqwest::Error> {
        let data = self.request("products", "select=*").await?;
        let products: Vec<Product> = serde_json::from_value(data).unwrap_or_default();
        Ok(products)
    }

    pub async fn search_products(&self, query: &str) -> Result<Vec<Product>, reqwest::Error> {
        let encoded = urlencoding::encode(query);
        let q = format!("select=*&or=(name.ilike.*{}*,name_th.ilike.*{}*)", encoded, encoded);
        let data = self.request("products", &q).await?;
        let products: Vec<Product> = serde_json::from_value(data).unwrap_or_default();
        Ok(products)
    }

    pub async fn get_branches(&self) -> Result<Vec<Branch>, reqwest::Error> {
        let data = self.request("branches", "select=*").await?;
        let branches: Vec<Branch> = serde_json::from_value(data).unwrap_or_default();
        Ok(branches)
    }

    pub async fn get_branch(&self, id: &str) -> Result<Option<Branch>, reqwest::Error> {
        let q = format!("select=*&id=eq.{}", id);
        let data = self.request("branches", &q).await?;
        let branches: Vec<Branch> = serde_json::from_value(data).unwrap_or_default();
        Ok(branches.into_iter().next())
    }

    pub async fn get_inventory_for_product(&self, product_id: &str) -> Result<Vec<BranchInventory>, reqwest::Error> {
        let q = format!("select=*&product_id=eq.{}&quantity=gt.0", product_id);
        let data = self.request("branch_inventory", &q).await?;
        let inventory: Vec<BranchInventory> = serde_json::from_value(data).unwrap_or_default();
        Ok(inventory)
    }

    pub async fn get_promotions(&self) -> Result<Vec<Promotion>, reqwest::Error> {
        let data = self.request("promotions", "select=*").await?;
        let promotions: Vec<Promotion> = serde_json::from_value(data).unwrap_or_default();
        Ok(promotions)
    }
}

impl Default for SupabaseClient {
    fn default() -> Self {
        Self::new()
    }
}

