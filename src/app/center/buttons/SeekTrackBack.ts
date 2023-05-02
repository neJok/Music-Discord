import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { ButtonInteraction } from 'discord.js'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Interaction from '../../../struct/base/Interaction'

export default new Interaction(
    'backseek',
    {
        voice: true
    },
    async (client: MusicCenter, button: ButtonInteraction<'cached'>) => {
        await button.deferReply({ ephemeral: true, fetchReply: true })

        const get = client.util.getVoiceProvider(button.member, providers)

        if(!get) {
            return button.editReply({
                embeds: [ new MusicEmbed().warn('С тобой рядом нет музыкального бота, которым ты можешь управлять!') ]
            })
        }

        const player = get.manager.players.get(button.guild.id)
        const queue = get.queue.get(button.guild.id)

        if(!player || (player && !player.paused && !player.playing) || (!queue || (queue && queue?.songs.length === 0))) {
            return button.editReply({
                embeds: [ new MusicEmbed().warn(`Произошла ошибка. Сообщение было удалено.`) ]
            }).catch(() => {})
        }

        const status = (Date.now() - (queue.songs[0].info.start || 0)) > 10000

        await player.seek(status ? ((Date.now() - (queue.songs[0].info.start || 0))-10000) : 0)
        queue.songs[0].info.start = (status ? (queue.songs[0].info.start + 10000) : Date.now())

        return button.editReply({
            embeds: [ new MusicEmbed().success(`Вы ${status ? 'перемотали на 10 секунд назад' : 'вернулись в начало трека'}`) ]
        })
    }
)