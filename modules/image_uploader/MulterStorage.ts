import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";

/**
 * @description Singleton Class responsible for handling file uploads to the server
 *
 * @author Samuel Dubé
 */
class MulterStorage {

    private ServerRoot: string;
    private _PathToRoot: string = "images";
    private _AcceptedMimeTypes: { [index: string]: string } = {
        "image/gif": "gif",
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/tiff": "tiff",
        "image/svg": "svg",
    };

    constructor() {
        if (require !== undefined && require.main !== undefined) {
            this.ServerRoot = path.dirname(require.main.filename);
        } else {
            throw new Error("Server root path is unknown. Storage is disabled");
        }
        this.PickDestinationFolder = this.PickDestinationFolder.bind(this);
        this.ExecuteFileValidation = this.ExecuteFileValidation.bind(this);
        this.PickFileName = this.PickFileName.bind(this);
        this.DoesFileAlreadyExists = this.DoesFileAlreadyExists.bind(this);
        this.AddFileToRequest = this.AddFileToRequest.bind(this);
    }

    /**
     * @description Method that returns the root path to the
     * folder used for saving uploaded images
     */
    public get PathToRoot(): string {
        return this._PathToRoot;
    }

    /**
    * @description Method that returns the multer middleware for parsing
    * the files sent by the client into the express request object.
    */
    public GetMiddleware(): multer.Instance {
        const storage = multer.diskStorage({
            destination: this.PickDestinationFolder,
            filename: this.PickFileName,
        });

        return multer({
            storage,
            fileFilter: this.ExecuteFileValidation,
            // NOTE : Should find a way to catch filesize in file filter function
            // limits: {
            //     fileSize: 5000000,
            // },
        });
    }

    /**
     * @description Method that assign the destination folder of the
     * file beeing uploaded
     *
     * @param req Express Request sent by the client
     * @param file Multer File beeing uploaded
     * @param next Callback function to pass the information to the next handler.
     */
    private PickDestinationFolder(
        req: Express.Request,
        file: Express.Multer.File,
        next: (err: Error | null, fileDestinationPath: string) => void) {

        if (!fs.existsSync(this._PathToRoot)) {
            fs.mkdirSync(this._PathToRoot);
        }

        const destinationPath = path.join(this.ServerRoot, this._PathToRoot);
        next(null, destinationPath);
    }

    /**
     * @description Method that assign the file name to the image
     * beeing uploaded.
     *
     * @param req Express Request sent by the client
     * @param file Multer file beeing uploaded
     * @param next Callback function to pass the information to the next handler.
     */
    private PickFileName(
        req: Express.Request,
        file: Express.Multer.File,
        next: (err: Error | null, fileName: string) => void) {

        const fileName = `${file.originalname}`;
        return next(null, fileName);
    }

    /**
     * @description Method that determine if the file beeing uploaded
     * is allowed by the server
     *
     * @param req Express Request sent by the client
     * @param file Multer file beeing uploaded
     * @param next Callback function to pass the information to the next handler.
     */
    private ExecuteFileValidation(
        req: express.Request,
        file: any,
        next: (err: Error | null, isAccepted: boolean) => void) {

        // console.log(req.headers["content-length"]);

        const fileName = `${file.originalname}`;

        if (this.DoesFileAlreadyExists(fileName)) {
            file.error = "File Already exists";
        } else if (this._AcceptedMimeTypes[file.mimetype] === undefined) {
            file.error = "File Mimetype not handled";
        } else {
            file.error = undefined;
        }

        if ((file.error) === undefined) {
            return next(null, true);
        } else {
            this.AddFileToRequest(req, file);
            req.file = file;
            return next(null, false);
        }
    }

    private DoesFileAlreadyExists(
        fileName: string)
        : boolean {
        return fs.existsSync(`${this.PathToRoot}\\${fileName}`);
    }

    private AddFileToRequest(
        req: Express.Request,
        file: Express.Multer.File)
        : void {
        if (!req.files) {
            req.files = new Array();
        }

        if (req.files instanceof Array) {
            req.files.push(file);
        }
    }
}

const Instance = new MulterStorage();
export default Instance;
