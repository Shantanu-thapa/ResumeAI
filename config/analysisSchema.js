const { z } = require("zod");

const analysisSchema = z.object({
    score: z
        .number()
        .min(0)
        .max(100),

    breakdown: z.object({
        formatting: z
            .number()
            .min(0)
            .max(20),

        skills: z
            .number()
            .min(0)
            .max(20),

        experienceProjects: z
            .number()
            .min(0)
            .max(20),

        keywords: z
            .number()
            .min(0)
            .max(15),

        education: z
            .number()
            .min(0)
            .max(10),

        achievements: z
            .number()
            .min(0)
            .max(10),

        clarity: z
            .number()
            .min(0)
            .max(5)
    }),

    summary: z.string(),

    skills: z.array(
        z.string()
    ),

    missingSkills: z.array(
        z.string()
    ),

    strengths: z.array(
        z.string()
    ),

    weaknesses: z.array(
        z.string()
    ),

    suggestions: z.array(
        z.string()
    ),

    recommendedRoles: z.array(
        z.string()
    )
});

module.exports = analysisSchema;