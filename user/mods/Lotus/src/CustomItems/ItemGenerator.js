"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemGenerator = void 0;
const Enums_1 = require("../Refs/Enums");
class ItemGenerator {
    constructor() { }
    createLotusKeycard(newItem, utils, tables) {
        const LotusKeycard = {
            itemTplToClone: Enums_1.ItemGenIDs.Keycard,
            overrideProperties: {
                Prefab: {
                    "path": "assets/content/items/spec/item_keycard_lab/item_keycard_lab_white_sanitar.bundle",
                    "rcid": ""
                },
                Height: 1,
                Width: 1,
                BackgroundColor: "violet",
                MaximumNumberOfUsage: 0
            },
            parentId: Enums_1.BaseClasses.INFO,
            newId: "LotusKeycard",
            fleaPriceRoubles: 29999999,
            handbookPriceRoubles: 24999999,
            handbookParentId: Enums_1.HandbookIDs.ElectronicKeys,
            locales: {
                "en": {
                    name: "Lotus' Custom Labs Access Card",
                    shortName: "LotusCC",
                    description: "A custom access keycard for the Terragroup Lab, a place filled with treasure and danger. This card has been modified by Lotus and does not have any limited uses unlike the normal access cards. Whoever owns this keycard will not have to worry about buying or finding normal access cards ever again."
                }
            }
        };
        newItem.createItemFromClone(LotusKeycard);
        utils.addToCases(tables, "5d235bb686f77443f4331278", "LotusKeycard");
        utils.addToCases(tables, "619cbf9e0a7c3a1a2731940a", "LotusKeycard");
    }
}
exports.ItemGenerator = ItemGenerator;
//# sourceMappingURL=ItemGenerator.js.map