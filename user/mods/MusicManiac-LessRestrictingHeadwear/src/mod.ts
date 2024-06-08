import { DependencyContainer } from "tsyringe";
import { Ilogger } from "@spt-aki/models/spt/utils/Ilogger";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { BaseClasses } from "@spt-aki/models/enums/BaseClasses";

import { VFS } from "@spt-aki/utils/VFS";
import { jsonc } from "jsonc";
import path from "path";

class LessRestrictingHeadwear implements IPostDBLoadMod
{
	public mod: string;
    public modShortName: string;

	constructor() {
        this.mod = "MusicManiac - Less Restricting Headwear";
        this.modShortName = "LessRestrictingHeadwear";
	}

	public postDBLoad(container: DependencyContainer): void 
	{
		const logger = container.resolve<Ilogger>("WinstonLogger");
		const db = container.resolve<DatabaseServer>("DatabaseServer");
		const tables = db.getTables();    
		const itemDB = tables.templates.items;
		const itemHelper = container.resolve<ItemHelper>("ItemHelper");

		const vfs = container.resolve<VFS>("VFS");
		const config = jsonc.parse(vfs.readFile(path.resolve(__dirname, "../config.jsonc")));
		
		for (let item in itemDB) {
			if (itemDB[item]._type !== "Node") {
				const itemId = itemDB[item]._id
				if (itemHelper.isOfBaseclass(itemId, BaseClasses.HEADWEAR)) {
					if (config.debug) {
						logger.info(`[${this.modShortName}] adjusting item ${itemDB[item]._name} (id ${itemId} ) to match config values`);
					}
					itemDB[item]._props.BlocksHeadwear = config.Headwear.removeBlocksHeadwear ? false : itemDB[item]._props.BlocksHeadwear;
					itemDB[item]._props.BlocksEarpiece = config.Headwear.removeBlocksEarpiece ? false : itemDB[item]._props.BlocksEarpiece;
					itemDB[item]._props.BlocksFaceCover = config.Headwear.removeBlocksFaceCover ? false : itemDB[item]._props.BlocksFaceCover;
					itemDB[item]._props.BlocksEyewear = config.Headwear.removeBlocksEyewear ? false : itemDB[item]._props.BlocksEyewear;
					itemDB[item]._props.ConflictingItems = config.Headwear.clearConflictingItems ? [] : itemDB[item]._props.ConflictingItems;
				} else if (itemHelper.isOfBaseclass(itemId, BaseClasses.HEADPHONES)) {
					if (config.debug) {
						logger.info(`[${this.modShortName}] adjusting item ${itemDB[item]._name} (id ${itemId} ) to match config values`);
					}
					itemDB[item]._props.BlocksHeadwear = config.Earpiece.removeBlocksHeadwear ? false : itemDB[item]._props.BlocksHeadwear;
					itemDB[item]._props.BlocksEarpiece = config.Earpiece.removeBlocksEarpiece ? false : itemDB[item]._props.BlocksEarpiece;
					itemDB[item]._props.BlocksFaceCover = config.Earpiece.removeBlocksFaceCover ? false : itemDB[item]._props.BlocksFaceCover;
					itemDB[item]._props.BlocksEyewear = config.Earpiece.removeBlocksEyewear ? false : itemDB[item]._props.BlocksEyewear;
					itemDB[item]._props.ConflictingItems = config.Earpiece.clearConflictingItems ? [] : itemDB[item]._props.ConflictingItems;
				} else if (itemHelper.isOfBaseclass(itemId, BaseClasses.FACECOVER)) {
					if (config.debug) {
						logger.info(`[${this.modShortName}] adjusting item ${itemDB[item]._name} (id ${itemId} ) to match config values`);
					}
					itemDB[item]._props.BlocksHeadwear = config.FaceCover.removeBlocksHeadwear ? false : itemDB[item]._props.BlocksHeadwear;
					itemDB[item]._props.BlocksEarpiece = config.FaceCover.removeBlocksEarpiece ? false : itemDB[item]._props.BlocksEarpiece;
					itemDB[item]._props.BlocksFaceCover = config.FaceCover.removeBlocksFaceCover ? false : itemDB[item]._props.BlocksFaceCover;
					itemDB[item]._props.BlocksEyewear = config.FaceCover.removeBlocksEyewear ? false : itemDB[item]._props.BlocksEyewear;
					itemDB[item]._props.ConflictingItems = config.FaceCover.clearConflictingItems ? [] : itemDB[item]._props.ConflictingItems;
				} else if (itemHelper.isOfBaseclass(itemId, BaseClasses.VISORS)) {
					if (config.debug) {
						logger.info(`[${this.modShortName}] adjusting item ${itemDB[item]._name} (id ${itemId} ) to match config values`);
					}
					itemDB[item]._props.BlocksHeadwear = config.Eyewear.removeBlocksHeadwear ? false : itemDB[item]._props.BlocksHeadwear;
					itemDB[item]._props.BlocksEarpiece = config.Eyewear.removeBlocksEarpiece ? false : itemDB[item]._props.BlocksEarpiece;
					itemDB[item]._props.BlocksFaceCover = config.Eyewear.removeBlocksFaceCover ? false : itemDB[item]._props.BlocksFaceCover;
					itemDB[item]._props.BlocksEyewear = config.Eyewear.removeBlocksEyewear ? false : itemDB[item]._props.BlocksEyewear;
					itemDB[item]._props.ConflictingItems = config.Eyewear.clearConflictingItems ? [] : itemDB[item]._props.ConflictingItems;
				} else if (config.faceShields.includes(itemId)) {
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

module.exports = { mod: new LessRestrictingHeadwear() }