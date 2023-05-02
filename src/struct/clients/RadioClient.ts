import { Client, GatewayDispatchEvents } from 'discord.js'
import { Manager, Player } from 'lavacord'
import * as config from '../../config'
import Logger from '../utils/Logger'
import CenterUtil from './CenterUtil'

type TType = 'Lo-Fi' | 'Chill' | 'Phonk'

export default class RadioClient extends Client {
    public logger: Logger = new Logger()
    public manager!: Manager
    public type: string

    constructor(token: string, type: TType) {
        super(
            {
                intents: config.intents
            }
        )

        this.token = token
        this.type = type
    }

    async start(i: number) {
        await this.login(this.token!)
        .then(async () => {
            this.logger.login(`${this.user!.tag} зашел в сеть`)

            const client = this
            
            this.manager = new Manager(
                [
                    {
                        id: String(config.providers.length+i+1),
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
            .on('ready', async node => {
                this.logger.success(`Radio Node ${node.host}:${node.port} (${config.providers.length+i+1}) подключена`)
            })
            .on('error', (error, node) => {this.logger.error(error)})

            this.ws
            .on(GatewayDispatchEvents.VoiceServerUpdate, this.manager.voiceServerUpdate.bind(this.manager))
            .on(GatewayDispatchEvents.VoiceStateUpdate, this.manager.voiceStateUpdate.bind(this.manager))

            this.on('ready', async () => {
                await this.manager.connect()

                const player = await this.manager.join({
                    guild: config.meta.guild,
                    channel: config.radio.find(t => t.type === this.type)!.channelId,
                    node: String(config.providers.length+i+1)
                }, {
                    selfdeaf: true
                })
    
                const res = await CenterUtil.getSongs(this.manager, config.radio.find(t => t.type === this.type)!.url)
    
                await player.play(res.tracks[0].track, {volume: 100})
            })
        })
    }
}

export const startRadio = () => {
    config.radio.map(async (radio, i) => {
        const provider = new RadioClient(radio.token, radio.type as TType)
        await provider.start(i)
    })
}