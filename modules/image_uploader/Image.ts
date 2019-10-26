
class Image implements Express.Multer.File {

    public fieldname: string = "";
    public originalname: string = "";
    public encoding: string = "";
    public mimetype: string = "";
    public size: number = 0;
    public url : string = "";
    public destination: string = "";
    public location: string = "";
    public filename: string = "";
    public path: string = "";
    public buffer: Buffer = new Buffer("");
    public width : number = 0;
    public height : number = 0;
    public error: string | undefined;
    public resizesavailable: string[] = [];
    public lastrequested: Date = new Date();
    public createdat: Date = new Date();

    private constructor() { }

    public static BindMulterFile(
        p_file: { [index: string]: string })
        : Image {

        const image: Image = new Image();

        // Required attributes
        image.fieldname = p_file.fieldname;
        image.originalname = p_file.originalname;
        image.encoding = p_file.encoding;
        image.mimetype = p_file.mimetype;
        image.error = p_file.error;

        // Optional attributes
        image.size = (p_file.size) ? +p_file.size : 0;
        image.destination = p_file.destination || "";
        image.location = p_file.location || "";
        image.filename = p_file.filename || "";
        image.path = p_file.path || "";

        // Self initialised attributes
        image.buffer = new Buffer("");
        image.resizesavailable = [];
        image.lastrequested = new Date();
        image.createdat = new Date();
        return image;
    }
}

export default Image;
