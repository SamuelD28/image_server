/**
 * Class responsible for handling file uploads to the server
 */

class FileParser {

    constructor() {
        this.rootImagesFolder = "/images";
        this.rawMimeType = {
            "image/gif": "gif",
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/tiff": "tiff",
            "image/svg": "svg"
        };
    }

    PickDestinationFolder(req, file, cb) {
        if (!fs.existsSync(RootImagesFolder)) {
            fs.mkdirSync(RootImagesFolder);
        }

        cb(null, RootImagesFolder);
    }

    PickFileName(req, file, cb) {
        let fileName = `${Date.now()}.${rawMimeType[file.mimetype]}`;
        cb(null, fileName);
    }

    GetFileParser() {
        var storage = multer.diskStorage({
            destination: PickDestinationFolder,
            filename: PickFileName
        });

        return multer({ storage: storage })
    }
}

const Instance = new UploadHandler();
module.exports = Instance;