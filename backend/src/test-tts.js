
import { generateAudio } from './services/tts.service.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function testTTS() {
    console.log('Starting TTS Cache Test...');
    const text = "Testing audio caching system.";

    // Clear cache for this test
    const cacheDir = path.join(process.cwd(), 'cache', 'audio');
    if (fs.existsSync(cacheDir)) {
        const files = fs.readdirSync(cacheDir);
        for (const file of files) {
            fs.unlinkSync(path.join(cacheDir, file));
        }
        console.log('Cleared audio cache.');
    }

    // First call - should be a miss
    console.log('\n--- First Call (Expect Miss) ---');
    const start1 = Date.now();
    await generateAudio(text);
    const duration1 = Date.now() - start1;
    console.log(`First call took ${duration1}ms`);

    // Verify file exists
    const files = fs.readdirSync(cacheDir);
    if (files.length === 1) {
        console.log('SUCCESS: Audio file created in cache.');
    } else {
        console.error('FAILURE: No audio file found in cache.');
    }

    // Second call - should be a hit
    console.log('\n--- Second Call (Expect Hit) ---');
    const start2 = Date.now();
    await generateAudio(text);
    const duration2 = Date.now() - start2;
    console.log(`Second call took ${duration2}ms`);

    if (duration2 < 50) {
        console.log('SUCCESS: Second call was extremely fast (Cache Hit).');
    } else {
        console.warn('WARNING: Second call was slow, might not be hitting cache properly.');
    }
}

testTTS().catch(console.error);
