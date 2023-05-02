import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { SelectMenuInteraction } from 'discord.js'
import { MusicActionRow } from '../../../struct/utils/MusicComponents'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Interaction from '../../../struct/base/Interaction'
import { boostFilter } from '../../FilterChoose'

export default new Interaction(
    'bass',
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

        const bass = boostFilter.find(c => c.value === menu.values[0])
        if(!bass) {
            return menu.editReply({
                embeds: [ new MusicEmbed().warn(`Произошла ошибка. Басс фильтр не найден.`) ]
            }).catch(() => {})
        }

        bass.start(menu.guild, player, queue)

        await menu.message.edit({
            embeds: [
                await new MusicEmbed().playerSong(get, player, queue.songs[0], client.util)
            ],
            components: new MusicActionRow().player(player, queue, get.user!.id)
        })
        
        return menu.editReply({
            embeds: [ new MusicEmbed().success(bass.description) ]
        })
    }
)