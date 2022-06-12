import * as fsPromises from "fs/promises";
import * as path from "path";
import { Basic } from "./basic.js";

export class DirHelper extends Basic {
    toUpFirstCase(words) {
        return words ? words[0].toUpperCase() + words.slice(1) : "";
    }

    moveDirUp(directory) {
        const root = this.getRootDir();
        if (directory === root) {
            console.warn("You at root directory");
            this.showBasicOutput(directory);
            return root;
        }

        const newPath = path.join(dir, '..');
        this.showBasicOutput(newPath);
        return newPath;
    }

    async checkDirExistance(dir) {
        try {
            const stat = await fsPromises.stat(dir);
            return !stat.isDirectory();
        } catch {
            return true;
        }
    }

    async getDirResult(currentDirectory, newDir, cb = false, command = "") {
        const dirErr = await this.checkDirExistance(newDir);

        if (dirErr) {
            this.showErrorOutput(currentDirectory, command);
            return {
                dir: currentDirectory,
                error: true,
            };
        } else {
            cb ? this.showBasicOutput(newDir) : null;
            return {
                dir: newDir,
                error: false,
            };
        }
    }

    getUpperDir(currentPath, newPath) {
        const splitted = newPath.split("/");
        if (splitted[0] == "..") {
            currentPath = path.join(currentPath, "..");
            return this.getUpperDir(currentPath, splitted.slice(1).join("/"));
        } else {
            for (let i = 0; i < splitted.length; i++) {
                currentPath = path.join(currentPath, this.toUpFirstCase(splitted[i]));
            }

            return currentPath;
        }
    }

    async changeDirectory(currentDirectory, requestedPath, cb = false, command = "") {
        const splitted = requestedPath.split("/");
        if (splitted[0] == ".") {
            let newPath = currentDirectory;
            for (let i = 1; i < splitted.length; i++) {
                newPath = path.join(newPath, this.toUpFirstCase(splitted[i]));
            }
            return await this.getDirResult(currentDirectory, newPath, cb, command);
        }
        if (splitted[0] == "..") {
            return await this.getDirResult(
                currentDirectory,
                this.getUpperDir(currentDirectory, requestedPath),
                cb,
                command,
            );
        }
        if (splitted[0].match(/^[A-Za-z]:$/)) {
            return await this.getDirResult(currentDirectory, requestedPath, cb, command);
        }

        let newPath = currentDirectory;
        for (let i = 0; i < splitted.length; i++) {
            newPath = path.join(newPath, this.toUpFirstCase(splitted[i]));
        }
        return await this.getDirResult(currentDirectory, newPath, cb, command);
    }

    getRootDir() {
        return path.parse(process.cwd()).root;
    }

    async dirList(dir) {
        try {
            const files = await fsPromises.readdir(dir);
            for (const file of files) console.warn(file);
            this.showBasicOutput(dir);
        } catch (err) {
            this.showFailedOutput(dir)
        }
    }
}
