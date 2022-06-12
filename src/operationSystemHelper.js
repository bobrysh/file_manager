import os from "os";
import { Basic } from "./basic.js";

export class OperationSystemHelper extends Basic {
    getHomeDir() {
        return os.homedir();
    }

    homeDir() {
        console.warn("Home directory: ", this.getHomeDir());
    }

    username() {
        const user = os.userInfo();
        console.warn("User name: ", user.username);
    }

    eol() {
        console.warn("End-Of-Line: ", os.EOL.replace("\r", "\\r").replace("\n", "\\n"));
    }

    cpus() {
        const cpus = os.cpus();
        const arr = cpus.map((cpu) => ({
            model: cpu.model,
            "clock rate": `${cpu.speed / 1000}GHz`,
        }));
        console.warn("Overall amount of CPUS: ", cpus.length);
        for (const cpu of arr) {
            console.warn(cpu);
        }
    }

    architecture() {
        console.warn("CPU architecture: ", os.arch());
    }

    output(key, currentPath) {
        switch (key) {
            case "--homedir": {
                this.homeDir();
                break;
            }
            case "--username": {
                this.username();
                break;
            }
            case "--EOL": {
                this.eol();
                break;
            }
            case "--cpus": {
                this.cpus();
                break;
            }
            case "--architecture": {
                this.architecture();
                break;
            }

            default:
                this.showErrorOutput(currentPath, "os");
                return;
        }
        this.showBasicOutput(currentPath);
    }
}
