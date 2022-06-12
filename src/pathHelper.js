import * as path from "path";
import { DirHelper } from "./dirHelper.js";

export class PathHelper extends DirHelper {
    async getFileNameToPath(currentDirectory, filePath, command) {
        const filePathSplitted = filePath.split("/");
        let fileDir = null;
        let newFilePath = "";
        if (filePathSplitted[0] == "." && filePathSplitted.length == 2) {
            newFilePath = path.join(currentDirectory, filePathSplitted[1]);
        } else {
            fileDir = await this.changeDirectory(
                currentDirectory,
                filePathSplitted.slice(0, -1).join("/"),
                false,
                command,
            );
            if (!fileDir.error) {
                newFilePath = path.join(fileDir.dir, filePathSplitted[filePathSplitted.length - 1]);
            } else return null;
        }
        return {
            filePath: newFilePath,
            fileDir: fileDir,
            fileName: filePathSplitted[filePathSplitted.length - 1],
        };
    }

    async getPathNameToPath(currentDirectory, filePath, command) {
        const filePathSplitted = filePath.split("/");
        let fileDir = null;
        let newFilePath = "";
        if (filePathSplitted[0] == "." && filePathSplitted.length == 2) {
            fileDir = path.join(currentDirectory, filePathSplitted[1]);
        } else {
            fileDir = await this.changeDirectory(
                currentDirectory,
                filePath,
                false,
                command,
            );
            if (fileDir.error) return null;
        }
        return {
            filePath: newFilePath,
            fileDir: fileDir,
            fileName: filePathSplitted[filePathSplitted.length - 1],
        };
    }
}
