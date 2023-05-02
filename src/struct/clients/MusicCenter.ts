import { Client as GeniusClient } from 'genius-lyrics'
import { Database } from '../../db/Database'
import { Client } from 'discord.js'
import CommandHandler from '../handlers/CommandHandler'
import InteractionHandler from '../handlers/InteractionHandler'
import EventHandler from '../handlers/EventHandler'
import * as config from '../../config'
import CenterUtil from './CenterUtil'
import Logger from '../utils/Logger'

export class MusicCenter extends Client {
    readonly config = config

    constructor() {
        super(
            {
                intents: config.intents
            }
        )

        this.events = new EventHandler(this, 'center')
    }

    genius = new GeniusClient(config.genius)
    
    commands: CommandHandler = new CommandHandler()
    buttons: InteractionHandler = new InteractionHandler('buttons')
    modals: InteractionHandler = new InteractionHandler('modals')
    menus: InteractionHandler = new InteractionHandler('menus')
    events: EventHandler

    util: CenterUtil = new CenterUtil(this)

    logger: Logger = new Logger()

    db: Database = new Database(this)

    async start() {        
        this.commands.load()
        this.buttons.load()
        this.modals.load()
        this.menus.load()
        this.events.load()

        return this.login(config.center).then(async () => {
            await this.initApplicationCommand()
            await this.db.connect()
            await this.db.init()
            this.logger.login(`Центральный бот '${this.user!.tag}' зашел в сеть`)
        })
    }

    async initApplicationCommand() {
        const guild = this.guilds.cache.get(config.meta.guild)
        if(guild) {
            await guild.members.fetch()
            guild.commands.set(this.commands.cache.map(c => c.options.data))
        } else return this.logger.error('Пригласите мьюзик центра на сервер дебилы')
    }
}

const center = new MusicCenter()
export default center