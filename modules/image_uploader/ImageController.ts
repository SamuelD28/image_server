import express, { response } from "express";
import path from 'path';
import { MulterStorage } from "./";
import { Image } from "./";
import { Mongodb } from "../database";
import { ObjectId } from "bson";

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
        this.InsertImageInDatabase = this.InsertImageInDatabase.bind(this);
        this.SendResponse = this.SendResponse.bind(this);
        this.ParseFileUploadResult = this.ParseFileUploadResult.bind(this);

        this.Database = database;
        this.Router.get("/:id", this.GetImage)
        this.Router.post("/upload", this.UploadImage)
        this.Router.post("/uploads", this.UploadImages)
    }

    public get Router() {
        return this._Router;
    }

    private GetImage(
        req: express.Request,
        res: express.Response) {

        let id: ObjectId = new ObjectId(req.params.id);
        this.Database.GetDocumentInCollection(
            this.CollectionName,
            { _id: id })
            .then((image) => {
                if (!image) {
                    throw new Error();
                } else {
                    image.lastrequested = new Date();
                    
                    return res.sendFile(image.path);
                }
            })
            .catch((err) => {
                this.SendResponse(res, 404, { error: err.message })
            });
    };

    private UploadImage(
        req: express.Request,
        res: express.Response) {

        this.UploadOneFile(
            req,
            res,
            async (err: Error) => {
                if (err) {
                    return this.SendResponse(res, 403, { error: err.message });
                }

                let uploadResult: Image = await this.ParseFileUploadResult(req.file);
                return this.SendResponse(res, 200, uploadResult);
            });
    };

    private async ParseFileUploadResult(
        file: any) {

        let uploadResult: Image;
        let image: Image = Image.BindMulterFile(file);
        if (image.error !== undefined) {
            uploadResult = image;
        }
        else {
            uploadResult = await this.InsertImageInDatabase(image);
        }

        return uploadResult;
    }

    private UploadImages(
        req: express.Request,
        res: express.Response) {

        this.UploadMultipleFiles(
            req,
            res,
            async (err: Error) => {
                if (err) {
                    return this.SendResponse(res, 500, { error: err.message });
                }

                let files = req.files ? req.files : [];
                let uploadResults: Image[] = [];

                for (let i = 0; i < files.length; i++) {
                    let uploadResult = await this.ParseFileUploadResult(files[i]);
                    uploadResults.push(uploadResult);
                }

                return this.SendResponse(res, 200, uploadResults);
            });
    };

    private async InsertImageInDatabase(
        image: Image
    ): Promise<Image> {

        let savedImage = await this.Database.InsertInCollection(
            this.CollectionName,
            image
        );

        if (savedImage) {
            return savedImage.ops[0];
        } else {
            image.error = "Can't save image in database";
            return image;
        }
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