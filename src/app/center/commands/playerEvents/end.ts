import { MusicCenter } from '@struct/clients/MusicCenter'
import { Provider } from '@struct/clients/Provider'
import { Guild, TextChannel } from 'discord.js'
import { LavalinkEvent } from 'lavacord'

export default async (data: LavalinkEvent, center: MusicCenter, provider: Provider, guild: Guild) => {
    if(data.reason === 'REPLACED') {
        const queue = provider.queue.get(guild.id)
        if(!queue) return

        queue.pause = 0

        const channel = guild.channels.cache.get(queue.text) as TextChannel
        if(!channel) return
    
        const message = await channel.messages.fetch(provider.messages[0]).catch(() => {})
        if(message && message?.deletable) {
            provider.messages.splice(provider.messages.indexOf(provider.messages[0]), 1)
            await message.delete().catch(() => {})
        }

        return
    }
    
    const player = provider.manager.players.get(guild.id)
    if(!player) return

    const queue = provider.queue.get(guild.id)
    if(!queue) return
    
    queue.pause = 0

    const song = queue.songs[0]
    if(!song) return

    const channel = guild.channels.cache.get(queue.text) as TextChannel
    if(!channel) return

    const message = await channel.messages.fetch(provider.messages[0]).catch(() => {}) || undefined
    if(message && message?.deletable) {
        provider.messages.splice(provider.messages.indexOf(provider.messages[0]), 1)
        await message.delete().catch(() => {})
    }

    queue.lasts[queue.songs[0].track] = queue.songs[0]
    if(Object.keys(queue.lasts).length > 5) {
        delete queue.lasts[Object.keys(queue.lasts)[4]]
    }

    if(queue.loop) {
        queue.songs[0].info.start = Date.now()
        return player.play(queue.songs[0].track)
    }

    if(queue.loopQueue && queue.songs.length > 0) {
        queue.songs.push(queue.songs.shift()!)
        queue.songs[0].info.start = Date.now()
        return player.play(queue.songs[0].track)
    }

    queue.songs.shift()
    
    if(queue.songs.length >= 1) {
        queue.songs[0].info.start = Date.now()
        return player.play(queue.songs[0].track)
    } else {
        return provider.manager.leave(guild.id)
    }
}