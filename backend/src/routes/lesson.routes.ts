import { Router } from 'express';
import {
    generateLessonController,
    generateAudioController,
    generateVisualController,
    generateImageController
} from '../controllers/lesson.controller.js';

const router = Router();

// POST /api/generate-lesson - Generate a lesson from a question
router.post('/generate-lesson', generateLessonController);

// POST /api/generate-audio - Generate audio narration for text
router.post('/generate-audio', generateAudioController);

// POST /api/generate-visual - Generate visual instructions for a step
router.post('/generate-visual', generateVisualController);

// POST /api/generate-image - Generate AI image for a step
router.post('/generate-image', generateImageController);

export default router;
