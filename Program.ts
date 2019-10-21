/**
 * Entry point for the image server
 *
 * TODO : Error Handler quand le champ des images est pas present.
 * TODO  : Error handler pour les erreurs trop large
 */

import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import path from "path";
import { Mongodb } from "./modules/database/Index";
import ImageController from "./modules/image_uploader/ImageController";

// Parse the .env of the project in the process runtime
dotenv.config();

const App = express();
const Port: number = process.env.PORT ? +process.env.PORT : 8080;
const Database: Mongodb = new Mongodb(<string>process.env.MONGODB_URI, <string>process.env.MONGODB_NAME);

App.use(bodyParser.urlencoded({ extended: true }));

App.use("/images", new ImageController(Database).Router);

App.get("/", (req, res) => {
    res.sendFile(__dirname + "/pages/upload.html");
});

App.listen(
    Port,
    (err) => {
        if (err) {
            console.log("Can't start the server");
        } else {
            console.log(`Server started\nPORT : ${Port}\nHOST : ${process.env.Host}`);
        }
    });



