import { GuildMember, TextChannel, VoiceState } from 'discord.js'
import { Provider, providers } from '../../../struct/clients/Provider'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import center from '../../../struct/clients/MusicCenter'
import Event from '../../../struct/base/Event'

export default new Event(
    'voiceStateUpdate',
    {},
    async (client: Provider, oldState: VoiceState, newState: VoiceState) => {
        if((newState && oldState && oldState.channel !== newState?.channel)) {
            const { guild, member, channel } = oldState
            if(!guild || !member || !channel) return

            const provider = guild.members.cache.get(client.user!.id) as GuildMember
            const get = providers.find(p => p.user!.id === provider.id)

            if(provider.voice?.channelId && provider.voice.channelId === channel.id) {
                if(channel.members.size === 1) {
                    await client.manager.leave(guild.id)

                    const text = center.channels.cache.get(client.queue.get(guild.id)!.text) as TextChannel
                    if(get) {
                        get.queue.delete(guild.id)
                        if(text) {
                            return text.send({
                                embeds: [ new MusicEmbed().leave(`В голосвом канале с ${get.user!.tag} не осталось участников...`) ]
                            }).catch(() => {})
                        }
                    }
                }
            }
        }

        if(newState?.channel === null) {
            const { guild, member, channel } = oldState
            if(!guild || !member || !channel) return

            const provider = guild.members.cache.get(client.user!.id) as GuildMember
            const get = providers.find(p => p.user!.id === provider.id)

            if(provider.id === member.id) {
                await client.manager.leave(guild.id)

                const queue = client.queue.get(guild.id)
                if(get) {
                    if(queue) {
                        const text = center.channels.cache.get(queue.text) as TextChannel
                        if(text) {
                            await text.send({
                                embeds: [ new MusicEmbed().leave(`В очереди ${get.user!.tag} больше не осталось треков...`) ]
                            }).catch(() => {})
                        }
                    }
                    get.queue.delete(guild.id)
                }
            }

            if(provider.voice?.channelId && provider.voice.channelId === channel.id) {
                if(channel.members.size === 1) {
                    await client.manager.leave(guild.id)

                    const text = center.channels.cache.get(client.queue.get(guild.id)!.text) as TextChannel
                    if(get) {
                        if(text) {
                            await text.send({
                                embeds: [ new MusicEmbed().leave(`В голосвом канале с ${get.user!.tag} не осталось участников...`) ]
                            }).catch(() => {})
                        }
                        get.queue.delete(guild.id)
                    }
                }
            }
        }
    }
)