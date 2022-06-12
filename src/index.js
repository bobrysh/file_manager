import { TaskResolver } from "./taskResolver.js";
import { finishLog } from "./inputConstants.js";

const taskResolver = new TaskResolver();

process.stdin.on("data", async (data) => {
    const INPUT = data.toString("utf8").trim();
    const TASK = INPUT.split(" ");

    if(TASK[0] === ".exit"){
        taskResolver.exitHandler();
    }else{
        await taskResolver.onInput(data);
    }
});

process.on("SIGINT", function () { //ctrl+c
    taskResolver.exitHandler();
});

process.on("exit", () => {
    console.warn(finishLog);
});


