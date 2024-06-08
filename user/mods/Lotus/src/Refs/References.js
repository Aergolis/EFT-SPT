"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.References = void 0;
class References {
    modName;
    debug;
    container;
    preAkiModLoader;
    configServer;
    saveServer;
    itemHelper;
    logger;
    staticRouter;
    onUpdateModService;
    database;
    customItem;
    imageRouter;
    jsonUtil;
    profileHelper;
    ragfairPriceService;
    importerUtil;
    vfs;
    tables;
    botHelper;
    randomUtil;
    preAkiLoad(container, mod) {
        this.modName = mod;
        this.container = container;
        this.preAkiModLoader = container.resolve("PreAkiModLoader");
        this.imageRouter = container.resolve("ImageRouter");
        this.configServer = container.resolve("ConfigServer");
        this.saveServer = container.resolve("SaveServer");
        this.itemHelper = container.resolve("ItemHelper");
        this.logger = container.resolve("WinstonLogger");
        this.staticRouter = container.resolve("StaticRouterModService");
        this.onUpdateModService = container.resolve("OnUpdateModService");
        this.randomUtil = container.resolve("RandomUtil");
    }
    postDBLoad(container) {
        this.container = container;
        this.database = container.resolve("DatabaseServer");
        this.tables = container.resolve("DatabaseServer").getTables();
        this.customItem = container.resolve("CustomItemService");
        this.jsonUtil = container.resolve("JsonUtil");
        this.profileHelper = container.resolve("ProfileHelper");
        this.ragfairPriceService = container.resolve("RagfairPriceService");
        this.importerUtil = container.resolve("ImporterUtil");
        this.vfs = container.resolve("VFS");
        this.botHelper = container.resolve("BotHelper");
        this.randomUtil = container.resolve("RandomUtil");
        this.itemHelper = container.resolve("ItemHelper");
    }
}
exports.References = References;
//# sourceMappingURL=References.js.map