import * as fs from "fs";
import * as util from "util";

export default class JsonUtil {
  public static read<T>(key: string): Promise<T> {
    return util
      .promisify(fs.readFile)(`./dist/repos/${key}.json`)
      .then((str) => JSON.parse(str.toString()) as T);
  }

  public static save(key: string, data: any): Promise<void> {
    return util.promisify(fs.writeFile)(
      `./dist/repos/${key}.json`,
      JSON.stringify(data)
    );
  }

  public static clear(key: string) {
    this.save(key, []);
  }
}
