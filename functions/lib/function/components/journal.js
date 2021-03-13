"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trigger = void 0;
const onJournalUpdated_1 = __importDefault(require("../../function/components/journal/onJournalUpdated"));
const onJournalCreated_1 = __importDefault(require("../../function/components/journal/onJournalCreated"));
var trigger;
(function (trigger) {
    trigger.onJournalUpdated = onJournalUpdated_1.default;
    trigger.onJournalCreated = onJournalCreated_1.default;
})(trigger || (trigger = {}));
exports.trigger = trigger;
