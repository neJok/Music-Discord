import { MusicActionRow } from '../../../../struct/utils/MusicComponents'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { Provider } from '@struct/clients/Provider'
import { Guild, TextChannel } from 'discord.js'
import { LavalinkEvent } from 'lavacord'
import MusicEmbed from '../../../../struct/utils/MusicEmbed'

export default async (data: LavalinkEvent, center: MusicCenter, provider: Provider, guild: Guild) => {
    const player = provider.manager.players.get(guild.id)
    if(!player) return

    await player.pause(false)

    const queue = provider.queue.get(guild.id)
    if(!queue) return

    queue.pause = 0

    const song = queue.songs[0]
    if(!song) return

    const channel = guild.channels.cache.get(queue.text) as TextChannel
    if(!channel) return

    return channel.send({
        embeds: [ await new MusicEmbed().playerSong(provider, player, song, center.util) ],
        components: new MusicActionRow().player(player, queue, provider.user!.id)
    }).then((msg) => {
        provider.messages.push(msg.id)
        const int = setInterval(async () => {
            const member = guild.members.cache.get(provider.user!.id)
            if((member && !member?.voice?.channelId) || (provider.messages[0] && provider.messages[0] !== msg.id)) {
                const message = (await channel.messages.fetch({message: msg.id}).catch(() => {})) || undefined
                if(message && message?.deletable) {
                    provider.messages.shift()
                    await message.delete().catch(() => {})
                }
                clearInterval(int)
                return
            }

            const message = (await channel.messages.fetch({message: msg.id}).catch(() => {})) || undefined
            if(message && message?.editable) {
                return message.edit({
                    embeds: [ await new MusicEmbed().playerSong(provider, player, song, center.util) ],
                    components: new MusicActionRow().player(player, queue, provider.user!.id)
                }).catch(() => {})
            } else {
                const message = (await channel.messages.fetch({message: msg.id}).catch(() => {})) || undefined
                if(message && message?.deletable) {
                    provider.messages.shift()
                    await message.delete().catch(() => {})
                }
                clearInterval(int)
                return
            }
        }, 5_000)
    })
}