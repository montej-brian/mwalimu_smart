import os
import hashlib
import google.generativeai as genai
from dotenv import load_dotenv
import subprocess
import tempfile

load_dotenv()

# Configure Gemini AI
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

VIDEO_DIR = os.path.join(os.path.dirname(__file__), 'videos')
os.makedirs(VIDEO_DIR, exist_ok=True)

def generate_manim_code(step_text: str, topic: str) -> str:
    """Use Gemini AI to generate Manim Python code"""
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    prompt = f"""You are a Manim animation expert. Generate Python code using the Manim library to create a short, educational animation for this concept:

Topic: {topic}
Step: {step_text}

Requirements:
1. Use Manim Community Edition (manim library)
2. Create a Scene class called GeneratedScene
3. Keep animation under 10 seconds
4. Use clear, simple visuals
5. Include text labels
6. Use smooth animations
7. Return ONLY the Python code, no explanations

Example structure:
```python
from manim import *

class GeneratedScene(Scene):
    def construct(self):
        # Your animation code here
        title = Text("{step_text[:30]}...")
        self.play(Write(title))
        self.wait(1)
```

Generate the complete Manim code now:"""
    
    response = model.generate_content(prompt)
    code = response.text
    
    # Clean the code (remove markdown code blocks if present)
    if '```python' in code:
        code = code.split('```python')[1].split('```')[0]
    elif '```' in code:
        code = code.split('```')[1].split('```')[0]
    
    return code.strip()

def generate_animation(step_text: str, step_number: int, topic: str) -> str:
    """Generate Manim animation and return video path"""
    
    # Create cache key
    cache_key = hashlib.md5(f"{topic}:{step_text}".encode()).hexdigest()
    video_filename = f"animation_{cache_key}.mp4"
    video_path = os.path.join(VIDEO_DIR, video_filename)
    
    # Return cached video if exists
    if os.path.exists(video_path):
        print(f"Using cached animation: {video_filename}")
        return video_path
    
    try:
        # Generate Manim code using AI
        print(f"Generating Manim code for: {step_text[:50]}...")
        manim_code = generate_manim_code(step_text, topic)
        
        # Create temporary Python file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(manim_code)
            temp_script = f.name
        
        # Render animation with Manim
        print("Rendering animation...")
        output_dir = tempfile.mkdtemp()
        
        result = subprocess.run([
            'manim',
            '-ql',  # Low quality for faster rendering
            '--format=mp4',
            f'--output_file={video_filename}',
            temp_script,
            'GeneratedScene'
        ], capture_output=True, text=True, cwd=output_dir)
        
        if result.returncode != 0:
            print(f"Manim error: {result.stderr}")
            raise Exception(f"Manim rendering failed: {result.stderr}")
        
        # Find the generated video
        media_dir = os.path.join(output_dir, 'media', 'videos')
        for root, dirs, files in os.walk(media_dir):
            for file in files:
                if file.endswith('.mp4'):
                    generated_video = os.path.join(root, file)
                    # Move to videos directory
                    os.rename(generated_video, video_path)
                    break
        
        # Cleanup
        os.unlink(temp_script)
        
        if not os.path.exists(video_path):
            raise Exception("Video file not found after rendering")
        
        print(f"Animation generated successfully: {video_filename}")
        return video_path
    
    except Exception as e:
        print(f"Error generating animation: {e}")
        raise
