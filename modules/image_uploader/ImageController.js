"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bson_1 = require("bson");
var express_1 = __importDefault(require("express"));
var image_size_1 = __importDefault(require("image-size"));
var jimp_1 = __importDefault(require("jimp"));
var path_1 = __importDefault(require("path"));
var Image_1 = __importDefault(require("./Image"));
var MulterStorage_1 = __importDefault(require("./MulterStorage"));
var ImageController = /** @class */ (function () {
    function ImageController(database) {
        this.CollectionName = "images";
        this.FileMiddleware = MulterStorage_1.default.GetMiddleware();
        this.UploadOneFile = this.FileMiddleware.single("image");
        this.UploadMultipleFiles = this.FileMiddleware.array("images");
        this._Router = express_1.default.Router();
        this.GetImage = this.GetImage.bind(this);
        this.UploadImage = this.UploadImage.bind(this);
        this.UploadImages = this.UploadImages.bind(this);
        this.InsertImageInDatabase = this.InsertImageInDatabase.bind(this);
        this.SendResponse = this.SendResponse.bind(this);
        this.ParseFileUploadResult = this.ParseFileUploadResult.bind(this);
        this.Database = database;
        this.Router.get("/:id", this.GetImage);
        this.Router.post("/upload", this.UploadImage);
        this.Router.post("/uploads", this.UploadImages);
    }
    Object.defineProperty(ImageController.prototype, "Router", {
        get: function () {
            return this._Router;
        },
        enumerable: true,
        configurable: true
    });
    ImageController.prototype.GetImage = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, image, scalingRatio, adjustedHeight, adjustedWidth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = new bson_1.ObjectId(req.params.id);
                        return [4 /*yield*/, this.Database.GetDocumentInCollection(this.CollectionName, { _id: id })];
                    case 1:
                        image = _a.sent();
                        if (!image) {
                            return [2 /*return*/, this.SendResponse(res, 404, { error: "No image found" })];
                        }
                        if (this.QueryContainsSpecifiedNumberKeys(req.query, "size")) {
                            scalingRatio = +req.query.size / 100;
                            adjustedHeight = Math.ceil(image.height * scalingRatio);
                            adjustedWidth = Math.ceil(image.width * scalingRatio);
                            return [2 /*return*/, this.SendImageWithTransformation(adjustedWidth, adjustedHeight, image, res)];
                        }
                        else if (this.QueryContainsSpecifiedNumberKeys(req.query, "height", "width")) {
                            return [2 /*return*/, this.SendImageWithTransformation(+req.query.width, +req.query.height, image, res)];
                        }
                        else {
                            return [2 /*return*/, this.SendImage(image, image.path, res)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ImageController.prototype.SendImageWithTransformation = function (imageWidth, imageHeight, image, res) {
        return __awaiter(this, void 0, void 0, function () {
            var imageDimensions, desiredDimensionPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        imageDimensions = this.CreateImageDimensions(imageWidth, imageHeight);
                        desiredDimensionPath = this.GetDesiredDimensionPath(imageDimensions, image);
                        if (!(desiredDimensionPath === null)) return [3 /*break*/, 2];
                        desiredDimensionPath = this.CreateDesiredDimensionPath(imageDimensions, image);
                        return [4 /*yield*/, this.CreateResizedImageVersion(image.path, imageWidth, imageHeight, desiredDimensionPath)];
                    case 1:
                        _a.sent();
                        image.resizesavailable.push({ dimensions: imageDimensions, path: desiredDimensionPath });
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.SendImage(image, desiredDimensionPath, res)];
                }
            });
        });
    };
    ImageController.prototype.SendImage = function (image, imagePath, res) {
        image.lastrequested = new Date();
        this.SaveImageChanges(image);
        return res.sendFile(imagePath);
    };
    ImageController.prototype.CreateDesiredDimensionPath = function (imageDimensions, image) {
        return path_1.default.join(image.destination, imageDimensions + image.filename);
    };
    ImageController.prototype.GetDesiredDimensionPath = function (imageDimensions, image) {
        var desiredImageDimension = image.resizesavailable.find(function (i) { return i.dimensions === imageDimensions; });
        if (desiredImageDimension !== undefined) {
            return desiredImageDimension.path;
        }
        else {
            return null;
        }
    };
    ImageController.prototype.CreateImageDimensions = function (imageWidth, imageHeight) {
        return "w" + imageWidth + "h" + imageHeight;
    };
    ImageController.prototype.CreateResizedImageVersion = function (originalPath, imageWidth, imageHeight, resizedSavePath) {
        return __awaiter(this, void 0, void 0, function () {
            var jimpImage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, jimp_1.default.read(originalPath)];
                    case 1:
                        jimpImage = _a.sent();
                        return [4 /*yield*/, jimpImage
                                .resize(imageWidth, imageHeight)
                                .writeAsync(resizedSavePath)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ImageController.prototype.SaveImageChanges = function (image) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.Database.UpdateInCollection(this.CollectionName, { _id: image._id }, { $set: image })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ImageController.prototype.QueryContainsSpecifiedNumberKeys = function (query) {
        var keys = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            keys[_i - 1] = arguments[_i];
        }
        var containsAllKeys = true;
        keys.forEach(function (key) {
            if (isNaN(query[key])) {
                containsAllKeys = false;
            }
        });
        return containsAllKeys;
    };
    ImageController.prototype.UploadImage = function (req, res) {
        var _this = this;
        this.UploadOneFile(req, res, function (err) { return __awaiter(_this, void 0, void 0, function () {
            var uploadResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (err) {
                            return [2 /*return*/, this.SendResponse(res, 403, { error: err.message })];
                        }
                        return [4 /*yield*/, this.ParseFileUploadResult(req.file)];
                    case 1:
                        uploadResult = _a.sent();
                        return [2 /*return*/, this.SendResponse(res, 200, uploadResult)];
                }
            });
        }); });
    };
    ImageController.prototype.ParseFileUploadResult = function (file) {
        return __awaiter(this, void 0, void 0, function () {
            var uploadResult, image, imageDimension;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        image = Image_1.default.BindMulterFile(file);
                        if (!(image.error !== undefined)) return [3 /*break*/, 1];
                        uploadResult = image;
                        return [3 /*break*/, 3];
                    case 1:
                        imageDimension = image_size_1.default.imageSize(image.path);
                        image.width = imageDimension.width || 0;
                        image.height = imageDimension.height || 0;
                        return [4 /*yield*/, this.InsertImageInDatabase(image)];
                    case 2:
                        uploadResult = _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, uploadResult];
                }
            });
        });
    };
    ImageController.prototype.UploadImages = function (req, res) {
        var _this = this;
        this.UploadMultipleFiles(req, res, function (err) { return __awaiter(_this, void 0, void 0, function () {
            var files, uploadResults, i, uploadResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (err) {
                            return [2 /*return*/, this.SendResponse(res, 500, { error: err.message })];
                        }
                        files = req.files ? req.files : [];
                        uploadResults = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < files.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.ParseFileUploadResult(files[i])];
                    case 2:
                        uploadResult = _a.sent();
                        uploadResults.push(uploadResult);
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, this.SendResponse(res, 200, uploadResults)];
                }
            });
        }); });
    };
    ImageController.prototype.InsertImageInDatabase = function (image) {
        return __awaiter(this, void 0, void 0, function () {
            var savedImage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.Database.InsertInCollection(this.CollectionName, image)];
                    case 1:
                        savedImage = _a.sent();
                        if (savedImage) {
                            return [2 /*return*/, savedImage.ops[0]];
                        }
                        else {
                            image.error = "Can't save image in database";
                            return [2 /*return*/, image];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ImageController.prototype.SendResponse = function (res, status, body) {
        res.status(status).json(body);
    };
    return ImageController;
}());
exports.default = ImageController;
