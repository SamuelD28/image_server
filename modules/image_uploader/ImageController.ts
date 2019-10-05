import express from "express";
import multer from "multer";
import { MulterStorage } from "./";
import { Mongodb } from "../database";

class ImageController {

    private FileMiddleware = MulterStorage.GetMiddleware();
    private SingleFileUploader = this.FileMiddleware.single("image");
    private MultileFilesUploader = this.FileMiddleware.array("images");
    private Router = express.Router();

    constructor() {
        this.Router.get("/:imagename", this.GetImage)
        this.Router.post("/upload", this.UploadImage)
        this.Router.post("/uploads", this.UploadImages)
    }

    private GetImage(
        req: express.Request,
        res: express.Response) {
    };

    private UploadImage(
        req: express.Request,
        res: express.Response) {

        this.SingleFileUploader(
            req,
            res,
            function (err: Error) {
                if (err instanceof Error) {
                    res.send(err.message);
                } else {
                    const file = req.file;
                    if (!file) {
                        res.send("No file received by the server");
                    } else {
                        res.send(`${MulterStorage.PathToRoot}/${file.filename}`);
                    }
                }
            })
    };

    private UploadImages(
        req: express.Request,
        res: express.Response) {

        this.MultileFilesUploader(
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