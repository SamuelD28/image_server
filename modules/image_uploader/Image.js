"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Image = /** @class */ (function () {
    function Image() {
        this.fieldname = "";
        this.originalname = "";
        this.encoding = "";
        this.mimetype = "";
        this.size = 0;
        this.destination = "";
        this.location = "";
        this.filename = "";
        this.path = "";
        this.buffer = new Buffer("");
        this.width = 0;
        this.height = 0;
        this.resizesavailable = [];
        this.lastrequested = new Date();
        this.createdat = new Date();
    }
    Image.BindMulterFile = function (p_file) {
        var image = new Image();
        // Required attributes
        image.fieldname = p_file.fieldname;
        image.originalname = p_file.originalname;
        image.encoding = p_file.encoding;
        image.mimetype = p_file.mimetype;
        image.error = p_file.error;
        // Optional attributes
        image.size = (p_file.size) ? +p_file.size : 0;
        image.destination = p_file.destination || "";
        image.location = p_file.location || "";
        image.filename = p_file.filename || "";
        image.path = p_file.path || "";
        // Self initialised attributes
        image.buffer = new Buffer("");
        image.resizesavailable = [];
        image.lastrequested = new Date();
        image.createdat = new Date();
        return image;
    };
    return Image;
}());
exports.default = Image;
