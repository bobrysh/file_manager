import * as fsPromises from "fs/promises";
import fs from "fs";
import * as path from "path";
import crypto from "crypto";
import zlib from "zlib";
import { pipeline } from "stream/promises";
import { PathHelper } from "./pathHelper.js";

export class FileSystemHelper extends PathHelper {
    async readFile(currentDir, requestedPath, cb = false, command = "") {
        const fileData = await this.getFileNameToPath(currentDir, requestedPath, command);

        if (!fileData) return;

        const readableStream = fs.createReadStream(fileData.filePath, "utf8");

        readableStream.on("error", (error) => {
            this.showFailedOutput(currentDir);
        });

        readableStream.on("data", (chunk) => {
            console.warn(chunk);
        });

        readableStream.on("end", () => {
            cb ? this.showBasicOutput(currentDir) : null;
        });
    }

    async createFile(currentDir, fileName) {
        const filePath = path.join(currentDir, fileName);
        const writableStream = fs.createWriteStream(filePath);

        writableStream.on("error", (error) => {
            this.showFailedOutput(currentDir);
        });
        writableStream.on("close", () => {
            writableStream.end();
        });

        this.showBasicOutput(currentDir);
        writableStream.close();
    }

    async renameFile(currentDir, filePath, newFileName, cb = false, command = "") {
        const fileData = await this.getFileNameToPath(currentDir, filePath, command);
        if (!fileData) return;
        if (fileData.fileName == newFileName) {
            this.showErrorOutput(currentDir, command);
            return;
        }

        try {
            const oldFileStat = await fsPromises.stat(fileData.filePath);
            if (!oldFileStat.isFile()) throw Error;
            const readableStream = fs.createReadStream(fileData.filePath, "utf8");

            readableStream.on("error", (error) => {
                console.warn(error);
                this.showFailedOutput(currentDir);
                return;
            });

            readableStream.on("end", () => {});

            const renameFilePath = path.join(fileData.fileDir.dir, newFileName);

            const writableStream = fs.createWriteStream(renameFilePath);

            writableStream.on("error", (error) => {
                return;
            });
            writableStream.on("close", async () => {
                writableStream.end();
                readableStream.unpipe();
                readableStream.close();
                await fsPromises.rm(fileData.filePath);
                cb ? this.showBasicOutput(currentDir) : null;
            });

            readableStream.pipe(writableStream);
        } catch (error) {
            this.showFailedOutput(currentDir);
        }
    }

    async deleteFile(currentDir, requestedPath, cb = false, command = "") {
        const fileData = await this.getFileNameToPath(currentDir, requestedPath);

        if (!fileData) return;

        const readableStream = fs.createReadStream(fileData.filePath, "utf8");

        readableStream.on("error", (error) => {
            this.executionFailed();
        });

        readableStream.on("close", async () => {
            await fsPromises.rm(fileData.filePath).catch(() => {
                return;
            });
            cb ? this.showBasicOutput(currentDir) : null;
        });

        readableStream.close();
    }

    async copyFile(currentDir, filePath, copyFilePath, cb = false, command = "") {
        const fileData = await this.getFileNameToPath(currentDir, filePath, command);

        if (!fileData) return;

        const fileCopyData = await this.getFileNameToPath(currentDir, copyFilePath, command);

        if (!fileCopyData) return;

        try {
            const oldFileStat = await fsPromises.stat(fileData.filePath);
            if (!oldFileStat.isFile()) throw Error;
            const readableStream = fs.createReadStream(fileData.filePath, "utf8");

            readableStream.on("error", (error) => {
                this.showFailedOutput(currentDir);
            });

            const copyPath = path.join(fileCopyData.filePath, fileData.fileName);
            const writableStream = fs.createWriteStream(copyPath);

            writableStream.on("error", (error) => {
                this.executionFailed();
            });
            writableStream.on("close", () => {
                writableStream.end();
                readableStream.unpipe();
                readableStream.close();
                cb ? this.showBasicOutput(currentDir) : null;
            });

            readableStream.pipe(writableStream);
        } catch (error) {
            this.showFailedOutput(currentDir);
        }
    }

    async moveFile(currentDir, filePath, copyFilePath, cb = false, command = "") {
        const fileData = await this.getFileNameToPath(currentDir, filePath);

        if (!fileData) return;

        const fileCopyData = await this.getFileNameToPath(currentDir, copyFilePath);

        if (!fileCopyData) return;

        try {
            const oldFileStat = await fsPromises.stat(fileData.filePath);
            if (!oldFileStat.isFile()) throw Error;
            const readableStream = fs.createReadStream(fileData.filePath, "utf8");

            readableStream.on("error", (error) => {
                console.warn("READ");
                this.showFailedOutput(currentDir);
            });

            const copyPath = path.join(fileCopyData.filePath, fileData.fileName);
            const writableStream = fs.createWriteStream(copyPath);

            writableStream.on("error", (error) => {
                this.executionFailed();
            });
            writableStream.on("finish", async () => {
                writableStream.end();
                readableStream.unpipe();
                readableStream.close();
                await fsPromises.rm(fileData.filePath);
            });
            writableStream.on("close", () => {
                writableStream.end();
                readableStream.unpipe();
                readableStream.close();
                cb ? this.showBasicOutput(currentDir) : null;
            });

            readableStream.pipe(writableStream);
        } catch (error) {
            this.showFailedOutput(currentDir);
        }
    }

