import { ObjectId } from "bson";
import express, { response } from "express";
import fs from "fs";
import jimp from "jimp";
import path from "path";
import Mongodb from "../database/MongoDb";
import Image from "./Image";
import MulterStorage from "./MulterStorage";

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
        this.Router.get("/:id", this.GetImage);
        this.Router.post("/upload", this.UploadImage);
        this.Router.post("/uploads", this.UploadImages);
    }

    public get Router() {
        return this._Router;
    }

    private async GetImage(
        req: express.Request,
        res: express.Response) {

        // Error handling when id is wrong
        const id: ObjectId = new ObjectId(req.params.id);
        const image = await this.Database.GetDocumentInCollection(
            this.CollectionName,
            { _id: id },
        );

        if (!image) {
            return this.SendResponse(res, 404, { error: "No image found" });
        }

        if (this.QueryContainsSpecifiedNumberKeys(req.query, "size")) {

            // Check if transform available. Reading huge file cost in resource
            const scalingRatio: number = +req.query.size / 100;
            const jimpImage = await jimp.read(image.path);
            const adjustedHeight = jimpImage.getHeight() * scalingRatio;
            const adjustedWidth = jimpImage.getWidth() * scalingRatio;

            return this.SendImageWithTransformation(
                adjustedWidth,
                adjustedHeight,
                image,
                res,
            );
        } else if (this.QueryContainsSpecifiedNumberKeys(req.query, "height", "width")) {

            return this.SendImageWithTransformation(
                +req.query.width,
                +req.query.height,
                image,
                res,
            );
        } else {

            return this.SendImage(image, image.path, res);
        }
    }

    private async SendImageWithTransformation(
        imageWidth: number,
        imageHeight: number,
        image: { [key: string]: any; },
        res: express.Response) {

        const imageDimensions: string = this.CreateImageDimensions(imageWidth, imageHeight);
        let desiredDimensionPath = this.GetDesiredDimensionPath(imageDimensions, image);

        if (desiredDimensionPath === null) {

            desiredDimensionPath = this.CreateDesiredDimensionPath(imageDimensions, image);
            await this.CreateResizedImageVersion(
                image.path,
                imageWidth,
                imageHeight,
                desiredDimensionPath,
            );
            image.resizesavailable.push({ dimensions: imageDimensions, path: desiredDimensionPath });
        }

        return this.SendImage(image, desiredDimensionPath, res);
    }

    private SendImage(
        image: { [key: string]: any; },
        imagePath: string,
        res: express.Response,
    ) {
        image.lastrequested = new Date();
        this.SaveImageChanges(image);
        return res.sendFile(imagePath);
    }

    private CreateDesiredDimensionPath(
        imageDimensions: string,
        image: { [key: string]: any; }) {

        return path.join(image.destination, imageDimensions + image.filename);
    }

    private GetDesiredDimensionPath(
        imageDimensions: string,
        image: { [key: string]: any; })
        : string | null {

        const desiredImageDimension = image.resizesavailable.find((i: any) => i.dimensions === imageDimensions);
        if (desiredImageDimension !== undefined) {
            return desiredImageDimension.path;
        } else {
            return null;
        }
    }

    private CreateImageDimensions(
        imageWidth: number,
        imageHeight: number): string {
        return `w${imageWidth}h${imageHeight}`;
    }

    private async CreateResizedImageVersion(
        originalPath: string,
        imageWidth: number,
        imageHeight: number,
        resizedSavePath: string) {

        const jimpImage = await jimp.read(originalPath);
        await jimpImage.resize(imageWidth, imageHeight)
            .writeAsync(resizedSavePath);
    }

    private async SaveImageChanges(
        image: { [key: string]: any; }) {

        await this.Database.UpdateInCollection(
            this.CollectionName,
            { _id: image._id },
            { $set: image },
        );
    }

    private QueryContainsSpecifiedNumberKeys(
        query: { [index: string]: any },
        ...keys: string[]) {

        let containsAllKeys = true;
        keys.forEach((key) => {
            if (isNaN(query[key])) {
                containsAllKeys = false;
            }
        });
        return containsAllKeys;
    }

    private UploadImage(
        req: express.Request,
        res: express.Response)
        : void {

        this.UploadOneFile(
            req,
            res,
            async (err: Error) => {
                if (err) {
                    return this.SendResponse(res, 403, { error: err.message });
                }

                const uploadResult: Image = await this.ParseFileUploadResult(req.file);
                return this.SendResponse(res, 200, uploadResult);
            });
    }

    private async ParseFileUploadResult(
        file: any)
        : Promise<Image> {

        let uploadResult: Image;
        const image: Image = Image.BindMulterFile(file);
        if (image.error !== undefined) {
            uploadResult = image;
        } else {
            uploadResult = await this.InsertImageInDatabase(image);
        }

        return uploadResult;
    }

    private UploadImages(
        req: express.Request,
        res: express.Response)
        : void {

        this.UploadMultipleFiles(
            req,
            res,
            async (err: Error) => {
                if (err) {
                    return this.SendResponse(res, 500, { error: err.message });
                }

                const files = req.files ? req.files : [];
                const uploadResults: Image[] = [];

                for (let i = 0; i < files.length; i++) {
                    const uploadResult = await this.ParseFileUploadResult(files[i]);
                    uploadResults.push(uploadResult);
                }

                return this.SendResponse(res, 200, uploadResults);
            });
    }

    private async InsertImageInDatabase(
        image: Image,
    ): Promise<Image> {

        const savedImage = await this.Database.InsertInCollection(
            this.CollectionName,
            image,
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
