import { ShowErrorMessage } from "./showErrorMessage.js";

export class Basic extends ShowErrorMessage {
  enterCommandLog() {
    console.log(`Please enter a command. Type "exit" to quit \n`);
  }
  showCurrentPath(path) {
    console.log(`You are currently in ${path}`);
  }
  showCurrentCommandLine(path) {
    process.stdout.write(`CLI ${path}> `);
  }
  showBasicOutput(currentDir) {
    console.log("\n");
    this.showCurrentCommandLine(currentDir);
  }
  showErrorOutput(currentDir, command = "") {
    this.wrongInput(command);
    this.showCurrentCommandLine(currentDir);
  }
  showFailedOutput(currentDir) {
    this.executionFailed();
    this.showCurrentCommandLine(currentDir);
  }
}
