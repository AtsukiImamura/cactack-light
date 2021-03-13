// import { DJournal } from "@/app/function/base/interface/DJournal";
import ApiResponse from "../base/ApiResponse";
import * as context from "@/app/function/base/FunctionContext";
import JournalDate from "@/app/function/model/date/JournalDate";
import { DataStore } from "@/app/function/base/DataStore";
import Identifiable from "@/app/model/interface/Identifiable";

interface DJournal extends Identifiable{

}

export namespace JournalData {
  export async function getBookContext(
    context: context.auth.ExecutableContext
  ) {
    if (!context.token) {
      throw new Error("authentication context was not given.");
    }

    const periodFrom = JournalDate.cast(context.params.from);
    // const periodTo = JournalDate.cast(context.params.to);

    const journals = await new DataStore<DJournal>(
      "journals"
    ).getByKey("userId", context.token.uid);

   
    return new ApiResponse(200, "", {
      date: periodFrom.toString(),
      journals: journals
    }).json();
  }

}
