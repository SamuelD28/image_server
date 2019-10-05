import { IDatabaseModel } from "../database";

class Image implements IDatabaseModel {

    private FileName: string = "";
    private FileMimeType: string = "";
    private SizesAvailable: { [size: string]: string } = {}; // Path
    private LastRequested: Date = new Date();

    constructor() { }

    public Create(
        values: { [key: string]: any; })
        : Image {

        let image: Image = new Image();

        image.FileName = values.FileName;
        image.FileMimeType = values.FileMimeType;
        image.SizesAvailable = values.SizesAvailable;

        if (!image.FileName || !image.FileName || !image.FileName) {
            throw new Error("Missing property");
        }

        return image;
    }

    public Apply(
        values: { [key: string]: any; })
        : void {

        this.FileName = values.FileName;
        this.FileMimeType = values.FileMimeType;
        this.SizesAvailable = values.SizesAvailable;
    }

    public Update(
        values: { [key: string]: any; })
        : void {

        this.FileName = values.FileName;
        this.FileMimeType = values.FileMimeType;
        this.SizesAvailable = values.SizesAvailable;

        if (!this.FileName || !this.FileName || !this.FileName) {
            throw new Error("Missing property");
        }
    }
}

export default Image;