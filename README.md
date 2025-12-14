MwalimuSmart is an AI-driven virtual lecturer platform designed to transform digital learning by mimicking a real classroom experience. It delivers lessons through dynamic board-style illustrations, motion-based drawings, and synchronized voice explanations, just like a physical teacher in front of a class.

The platform focuses on clarity, engagement, and accessibility—making complex concepts easier to understand for learners across different educational levels.


---

# Vision
To democratize quality education by providing learners with an interactive, lecturer-like learning experience anytime, anywhere.


---

# Key Features
Virtual Lecturer Experience
Lessons are delivered as if a real lecturer is teaching on a board, step-by-step.

Dynamic Board Illustrations
Concepts are explained using animated drawings, diagrams, and handwritten-style notes.

AI-Generated Voice Explanations
Clear, synchronized narration that follows the drawing flow in real time.

Structured Lesson Flow
Introduction → Explanation → Examples → Summary (just like a real class).

Scalable for Multiple Subjects
Designed to support STEM, humanities, and technical courses.

Student-Centric Learning
Focused on understanding, not memorization.



---

# How It Works (High Level)

1. Lesson content is structured into logical teaching steps


2. AI generates synchronized:

Board drawings

Motion animations

Voice explanations



3. Learners watch and follow the lesson as if attending a physical lecture




---

 # Tech Stack

Frontend: Web-based UI (React / HTML / CSS / JavaScript)

Backend: Node.js 

AI Components:

Text-to-speech (TTS)

AI-generated lesson scripts

Drawing/animation engine


Deployment: Cloud-based (scalable architecture)


---

# Use Cases

Secondary school and university students

Self-learners and remote learners

Institutions seeking digital lecture delivery

EdTech platforms and training programs



---

# Target Impact

Improve comprehension and retention

Reduce dependency on physical classrooms

Support learners in under-resourced regions

Enable scalable, affordable education



---

# Project Status

 Active Development (MVP Stage)
Features, architecture, and modules are being iteratively built and refined.


---

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Create .env file from the example
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
# PORT=3001
# FRONTEND_URL=http://localhost:5173

# Dependencies are already installed
# If needed, run: npm install

# Start the backend server
npm run dev
```

The backend server will start on `http://localhost:3001`

### 2. Frontend Setup

```bash
cd mvp-builder

# Dependencies are already installed
# If needed, run: npm install

# Start the frontend development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Enter a question (e.g., "Explain photosynthesis")
3. Optionally upload an image for visual context
4. Click "Get Explanation"
5. On the Board page:
   - Click **Play** to start audio narration
   - Watch the canvas as visual illustrations appear
   - Use **Skip Forward/Back** to navigate between steps
   - Adjust volume with the slider



## Troubleshooting

### Backend won't start
- Ensure you have a valid `GEMINI_API_KEY` in `backend/.env`
- Check that port 3001 is not already in use

### Frontend can't connect to backend
- Verify the backend is running on port 3001
- Check `VITE_BACKEND_URL` in `mvp-builder/.env` is set to `http://localhost:3001`

### Audio not playing
- Ensure your browser supports Web Speech API (Chrome, Edge, Safari)
- Check browser audio permissions

### Visuals not loading
- Check browser console for errors
- Verify backend is responding to `/api/generate-visual` requests

## Development

### Backend Development
```bash
cd backend
npm run dev  # Auto-reloads on file changes
```

### Frontend Development
```bash
cd mvp-builder
npm run dev  # Vite dev server with HMR
```

### Building for Production

Backend:
```bash
cd backend
npm run build
npm start
```

Frontend:
```bash
cd mvp-builder
npm run build
npm run preview
```

## Features

### Lesson Generation
- Powered by Gemini 2.0 Flash
- Structured JSON output with title, steps, and summary
- Support for image-based questions

### Visual Instructions
- AI-generated drawing commands (circles, rectangles, arrows, text, lines)
- Rendered on HTML5 canvas
- Synchronized with lesson steps

### Audio Narration
- Browser-native Web Speech API
- Adjustable volume
- Step-by-step playback
- Automatic progression through lesson

## Notes

- The backend uses Gemini 2.0 Flash Experimental for best performance
- Audio narration uses the browser's built-in TTS (no external API needed)
- Visual instructions are generated per step and cached
- All dependencies have been successfully installed
