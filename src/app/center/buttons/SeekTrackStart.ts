import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { ButtonInteraction } from 'discord.js'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Interaction from '../../../struct/base/Interaction'

export default new Interaction(
    'startseek',
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

        queue.songs[0].info.start = Date.now()
        await player.seek(0)

        return button.editReply({
            embeds: [ new MusicEmbed().success('Вы перемотали в начало трека') ]
        })
    }
)