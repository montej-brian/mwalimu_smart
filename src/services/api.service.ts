import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 second timeout for AI generation
});

export interface LessonStep {
    id: string;
    text: string;
    duration: number;
}

export interface LessonData {
    title: string;
    steps: LessonStep[];
    summary: string;
}

export interface VisualInstruction {
    type: 'circle' | 'rectangle' | 'line' | 'arrow' | 'text' | 'curve';
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    radius?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    text?: string;
    color?: string;
    fontSize?: number;
}

/**
 * Generate a lesson from a question and optional image
 */
export async function generateLesson(
    question: string,
    image?: string | null
): Promise<LessonData> {
    const response = await apiClient.post('/generate-lesson', {
        question,
        image,
    });
    return response.data;
}

/**
 * Generate audio narration for text
 */
export async function generateAudio(text: string): Promise<{ text: string; audioUrl?: string }> {
    const response = await apiClient.post('/generate-audio', {
        text,
    });
    return response.data;
}

/**
 * Generate visual instructions for a step
 */
export async function generateVisual(
    stepText: string,
    stepNumber: number
): Promise<{ instructions: VisualInstruction[] }> {
    const response = await apiClient.post('/generate-visual', {
        stepText,
        stepNumber,
    });
    return response.data;
}

export default {
    generateLesson,
    generateAudio,
    generateVisual,
};
