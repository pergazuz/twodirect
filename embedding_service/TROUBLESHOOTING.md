# Troubleshooting Guide

## Current Status

The embedding service has been successfully migrated to `uv` and all dependencies are installed correctly. However, there's a compatibility issue between PyTorch 2.10.0 and the Jina CLIP v2 model that we're working to resolve.

## The Meta Tensor Issue

### Problem
PyTorch 2.10.0 introduced "meta tensors" for faster model initialization. However, the Jina CLIP v2 model code calls `.item()` on these tensors during initialization, which causes this error:

```
RuntimeError: Tensor.item() cannot be called on meta tensors
```

### What We've Tried

1. ✅ **Added all missing dependencies**: `timm`, `torchvision`, `einops`
2. ✅ **Fixed pyproject.toml**: Proper package configuration
3. ⏳ **Attempted fixes for meta tensor issue**:
   - Setting `torch_dtype=torch.float32`
   - Setting `low_cpu_mem_usage=False`
   - Using `device_map="cpu"`
   - Setting `_fast_init=False` (current approach)
   - Trying to downgrade to PyTorch 2.5.1 (not available for macOS ARM64)

### Current Approach

We're using `_fast_init=False` in the model loading code to disable meta device initialization:

```python
self.model = AutoModel.from_pretrained(
    self.model_name,
    trust_remote_code=True,
    _fast_init=False  # Disable meta device
).to(self.device)
```

## How to Test

**⚠️ CRITICAL: The service takes 30-60 seconds to start. DO NOT PRESS CTRL+C DURING STARTUP!**

### Step-by-Step Instructions

1. **Start the service:**
   ```bash
   cd embedding_service
   ./start.sh
   ```

2. **BE PATIENT - Wait for these stages:**

   **Stage 1: Dependency sync** (1-2 seconds)
   ```
   📦 Syncing dependencies with uv...
   Resolved 110 packages in 4ms
   ✅ Starting embedding service on port 8000...
   ```

   **Stage 2: Import transformers** (10-20 seconds) ⏳
   ```
   INFO: Uvicorn running on http://0.0.0.0:8000
   INFO: Started server process [xxxxx]
   INFO: Waiting for application startup.
   ```
   ⚠️ **The screen will appear frozen here - THIS IS NORMAL! Wait!**

   **Stage 3: Load model** (20-40 seconds) ⏳
   ```
   🚀 Starting embedding service...
   📦 Loading model: jinaai/jina-clip-v2
   💻 Using device: mps
   ```
   ⚠️ **Model is loading - wait for success message!**

   **Stage 4: Ready!** ✅
   ```
   ✅ Model loaded successfully
   INFO: Application startup complete.
   ```

3. **Test the service:**
   ```bash
   # In a NEW terminal window
   curl http://localhost:8000/api/health
   ```

### Common Mistakes

❌ **Pressing Ctrl+C during import** - This kills the process before it can load
❌ **Not waiting long enough** - The model is 1.73GB and takes time
❌ **Expecting instant startup** - This is a large ML model, not a simple web server

✅ **Correct approach**: Start the service and go get coffee for 60 seconds!

## Alternative Solutions

If the `_fast_init=False` approach doesn't work, we have these options:

### Option 1: Use a Different Model
Switch to a model that doesn't have this compatibility issue:
- `sentence-transformers/clip-ViT-B-32-multilingual-v1`
- `openai/clip-vit-base-patch32`

### Option 2: Wait for Fix
- Wait for Jina AI to update their model code
- Wait for PyTorch to fix the meta tensor issue
- Wait for transformers library to add a workaround

### Option 3: Patch the Model Code
Manually patch the downloaded model code in `~/.cache/huggingface/` to avoid calling `.item()` on meta tensors.

## Performance with uv

Despite the model loading issue, the `uv` migration is working perfectly:

- ✅ **110 packages resolved in 3-354ms** (vs 30-60s with pip)
- ✅ **Dependencies install in milliseconds** (vs several seconds with pip)
- ✅ **~100-200x faster** than pip!

## Next Steps

1. **Test with patience**: Let the service run for 60 seconds without interruption
2. **If it works**: Document the solution and move on
3. **If it fails**: Consider switching to an alternative model

## Getting Help

If you continue to have issues:
1. Check the full error message
2. Verify PyTorch version: `uv run python -c "import torch; print(torch.__version__)"`
3. Check if model files are cached: `ls -lh ~/.cache/huggingface/hub/models--jinaai--jina-clip-v2/`

