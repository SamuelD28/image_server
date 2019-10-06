import express, { response } from "express";
import multer from "multer";
import { MulterStorage } from "./";
import { Image } from "./";
import { Mongodb } from "../database";
import e from "express";

class ImageController {
    private CollectionName = "images";
    private Database: Mongodb;
    private FileMiddleware = MulterStorage.GetMiddleware();
    private UploadOneFile = this.FileMiddleware.single("image");
    private UploadMultipleFiles = this.FileMiddleware.array("images");
    private _Router = express.Router();

    constructor(database: Mongodb) {

        this.GetImage = this.GetImage.bind(this);
        this.UploadImage = this.UploadImage.bind(this);
        this.UploadImages = this.UploadImages.bind(this);
        this.InsertImagesInDatabase = this.InsertImagesInDatabase.bind(this);
        this.InsertImageInDatabase = this.InsertImageInDatabase.bind(this);
        this.SendResponse = this.SendResponse.bind(this);

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

        this.UploadOneFile(
            req,
            res,
            async (err: Error) => {
                let uploadResults: { [image: string]: Image | Error } = {};

                if (!req.file && err) {
                    return this.SendResponse(res, 403, { error: err.message });
                }
                else if (!req.file) {
                    return this.SendResponse(res, 403, { error: "No file received by the server" });
                }
                else if (err) {
                    return this.SendResponse(res, 500, { [`${req.file.originalname}`]: err.message });
                } else {
                    uploadResults[req.file.originalname] = await this.InsertImageInDatabase(req.file);
                    return this.SendResponse(res, 200, uploadResults);
                }
            });
    };

    private UploadImages(
        req: express.Request,
        res: express.Response) {

        this.UploadMultipleFiles(
            req,
            res,
            (err: Error) => {
                if (err) {
                    return this.SendResponse(res, err);
                }
                else if (!req.files) {
                    return this.SendResponse(res, new Error("No files received by the server"));
                } else {
                    let response = this.InsertImagesInDatabase(req.files);
                    return this.SendResponse(res, response);
                }
            });
    };

    private InsertImagesInDatabase(
        files: Express.Multer.File[])
        : { [image: string]: Image | Error } {

        let results: { [image: string]: Image | Error } = {};

        files.forEach(async file => {
            results[file.filename] = await this.InsertImageInDatabase(file);
        });

        return results;
    }

    private async InsertImageInDatabase(
        file: Express.Multer.File
    ): Promise<Image | Error> {

        let result: Image | Error;

        let newImage = new Image(
            file.filename,
            file.mimetype,
            { "original": file.path }
        );

        let savedImage = await this.Database.InsertInCollection(
            this.CollectionName,
            newImage
        );

        result = (savedImage) ? savedImage.ops[0] : new Error();
        return result;
    }

    private SendResponse(
        res: express.Response,
        status: number,
        body: any)
        : void {

        res.status(status).json(body);
    }


}

export default ImageController;