class JournalBuilder{
    info = {id: "", accountAt: "", userId: "", credits: [], debits:[], visible: true, deletedAt: ""}

    accountAt(val) {
        this.info.accountAt = val
        return this
    }

    userId(val) {
        this.info.userId = val
        return this
    }

    credit(itemId, amount){
        if(this.info.credits.map(d => d.categoryItemId).includes(itemId)){
            throw new Error(`Item ID ${itemId} is duplicated.`)
        }
        this.info.credits.push({categoryItemId: itemId, amount: amount})
        return this
    }
    debit(itemId, amount){        
        if(this.info.debits.map(d => d.categoryItemId).includes(itemId)){
            throw new Error(`Item ID ${itemId} is duplicated.`)
        }
        this.info.debits.push({categoryItemId: itemId, amount: amount})
        return this
    }

    modifyCredit(itemId, amount)  {
        for(const dtl of this.info.credits){
            if(dtl.categoryItemId === itemId){
                dtl.amount = amount
                return this
            }
        }
        throw new Error(`Item ID ${itemId} is not found.`)
    }
    
    modifyDebit(itemId, amount)  {
        for(const dtl of this.info.debits){
            if(dtl.categoryItemId === itemId){
                dtl.amount = amount
                return this
            }
        }
        throw new Error(`Item ID ${itemId} is not found.`)
    }

    build()   {
        if(this.info.accountAt == ""){
            throw new Error("Account at is required.")
        }
        if(this.info.userId == ""){
            throw new Error("User ID is required.")
        }
        if(this.info.credits.length === 0 || this.info.debits.length === 0){
            throw new Error("Journal detail is not valid.")
        }
        return this.info
    }
}


// console.log(new JournalBuilder())

export function builder() {
    return new JournalBuilder()
}