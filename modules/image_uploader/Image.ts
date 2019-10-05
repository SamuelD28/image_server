import { IDatabaseModel } from "../database";

interface IFile {
    [size: string]: { path: string, lastRequested: Date }
}

class Image implements IDatabaseModel {

    private FileName: string = "";
    private FileExtension: string = "";
    private SizesAvailable: IFile = {};

    /**
     *
     */
    private constructor() { }

    Create(
        values: { [key: string]: any; })
        : Image {

        let image: Image = new Image();

        image.FileName = values.FileName;
        image.FileExtension = values.FileExtension;
        image.SizesAvailable = values.SizesAvailable;

        if (!image.FileName || !image.FileName || !image.FileName) {
            throw new Error("Missing property");
        }

        return image;
    }

    Apply(
        values: { [key: string]: any; })
        : Image {

        let image = new Image();

        

        return image;
    }

    Update(
        values: { [key: string]: any; })
        {

    }
}

export default Image;