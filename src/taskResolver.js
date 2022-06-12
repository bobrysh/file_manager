import { Basic } from "./basic.js";
import os from "os";
import { username } from "./inputConstants.js";
import { FileSystemHelper } from "./fileSystemHelper.js";
import { OperationSystemHelper } from "./operationSystemHelper.js";

export class TaskResolver extends Basic {
    constructor() {
        super();
        this.FileSystemHelper = new FileSystemHelper();
        this.OperationSystemHelper = new OperationSystemHelper();
        this.currentDirectory = this.OperationSystemHelper.getHomeDir();
        this.user = os.userInfo() || "";
        this.greetings();
    }

    greetings() {
        const args = process.argv;
        this.user = args[2] ? args[2].split("=")[1] : username;
        // const user = os.userInfo();
        console.warn(`Welcome to the Bobrysh File Manager, ${this.user}!\n`);
        this.showCurrentCommandLine(this.currentDirectory);
    }

    exitHandler() {
        console.warn(`\nThank you for using Bobrysh File Manager, ${this.user}!`);
        process.exit();
    }

    async onInput(data) {
        const input = data.toString("utf8").trim();
        const command = input.split(" ");

        if(command[0] === "os"){
            this.OperationSystemHelper.output(command[1], this.currentDirectory);
        }else if(command[0] === "ls"){
            await this.FileSystemHelper.output(input, this.currentDirectory, this.showBasicOutput);
        }else if(command[0] === "up"){
            this.currentDirectory = await this.FileSystemHelper.output(
                input,
                this.currentDirectory,
                this.showBasicOutput,
            );
        }else if(command[0] === "cd"){
            const dir = await this.FileSystemHelper.output(
                input,
                this.currentDirectory,
                this.showBasicOutput,
            );
            this.currentDirectory = dir?.dir;
        }else if(command[0] === "decompress"){
            await this.FileSystemHelper.output(input, this.currentDirectory, this.showBasicOutput);
        }else if(command[0] === "exit"){
            await this.exitHandler();
        }else{
            this.showErrorOutput(this.currentDirectory);
        }
    }
}
