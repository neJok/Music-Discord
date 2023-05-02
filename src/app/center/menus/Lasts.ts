import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { SelectMenuInteraction } from 'discord.js'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Interaction from '../../../struct/base/Interaction'

export default new Interaction(
    'lasts',
    {
        voice: true
    },
    async (client: MusicCenter, menu: SelectMenuInteraction<'cached'>) => {
        await menu.deferReply({ ephemeral: true })

        const get = client.util.getVoiceProvider(menu.member, providers)

        if(!get) {
            return menu.editReply({
                embeds: [ new MusicEmbed().warn('С тобой рядом нет музыкального бота, которым ты можешь управлять!') ]
            })
        }

        if(get.user!.id !== menu.customId.split('.')[1]) {
            return menu.editReply({
                embeds: [ new MusicEmbed().warn('Это не ваш плеер!') ]
            })
        }

        const player = get.manager.players.get(menu.guild.id)
        const queue = get.queue.get(menu.guild.id)

        if(!player || (player && !player.paused && !player.playing) || (!queue || (queue && queue?.songs.length === 0))) {
            await menu.message.delete().catch(() => {})
            return menu.editReply({
                embeds: [ new MusicEmbed().warn(`Произошла ошибка. Сообщение было удалено.`) ]
            }).catch(() => {})
        }

        const lastTrack = Object.values(queue.lasts).find(t => t.info.uri === menu.values[0])
        if(!lastTrack) {
            return menu.editReply({
                embeds: [ new MusicEmbed().warn(`Трек не был найден :(`) ]
            }).catch(() => {})
        }

        delete queue.lasts[lastTrack.track]
        queue.songs.unshift(lastTrack)
        lastTrack.info.start = Date.now()
        await player.play(lastTrack.track)
        
        return menu.editReply({
            embeds: [ new MusicEmbed().success(`Вы вернулись к треку "${lastTrack.info.title}"`) ]
        })
    }
)