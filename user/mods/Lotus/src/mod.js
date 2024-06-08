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
const LogTextColor_1 = require("C:/snapshot/project/obj/models/spt/logging/LogTextColor");
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const Traders_1 = require("C:/snapshot/project/obj/models/enums/Traders");
const ItemGenerator_1 = require("./CustomItems/ItemGenerator");
const References_1 = require("./Refs/References");
const Lotus_1 = require("./Trader/Lotus");
const Utils_1 = require("./Refs/Utils");
const baseJson = __importStar(require("../db/base.json"));
const questAssort = __importStar(require("../db/questassort.json"));
class Lotus {
    mod;
    logger;
    ref = new References_1.References();
    utils = new Utils_1.Utils(this.ref);
    constructor() {
        this.mod = "Lotus";
    }
    preAkiLoad(container) {
        this.logger = container.resolve("WinstonLogger");
        this.logger.debug(`[${this.mod}] preAki Loading... `);
        this.ref.preAkiLoad(container, "Lotus");
        const jsonUtil = container.resolve("JsonUtil");
        const configServer = container.resolve("ConfigServer");
        const ragfair = configServer.getConfig("aki-ragfair");
        const traderConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.TRADER);
        const traderUtils = new Utils_1.TraderUtils();
        const traderData = new Lotus_1.TraderData(traderConfig, this.ref, traderUtils, jsonUtil);
        traderData.registerProfileImage();
        traderData.setupTraderUpdateTime();
        Traders_1.Traders[baseJson._id] = baseJson._id;
        ragfair.traders[baseJson._id] = true;
        this.logger.debug(`[${this.mod}] preAki Loaded`);
    }
    postDBLoad(container) {
        this.logger.debug(`[${this.mod}] postDb Loading... `);
        const databaseServer = container.resolve("DatabaseServer");
        const configServer = container.resolve("ConfigServer");
        const jsonUtil = container.resolve("JsonUtil");
        const newItem = container.resolve("CustomItemService");
        const traderConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.TRADER);
        const itemGenerator = new ItemGenerator_1.ItemGenerator();
        const traderUtils = new Utils_1.TraderUtils();
        const traderData = new Lotus_1.TraderData(traderConfig, this.ref, traderUtils, jsonUtil);
        const Ragfair = configServer.getConfig("aki-ragfair");
        const tables = databaseServer.getTables();
        const logger = container.resolve("WinstonLogger");
        const locations = tables.locations;
        traderData.pushTrader();
        tables.traders[baseJson._id].questassort = questAssort;
        traderData.addTraderToLocales(tables, baseJson.name, "Lotus", baseJson.nickname, baseJson.location, "A businesswoman who travels around conflict zones around the world.");
        itemGenerator.createLotusKeycard(newItem, this.utils, tables);
        Ragfair.dynamic.blacklist.custom.push(...["LotusKeycard"]);
        locations["laboratory"].base.AccessKeys.push(...["LotusKeycard"]);
        this.logger.debug(`[${this.mod}] postDb Loaded`);
        logger.log("Lotus arrived in Tarkov.", LogTextColor_1.LogTextColor.GREEN);
        logger.log("Thanks for using my trader!", LogTextColor_1.LogTextColor.GREEN);
    }
}
module.exports = { mod: new Lotus() };
//# sourceMappingURL=mod.js.map