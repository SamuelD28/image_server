"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var multer_1 = __importDefault(require("multer"));
var path_1 = __importDefault(require("path"));
/**
 * @description Singleton Class responsible for handling file uploads to the server
 *
 * @author Samuel Dubé
 */
var MulterStorage = /** @class */ (function () {
    function MulterStorage() {
        this._PathToRoot = "images";
        this._AcceptedMimeTypes = {
            "image/gif": "gif",
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/tiff": "tiff",
            "image/svg": "svg",
        };
        if (require !== undefined && require.main !== undefined) {
            this.ServerRoot = path_1.default.dirname(require.main.filename);
        }
        else {
            throw new Error("Server root path is unknown. Storage is disabled");
        }
        this.PickDestinationFolder = this.PickDestinationFolder.bind(this);
        this.ExecuteFileValidation = this.ExecuteFileValidation.bind(this);
        this.PickFileName = this.PickFileName.bind(this);
        this.DoesFileAlreadyExists = this.DoesFileAlreadyExists.bind(this);
        this.AddFileToRequest = this.AddFileToRequest.bind(this);
    }
    Object.defineProperty(MulterStorage.prototype, "PathToRoot", {
        /**
         * @description Method that returns the root path to the
         * folder used for saving uploaded images
         */
        get: function () {
            return this._PathToRoot;
        },
        enumerable: true,
        configurable: true
    });
    /**
    * @description Method that returns the multer middleware for parsing
    * the files sent by the client into the express request object.
    */
    MulterStorage.prototype.GetMiddleware = function () {
        var storage = multer_1.default.diskStorage({
            destination: this.PickDestinationFolder,
            filename: this.PickFileName,
        });
        return multer_1.default({
            storage: storage,
            fileFilter: this.ExecuteFileValidation,
        });
    };
    /**
     * @description Method that assign the destination folder of the
     * file beeing uploaded
     *
     * @param req Express Request sent by the client
     * @param file Multer File beeing uploaded
     * @param next Callback function to pass the information to the next handler.
     */
    MulterStorage.prototype.PickDestinationFolder = function (req, file, next) {
        if (!fs_1.default.existsSync(this._PathToRoot)) {
            fs_1.default.mkdirSync(this._PathToRoot);
        }
        var destinationPath = path_1.default.join(this.ServerRoot, this._PathToRoot);
        next(null, destinationPath);
    };
    /**
     * @description Method that assign the file name to the image
     * beeing uploaded.
     *
     * @param req Express Request sent by the client
     * @param file Multer file beeing uploaded
     * @param next Callback function to pass the information to the next handler.
     */
    MulterStorage.prototype.PickFileName = function (req, file, next) {
        var fileName = "" + file.originalname;
        return next(null, fileName);
    };
    /**
     * @description Method that determine if the file beeing uploaded
     * is allowed by the server
     *
     * @param req Express Request sent by the client
     * @param file Multer file beeing uploaded
     * @param next Callback function to pass the information to the next handler.
     */
    MulterStorage.prototype.ExecuteFileValidation = function (req, file, next) {
        // console.log(req.headers["content-length"]);
        var fileName = "" + file.originalname;
        if (this.DoesFileAlreadyExists(fileName)) {
            file.error = "File Already exists";
        }
        else if (this._AcceptedMimeTypes[file.mimetype] === undefined) {
            file.error = "File Mimetype not handled";
        }
        else {
            file.error = undefined;
        }
        if ((file.error) === undefined) {
            return next(null, true);
        }
        else {
            this.AddFileToRequest(req, file);
            req.file = file;
            return next(null, false);
        }
    };
    MulterStorage.prototype.DoesFileAlreadyExists = function (fileName) {
        return fs_1.default.existsSync(this.PathToRoot + "\\" + fileName);
    };
    MulterStorage.prototype.AddFileToRequest = function (req, file) {
        if (!req.files) {
            req.files = new Array();
        }
        if (req.files instanceof Array) {
            req.files.push(file);
        }
    };
    return MulterStorage;
}());
var Instance = new MulterStorage();
exports.default = Instance;
