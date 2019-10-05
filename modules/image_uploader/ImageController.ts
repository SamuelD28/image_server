import express from "express";
import multer from "multer";
import { MulterStorage } from "./";
import { Image } from "./";
import { Mongodb } from "../database";

class ImageController {
    private CollectionName = "images";
    private Database: Mongodb;
    private FileMiddleware = MulterStorage.GetMiddleware();
    private SingleFileUpload = this.FileMiddleware.single("image");
    private MultileFilesUpload = this.FileMiddleware.array("images");
    private _Router = express.Router();

    constructor(database: Mongodb) {
        this.Database = database;
        this.Router.get("/:imagename", this.GetImage)
        this.Router.post("/upload", this.UploadImage)
        this.Router.post("/uploads", this.UploadImages)
    }

    public get Router() {
        return this._Router;
    }

    private GetImage(
        req: express.Request,
        res: express.Response) {
    };

    private UploadImage(
        req: express.Request,
        res: express.Response) {

        this.SingleFileUpload(
            req,
            res,
            (err: Error) => {
                if (err instanceof Error) {
                    return res.send(err.message);
                } else if (!req.file) {
                    return res.send("No file received by the server");
                } else {

                    let imageData = {
                        FileName: req.file.filename,
                        FileExtension: req.file.mimetype,
                        SizesAvailable: { "original": req.file.path }
                    }

                    let newImage = new Image();
                    newImage.Create(imageData);

                    this.Database.InsertInCollection(
                        this.CollectionName,
                        newImage)
                        .then((image: any) => {
                            if (!image) {
                                throw new Error();
                            }
                            res.send(image);
                        })
                        .catch((err: Error) => {
                            res.send(err);
                        });
                }
            });
    };

    private UploadImages(
        req: express.Request,
        res: express.Response) {

        this.MultileFilesUpload(
            req,
            res,
            function (err: Error) {
                if (err) {
                    res.send(err.message);
                }
                else {
                    if (!req.files) {
                        res.send("No files received by the server");
                    } else {
                        let files: Express.Multer.File[] = req.files;
                        let filesPath = files.map((file: Express.Multer.File) => file.path);
                        res.send(filesPath);
                    }
                }
            });
    };

}

export default ImageController;