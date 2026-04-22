"""DigiRepub 配图生成 v2"""
from google import genai
from PIL import Image
import os, io

API_KEY = "sk-BQaLJJNEgzYpZVXo67D52dF12b1b42B0A3A8175c7f278e30"
MODEL = "gemini-3.1-flash-image-preview"

client = genai.Client(
    api_key=API_KEY,
    http_options={"base_url": "https://api.apiyi.com"}
)

OUTPUT_DIR = "/Users/linhuasun/Desktop/DIGIREPUB/images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

logo = Image.open("/Users/linhuasun/Desktop/DIGIREPUB/微信图片_20260121162923_1845_48.png")

prompts = [
    ("hero_bg", "Generate an image: abstract futuristic dark technology background, deep charcoal gray with subtle red glowing neural network lines and particles, minimal premium feel, wide 16:9, no text, cinematic lighting"),
    ("ai_consulting", "Generate an image: modern glass office meeting room, professionals discussing around holographic AI dashboard, warm lighting, red accent, corporate innovative, no text, 16:9"),
    ("product_matrix", "Generate an image: isometric 3D floating digital product modules in dark space, 8 glowing connected cubes, red and white accents on dark background, tech startup aesthetic, no text, 16:9"),
    ("ecosystem_network", "Generate an image: abstract network visualization, central red node radiating connections, dark space background with subtle grid, data visualization style, futuristic, no text, 16:9"),
    ("team_workshop", "Generate an image: modern creative workspace, people collaborating around large screens with AI content, warm natural lighting, red accent elements, professional energetic atmosphere, no text, 16:9"),
]

for name, prompt in prompts:
    print(f"生成: {name}...")
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=[prompt, logo],
            config=genai.types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            )
        )
        saved = False
        if response.candidates:
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data and part.inline_data.data:
                    img = Image.open(io.BytesIO(part.inline_data.data))
                    out = os.path.join(OUTPUT_DIR, f"{name}.png")
                    img.save(out)
                    print(f"  ✅ {out} ({img.size})")
                    saved = True
                    break
        if not saved:
            # 尝试直接访问 image 属性
            for part in response.candidates[0].content.parts:
                print(f"  Part type: {type(part)}, attrs: {[a for a in dir(part) if not a.startswith('_')]}")
            print(f"  ⚠️ 无图片, text: {response.text[:150] if response.text else 'none'}")
    except Exception as e:
        print(f"  ❌ {e}")

print("\n完成!")
