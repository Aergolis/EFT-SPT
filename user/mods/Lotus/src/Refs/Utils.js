"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssortUtils = exports.TraderUtils = exports.Utils = void 0;
const path = __importStar(require("path"));
const fs = require('fs');
class Utils {
    ref;
    constructor(ref) {
        this.ref = ref;
    }
    randomCount(base, random) {
        return (base + Math.floor(Math.random() * random * 2) - random);
    }
    loadFiles(dirPath, extName, cb) {
        if (!fs.existsSync(dirPath))
            return;
        const dir = fs.readdirSync(dirPath, { withFileTypes: true });
        dir.forEach(item => {
            const itemPath = path.normalize(`${dirPath}/${item.name}`);
            if (item.isDirectory())
                this.loadFiles(itemPath, extName, cb);
            else if (extName.includes(path.extname(item.name)))
                cb(itemPath);
        });
    }
    shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }
    shufflePop(array) {
        return this.shuffle(array).pop().toString;
    }
    shuffleShift(array) {
        return this.shuffle(array).shift().toString;
    }
    shufflePullTwo(array) {
        return this.shuffle(array).pop().toString() && this.shuffle(array).shift().toString();
    }
    addToCases(tables, caseToAdd, itemToAdd) {
        const items = tables.templates.items;
        for (let item in items) {
            if (items[item]._id === caseToAdd) {
                if (items[item]._props?.Grids[0]._props.filters[0].Filter !== null) {
                    items[item]._props?.Grids[0]._props.filters[0].Filter.push(itemToAdd);
                }
            }
        }
    }
    stopHurtingMeSVM(tables, caseToAdd) {
        const unbreakFilters = [
            {
                "Filter": ["54009119af1c881c07000029"],
                "ExcludedFilter": [""]
            }
        ];
        tables.templates.items[caseToAdd]._props.Grids[0]._props.filters = unbreakFilters;
    }
}
exports.Utils = Utils;
//
//
//
class TraderUtils {
    /**
    * Add profile picture to our trader
    * @param baseJson json file for trader (db/base.json)
    * @param preAkiModLoader mod loader class - used to get the mods file path
    * @param imageRouter image router class - used to register the trader image path so we see their image on trader page
    * @param traderImageName Filename of the trader icon to use
    */
    registerProfileImage(baseJson, modName, preAkiModLoader, imageRouter, traderImageName) {
        // Reference the mod "res" folder
        const imageFilepath = `./${preAkiModLoader.getModPath(modName)}res`;
        // Register a route to point to the profile picture - remember to remove the .jpg from it
        imageRouter.addRoute(baseJson.avatar.replace(".jpg", ""), `${imageFilepath}/${traderImageName}`);
    }
    /**
     * Add record to trader config to set the refresh time of trader in seconds (default is 60 minutes)
     * @param traderConfig trader config to add our trader to
     * @param baseJson json file for trader (db/base.json)
     * @param refreshTimeSeconds How many sections between trader stock refresh
     */
    setTraderUpdateTime(traderConfig, baseJson, minSeconds, maxSeconds) {
        // Add refresh time in seconds to config
        const traderRefreshRecord = {
            traderId: baseJson._id,
            seconds: {
                min: minSeconds,
                max: maxSeconds
            }
        };
        traderConfig.updateTime.push(traderRefreshRecord);
    }
    addTraderToDb(traderDetailsToAdd, assort, tables, jsonUtil) {
        tables.traders[traderDetailsToAdd._id] = {
            assort: jsonUtil.deserialize(jsonUtil.serialize(assort)),
            base: jsonUtil.deserialize(jsonUtil.serialize(traderDetailsToAdd)),
            questassort: {
                started: {},
                success: {},
                fail: {}
            }
        };
    }
    /**
     * Add our new trader to the database
     * @param traderDetailsToAdd trader details
     * @param tables database
     * @param jsonUtil json utility class
     */
    // rome-ignore lint/suspicious/noExplicitAny: traderDetailsToAdd comes from base.json, so no type
    addTraderToDbCustomAssort(traderDetailsToAdd, tables, jsonUtil) {
        // Add trader to trader table, key is the traders id
        tables.traders[traderDetailsToAdd._id] = {
            assort: this.createAssortTable(), // assorts are the 'offers' trader sells, can be a single item (e.g. carton of milk) or multiple items as a collection (e.g. a gun)
            base: jsonUtil.deserialize(jsonUtil.serialize(traderDetailsToAdd)), // Deserialise/serialise creates a copy of the json and allows us to cast it as an ITraderBase
            questassort: {
                started: {},
                success: {},
                fail: {}
            } // questassort is empty as trader has no assorts unlocked by quests
        };
    }
    /**
     * Create basic data for trader + add empty assorts table for trader
     * @param tables SPT db
     * @param jsonUtil SPT JSON utility class
     * @returns ITraderAssort
     */
    createAssortTable() {
        // Create a blank assort object, ready to have items added
        const assortTable = {
            nextResupply: 0,
            items: [],
            barter_scheme: {},
            loyal_level_items: {}
        };
        return assortTable;
    }
    /**
    * Add traders name/location/description to the locale table
    * @param baseJson json file for trader (db/base.json)
    * @param tables database tables
    * @param fullName Complete name of trader
    * @param firstName First name of trader
    * @param nickName Nickname of trader
    * @param location Location of trader (e.g. "Here in the cat shop")
    * @param description Description of trader
    */
    addTraderToLocales(baseJson, tables, fullName, firstName, nickName, location, description) {
        // For each language, add locale for the new trader
        const locales = Object.values(tables.locales.global);
        for (const locale of locales) {
            locale[`${baseJson._id} FullName`] = fullName;
            locale[`${baseJson._id} FirstName`] = firstName;
            locale[`${baseJson._id} Nickname`] = nickName;
            locale[`${baseJson._id} Location`] = location;
            locale[`${baseJson._id} Description`] = description;
        }
    }
}
exports.TraderUtils = TraderUtils;
//
//
//
class AssortUtils {
    itemsToSell = [];
    barterScheme = {};
    loyaltyLevel = {};
    hashUtil;
    logger;
    constructor(hashutil, logger) {
        this.hashUtil = hashutil;
        this.logger = logger;
    }
    /**
     * Start selling item with tpl
     * @param itemTpl Tpl id of the item you want trader to sell
     * @param itemId Optional - set your own Id, otherwise unique id will be generated
     */
    createSingleAssortItem(itemTpl, itemId = undefined) {
        // Create item ready for insertion into assort table
        const newItemToAdd = {
            _id: !itemId ? this.hashUtil.generate() : itemId,
            _tpl: itemTpl,
            parentId: "hideout", // Should always be "hideout"
            slotId: "hideout", // Should always be "hideout"
            upd: {
                UnlimitedCount: false,
                StackObjectsCount: 100
            }
        };
        this.itemsToSell.push(newItemToAdd);
        return this;
    }
    createComplexAssortItem(items) {
        items[0].parentId = "hideout";
        items[0].slotId = "hideout";
        if (!items[0].upd) {
            items[0].upd = {};
        }
        items[0].upd.UnlimitedCount = false;
        items[0].upd.StackObjectsCount = 100;
        this.itemsToSell.push(...items);
        return this;
    }
    addStackCount(stackCount) {
        this.itemsToSell[0].upd.StackObjectsCount = stackCount;
        return this;
    }
    addUnlimitedStackCount() {
        this.itemsToSell[0].upd.StackObjectsCount = 999999;
        this.itemsToSell[0].upd.UnlimitedCount = true;
        return this;
    }
    makeStackCountUnlimited() {
        this.itemsToSell[0].upd.StackObjectsCount = 999999;
        return this;
    }
    addBuyRestriction(maxBuyLimit) {
        this.itemsToSell[0].upd.BuyRestrictionMax = maxBuyLimit;
        this.itemsToSell[0].upd.BuyRestrictionCurrent = 0;
        return this;
    }
    addLoyaltyLevel(level) {
        this.loyaltyLevel[this.itemsToSell[0]._id] = level;
        return this;
    }
    addMoneyCost(currencyType, amount) {
        this.barterScheme[this.itemsToSell[0]._id] = [
            [
                {
                    count: amount,
                    _tpl: currencyType
                }
            ]
        ];
        return this;
    }
    addBarterCost(itemTpl, count) {
        const sellableItemId = this.itemsToSell[0]._id;
        // No data at all, create
        if (Object.keys(this.barterScheme).length === 0) {
            this.barterScheme[sellableItemId] = [[
                    {
                        count: count,
                        _tpl: itemTpl
                    }
                ]];
        }
        else {
            // Item already exists, add to
            const existingData = this.barterScheme[sellableItemId][0].find(x => x._tpl === itemTpl);
            if (existingData) {
                // itemtpl already a barter for item, add to count
                existingData.count += count;
            }
            else {
                // No barter for item, add it fresh
                this.barterScheme[sellableItemId][0].push({
                    count: count,
                    _tpl: itemTpl
                });
            }
        }
        return this;
    }
    /**
     * Reset object ready for reuse
     * @returns
     */
    export(data, blockDupes) {
        const itemBeingSoldId = this.itemsToSell[0]._id;
        const itemBeingSoldTpl = this.itemsToSell[0]._tpl;
        if (blockDupes) {
            if (data.assort.items.find(x => x._id === itemBeingSoldId)) {
                return;
            }
            if (data.assort.items.find(x => x._tpl === itemBeingSoldTpl)) {
                return;
            }
        }
        data.assort.items.push(...this.itemsToSell);
        data.assort.barter_scheme[itemBeingSoldId] = this.barterScheme[itemBeingSoldId];
        data.assort.loyal_level_items[itemBeingSoldId] = this.loyaltyLevel[itemBeingSoldId];
        this.itemsToSell = [];
        this.barterScheme = {};
        this.loyaltyLevel = {};
        return this;
    }
    pushFromTraderAssort(items, itemTpl, count, stackCount, level, data, blockDupes) {
        items[0].parentId = "hideout";
        items[0].slotId = "hideout";
        if (!items[0].upd) {
            items[0].upd = {};
        }
        items[0].upd.UnlimitedCount = false;
        items[0].upd.StackObjectsCount = 100;
        this.itemsToSell.push(...items);
        const sellableItemId = this.itemsToSell[0]._id;
        // No data at all, create
        if (Object.keys(this.barterScheme).length === 0) {
            this.barterScheme[sellableItemId] = [[
                    {
                        count: count,
                        _tpl: itemTpl
                    }
                ]];
        }
        else {
            // Item already exists, add to
            const existingData = this.barterScheme[sellableItemId][0].find(x => x._tpl === itemTpl);
            if (existingData) {
                // itemtpl already a barter for item, add to count
                existingData.count += count;
            }
            else {
                // No barter for item, add it fresh
                this.barterScheme[sellableItemId][0].push({
                    count: count,
                    _tpl: itemTpl
                });
            }
        }
        this.itemsToSell[0].upd.StackObjectsCount = stackCount;
        this.loyaltyLevel[this.itemsToSell[0]._id] = level;
        const itemBeingSoldId = this.itemsToSell[0]._id;
        const itemBeingSoldTpl = this.itemsToSell[0]._tpl;
        if (blockDupes) {
            if (data.assort.items.find(x => x._id === itemBeingSoldId)) {
                return;
            }
            if (data.assort.items.find(x => x._tpl === itemBeingSoldTpl)) {
                return;
            }
        }
        data.assort.items.push(...this.itemsToSell);
        data.assort.barter_scheme[itemBeingSoldId] = this.barterScheme[itemBeingSoldId];
        data.assort.loyal_level_items[itemBeingSoldId] = this.loyaltyLevel[itemBeingSoldId];
        this.itemsToSell = [];
        this.barterScheme = {};
        this.loyaltyLevel = {};
    }
}
exports.AssortUtils = AssortUtils;
//# sourceMappingURL=Utils.js.map