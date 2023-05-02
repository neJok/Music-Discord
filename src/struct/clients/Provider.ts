import { Client, Collection, GatewayDispatchEvents } from 'discord.js'
import { LavasfyClient } from 'lavasfy'
import { Manager } from 'lavacord'
import EventHandler from '../handlers/EventHandler'
import Queue from '@customTypes/struct/queue/Queue'
import * as config from '../../config'
import Logger from '../utils/Logger'
import Track from '@customTypes/lib/Track'

export class Provider extends Client {
    readonly config = config
    public queue: Collection<string, Queue> = new Collection()
    public logger: Logger = new Logger()
    public lasts: Track[] = []
    public spotify!: LavasfyClient
    public events: EventHandler
    public manager!: Manager
    public token: string
    public messages: string[] = []

    constructor(token: string) {
        super(
            {
                intents: config.intents
            }
        )

        this.events = new EventHandler(this, 'providers')
        this.token = token
    }

    async start(i: number) {
        this.events.load()

        await this.login(this.token).then(() => {
            this.logger.login(`${this.user!.tag} зашел в сеть`)

            const client = this
            
            this.manager = new Manager(
                [
                    {
                        id: String(i+1),
                        password: config.lavalink.password,
                        host: config.lavalink.host.ip,
                        port: config.lavalink.host.port
                    }
                ],
                {
                    user: this.user!.id,
                    async send(packet) {
                        const guild = client.guilds.cache.get(packet.d.guild_id)
                        if (guild) guild.shard.send(packet)
                    }
                }
            )
            .on('ready', node => this.logger.success(`Node ${node.host}:${node.port} (${i+1}) подключена`))
            .on('error', (error, node) => {this.logger.error(error)})

            this.ws
            .on(GatewayDispatchEvents.VoiceServerUpdate, this.manager.voiceServerUpdate.bind(this.manager))
            .on(GatewayDispatchEvents.VoiceStateUpdate, this.manager.voiceStateUpdate.bind(this.manager))

            this.spotify = new LavasfyClient(
                {
                    clientID: 'aa436e9448d8408e93785c4b622b3b31',
                    clientSecret: '53139232c0fc40788d3b89d80c7814d0'
                }, [...[...this.manager.nodes.values()]]
            )
        })
    }
}

export const providers: Collection<string, Provider> = new Collection()

export const startProviders = () => {
    config.providers.map(async (token, i) => {
        const provider = new Provider(token)
        await provider.start(i)

        providers.set(provider.user!.id, provider)
    })
}