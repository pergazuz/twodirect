"""
Quick test script to verify model loading works
"""
import sys
import torch
print(f"🐍 Python: {sys.version}")
print(f"🔥 PyTorch: {torch.__version__}")
print(f"💻 MPS available: {torch.backends.mps.is_available()}")

print("\n📦 Loading model...")
from models.embedding_model import EmbeddingModel

print("🚀 Initializing model...")
model = EmbeddingModel()

print("\n✅ Model loaded successfully!")
print(f"📊 Model name: {model.model_name}")
print(f"💻 Device: {model.device}")

print("\n🧪 Testing text encoding...")
embedding = model.encode_text("Hello world")
print(f"✅ Text embedding shape: {embedding.shape}")
print(f"📏 Embedding dimension: {len(embedding)}")

print("\n🎉 All tests passed!")

