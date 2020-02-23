import temp = require("temp");
import { unlink } from "fs";

export default function withTempFile<T>(fn: (path: string) => T, catchFn: (e: Error) => T) {
    const tempFile = temp.openSync({
        suffix: '.js'
    })

    try {
        return fn(tempFile.path)
    } catch (e) {
        return catchFn(e)
    } finally {
        unlink(tempFile.path, (err => {
            if (err) {
                console.error(`Error while deleting temporary compiled file ${tempFile.path}: ${err}`);
            }
        }))
    }

}