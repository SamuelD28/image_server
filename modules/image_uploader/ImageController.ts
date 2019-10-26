import { ObjectId } from "bson";
import express from "express";
import sizeOf from "image-size";
import jimp from "jimp";
import path from "path";
import Mongodb from "../database/MongoDb";
import Image from "./Image";
import MulterStorage from "./MulterStorage";
import fs from "fs";
import getStream from "into-stream";
import azureStorage from "azure-storage";
import azurestorage from "azure-storage";

class ImageController {
    private BlobService : azurestorage.BlobService;
    private CollectionName = "images";
    private Database: Mongodb;
    private FileMiddleware = MulterStorage.GetMiddleware();
    private UploadOneFile = this.FileMiddleware.single("image");
    private UploadMultipleFiles = this.FileMiddleware.array("images");
    private _Router = express.Router();

    constructor(database: Mongodb) {
        this.BlobService = azureStorage.createBlobService();
        this.GetImage = this.GetImage.bind(this);
        this.UploadImage = this.UploadImage.bind(this);
        this.UploadImages = this.UploadImages.bind(this);
        this.InsertImageInDatabase = this.InsertImageInDatabase.bind(this);
        this.SendResponse = this.SendResponse.bind(this);
        this.ParseFileUploadResult = this.ParseFileUploadResult.bind(this);
        this.GetImageInfo = this.GetImageInfo.bind(this);
        this.GetImagesInfo = this.GetImagesInfo.bind(this);
        this.DeleteImage = this.DeleteImage.bind(this);
        this.RemoveFile = this.RemoveFile.bind(this);

        this.Database = database;
        this.Router.post("/upload", this.UploadImage);
        this.Router.post("/uploads", this.UploadImages);
        this.Router.get("/info", this.GetImagesInfo);
        this.Router.get("/:id/info", this.GetImageInfo);
        this.Router.get("/:id", this.GetImage);
        this.Router.delete("/:id", this.DeleteImage);
    }

    public get Router() {
        return this._Router;
    }

    private RemoveFile(
        path : string){
        if(fs.existsSync(path)){
            fs.unlinkSync(path);
        }
    }

    private async DeleteImage(
        req : express.Request,
        res : express.Response){

        let id: ObjectId;
        try{
            id = new ObjectId(req.params.id);
        }catch{
            id = new ObjectId();
        }

        this.Database.GetDocumentInCollection(
            this.CollectionName,
            {_id : id})
            .then(async(image) =>{
                if(image){
                    this.RemoveFile(image.path);
                    if(image.resizesavailable.length > 0){
                        image.resizesavailable.forEach((rezise : any)  => {
                            this.RemoveFile(rezise.path);
                        });
                    }

                    let result = await this.Database.DeleteInCollection(this.CollectionName, {_id : id});

                    if(result){
                        this.SendResponse(res, 200, result);
                    }else{
                        throw new Error("Error deleting the files");
                    }
                }
            })
            .catch((err) =>{
                this.SendResponse(res, 500, err);
            });
    }

    private async GetImagesInfo(
        req : express.Request,
        res : express.Response){

        this.Database.GetDocumentsInCollection(
            this.CollectionName,
            {error : undefined})
            .then((images) => {
                if(images){
                    this.SendResponse(res, 200, images);
                }
            })
            .catch((err) =>{
                this.SendResponse(res, 404, err);
            });
    }

    private async GetImageInfo(
        req : express.Request,
        res : express.Response){

        let id: ObjectId;
        try{
            id = new ObjectId(req.params.id);
        }catch{
            id = new ObjectId();
        }
        
        this.Database.GetDocumentInCollection(
            this.CollectionName,
            {_id : id})
            .then((image) => {
                if(image){
                    this.SendResponse(res, 200, image);
                }
            })
            .catch((err) =>{
                this.SendResponse(res, 404, err);
            });
    }

    private async GetImage(
        req: express.Request,
        res: express.Response) {
            
        // Error handling when id is wrong
        let id: ObjectId;
        try{
            id = new ObjectId(req.params.id);
        }catch{
            id = new ObjectId();
        }

        const image = await this.Database.GetDocumentInCollection(
            this.CollectionName,
            { _id: id },
        );

        if (!image) {
            return this.SendResponse(res, 404, { error: "No image found" });
        }

        if (this.QueryContainsSpecifiedNumberKeys(req.query, "size")) {

            let scalingRatio: number = +req.query.size / 100;
            let adjustedHeight = Math.ceil(image.height * scalingRatio);
            let adjustedWidth = Math.ceil(image.width * scalingRatio);

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

        let jimpImage = await jimp.read(originalPath);
        await jimpImage
            .resize(imageWidth, imageHeight)
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

    GetBlobName(originalName : string){
        const identifier = Math.random().toString().replace(/0\./, '');
        return `${identifier}-${originalName}`;
    };

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
                }else if(!req.file){
                    return this.SendResponse(res, 500, { error: "No file received by the server" });
                }else{

                    const   blobName = this.GetBlobName(req.file.originalname), 
                            stream = getStream(req.file.buffer), 
                            streamLength = req.file.buffer.length;

                    this.BlobService.createBlockBlobFromStream(
                        "pizzerias-storage-container", 
                        blobName, 
                        stream, 
                        streamLength, 
                        async(err) => {

                            if(err) {
                                return this.SendResponse(res, 500, { error: err.message });
                            }

                            const uploadResult: Image = await this.ParseFileUploadResult(req.file);
                            return this.SendResponse(res, 200, uploadResult);
                    });

                }
            });
    }

    private async ParseFileUploadResult(
        file: any)
        : Promise<Image> {

        let uploadResult: Image;
        const image: Image = Image.BindMulterFile(file);
        if (image.error !== undefined) {
            uploadResult = image;
        }
        else {
            let imageDimension = sizeOf.imageSize(image.path);
            image.width = imageDimension.width || 0;
            image.height = imageDimension.height || 0;
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
                }else if(!req.files || req.files.length === 0){
                    return this.SendResponse(res, 500, { error: "No files received by the server" });
                }else{

                    // @ts-ignore
                    const files: Express.Multer.File[] = req.files ? req.files : [];
                    const uploadResults: Image[] = [];
                    
                    for (let i = 0; i < files.length; i++) {
                        // @ts-ignore
                        const uploadResult = await this.ParseFileUploadResult(files[i]);
                        uploadResults.push(uploadResult);
                    }
                    
                    return this.SendResponse(res, 200, uploadResults);
                }
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
