"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseClasses_1 = require("C:/snapshot/project/obj/models/enums/BaseClasses");
const jsonc_1 = require("C:/snapshot/project/node_modules/jsonc");
const path_1 = __importDefault(require("path"));
class LessRestrictingHeadwear {
    mod;
    modShortName;
    constructor() {
        this.mod = "MusicManiac - Less Restricting Headwear";
        this.modShortName = "LessRestrictingHeadwear";
    }
    postDBLoad(container) {
        const logger = container.resolve("WinstonLogger");
        const db = container.resolve("DatabaseServer");
        const tables = db.getTables();
        const itemDB = tables.templates.items;
        const itemHelper = container.resolve("ItemHelper");
        const vfs = container.resolve("VFS");
        const config = jsonc_1.jsonc.parse(vfs.readFile(path_1.default.resolve(__dirname, "../config.jsonc")));
        for (let item in itemDB) {
            if (itemDB[item]._type !== "Node") {
                const itemId = itemDB[item]._id;
                if (itemHelper.isOfBaseclass(itemId, BaseClasses_1.BaseClasses.HEADWEAR)) {
                    if (config.debug) {
                        logger.info(`[${this.modShortName}] adjusting item ${itemDB[item]._name} (id ${itemId} ) to match config values`);
                    }
                    itemDB[item]._props.BlocksHeadwear = config.Headwear.removeBlocksHeadwear ? false : itemDB[item]._props.BlocksHeadwear;
                    itemDB[item]._props.BlocksEarpiece = config.Headwear.removeBlocksEarpiece ? false : itemDB[item]._props.BlocksEarpiece;
                    itemDB[item]._props.BlocksFaceCover = config.Headwear.removeBlocksFaceCover ? false : itemDB[item]._props.BlocksFaceCover;
                    itemDB[item]._props.BlocksEyewear = config.Headwear.removeBlocksEyewear ? false : itemDB[item]._props.BlocksEyewear;
                    itemDB[item]._props.ConflictingItems = config.Headwear.clearConflictingItems ? [] : itemDB[item]._props.ConflictingItems;
                }
                else if (itemHelper.isOfBaseclass(itemId, BaseClasses_1.BaseClasses.HEADPHONES)) {
                    if (config.debug) {
                        logger.info(`[${this.modShortName}] adjusting item ${itemDB[item]._name} (id ${itemId} ) to match config values`);
                    }
                    itemDB[item]._props.BlocksHeadwear = config.Earpiece.removeBlocksHeadwear ? false : itemDB[item]._props.BlocksHeadwear;
                    itemDB[item]._props.BlocksEarpiece = config.Earpiece.removeBlocksEarpiece ? false : itemDB[item]._props.BlocksEarpiece;
                    itemDB[item]._props.BlocksFaceCover = config.Earpiece.removeBlocksFaceCover ? false : itemDB[item]._props.BlocksFaceCover;
                    itemDB[item]._props.BlocksEyewear = config.Earpiece.removeBlocksEyewear ? false : itemDB[item]._props.BlocksEyewear;
                    itemDB[item]._props.ConflictingItems = config.Earpiece.clearConflictingItems ? [] : itemDB[item]._props.ConflictingItems;
                }
                else if (itemHelper.isOfBaseclass(itemId, BaseClasses_1.BaseClasses.FACECOVER)) {
                    if (config.debug) {
                        logger.info(`[${this.modShortName}] adjusting item ${itemDB[item]._name} (id ${itemId} ) to match config values`);
                    }
                    itemDB[item]._props.BlocksHeadwear = config.FaceCover.removeBlocksHeadwear ? false : itemDB[item]._props.BlocksHeadwear;
                    itemDB[item]._props.BlocksEarpiece = config.FaceCover.removeBlocksEarpiece ? false : itemDB[item]._props.BlocksEarpiece;
                    itemDB[item]._props.BlocksFaceCover = config.FaceCover.removeBlocksFaceCover ? false : itemDB[item]._props.BlocksFaceCover;
                    itemDB[item]._props.BlocksEyewear = config.FaceCover.removeBlocksEyewear ? false : itemDB[item]._props.BlocksEyewear;
                    itemDB[item]._props.ConflictingItems = config.FaceCover.clearConflictingItems ? [] : itemDB[item]._props.ConflictingItems;
                }
                else if (itemHelper.isOfBaseclass(itemId, BaseClasses_1.BaseClasses.VISORS)) {
                    if (config.debug) {
                        logger.info(`[${this.modShortName}] adjusting item ${itemDB[item]._name} (id ${itemId} ) to match config values`);
                    }
                    itemDB[item]._props.BlocksHeadwear = config.Eyewear.removeBlocksHeadwear ? false : itemDB[item]._props.BlocksHeadwear;
                    itemDB[item]._props.BlocksEarpiece = config.Eyewear.removeBlocksEarpiece ? false : itemDB[item]._props.BlocksEarpiece;
                    itemDB[item]._props.BlocksFaceCover = config.Eyewear.removeBlocksFaceCover ? false : itemDB[item]._props.BlocksFaceCover;
                    itemDB[item]._props.BlocksEyewear = config.Eyewear.removeBlocksEyewear ? false : itemDB[item]._props.BlocksEyewear;
                    itemDB[item]._props.ConflictingItems = config.Eyewear.clearConflictingItems ? [] : itemDB[item]._props.ConflictingItems;
                }
                else if (config.faceShields.includes(itemId)) {
                    if (config.debug) {
                        logger.info(`[${this.modShortName}] adjusting item ${itemDB[item]._name} (id ${itemId} ) to match config values`);
                    }
                    itemDB[item]._props.BlocksHeadwear = config.FaceShields.removeBlocksHeadwear ? false : itemDB[item]._props.BlocksHeadwear;
                    itemDB[item]._props.BlocksEarpiece = config.FaceShields.removeBlocksEarpiece ? false : itemDB[item]._props.BlocksEarpiece;
                    itemDB[item]._props.BlocksFaceCover = config.FaceShields.removeBlocksFaceCover ? false : itemDB[item]._props.BlocksFaceCover;
                    itemDB[item]._props.BlocksEyewear = config.FaceShields.removeBlocksEyewear ? false : itemDB[item]._props.BlocksEyewear;
                    itemDB[item]._props.ConflictingItems = config.FaceShields.clearConflictingItems ? [] : itemDB[item]._props.ConflictingItems;
                }
            }
        }
        logger.info(`[${this.modShortName}] ${this.mod} Loaded`);
    }
}
module.exports = { mod: new LessRestrictingHeadwear() };
//# sourceMappingURL=mod.js.map