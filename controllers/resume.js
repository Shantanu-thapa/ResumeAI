const cloudinary = require("../config/cloudinary");
const Resume = require("../Model/resume");
const streamifier = require("streamifier");

const uploadResume = async (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a resume"
            });
        }

        // Upload file to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "resume-analyzer",
                    resource_type: "raw"
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            streamifier.createReadStream(req.file.buffer)
                .pipe(uploadStream);
        });

        // Save resume information in MongoDB
        const resume = await Resume.create({
            user: req.user,
            fileName: req.file.originalname,
            cloudinaryUrl: result.secure_url,
            publicId: result.public_id
        });

        res.status(201).json({
            message: "Resume uploaded successfully",
            resume
        });

    } catch (error) {
        console.error("Resume upload error:", error);

        res.status(500).json({
            message: "Failed to upload resume",
            error: error.message
        });
    }
};

const getMyResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({
            user: req.user
        }).sort({ createdAt: -1 });

        res.status(200).json({
            count: resumes.length,
            resumes
        });

    } catch (error) {
        console.error("Get resumes error:", error);

        res.status(500).json({
            message: "Failed to fetch resumes",
            error: error.message
        });
    }
};

const deleteResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            user: req.user
        });

        if (!resume) {
            return res.status(404).json({
                message: "Resume not found"
            });
        }

        // Delete file from Cloudinary
        await cloudinary.uploader.destroy(
            resume.publicId,
            {
                resource_type: "raw"
            }
        );

        // Delete record from MongoDB
        await Resume.findByIdAndDelete(resume._id);

        res.status(200).json({
            message: "Resume deleted successfully"
        });

    } catch (error) {
        console.error("Delete resume error:", error);

        res.status(500).json({
            message: "Failed to delete resume",
            error: error.message
        });
    }
};

module.exports = {uploadResume,getMyResumes , deleteResume};