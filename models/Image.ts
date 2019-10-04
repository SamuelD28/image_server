class Image{

    private FileName : string;
    private FileExtension : string;
    private SizesAvailable : {[index : string] : {path : string, lastRequest : Date}};

    /**
     *
     */
    constructor() {
        super();
            
    }

}

export default Image;