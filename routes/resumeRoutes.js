const express = require("express");

const { uploadResume, getMyResumes, deleteResume } = require("../controllers/resume")   
const protect = require("../middleware/authmiddleware");
const upload = require("../middleware/multer");

const router = express.Router();

router.post(
    "/upload",
    protect,
    upload.single("resume"),
    uploadResume
);

router.get(
    "/my-resumes",
    protect,
    getMyResumes
);

router.delete(
    "/:id",
    protect,
    deleteResume
);



module.exports = router;