import express, {Application} from "express";
import 'express-async-errors'
import Server from './server';

class ShopApplicaiton {
    public run (): void{
        const app: Application = express();

        const server:Server = new Server(app);

        server.start();
    }
}

const shopApplicaiton: ShopApplicaiton= new ShopApplicaiton();
shopApplicaiton.run();

