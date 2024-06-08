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
const jsonc_1 = require("C:/snapshot/project/node_modules/jsonc");
const path = __importStar(require("path"));
const LogTextColor_1 = require("C:/snapshot/project/obj/models/spt/logging/LogTextColor");
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
class SeededRandom {
    m;
    a;
    s;
    constructor(seed) {
        this.m = 2 ** 35 - 31;
        this.a = 185852;
        this.s = seed % this.m;
    }
    random() {
        this.s = this.s * this.a % this.m;
        return this.s / this.m;
    }
}
/***
 * How this should work
 * 1. Generate a list of items that can be used to barter. And assign a value to each. Something like 15k rubles per value. Could also be randomized a bit for funsies.
 * 2. Convert the price of an item into value.
 * 3. Select items from the list of values that are reasonable. Repeat until cost has been exceeded by at least 1.
 * 4. Generate the barter.
*/
class BarterEconomy {
    logger;
    db;
    tables;
    handbookHelper;
    ragfairOfferGenerator;
    ragfairOfferHolder;
    ragfairOfferService;
    itemHelper;
    saveServer;
    jsonUtil;
    timeUtil;
    hashUtil;
    vfs;
    outputFolder;
    rng;
    allProfiles;
    allTraders;
    configServer;
    ragfairConfig;
    //Config
    config;
    barterList;
    locale;
    //Trader update
    setUpCompleted;
    tradersToUpdate;
    tradersLastUpdate;
    currentLogFile;
    static moneyIDs = [
        "5449016a4bdc2d6f028b456f",
        "569668774bdc2da2298b4568",
        "5696686a4bdc2da3298b456a"
    ];
    updateTraders(timeSinceLastRun, logger) {
        if (timeSinceLastRun > 30) {
            if (!this.setUpCompleted) {
                return false;
            }
            let timeNow = this.getTimeNow();
            const traders = this.tables.traders;
            for (let traderNum = 0; traderNum < this.tradersToUpdate.length; traderNum++) {
                if (timeNow > this.tradersLastUpdate[traderNum]) {
                    //Update base trader
                    if (this.config.writeLog) {
                        const date = this.timeUtil.getDate();
                        const time = this.timeUtil.getTime();
                        const dateString = `_${date}_${time}_`;
                        const nickname = traders[this.tradersToUpdate[traderNum]].base.nickname;
                        this.currentLogFile = "trades_" + dateString + nickname + ".txt";
                        this.writeLogFileLine("[Updating Trader:" + traders[this.tradersToUpdate[traderNum]].base.nickname + "]");
                        this.writeLogFileLine("-------------------------------------------");
                    }
                    this.printColor("[Barter Economy] Updating Trader:" + this.tradersToUpdate[traderNum], LogTextColor_1.LogTextColor.BLUE);
                    this.modifyTrader(this.tradersToUpdate[traderNum]);
                    //Update ragfair (flea market) 
                    this.ragfairOfferGenerator.generateFleaOffersForTrader(this.tradersToUpdate[traderNum]);
                    this.tradersLastUpdate[traderNum] = structuredClone(traders[this.tradersToUpdate[traderNum]].base.nextResupply);
                }
            }
            return true;
        }
        return false;
    }
    getTimeNow() {
        const time = new Date();
        const unixNow = time.valueOf();
        return Math.round(unixNow / 1000);
    }
    preAkiLoad(container) {
        // Get the logger from the server container.
        this.logger = container.resolve("WinstonLogger");
        // Get database from server.
        this.db = container.resolve("DatabaseServer");
        this.handbookHelper = container.resolve("HandbookHelper");
        this.ragfairOfferGenerator = container.resolve("RagfairOfferGenerator");
        this.ragfairOfferService = container.resolve("RagfairOfferService");
        this.ragfairOfferHolder = this.ragfairOfferService.ragfairOfferHandler;
        this.itemHelper = container.resolve("ItemHelper");
        this.saveServer = container.resolve("SaveServer");
        this.configServer = container.resolve("ConfigServer");
        this.ragfairConfig = this.configServer.getConfig(ConfigTypes_1.ConfigTypes.RAGFAIR);
        this.jsonUtil = container.resolve("JsonUtil");
        this.timeUtil = container.resolve("TimeUtil");
        this.hashUtil = container.resolve("HashUtil");
        this.vfs = container.resolve("VFS");
        const onUpdateModService = container.resolve("OnUpdateModService");
        const configFile = path.resolve(__dirname, "../config/config.jsonc");
        this.config = jsonc_1.jsonc.parse(this.vfs.readFile(configFile));
        this.locale = this.config.writeLogLocale ? this.config.writeLogLocale : "en";
        const preAkiModLoader = container.resolve("PreAkiModLoader");
        this.outputFolder = preAkiModLoader.getModPath("Leaves-BarterEconomy") + "output/";
        if (this.config.useSeed) {
            this.rng = new SeededRandom(this.config.seed);
        }
        onUpdateModService.registerOnUpdate("BarterEconomyUpdateTraders", (timeSinceLastRun) => this.updateTraders(timeSinceLastRun, this.logger), () => "BarterEconomyUpdateTraders" // new route name
        );
        //Flea market bartering stuff.
        this.allTraders = [];
        if (this.config.barterizeFleamarket) {
            this.ragfairConfig.dynamic.offerItemCount = this.config.offersPerItem;
            onUpdateModService.registerOnUpdate("BarterEconomyUpdateProfileList", (timeSinceLastRun) => this.updateProfileList(timeSinceLastRun, this.logger), () => "BarterEconomyUpdateProfileList" // new route name
            );
            this.updateProfileList(31, this.logger);
            this.ragfairOfferHolder.addOffer = this.addOfferOverride.bind(this); //Override the method to add barter offers to the ragfair.
        }
    }
    addOfferOverride(offer) {
        //this.printColor( "[Barter Economy] - Adding offer to ragfair from user " + offer.user.id, LogTextColor.GREEN );
        const trader = offer.user.id;
        const offerId = offer._id;
        const itemTpl = offer.items[0]._tpl;
        if (!this.allProfiles.includes(trader) && !this.allTraders.includes(trader)) {
            if (BarterEconomy.moneyIDs.includes(offer.requirements[0]._tpl)) {
                offer.requirements = this.generateBarter(offer.requirementsCost, offer.items[0]._tpl, offer.loyaltyLevel);
                //this.printColor( "[Barter Economy] - Generated barter for trader " + trader + " with ID " + offerId, LogTextColor.GREEN );
            }
        }
        this.ragfairOfferHolder.offersById.set(offerId, offer);
        this.ragfairOfferHolder.addOfferByTrader(trader, offer);
        this.ragfairOfferHolder.addOfferByTemplates(itemTpl, offer);
    }
    updateProfileList(timeSinceLastRun, logger) {
        if (timeSinceLastRun > 30) {
            this.allProfiles = [];
            for (const profile in this.saveServer.getProfiles()) {
                this.allProfiles.push(profile);
            }
            return true;
        }
        return false;
    }
    postDBLoad(container) {
        //Get tables once DB has loaded.
        this.tables = this.db.getTables();
        this.printColor("[Barter Economy] - Barter Economy Starting", LogTextColor_1.LogTextColor.GREEN);
        const traderIDs = this.config.tradersToBarter;
        const traders = this.db.getTables().traders;
        this.tradersToUpdate = [];
        this.tradersLastUpdate = [];
        //Print all existing traders, so players can see their IDs.
        this.printColor("[Barter Economy] All traders in the database:", LogTextColor_1.LogTextColor.YELLOW);
        for (let traderID in traders) {
            this.allTraders.push(traderID); //Add all traders to out list of traders. For use in ragfair.
            this.printColor("[Barter Economy] Trader ID: \"" + traderID + "\" - Nickname: " + traders[traderID].base.nickname, LogTextColor_1.LogTextColor.YELLOW);
        }
        //Let user know that they should load this mod after other traders.
        this.printColor("[Barter Economy] If you don't see the trader you're looking for.\nmake sure it's loaded BEFORE this mod.", LogTextColor_1.LogTextColor.YELLOW);
        for (let traderID of traderIDs) {
            //Check if trader exists
            if (!traders[traderID]) {
                this.printColor("[Barter Economy] Trader " + traderID + " does not exist in the database.", LogTextColor_1.LogTextColor.RED);
                continue;
            }
            this.tradersToUpdate.push(traderID);
            this.tradersLastUpdate.push(0);
        }
        this.barterList = this.generateBarterList();
        this.setUpCompleted = true;
    }
    getItemValue(ID) {
        return this.handbookHelper.getTemplatePrice(ID);
    }
    generateBarterList() {
        //Get all items in the game
        const items = this.db.getTables().templates.items;
        let barterList = {};
        for (const item of Object.values(items)) {
            //If quest item or not an item, we skip it.
            if (item._props.QuestItem || item._type != "Item") {
                continue;
            }
            //Check if the item is in the item blacklist
            if (this.config.itemBlacklist.includes(item._id)) {
                continue;
            }
            //Check if the item is the allowed categories.
            if (this.config.barterCategories[item._parent]) {
                const multiplier = this.config.barterCategories[item._parent].multi;
                let value = 0;
                if (this.config.manualTieredItems[item._id]) {
                    value = this.config.manualTieredItems[item._id];
                }
                else {
                    value = Math.ceil((this.getItemValue(item._id) * multiplier) / this.config.valueStep);
                    value = this.getClosestTier(value);
                }
                if (!barterList[value]) {
                    barterList[value] = [];
                }
                barterList[value].push(item._id);
            }
        }
        let barterListCopy = structuredClone(barterList);
        this.tempConvertToName(barterListCopy);
        if (this.config.dumpTiersToFile) {
            this.writeResult("barterList", barterListCopy, ".json", "[Barter Economy] -");
        }
        return barterList;
    }
    getClosestTier(currentTier) {
        const tiers = this.config.tiers;
        const highestTier = tiers[tiers.length - 1];
        //Check if it's already on an existing tier.
        if (tiers.includes(currentTier)) {
            return currentTier;
        }
        //Check if it's above the highest tier.
        if (currentTier >= highestTier) {
            return highestTier;
        }
        let closestDistance = 9999;
        let closestTier = 9999;
        for (const tier of tiers) {
            let tempDistance = Math.abs(currentTier - tier);
            if (tempDistance < closestDistance) {
                closestDistance = tempDistance;
                closestTier = tier;
            }
        }
        return closestTier;
    }
    tempConvertToName(barterList) {
        for (let value in barterList) {
            for (let i in barterList[value]) {
                let localeName = this.tables.locales.global.en[barterList[value][i] + " Name"];
                let parentLocaleName = this.tables.locales.global.en[this.tables.templates.items[barterList[value][i]]._parent + " Name"];
                barterList[value][i] = "[" + barterList[value][i] + "]-[" + localeName + "]-[" + parentLocaleName + "]";
            }
        }
    }
    getNextValueTier(current) {
        while (true) {
            current--;
            if (this.barterList[current]) {
                return current;
            }
            if (current <= 0) {
                return 1;
            }
        }
    }
    getRandomItemFromTier(tier) {
        const arrayLength = this.barterList[tier].length;
        const selected = this.getNumberBetweenZeroAnd(arrayLength);
        return selected;
    }
    generateNewItemIds(items) {
        let ids = {}; // this is a map / record / dictionary
        for (let item of items) {
            if (!ids[item._id]) {
                // add item id to change
                ids[item._id] = this.hashUtil.generate();
                //this.logger.error(`Found id ${item._id}, replace with: ${ids[item._id]}`);
            }
        }
        // replace the item ids
        for (const oldId in ids) {
            // not sure if this actually modifies the reference.
            // you might need a normal for(;;) loop here
            for (let item of items) {
                // update node id
                // not sure if debug messages of the server are shown in release mode, test this!
                if (item._id === oldId) {
                    item._id = ids[oldId];
                    //this.logger.error(`Replacing id ${item._id} with: ${ids[oldId]}`);
                }
                if (item.parentId && item.parentId === oldId) {
                    // update parent node id (if it exists)
                    item.parentId = ids[oldId];
                    //this.logger.error(`Replacing parent id ${item.parentId} with: ${ids[oldId]}`);
                }
            }
        }
    }
    adjustTrade(assort, trade) {
        let value = this.getTradeValue(assort, trade);
        const loyaltyLevel = this.getLoyaltyLevel(assort, trade);
        //Check if it's a barter
        if (!this.isMoneyTrade(assort, trade)) {
            //If it's a barter and we make a barter copy
            if (this.config.copyOverrideExistingBarters) {
                // Get children of item, they get copied too
                const tradeChildren = this.itemHelper.findAndReturnChildrenByItems(assort.items, trade._id);
                // Make a copy of the item and all it's children
                let newEntries = [];
                for (const node of assort.items) {
                    if (tradeChildren.includes(node._id)) {
                        newEntries.push(structuredClone(node));
                    }
                }
                //Give everything fresh and sparkling new IDs
                this.generateNewItemIds(newEntries);
                assort.items = assort.items.concat(newEntries); //<--- No
                const mainID = newEntries[0]._id;
                assort.barter_scheme[mainID] = [this.generateBarter(value, trade._tpl, loyaltyLevel)]; // Generate the actual barter. That's why I'm here - Obi Wan <---
                assort.loyal_level_items[mainID] = assort.loyal_level_items[trade._id]; //Its just an integer,so no need fo structuredCopy
            }
            //It is a barter, but we don't override.  
            if (!this.config.overrideExistingBarters) {
                return;
            }
        }
        //If the value is below cutoff
        if (value < this.config.valueCutoff) {
            return;
        }
        if (this.config.tradeBlacklist.includes(trade._id)) {
            return;
        }
        if (this.config.enableItemBlacklist && this.tradeIncludesItems(assort, trade, this.config.tradeItemBlacklist)) {
            return;
        }
        if (this.config.cashTradeEnabled && this.getNumberBetweenZeroAnd(100) / 100 < this.config.cashTradeChance) {
            value *= this.config.cashTradeMultiplier;
            if (value < this.config.cashTradeMinValue) {
                value = this.config.cashTradeMinValue;
            }
            const scheme = {
                count: value,
                _tpl: "5449016a4bdc2d6f028b456f"
            };
            assort.barter_scheme[trade._id][0] = [scheme];
            return;
        }
        assort.barter_scheme[trade._id][0] = this.generateBarter(value, trade._tpl, loyaltyLevel);
        return;
    }
    tradeIncludesItems(assort, trade, itemIDs) {
        const scheme = assort.barter_scheme[trade._id][0];
        for (const entry of scheme) {
            if (itemIDs.includes(entry._tpl)) {
                return true;
            }
        }
        return false;
    }
    isMoneyTrade(assort, trade) {
        //There are no trades that are bigger than one item that is a money trade.
        if (assort.barter_scheme[trade._id][0].length > 1) {
            return false;
        }
        for (const ID of BarterEconomy.moneyIDs) {
            if (assort.barter_scheme[trade._id][0][0]._tpl == ID) {
                return true;
            }
        }
        return false;
    }
    generateBarter(value, itemID, loyaltyLevel) {
        //All the barters of the current trade
        let barters = [];
        let currentTier = 0;
        let valueCredits = 0;
        //Check for overrides
        if (this.config.tradeValueOverrides[itemID] !== undefined) {
            valueCredits = this.config.tradeValueOverrides[itemID];
        }
        else //Use regular algorithm
         {
            valueCredits = Math.ceil((value / this.config.valueStep) * this.config.valueMultiplier) + this.config.valueExtraCost;
            valueCredits = Math.round(valueCredits * this.config.loyaltyMultiplier[loyaltyLevel - 1]);
        }
        if (valueCredits > this.config.maxBarterValue) {
            valueCredits = this.config.maxBarterValue;
        }
        if (this.config.writeLog) {
            this.writeLogFileLine(`\n\tLoyalty:${loyaltyLevel} value:${valueCredits} name:${this.getLocaleName(itemID)}`);
        }
        currentTier = this.getNextValueTier(valueCredits);
        let count = 1;
        while (true) {
            currentTier = this.getNextValueTier(valueCredits);
            if (currentTier >= this.config.randomTierdownStepStart) {
                const tierdownSteps = this.config.randomTierdownSteps;
                let downSteps = tierdownSteps[this.getNumberBetweenZeroAnd(tierdownSteps.length)];
                if (downSteps < 0) {
                    downSteps = 0;
                }
                for (let i = 0; i < downSteps; i++) {
                    currentTier = this.getNextValueTier(currentTier);
                }
            }
            let temp = {
                count: 1,
                _tpl: "5449016a4bdc2d6f028b456f"
            };
            //check if current exists (This should in theory never happen)
            if (currentTier <= 0) {
                break;
            }
            let selectedItem = 1;
            let selectedItemID = "";
            let attempts = 0;
            do {
                do {
                    selectedItem = this.getRandomItemFromTier(currentTier);
                    selectedItemID = this.barterList[currentTier][selectedItem];
                } while (selectedItemID == itemID && this.barterList[currentTier].length > 1); //Make sure there is more than one item on the tier, or we'll be stuck in an infinite loop.
                attempts++;
            } while (this.tradeHasItem(barters, selectedItemID) && attempts < 5);
            temp._tpl = selectedItemID;
            temp.count = Math.max(Math.floor(valueCredits / currentTier), 1);
            if (this.writeLogFileLine) {
                let line = "";
                line += `\t\tTier:${currentTier}`.padEnd(11);
                line += `\t\tcount:${temp.count}`.padEnd(11);
                line += `\titem:${this.getLocaleName(temp._tpl)}`;
                this.writeLogFileLine(line);
            }
            const maxItems = this.getNumberBetweenZeroAnd(this.config.maxRandomNumItems) + this.config.maxNumItems;
            if (temp.count > maxItems) {
                temp.count = maxItems;
            }
            //Add the selected item and count to the trade
            barters.push(temp);
            valueCredits -= currentTier * temp.count;
            if (valueCredits <= 0 || count > 5) {
                break;
            }
            count++;
        }
        return barters;
    }
    tradeHasItem(trade, itemID) {
        if (trade.length <= 0) {
            return false;
        }
        for (const entry of trade) {
            if (entry._tpl === itemID) {
                return true;
            }
        }
        return false;
    }
    getTradeValue(assort, trade) {
        let total = 0;
        if (assort.barter_scheme[trade._id] === undefined) {
            this.printColor(`Item ${trade._id} does not have a barter scheme. Defaulting to item value 1.`, LogTextColor_1.LogTextColor.RED);
            return 1;
        }
        for (const barter of assort.barter_scheme[trade._id][0]) {
            total += (this.getItemValue(barter._tpl) * barter.count);
        }
        //Check if this is lower than the item value, if so. We use that instead.
        const itemValue = this.getItemValue(trade._tpl);
        if (total < itemValue) {
            total = itemValue;
        }
        //Check if the item is above that setting.
        const maxValue = itemValue * this.config.maxValueOverHandbookMultiplier;
        if (total > maxValue) {
            total = maxValue;
        }
        return Math.round(total);
    }
    modifyTrader(traderID) {
        const itemDB = this.db.getTables().templates.items;
        const traders = this.db.getTables().traders;
        if (!traders[traderID].assort.items) {
            return;
        }
        for (const item of traders[traderID].assort.items) {
            if (item.parentId !== "hideout") {
                continue;
            }
            //check for invalid data
            if (!itemDB[item._tpl]) {
                //Item doesn't exist in the global item database
                this.printColor("[Limited Traders] Found trade with item that doesn't exist in the global database. This is most likely caused by a mod doing something wrong.", LogTextColor_1.LogTextColor.RED);
                this.printColor(`[Limited Traders] Item ID of broken trade is: ${item._tpl}`, LogTextColor_1.LogTextColor.RED);
                continue;
            }
            else if (!itemDB[item._tpl]._parent) {
                //Item exists but has no parent. 
                this.printColor("[Limited Traders] Found trade with item in the global database that has an invalid _parent entry. This is most likely caused by a mod doing something wrong.", LogTextColor_1.LogTextColor.RED);
                this.printColor("[Limited Traders] Item ID of broken item is: " + item._tpl, LogTextColor_1.LogTextColor.RED);
                continue;
            }
            //Check if the item is in the blacklist. 
            if (!this.config.traderCategoriesBlacklist.includes(itemDB[item._tpl]._parent)) {
                this.adjustTrade(traders[traderID].assort, item);
            }
        }
    }
    getNumberBetweenZeroAnd(max) {
        if (this.config.useSeed) {
            return Math.floor(this.rng.random() * max);
        }
        return Math.floor(Math.random() * max);
    }
    printColor(message, color = LogTextColor_1.LogTextColor.GREEN) {
        this.logger.logWithColor(message, color);
    }
    debugJsonOutput(jsonObject, label = "") {
        if (label.length > 0) {
            this.logger.logWithColor(`[${label}]`, LogTextColor_1.LogTextColor.GREEN);
        }
        this.logger.logWithColor(JSON.stringify(jsonObject, null, 4), LogTextColor_1.LogTextColor.MAGENTA);
    }
    writeResult(prefix, data, extension = ".json", messagePrefix = "") {
        // get formatted text to save
        const text = this.jsonUtil.serialize(data, true);
        // get file name
        const date = this.timeUtil.getDate();
        const time = this.timeUtil.getTime();
        const fileName = `${this.outputFolder + prefix}_${date}_${time}${extension}`;
        // save file
        this.vfs.writeFile(fileName, text);
        this.printColor(`${messagePrefix} Written results to: ${fileName}`, LogTextColor_1.LogTextColor.CYAN);
    }
    getLoyaltyLevel(assort, trade) {
        if (!assort.loyal_level_items[trade._id]) {
            this.printColor(`Item ${trade._id} does not have a loyalty level. Defaulting to 1.`, LogTextColor_1.LogTextColor.RED);
            return 1;
        }
        return assort.loyal_level_items[trade._id];
    }
    writeLogFileLine(line, reset = false) {
        const trader = this.currentLogFile;
        if (reset) {
            this.vfs.writeFile(this.outputFolder + this.currentLogFile, "");
        }
        this.vfs.writeFile(this.outputFolder + this.currentLogFile, `${line}\n`, true);
    }
    getLocaleName(ID) {
        if (!this.tables.locales.global[this.locale][`${ID} Name`]) {
            return "Unknown";
        }
        return this.tables.locales.global[this.locale][`${ID} Name`];
    }
}
module.exports = { mod: new BarterEconomy() };
//# sourceMappingURL=mod.js.map