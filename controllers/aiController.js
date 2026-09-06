const ai = require("../config/gemini");
const Resume = require("../Model/resume");
const extractTextFromPDF = require("../utils/pdfparser");
const analysisSchema = require("../config/analysisSchema");

const analyzeResume = async (req, res) => {
    try {
        // 1. Find resume belonging to logged-in user
        const resume = await Resume.findOne({
            _id: req.params.id,
            user: req.user
        });

        if (!resume) {
            return res.status(404).json({
                message: "Resume not found"
            });
        }

        // 2. Download PDF from Cloudinary
        const response = await fetch(resume.cloudinaryUrl);

        if (!response.ok) {
            throw new Error("Failed to download resume");
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3. Extract text from PDF
        const resumeText = await extractTextFromPDF(buffer);

        if (!resumeText.trim()) {
            return res.status(400).json({
                message: "Could not extract text from resume"
            });
        }

        // 4. Create AI prompt
        const prompt = `
You are an expert technical recruiter and ATS resume reviewer.

Analyze the resume below.

Return ONLY valid JSON.

Use exactly this structure:

{
    "score": 0,

    "breakdown": {
        "formatting": 0,
        "skills": 0,
        "experienceProjects": 0,
        "keywords": 0,
        "education": 0,
        "achievements": 0,
        "clarity": 0
    },

    "summary": "",

    "skills": [],

    "missingSkills": [],

    "strengths": [],

    "weaknesses": [],

    "suggestions": [],

    "recommendedRoles": []
}

SCORING:

Formatting: 0-20
Skills: 0-20
Experience & Projects: 0-20
Keywords: 0-15
Education: 0-10
Achievements: 0-10
Clarity: 0-5

IMPORTANT:
- score MUST equal the sum of all seven breakdown values.
- Maximum score is 100.
- Do not give random scores.
- Evaluate the actual resume content.

Resume:

${resumeText}
`;

        // 5. Send resume to Gemini
        const result = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });

        // 6. Get Gemini response
const responseText = result.text;

console.log("========== GEMINI RESPONSE ==========");
console.log(responseText);
console.log("=====================================");

const cleanedResponse = responseText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

let parsedAnalysis;

try {
    parsedAnalysis = JSON.parse(cleanedResponse);
} catch (error) {
    console.error("JSON parsing error:", error.message);

    return res.status(500).json({
        message: "AI returned invalid JSON"
    });
}

const validationResult = analysisSchema.safeParse(parsedAnalysis);

if (!validationResult.success) {
    return res.status(500).json({
        message: "AI returned an invalid analysis format",
        errors: validationResult.error.issues
    });
}

const analysis = validationResult.data;
        // 8. Save analysis in MongoDB
        resume.analysis = analysis;

        await resume.save();

        // 9. Send result to frontend
        res.status(200).json({
            message: "Resume analyzed successfully",
            analysis
        });

    } catch (error) {
        console.error("Resume analysis error:", error);

        res.status(500).json({
            message: "Failed to analyze resume",
            error: error.message
        });
    }
};

module.exports = {
    analyzeResume
};