export default interface IJournalDate {
  year: number;

  month: number;

  day: number;

  dayName: string;

  beforeThanOrEqualsTo: (date: IJournalDate) => boolean;

  afterThanOrEqualsTo: (date: IJournalDate) => boolean;

  beforeThan: (date: IJournalDate) => boolean;

  afterThan: (date: IJournalDate) => boolean;

  equalsTo: (date: IJournalDate) => boolean;

  toString: () => string;

  getNextMonth: () => IJournalDate;

  getNextDay: () => IJournalDate;

  getPreviousDay: () => IJournalDate;

  getNextWeek: () => IJournalDate;

  getPreviousWeek: () => IJournalDate;

  getAfterMonthOf: (val: number) => IJournalDate;

  getPreviousMonth: () => IJournalDate;

  getPreviousYear: () => IJournalDate;

  getBeforeMonthOf: (val: number) => IJournalDate;

  isInMonthOf: (date: IJournalDate) => boolean;

  isInYearOf: (date: IJournalDate) => boolean;

  getMonthsOfAfter: (num: number) => IJournalDate[];

  firstDay: IJournalDate;

  lastDay: IJournalDate;
 
  toDate: () => Date;

  countDayFrom: (date: IJournalDate) => number;

  setDate: (date: Date) => IJournalDate;
}
