"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
/**
 * @description Class responsible for communicating with a
 * mongo database
 *
 * @author Samuel Dube
 */
var Mongodb = /** @class */ (function () {
    /**
     * @description Base constructor for the class. Lazy initialise
     * the mongo client.
     *
     * @param connectionString Connection string used to connect to the database
     * @param dbName Name of the database to access
     */
    function Mongodb(connectionString, dbName) {
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
    Mongodb.prototype.GetDb = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (!(this.Client === null)) return [3 /*break*/, 2];
                                    _a = this;
                                    return [4 /*yield*/, new mongodb_1.MongoClient(this.ConnectionString, {
                                            useNewUrlParser: true,
                                            useUnifiedTopology: true,
                                        })
                                            .connect()];
                                case 1:
                                    _a.Client = _b.sent();
                                    _b.label = 2;
                                case 2:
                                    if (!this.Client.isConnected()) {
                                        reject("[ERR] - Can't connect with the database");
                                    }
                                    resolve(this.Client.db(this.DbName));
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * @description Method that return a collection object from a specific
     * database.
     *
     * @param name Name of the collection to retrieve
     * @param action Callback function to pass the collection object to.
     */
    Mongodb.prototype.GetCollection = function (name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.GetDb()
                .then(function (db) {
                db.collection(name, { strict: true }, function (err, collection) { return __awaiter(_this, void 0, void 0, function () {
                    var col;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                col = null;
                                if (!err) return [3 /*break*/, 2];
                                return [4 /*yield*/, this.CreateCollection(name)];
                            case 1:
                                col = _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                col = collection;
                                _a.label = 3;
                            case 3:
                                col === null ? reject("Can't create collection") : resolve(col);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        });
    };
    /**
     * @description Method that create a new collection inside a database
     *
     * @param name Name of the collection to create
     */
    Mongodb.prototype.CreateCollection = function (name) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.GetDb()
                .then(function (db) {
                resolve(db.createCollection(name));
            });
        });
    };
    /**
     * @description Method that retrieve a single document from the collection
     *
     * @param name Name of the collection
     * @param action Callback function to be pass
     * @param predicate Predicate for finding the document
     */
    Mongodb.prototype.GetDocumentInCollection = function (name, predicate) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.GetCollection(name)
                .then(function (collection) {
                resolve(collection.findOne(predicate));
            });
        });
    };
    /**
     * @description Method that retrieve multiples documents from the collection
     *
     * @param name Name of the collection
     * @param action Callback function to be pass
     * @param predicate Optionnal predicate for finding documents
     */
    Mongodb.prototype.GetDocumentsInCollection = function (name, predicate) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.GetCollection(name)
                .then(function (collection) {
                predicate
                    ? resolve(collection.find(predicate).toArray())
                    : resolve(collection.find().toArray());
            });
        });
    };
    /**
     * @description Methodd that insert a single or multiple set of data inside a collection
     *
     * @param name Name of the collection to insert the data into
     * @param data Data to insert inside the collection
     */
    Mongodb.prototype.InsertInCollection = function (name, data) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.GetCollection(name)
                .then(function (collection) { return __awaiter(_this, void 0, void 0, function () {
                var result, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!(data instanceof Object)) return [3 /*break*/, 2];
                            return [4 /*yield*/, collection.insertOne(data)];
                        case 1:
                            _a = _b.sent();
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, collection.insertMany(data)];
                        case 3:
                            _a = _b.sent();
                            _b.label = 4;
                        case 4:
                            result = _a;
                            resolve(result);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    };
    /**
     * @description Method that delete a single or multiple object
     * inside a collection based on a mongo condition
     *
     * @param name Name of the collection to remove the data from
     * @param condition Condition for removing the data
     */
    Mongodb.prototype.DeleteInCollection = function (name, condition) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.GetCollection(name)
                .then(function (collection) { return __awaiter(_this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, collection.deleteMany(condition)];
                        case 1:
                            result = _a.sent();
                            resolve(result);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    };
    /**
     * @description Method that update a single or muliple data set
     * inside a collection
     *
     * @param name Name of the collection
     * @param predicate Predicate for selecting a document for update
     * @param data New data to override the old data with
     */
    Mongodb.prototype.UpdateInCollection = function (name, predicate, data) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.GetCollection(name)
                .then(function (collection) { return __awaiter(_this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, collection.updateOne(predicate, data)];
                        case 1:
                            result = _a.sent();
                            resolve(result);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    };
    return Mongodb;
}());
exports.default = Mongodb;
