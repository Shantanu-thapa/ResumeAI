const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({

    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        console.log("File name:", file.originalname);
        console.log("MIME type:", file.mimetype);

        if (
            file.mimetype === "application/pdf" ||
            (
                file.mimetype === "application/octet-stream" &&
                file.originalname.toLowerCase().endsWith(".pdf")
            )
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    }

});

module.exports = upload;