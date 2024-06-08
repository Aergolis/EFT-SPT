"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Money_1 = require("C:/snapshot/project/obj/models/enums/Money");
const traderHelpers_1 = require("./traderHelpers");
const fluentTraderAssortCreator_1 = require("./fluentTraderAssortCreator");
const jsonc_1 = require("C:/snapshot/project/node_modules/jsonc");
const node_path_1 = __importDefault(require("node:path"));
let logger;
class Mod {
    //declare private variable db of DatabaseServer type
    db;
    traderHelper;
    fluentTraderAssortHelper;
    traderID;
    itemsJson;
    postDBLoad(container) {
        // Resolve containers
        const CustomItem = container.resolve("CustomItemService");
        const hashUtil = container.resolve("HashUtil");
        logger = container.resolve("WinstonLogger");
        this.db = container.resolve("DatabaseServer");
        this.traderHelper = new traderHelpers_1.TraderHelper();
        this.fluentTraderAssortHelper = new fluentTraderAssortCreator_1.FluentAssortConstructor(hashUtil, logger);
        // Get VFS to read in configs
        const vfs = container.resolve("VFS");
        const itemsJsonPath = node_path_1.default.resolve(__dirname, '../database/templates/items.jsonc');
        // Read the items.json file with type ItemsJson
        this.itemsJson = jsonc_1.jsonc.parse(vfs.readFile(itemsJsonPath));
        //set trader id we want to add assort items to
        this.traderID = "5a7c2eca46aef81a7ca2145d"; //existing trader Mechanic
        setupItems(this.itemsJson, CustomItem);
        handleAssorts(CustomItem, this.db, this.fluentTraderAssortHelper, this.traderID, this.itemsJson);
    }
    //Check if our item is in the server or not
    postAkiLoad(container) {
        ModifyAmmoPropForWeapons(this.db, this.itemsJson);
        logger.info("DoorBreacher: Finished Modifying Ammo Properties for Weapons");
    }
}
module.exports = { mod: new Mod() };
function setupItems(itemsjson, CustomItem) {
    //make locale for DoorBreacher
    const DoorBreacherLocale = {
        en: {
            name: "12/70 Door-Breaching Round",
            shortName: "Breach",
            description: "The door-breaching round is designed to destroy deadbolts, locks, and hinges without risking lives by ricocheting or penetrating through doors. These frangible rounds are made of a dense sintered material which can destroy a lock or hinge and then immediately disperse.",
        },
    };
    //add new custom item
    const DoorBreacher = {
        newItem: itemsjson.doorbreacher,
        fleaPriceRoubles: 8000,
        handbookPriceRoubles: 10000,
        handbookParentId: "5b47574386f77428ca22b33b",
        locales: DoorBreacherLocale,
    };
    //make locale for DoorBreacherBox
    const DoorBreacherBoxLocale = {
        en: {
            name: "12/70 Door-Breaching 5-Round Box",
            shortName: "Breach",
            description: "A 5-round box of 12ga door breaching shells. The door-breaching round is designed to destroy deadbolts, locks, and hinges without risking lives by ricocheting or penetrating through doors.  These frangible rounds are made of a dense sintered material which can destroy a lock or hinge and then immediately disperse.",
        },
    };
    //add new custom item
    const DoorBreacherBox = {
        newItem: itemsjson.doorbreacherbox,
        fleaPriceRoubles: 40000,
        handbookPriceRoubles: 50000,
        handbookParentId: "5b47574386f77428ca22b33c",
        locales: DoorBreacherBoxLocale,
    };
    //make locale for DoorBreacher
    const C4ExplosiveLocale = {
        en: {
            name: "C4 Explosive",
            shortName: "C4",
            description: "This C4 Explosive is used for breaching reinforced doors. It is a powerful explosive that is used in the military and law enforcement. It is a plastic explosive that is stable and safe to handle and triggered after a set timer.",
        },
    };
    //add new custom item
    const C4Explosive = {
        newItem: itemsjson.C4Explosive,
        fleaPriceRoubles: 25000,
        handbookPriceRoubles: 30000,
        handbookParentId: "5b47574386f77428ca22b2f2",
        locales: C4ExplosiveLocale,
    };
    //create the items
    CustomItem.createItem(DoorBreacher);
    CustomItem.createItem(DoorBreacherBox);
    CustomItem.createItem(C4Explosive);
}
function ModifyAmmoPropForWeapons(db, itemsJson) {
    const weaponProperties = [
        { name: "Chambers", index: 0 }, // Handles "patron_in_weapon" and its variants
        { name: "Cartridges", index: 1 }, // Directly under _props
    ];
    const is12GaugeAmmo = (filters) => {
        return filters ? filters.some(filter => filter.Filter?.includes("560d5e524bdc2d25448b4571")) : false;
    };
    const addDoorBreacher = (item, filters, weaponPropName) => {
        logger.info(`DoorBreacher added to: ${item._name} in weaponPropName: ${weaponPropName}`);
        filters[0].Filter.push(itemsJson.doorbreacher._id.toString());
    };
    const processChambers = (item, weaponPropName) => {
        const chambers = item._props[weaponPropName];
        if (!chambers || chambers.length === 0) {
            return;
        }
        for (const chamber of chambers) {
            if (!chamber._props.filters || chamber._props.filters.length === 0) {
                return;
            }
            if (is12GaugeAmmo(chamber._props.filters)) {
                addDoorBreacher(item, chamber._props.filters, weaponPropName);
            }
        }
    };
    const processCartridges = (item, weaponPropName) => {
        const cartridges = item._props[weaponPropName];
        if (!cartridges || cartridges.length === 0) {
            return;
        }
        if (!cartridges[0]._props.filters || cartridges[0]._props.filters.length === 0) {
            return;
        }
        if (is12GaugeAmmo(cartridges[0]._props.filters)) {
            addDoorBreacher(item, cartridges[0]._props.filters, weaponPropName);
        }
    };
    // Iterate over all items
    for (const item of Object.values(db.getTables().templates.items)) {
        for (const prop of weaponProperties) {
            if (prop.name === "Chambers" && item._props[prop.name]) {
                processChambers(item, prop.name);
            }
            else if (prop.name === "Cartridges" && item._props[prop.name]) {
                processCartridges(item, prop.name);
            }
        }
    }
}
function handleAssorts(CustomItem, db, assortHelper, traderID, itemsjson) {
    const targetTrader = db.getTables().traders[traderID];
    //create assort for doorbreacher. no money, add barter only later
    assortHelper
        .createSingleAssortItem(itemsjson.doorbreacher._id)
        .addStackCount(100)
        .addUnlimitedStackCount()
        .addLoyaltyLevel(1)
        .addMoneyCost(Money_1.Money.ROUBLES, 10000)
        .export(targetTrader);
    //create assort for doorbreacherbox - no assort since no other trader sells a packl
    // assortHelper
    //   .createSingleAssortItem(itemsjson.doorbreacherbox._id)
    //   .addStackCount(100)
    //   .addUnlimitedStackCount()
    //   .addLoyaltyLevel(1)
    //   .addMoneyCost(Money.ROUBLES, 50000)
    //   .export(targetTrader);
    //create barter item for doorbreacher
    const electricWire = "5c06779c86f77426e00dd782";
    assortHelper
        .createSingleAssortItem(itemsjson.doorbreacher._id)
        .addStackCount(100)
        .addUnlimitedStackCount()
        .addBarterCost(electricWire, 1)
        .addLoyaltyLevel(1)
        .export(targetTrader);
}
//# sourceMappingURL=mod.js.map