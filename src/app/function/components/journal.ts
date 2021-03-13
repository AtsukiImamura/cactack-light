import funcJournalUpdate from "@/app/function/components/journal/onJournalUpdated"
import funcJournalCreate from "@/app/function/components/journal/onJournalCreated"

namespace trigger {
    export const onJournalUpdated = funcJournalUpdate
    export const onJournalCreated = funcJournalCreate
}

export {trigger}