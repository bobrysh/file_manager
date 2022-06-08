import { inputConstants } from "./inputConstants.js";

export class ShowErrorMessage {
    executionFailed() {
        console.log("\n  Error: Operation failed  \n");
    }

    wrongInput(command) {
        const found = inputConstants.find((comm) => comm.name === command);
        console.log("\nError: Invalid input");
        found ? console.log(`${found.payload}\n`) : console.log(`\n`);
    }


}
