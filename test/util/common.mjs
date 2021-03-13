import admin from "firebase-admin";
import cliProgress from "cli-progress";


const progressBar = new cliProgress.MultiBar(
  {
      format: "[{bar}] | {task} | {percentage}% | ETA: {eta}s | {value}/{total}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
  },
  cliProgress.Presets.shades_grey
);

export async function sleepMe(msec, bar=false) {
    if(bar){
      const progress = progressBar.create(Math.floor(msec/1000), 0, {task: `sleep`,});
      for(let ms=1000; ms <= msec; ms = ms + 1000){
        setTimeout(() => progress.increment(), ms)
      }
    }
    return new Promise((o, x) => setTimeout(o,msec))
}

export async function prepareItems(userId, num, prefix) {
    const itemAddTasks = []
    for(let itemCnt = 0; itemCnt < num; itemCnt ++){
      const item = {id: "", name: `${prefix}-item-${itemCnt + 1}`,userId: userId}
      itemAddTasks.push(admin.firestore().collection("userCategoryItem")
          .add(item).then(doc => {
            item.id = doc.id
            return item
          }))
    }
    return Promise.all(itemAddTasks)
  }