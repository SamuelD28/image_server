import multer from "multer";
import fs from "fs";

/**
 * @description Singleton Class responsible for handling file uploads to the server
 *
 * @author Samuel Dubé
 */
class MulterStorage {

    private _PathToRoot: string = "images";
    private _AcceptedMimeTypes: { [index: string]: string } = {
        "image/gif": "gif",
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/tiff": "tiff",
        "image/svg": "svg"
    };

    constructor() {
        this.PickDestinationFolder = this.PickDestinationFolder.bind(this);
        this.IsFileTypeAccepted = this.IsFileTypeAccepted.bind(this);
        this.PickFileName = this.PickFileName.bind(this);
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
        var storage = multer.diskStorage({
            destination: this.PickDestinationFolder,
            filename: this.PickFileName
        });

        return multer({
            storage: storage,
            fileFilter: this.IsFileTypeAccepted,
            limits: {
                fileSize: 5000000, // 5mb
            }
        })
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

        next(null, this._PathToRoot);
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

        let fileName = `${file.originalname}`;

        // NOTE : Should use path constructor instead if hardcoding string
        if (fs.existsSync(`${this.PathToRoot}\\${fileName}`)) {
            // Explicitly append the to the request object.
            req.file = file;
            next(Error("File Already uploaded"), fileName);
        } else {
            next(null, fileName);
        }
    }

    /**
     * @description Method that determine if the file beeing uploaded
     * is allowed by the server
     *
     * @param req Express Request sent by the client
     * @param file Multer file beeing uploaded
     * @param next Callback function to pass the information to the next handler.
     */
    private IsFileTypeAccepted(
        req: Express.Request,
        file: Express.Multer.File,
        next: (err: Error | null, isAccepted: boolean) => void) {

        if (this._AcceptedMimeTypes[file.mimetype] !== undefined) {
            return next(null, true);
        } else {
            return next(null, false);
        }
    }
}

const Instance = new MulterStorage();
export default Instance;