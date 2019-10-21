"use strict";
/**
 * Entry point for the image server
 *
 * TODO : Error Handler quand le champ des images est pas present.
 * TODO  : Error handler pour les erreurs trop large
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var body_parser_1 = __importDefault(require("body-parser"));
var Index_1 = require("./modules/database/Index");
var ImageController_1 = __importDefault(require("./modules/image_uploader/ImageController"));
// Parse the .env of the project in the process runtime
dotenv_1.default.config();
var App = express_1.default();
var Port = process.env.PORT ? +process.env.PORT : 8080;
var Database = new Index_1.Mongodb(process.env.MONGODB_URI, "files");
App.use(body_parser_1.default.urlencoded({ extended: true }));
App.use("/images", new ImageController_1.default(Database).Router);
App.get("/", function (req, res) {
    res.sendFile(__dirname + "/pages/upload.html");
});
App.listen(Port, function (err) {
    if (err) {
        console.log("Can't start the server");
    }
    else {
        console.log("Server started\nPORT : " + Port + "\nHOST : " + process.env.Host);
    }
});
