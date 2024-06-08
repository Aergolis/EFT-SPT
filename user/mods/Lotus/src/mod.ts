import { DependencyContainer }  from "tsyringe";

import { IPreAkiLoadMod }       from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod }       from "@spt-aki/models/external/IPostDBLoadMod";
import { ILogger }              from "@spt-aki/models/spt/utils/ILogger";
import { LogTextColor }         from "@spt-aki/models/spt/logging/LogTextColor";
import { DatabaseServer }       from "@spt-aki/servers/DatabaseServer";
import { ConfigServer }         from "@spt-aki/servers/ConfigServer";
import { ConfigTypes }          from "@spt-aki/models/enums/ConfigTypes";
import { ITraderConfig }        from "@spt-aki/models/spt/config/ITraderConfig";
import { JsonUtil }             from "@spt-aki/utils/JsonUtil";
import { Traders }              from "@spt-aki/models/enums/Traders";
import { CustomItemService }    from "@spt-aki/services/mod/CustomItemService";
import { ItemGenerator }        from "./CustomItems/ItemGenerator";
import { References }           from "./Refs/References";
import { TraderData }           from "./Trader/Lotus";
import { TraderUtils, Utils }   from "./Refs/Utils";

import * as baseJson            from "../db/base.json";
import * as questAssort         from "../db/questassort.json";

class Lotus implements IPreAkiLoadMod, IPostDBLoadMod {
    mod: string;
    logger: ILogger;
    private ref: References = new References();
    private utils: Utils = new Utils(this.ref);

    constructor() {
        this.mod = "Lotus";
    }

    public preAkiLoad(container: DependencyContainer): void {
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.logger.debug(`[${this.mod}] preAki Loading... `);

        this.ref.preAkiLoad(container, "Lotus");
        const jsonUtil =        container.resolve<JsonUtil>("JsonUtil");
        const configServer =    container.resolve<ConfigServer>("ConfigServer");
        const ragfair =         configServer.getConfig("aki-ragfair");
        const traderConfig:     ITraderConfig = configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER);
        const traderUtils =     new TraderUtils();
        const traderData =      new TraderData(traderConfig, this.ref, traderUtils, jsonUtil);
        
        traderData.registerProfileImage();
        traderData.setupTraderUpdateTime();
        
		Traders[baseJson._id] = baseJson._id;
        ragfair.traders[baseJson._id] = true;

        this.logger.debug(`[${this.mod}] preAki Loaded`);
    }
    
    public postDBLoad(container: DependencyContainer): void {
        this.logger.debug(`[${this.mod}] postDb Loading... `);

        const databaseServer =  container.resolve<DatabaseServer>("DatabaseServer");
        const configServer =    container.resolve<ConfigServer>("ConfigServer");
        const jsonUtil =        container.resolve<JsonUtil>("JsonUtil");
        const newItem =         container.resolve<CustomItemService>("CustomItemService");
        const traderConfig :    ITraderConfig = configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER);
        const itemGenerator =   new ItemGenerator();
        const traderUtils =     new TraderUtils();
        const traderData =      new TraderData(traderConfig, this.ref, traderUtils, jsonUtil);

        const Ragfair =         configServer.getConfig("aki-ragfair");
        const tables =          databaseServer.getTables();
        const logger =          container.resolve("WinstonLogger");
        const locations =       tables.locations;

        traderData.pushTrader();
		tables.traders[baseJson._id].questassort = questAssort;
        traderData.addTraderToLocales(tables, baseJson.name, "Lotus", baseJson.nickname, baseJson.location, "A businesswoman who travels around conflict zones around the world.");

        itemGenerator.createLotusKeycard(newItem, this.utils, tables);
        Ragfair.dynamic.blacklist.custom.push(...["LotusKeycard"]);
        locations["laboratory"].base.AccessKeys.push(...["LotusKeycard"]);

        this.logger.debug(`[${this.mod}] postDb Loaded`);
		logger.log("Lotus arrived in Tarkov.", LogTextColor.GREEN);
        logger.log("Thanks for using my trader!", LogTextColor.GREEN);
    }
}

module.exports = { mod: new Lotus() }