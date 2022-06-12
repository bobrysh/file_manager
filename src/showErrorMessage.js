import { inputConstants,errorText } from "./inputConstants.js";

export class ShowErrorMessage {
    executionFailed() {
        console.warn("\n  Error: Operation failed  \n");
    }

    wrongInput(command) {
        const found = inputConstants.find((comm) => comm.input === command);
        console.warn(errorText);
        found ? console.warn(`${found.error}\n`) : console.warn(`\n`);
    }


}
