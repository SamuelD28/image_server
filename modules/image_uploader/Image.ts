import { IDatabaseModel } from "../database";

class Image {

    private _FileName: string = "";
    private FileMimeType: string = "";
    private _SizesAvailable: { [size: string]: string; } = {}; // Path
    private LastRequested: Date = new Date();

    constructor(
        fileName: string,
        fileMimeType: string,
        sizesAvailable: { [size: string]: string }
    ) {
        this.FileName = fileName;
        this.FileMimeType = fileMimeType;
        this.SizesAvailable = sizesAvailable;
        this.LastRequested = new Date();
    }

    public get SizesAvailable(): {
        [size: string]: string;
    } {
        return this._SizesAvailable;
    }

    public set SizesAvailable(value: {
        [size: string]: string;
    }) {
        this._SizesAvailable = value;
    }

    public get FileName(): string {
        return this._FileName;
    }

    public set FileName(value: string) {
        this._FileName = value;
    }

    public Empty()
        : Image {
        return new Image("", "", {});
    }

    public Bind(
        values: { [key: string]: any; })
        : void {
        this.FileName = values.FileName;
        this.FileMimeType = values.FileMimeType;
        this.SizesAvailable = values.SizesAvailable;
        this.LastRequested = values.LastRequested;
    }
}

export default Image;