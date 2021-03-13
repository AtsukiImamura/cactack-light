const fs = require("fs");

// 対象ディレクトリまでの深さ
const DEPTH = 1;

replaceImport(["lib"]);

/**
 * 指定されたディレクトリを再帰的に探索し、すべてのjsファイルに存在する絶対形式のインポートを相対形式に置き換える
 * @param {*} dirs 指定するディレクトリに至るパスの文字列リスト ex. "hoge/piyo" を ["hoge", "piyo"] で表現
 */
function replaceImport(dirs) {
  const currentDir = dirs.join("/");
  fs.readdir(currentDir, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    for (const file of files) {
      const filePath = `${currentDir}/${file}`;
      if (fs.statSync(filePath).isDirectory()) {
        const nextDirs = dirs.slice(0, dirs.length);
        nextDirs.push(file);
        replaceImport(nextDirs);
        continue;
      }
      if (!file.endsWith(".js")) {
        continue;
      }
      replaceImportOfFile(filePath);
    }
  });
}

function replaceImportOfFile(filePath) {
  const dirs = filePath.split("/").filter((t) => t !== "");
  let contents = fs.readFileSync(filePath).toString();
  // console.log(dirs);
  for (let i = dirs.length; i > 0; i--) {
    const dirPath = dirs.slice(DEPTH, i).join("/");
    contents = contents.replace(
      new RegExp(`@/${dirPath}/`, "gi"),
      i >= dirs.length - 1 ? "./" : "../".repeat(dirs.length - i - DEPTH)
    );
  }
  contents = contents.replace(
    new RegExp("@/app/", "gi"),
    dirs.length - DEPTH - 1 === 0 ? "./" : "../".repeat(dirs.length - DEPTH - 1)
  );
  fs.writeFileSync(filePath, contents);
}
