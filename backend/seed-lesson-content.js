/**
 * seed-lesson-content.js
 *
 * Fills every lesson in the DB with real AI-generated content via Groq (free).
 *
 * Prerequisites:
 *   1. Run seed-full-curriculum.js first (creates the 116 lesson shells)
 *   2. GROQ_API_KEY must be set in .env
 *
 * Usage:
 *   node seed-lesson-content.js
 *
 * Safe to re-run — only updates lessons whose content still has the placeholder
 * introduction ("Welcome to"). Lessons already enriched are skipped.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import axios from 'axios';
import { Lesson } from './models/index.js';

dotenv.config();

// ── Config ────────────────────────────────────────────────────────────────────

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL        = 'llama-3.1-8b-instant'; // fastest free model, sufficient for structured content
const DELAY_MS     = 2500;  // ~24 req/min, safely under the 30 req/min free limit
const MAX_TOKENS   = 1200;  // enough for introduction + 2 sections + summary

// ── Groq call ─────────────────────────────────────────────────────────────────

const callGroq = async (prompt) => {
    const response = await axios.post(
        GROQ_API_URL,
        {
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: MAX_TOKENS,
            temperature: 0.4, // lower = more consistent, factually grounded
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        }
    );
    return response.data.choices[0].message.content;
};

// ── Prompt builder ────────────────────────────────────────────────────────────

const buildPrompt = (lesson) => `
You are a mathematics curriculum writer creating content for a high school learning app.

Write lesson content for:
  Subject: ${lesson.topic}
  Lesson title: "${lesson.title}"
  Learning objectives: ${lesson.learningObjectives.join(', ')}
  Difficulty: ${lesson.difficulty}

Return ONLY valid JSON — no markdown, no backticks, no extra text. Use this exact structure:

{
  "introduction": "2-3 sentences introducing the topic and why it matters.",
  "sections": [
    {
      "title": "Section 1 title",
      "content": "Clear explanation of the first key concept (3-5 sentences).",
      "examples": [
        {
          "problem": "A specific, concrete problem statement.",
          "solution": "The final answer.",
          "steps": ["Step 1 description", "Step 2 description", "Step 3 description"]
        },
        {
          "problem": "A second problem testing the same concept.",
          "solution": "The final answer.",
          "steps": ["Step 1 description", "Step 2 description"]
        }
      ]
    },
    {
      "title": "Section 2 title",
      "content": "Explanation of the second key concept (3-5 sentences).",
      "examples": [
        {
          "problem": "A problem for this section.",
          "solution": "The final answer.",
          "steps": ["Step 1 description", "Step 2 description", "Step 3 description"]
        }
      ]
    }
  ],
  "summary": "1-2 sentences summarising what the student learned.",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3", "Takeaway 4"]
}

Rules:
- Use real numbers in all examples (not x, y placeholders for answers — give actual numeric answers)
- Steps must be short, action-oriented sentences (e.g. "Subtract 4 from both sides: 3x = 12")
- keyTakeaways must start with the formula or rule, not a generic phrase
- ALL string values must be on a single line — no line breaks inside any string
- Do NOT use apostrophes in possessive words (write "the student answer" not "the student's answer")
- Output must be valid JSON only — no markdown, no backticks, no explanation text
`.trim();

// ── JSON extractor (handles occasional markdown wrapping and bad escaping) ─────

const extractJSON = (raw) => {
    // Strip markdown code fences if present
    let clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    // Find the first { and last } to isolate the JSON object
    const start = clean.indexOf('{');
    const end   = clean.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON object found in response');
    clean = clean.slice(start, end + 1);

    // Fix unescaped control characters that break JSON.parse
    // Replace literal newlines/tabs inside string values with escaped versions
    clean = clean
        .replace(/\r\n/g, '\\n')
        .replace(/\r/g, '\\n')
        // Only replace bare newlines that are INSIDE a JSON string value
        // (i.e. not newlines that are part of the JSON structure itself)
        // We do a two-pass: first valid parse attempt, then repair if needed
        ;

    // First attempt: direct parse
    try {
        return JSON.parse(clean);
    } catch {
        // Second attempt: aggressive repair of unescaped characters inside strings
        // Replace newlines that appear inside quoted strings
        const repaired = clean.replace(
            /"((?:[^"\\]|\\.)*)"/g,
            (match, inner) => {
                const fixed = inner
                    .replace(/\n/g, '\\n')
                    .replace(/\t/g, '\\t')
                    .replace(/\r/g, '\\r');
                return `"${fixed}"`;
            }
        );
        return JSON.parse(repaired);
    }
};

// ── Validation — ensure the parsed object has all required fields ─────────────

const isValidContent = (obj) =>
    typeof obj.introduction === 'string' &&
    Array.isArray(obj.sections) &&
    obj.sections.length >= 1 &&
    typeof obj.summary === 'string' &&
    Array.isArray(obj.keyTakeaways);

// ── Main ──────────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const seedLessonContent = async () => {
    if (!process.env.GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY is not set in .env');
        process.exit(1);
    }

    console.log('🌐 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected\n');

    // Only process lessons that still have the placeholder introduction
    const lessons = await Lesson.find({
        'content.introduction': /^Welcome to/i,
    }).sort({ topic: 1, order: 1 });

    if (lessons.length === 0) {
        console.log('✅ All lessons already have enriched content. Nothing to do.');
        await mongoose.connection.close();
        process.exit(0);
    }

    console.log(`📚 Found ${lessons.length} lessons to enrich\n`);

    let success = 0, skipped = 0, failed = 0;

    for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        const prefix = `[${String(i + 1).padStart(3, '0')}/${lessons.length}]`;

        process.stdout.write(`${prefix} ${lesson.topic} › ${lesson.title} ... `);

        try {
            const prompt  = buildPrompt(lesson);
            const rawText = await callGroq(prompt);
            const content = extractJSON(rawText);

            if (!isValidContent(content)) {
                throw new Error('Response missing required fields');
            }

            // Preserve existing learningObjectives as keyTakeaways fallback
            const keyTakeaways = content.keyTakeaways.length >= 2
                ? content.keyTakeaways
                : lesson.learningObjectives;

            await Lesson.findByIdAndUpdate(lesson._id, {
                $set: {
                    'content.introduction': content.introduction,
                    'content.sections':     content.sections,
                    'content.summary':      content.summary,
                    'content.keyTakeaways': keyTakeaways,
                },
            });

            console.log('✅');
            success++;
        } catch (err) {
            console.log(`❌ ${err.message}`);
            failed++;

            // On rate-limit (429), wait longer before continuing
            if (err.response?.status === 429) {
                console.log('   ⏳ Rate limit hit — waiting 30 s...');
                await sleep(30000);
            }
        }

        // Polite delay between every call
        if (i < lessons.length - 1) await sleep(DELAY_MS);
    }

    console.log('\n─────────────────────────────');
    console.log(`✅ Success : ${success}`);
    console.log(`⚠️  Failed  : ${failed}`);
    console.log(`⏭  Skipped : ${skipped}`);
    console.log('─────────────────────────────');

    if (failed > 0) {
        console.log('\n💡 Re-run the script to retry failed lessons (only unfilled ones are processed).');
    } else {
        console.log('\n🎉 All lessons enriched! Your app now has full lesson content.');
    }

    await mongoose.connection.close();
    process.exit(0);
};

seedLessonContent().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
