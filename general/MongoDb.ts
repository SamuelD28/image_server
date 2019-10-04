import { MongoClient, Db, Collection } from "mongodb";

/**
 * @description Utility class for talking with a mongo
 * database.
 *
 * @author Samuel Dube
 */
class MongoDatabase {
    private ConnectionString: string;
    private DbName: string;
    private Client: MongoClient | null;

    /**
     * @description Base constructor for the class. Lazy initialise
     * the mongo client.
     *
     * @param connectionString Connection string used to connect to the database
     * @param dbName Name of the database to access
     */
    constructor(connectionString: string, dbName: string) {
        this.DbName = dbName;
        this.ConnectionString = connectionString;
        this.Client = null;
    }

    /**
     * @description Method that returns a database object of the specified
     * database.
     *
     * @param action Callback function to pass the database object to.
     */
    public async GetDb()
        : Promise<Db> {

        return new Promise(async (resolve, reject) => {
            //Lazy initialisation
            if (this.Client === null) {
                this.Client = await new MongoClient(
                    this.ConnectionString,
                    { useNewUrlParser: true })
                    .connect();
            }

            if (!this.Client.isConnected()) {
                reject("Cant establish connection with the database");
            }

            resolve(this.Client.db(this.DbName));
        });
    }

    /**
     * @description Method that return a collection object from a specific
     * database.
     *
     * @param name Name of the collection to retrieve
     * @param action Callback function to pass the collection object to.
     */
    public GetCollection(name: string)
        : Promise<Collection> {

        return new Promise((resolve, reject) => {
            this.GetDb()
                .then((db) => {
                    db.collection(name,
                        { strict: true },
                        async (err, collection) => {
                            let col: Collection | null = null;

                            if (err) {
                                col = await this.CreateCollection(name);
                            } else {
                                col = collection;
                            }

                            col === null ? reject("Can't create collection") : resolve(col);
                        });
                });
        });
    }


    /**
     * @description Method that create a new collection inside a database
     *
     * @param name Name of the collection to create
     */
    public CreateCollection(name: string)
        : Promise<Collection> {

        return new Promise((resolve) => {
            this.GetDb()
                .then((db) => {
                    resolve(db.createCollection(name));
                });
        });
    }

    /**
     * @description Method that retrieve a single document from the collection
     *
     * @param name Name of the collection
     * @param action Callback function to be pass
     * @param predicate Predicate for finding the document
     */
    public GetDocumentInCollection(name: string, predicate: object)
        : Promise<{ [key: string]: any }> {

        return new Promise((resolve) => {
            this.GetCollection(name)
                .then((collection) => {
                    resolve(collection.findOne(predicate));
                });
        })
    }

    /**
     * @description Method that retrieve multiples documents from the collection
     *
     * @param name Name of the collection
     * @param action Callback function to be pass
     * @param predicate Optionnal predicate for finding documents
     */
    public GetDocumentsInCollection(name: string, predicate?: object)
        : Promise<Array<{ [key: string]: any }>> {

        return new Promise((resolve) => {
            this.GetCollection(name)
                .then((collection) => {
                    predicate
                        ? resolve(collection.find(predicate).toArray())
                        : resolve(collection.find().toArray());
                });
        });
    }

    /**
     * @description Methodd that insert a single or multiple set of data inside a collection
     *
     * @param name Name of the collection to insert the data into
     * @param data Data to insert inside the collection
     */
    public InsertInCollection(name: string, data: object | Array<object>)
        : Promise<{ [key: string]: any }> {

        return new Promise((resolve) => {
            this.GetCollection(name)
                .then(async (collection) => {
                    let result =
                        data instanceof Object
                            ? await collection.insertOne(data)
                            : await collection.insertMany(data);
                    resolve(result);
                })
        });
    }

    /**
     * @description Method that delete a single or multiple object
     * inside a collection based on a mongo condition
     *
     * @param name Name of the collection to remove the data from
     * @param condition Condition for removing the data
     */
    public DeleteInCollection(name: string, condition: object)
        : Promise<{ [key: string]: any }> {

        return new Promise((resolve) => {
            this.GetCollection(name)
                .then(async (collection) => {
                    let result = await collection.deleteMany(condition);
                    resolve(result);
                });
        });
    }

    /**
     * @description Method that update a single or muliple data set
     * inside a collection
     *
     * @param name Name of the collection
     * @param predicate Predicate for selecting a document for update
     * @param data New data to override the old data with
     */
    public UpdateInCollection(name: string, predicate: object, data: object)
        : Promise<{ [key: string]: any }> {

        return new Promise((resolve) => {
            this.GetCollection(name)
                .then(async (collection) => {
                    let result = await collection.updateOne(predicate, data);
                    console.log(result);
                    resolve(result);
                });
        });
    }
}

export default MongoDatabase;