# API Research: Maps & Image Recognition Services

## Overview
This document outlines the key APIs needed for the Product Location Finder app.

---

## 1. Maps & Location APIs

### Option A: Google Maps Platform (Recommended)

**Website**: https://mapsplatform.google.com

**Key APIs Needed:**
| API | Use Case | Pricing |
|-----|----------|---------|
| Maps SDK | Display maps in app | $7/1000 loads (mobile) |
| Places API | Search for places, store locations | $17-32/1000 requests |
| Directions API | Navigation to stores | $5-10/1000 requests |
| Geocoding API | Convert addresses to coordinates | $5/1000 requests |
| Distance Matrix API | Calculate distances to multiple stores | $5-10/1000 elements |

**Free Tier:**
- $200 free monthly credit (covers ~28,000 map loads)
- Good for MVP and early development

**Pros:**
- ✅ Most comprehensive maps in Thailand
- ✅ Excellent documentation
- ✅ High accuracy and reliability
- ✅ Thai language support

**Cons:**
- ❌ Can get expensive at scale
- ❌ Usage tracking required

**Getting Started:**
1. Create Google Cloud account
2. Enable Maps SDK and required APIs
3. Create API key
4. Implement billing (required even for free tier)

---

### Option B: Mapbox

**Website**: https://www.mapbox.com

**Key Products:**
- Maps SDK for mobile (iOS/Android)
- Navigation SDK
- Geocoding API
- Directions API

**Pricing:**
- Free tier: 50,000 map loads/month
- Pay-as-you-go after free tier

**Pros:**
- ✅ More generous free tier
- ✅ Customizable map styles
- ✅ Good mobile SDKs

**Cons:**
- ❌ Less coverage detail in Thailand compared to Google
- ❌ Smaller community/support

---

### Option C: HERE Maps

**Website**: https://developer.here.com

**Pricing:**
- Free tier: 250,000 transactions/month
- Good for high-volume applications

**Pros:**
- ✅ Very generous free tier
- ✅ Good routing and navigation

**Cons:**
- ❌ Less popular in Thailand
- ❌ May have coverage gaps

---

### Maps API Recommendation

**For MVP**: Start with **Google Maps Platform**
- Best coverage in Thailand
- $200/month free credit is sufficient for MVP
- Most developers are familiar with it
- Easy to implement

---

## 2. Image Recognition APIs

### Option A: Google Cloud Vision API (Recommended)

**Website**: https://cloud.google.com/vision

**Key Features:**
| Feature | Use Case | Pricing |
|---------|----------|---------|
| Label Detection | Identify products in images | $1.50/1000 images |
| Logo Detection | Recognize brand logos | $1.50/1000 images |
| Text Detection (OCR) | Read product names | $1.50/1000 images |
| Product Search | Match to product catalog | $4.50/1000 images |
| Web Detection | Find similar products online | $3.50/1000 images |

**Free Tier:**
- First 1,000 units/month free for most features
- Product Search: First 5,000 free setup, then pay per operation

**Pros:**
- ✅ High accuracy
- ✅ Product Search feature specifically designed for retail
- ✅ Good Thai text OCR support
- ✅ Pre-trained models, no ML expertise needed

**Cons:**
- ❌ Custom product catalog setup required
- ❌ Cost can add up with high usage

---

### Option B: AWS Rekognition

**Website**: https://aws.amazon.com/rekognition

**Key Features:**
- Label detection
- Custom labels (train on your products)
- Face detection (not needed)
- Text detection

**Pricing:**
- First 5,000 images/month free (first 12 months)
- Then $0.001-$0.004 per image

**Pros:**
- ✅ Good accuracy
- ✅ Custom Labels for product training
- ✅ AWS ecosystem integration

**Cons:**
- ❌ Requires more setup for product matching
- ❌ Need to train custom models

---

### Option C: OpenAI Vision (GPT-4 Vision)

**Website**: https://platform.openai.com

**Use Case:**
- Send product image to GPT-4 Vision
- Get product description back
- Use description to search product database

**Pricing:**
- Input: ~$0.01 per image (varies by size)
- Output: Standard token pricing

**Pros:**
- ✅ Excellent understanding of images
- ✅ Can describe products in natural language
- ✅ No custom training needed

**Cons:**
- ❌ Slower response time
- ❌ More expensive at scale
- ❌ May not match exact product SKUs

---

### Option D: Google Gemini API

**Website**: https://ai.google.dev

**Use Case:**
- Multimodal AI for image understanding
- Similar to OpenAI Vision approach

**Pricing:**
- Gemini 2.0 Flash: Free tier available
- Pay-as-you-go for higher usage

**Pros:**
- ✅ Free tier for development
- ✅ Good image understanding
- ✅ Google ecosystem

---

### Image Recognition Recommendation

**For MVP**: Start with **Google Cloud Vision API**
- Use **Label Detection** + **Text Detection** for initial product identification
- Consider **Product Search** for better accuracy when product catalog is ready
- 1,000 free images/month is enough for testing

**Hybrid Approach (Future):**
1. Use Vision API for quick label/text detection
2. Use Gemini/GPT for complex or ambiguous products
3. Build custom ML model as usage scales

---

## 3. Cost Estimation (MVP Phase)

### Monthly Cost Estimate (1,000 active users)

| Service | Usage Estimate | Cost |
|---------|----------------|------|
| Google Maps SDK | 10,000 loads | $70 |
| Directions API | 5,000 requests | $25-50 |
| Distance Matrix | 20,000 elements | $100-200 |
| Vision API | 3,000 images | Free (within quota) |
| **Total** | | **~$200-300/month** |

**Note:** Google Cloud's $200 free credit should cover most MVP costs.

---

## 4. Implementation Priority

### Phase 1: MVP
1. ✅ Google Maps SDK - display store locations
2. ✅ Distance Matrix API - calculate distances
3. ✅ Vision API (Label + Text) - basic image search

### Phase 2: Enhancement
4. 🔜 Product Search API - accurate product matching
5. 🔜 Directions API - full navigation
6. 🔜 Push notifications - stock alerts

### Phase 3: Optimization
7. 🔮 Custom ML model - if scale requires it
8. 🔮 Alternative maps provider - if costs are too high

---

## 5. Action Items

- [ ] Create Google Cloud account
- [ ] Enable Maps Platform APIs
- [ ] Enable Cloud Vision API
- [ ] Get API keys and set up billing alerts
- [ ] Build prototype with basic Maps integration
- [ ] Test Vision API with sample product images
- [ ] Evaluate accuracy for Thai convenience store products