    async getFileHash(currentDir, filePath, cb = false, command = "") {
        const fileData = await this.getFileNameToPath(currentDir, filePath, command);

        if (!fileData) return;

        try {
            const fileStat = await fsPromises.stat(fileData.filePath);
            if (!fileStat.isFile()) throw Error;

            const readableStream = fs.createReadStream(fileData.filePath, "utf8");

            readableStream.on("error", (error) => {
                this.showFailedOutput(currentDir);
            });

            readableStream.on("data", (data) => {
                const algorithm = "sha256";

                const cripted = crypto.createHash(algorithm).update(data).digest("hex");

                console.warn("\nFile hash: ", cripted);
            });

            readableStream.on("end", () => {
                cb ? this.showBasicOutput(currentDir) : null;
            });
        } catch (error) {
            this.showFailedOutput(currentDir);
        }
    }

    async compressFile(currentDir, filePath, archiveFilePath, cb = false, command = "") {
        const fileData = await this.getFileNameToPath(currentDir, filePath);

        if (!fileData) return;

        const fileArchData = await this.getFileNameToPath(currentDir, archiveFilePath);

        if (!fileArchData) return;

        try {
            const fileStat = await fsPromises.stat(fileData.filePath);
            if (!fileStat.isFile()) throw Error;

            const readableStream = fs.createReadStream(fileData.filePath);

            readableStream.on("error", (error) => {
                this.showFailedOutput(currentDir);
            });

            const copyPath = path.join(fileArchData.filePath, "archive.gz");

            const writableStream = fs.createWriteStream(copyPath);
            writableStream.on("error", (error) => {
                this.executionFailed();
            });
            writableStream.on("close", () => {
                writableStream.end();
                readableStream.unpipe();
                readableStream.close();
                cb ? this.showBasicOutput(currentDir) : null;
            });

            await pipeline(readableStream, zlib.createBrotliCompress(), writableStream);
        } catch (error) {
            console.warn(error);
            this.showFailedOutput(currentDir);
        }
    }

    async decompressFile(currentDir, filePath, archiveFilePath, cb = false, command = "") {
        const fileArchData = await this.getFileNameToPath(currentDir, filePath);

        if (!fileArchData) return;

        const fileData = await this.getFileNameToPath(currentDir, archiveFilePath);

        if (!fileData) return;

        try {
            const fileStat = await fsPromises.stat(fileArchData.filePath);
            if (!fileStat.isFile()) throw Error;

            const readableStream = fs.createReadStream(fileArchData.filePath);

            readableStream.on("error", (error) => {
                this.showFailedOutput(currentDir);
            });

            const copyPath = path.join(fileData.filePath, "decompressed.txt");

            const writableStream = fs.createWriteStream(copyPath);
            
            writableStream.on("error", (error) => {
                this.executionFailed();
            });
            
            writableStream.on("close", () => {
                writableStream.end();
                readableStream.unpipe();
                readableStream.close();
                cb ? this.showBasicOutput(currentDir) : null;
            });

            await pipeline(readableStream, zlib.createBrotliDecompress(), writableStream);

            writableStream.close();
        } catch (error) {
            this.showFailedOutput(currentDir);
        }
    }

    async output(request, dir) {
        const command = request.split(" ");

        if(command[0] === "ls"){
            await this.dirList(dir);
        }else if(command[0] === "up"){
            return this.moveDirUp(dir);
        }else if(command[0] === "cd"){
            if (!command[1]) {
                this.showErrorOutput(dir, "cd");
                return null;
            }
            return this.changeDirectory(dir, command[1], true, "cd");
        }else if(command[0] === "cat"){
            if (!command[1]) {
                this.showErrorOutput(dir, "cat");
                return null;
            }
            await this.readFile(dir, command[1], true, "cat");
        }else if(command[0] === "add"){
            if (!command[1]) {
                this.showErrorOutput(dir, "add");
                return null;
            }
            await this.createFile(dir, command[1]);
        }else if(command[0] === "rn"){
            if (!command[1] || !command[2]) {
                this.showErrorOutput(dir, "rn");
                return null;
            }
            await this.renameFile(dir, command[1], command[2], true, "rn");
        }else if(command[0] === "rm"){
            if (!command[1]) {
                this.showErrorOutput(dir, "rm");
                return null;
            }
            await this.deleteFile(dir, command[1], true, "rm");
        }else if(command[0] === "cp"){
            if (!command[1] || !command[2]) {
                this.showErrorOutput(dir, "cp");
                return null;
            }
            await this.copyFile(dir, command[1], command[2], true, "cp");
        }else if(command[0] === "mv"){
            if (!command[1] || !command[2]) {
                this.showErrorOutput(dir, "mv");
                return null;
            }
            await this.moveFile(dir, command[1], command[2], true, "mv");
        }else if(command[0] === "hash"){
            if (!command[1]) {
                this.showErrorOutput(dir, "hash");
                return null;
            }
            await this.getFileHash(dir, command[1], true, "hash");
        }else if(command[0] === "compress"){
            if (!command[1] || !command[2]) {
                this.showErrorOutput(dir, "compress");
                return null;
            }
            await this.compressFile(dir, command[1], command[2], true, "compress");
        }else if(command[0] === "decompress"){
            if (!command[1] || !command[2]) {
                this.showErrorOutput(dir, "decompress");
                return null;
            }
            await this.decompressFile(dir, command[1], command[2], true, "decompress");
        }
    }
}

export const fileSystemHelper = new FileSystemHelper();
