import { container } from "tsyringe";
import JournalRepository from "../repository/JournalRepository";
import JournalDate from "./common/JournalDate";
import DDepreciation from "./interface/DDepreciation";
import IDepreciation from "./interface/IDepreciation";
import IJournal from "./interface/IJournal";
import IJournalDate from "./interface/IJournalDate";
import UserIdentifiableBase from "./UserIdentifiableBase";

export default class Depreciation extends UserIdentifiableBase implements IDepreciation {

    public static parse(dep: DDepreciation){
        return new Depreciation(dep.id, dep.userId, dep.journalIds, dep.deletedAt ? JournalDate.cast(dep.deletedAt) : undefined)
    }

    private _journalIds: string[] = []

    constructor(id: string, userId: string,journalIds: string[], deletedAt?: IJournalDate) {
        super(id, userId, deletedAt)
        this._journalIds = journalIds
    }


    public async loadJournals(): Promise<IJournal[]> {
        return await container.resolve(JournalRepository).getByIds(this._journalIds)
    }

    public simplify(): DDepreciation {
        return {
            id: this._id,
            userId: this._userId,
            journalIds: this._journalIds,
            deletedAt: this._deletedAt
        }
    }
}