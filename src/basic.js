import { ShowErrorMessage } from "./showErrorMessage.js";
import { enterCommandLog } from "./inputConstants.js";

export class Basic extends ShowErrorMessage {
  enterCommandLog() {
    console.warn(enterCommandLog);
  }
  showCurrentPath(path) {
    console.warn(`You are currently in ${path}`);
  }
  showFailedOutput(currentDirectory) {
    this.executionFailed();
    this.showCurrentCommandLine(currentDirectory);
  }
  showCurrentCommandLine(path) {
    process.stdout.write(`CLI ${path}> `);
  }
  showErrorOutput(currentDirectory, command = "") {
    this.wrongInput(command);
    this.showCurrentCommandLine(currentDirectory);
  }
  showBasicOutput(currentDirectory) {
    console.warn("\n");
    this.showCurrentCommandLine(currentDirectory);
  }

}
