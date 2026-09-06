const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        fileName: {
            type: String,
            required: true
        },

        cloudinaryUrl: {
            type: String,
            required: true
        },

        publicId: {
            type: String,
            required: true
        },

        analysis: {
            score: {
                type: Number,
                min: 0,
                max: 100
            },

            breakdown: {
                formatting: {
                    type: Number,
                    min: 0,
                    max: 20
                },

                skills: {
                    type: Number,
                    min: 0,
                    max: 20
                },

                experienceProjects: {
                    type: Number,
                    min: 0,
                    max: 20
                },

                keywords: {
                    type: Number,
                    min: 0,
                    max: 15
                },

                education: {
                    type: Number,
                    min: 0,
                    max: 10
                },

                achievements: {
                    type: Number,
                    min: 0,
                    max: 10
                },

                clarity: {
                    type: Number,
                    min: 0,
                    max: 5
                }
            },

            summary: {
                type: String
            },

            skills: {
                type: [String]
            },

            missingSkills: {
                type: [String]
            },

            strengths: {
                type: [String]
            },

            weaknesses: {
                type: [String]
            },

            suggestions: {
                type: [String]
            },

            recommendedRoles: {
                type: [String]
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Resume", resumeSchema);