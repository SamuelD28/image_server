const multer = require("multer");
const fs = require("fs");

/**
 * Class responsible for handling file uploads to the server
 */
class FileParser {

    constructor() {
        this.rootImagesFolder = "images";
        this.acceptedMimeTypes = {
            "image/gif": "gif",
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/tiff": "tiff",
            "image/svg": "svg"
        };
        this.PickDestinationFolder = this.PickDestinationFolder.bind(this);
        this.IsFileTypeAccepted = this.IsFileTypeAccepted.bind(this);
        this.PickFileName = this.PickFileName.bind(this);
    }

    PickDestinationFolder(req, file, cb) {
        if (!fs.existsSync(this.rootImagesFolder)) {
            fs.mkdirSync(this.rootImagesFolder);
        }

        cb(null, this.rootImagesFolder);
    }

    PickFileName(req, file, cb) {
        let fileName = `${file.originalname}`;
        cb(null, fileName);
    }

    IsFileTypeAccepted(req, file, cb) {
        if (this.acceptedMimeTypes[file.mimetype] !== undefined) {
            return cb(null, true);
        } else {
            return cb(null, false, new Error("Mime type not accepted"));
        }
    }

    GetMiddleware() {
        var storage = multer.diskStorage({
            destination: this.PickDestinationFolder,
            filename: this.PickFileName
        });

        return multer({
            storage: storage,
            fileFilter: this.IsFileTypeAccepted,
            limits: {
                fileSize: 100000, // 1mb
            }
        })
    }
}

const Instance = new FileParser();
module.exports = Instance;