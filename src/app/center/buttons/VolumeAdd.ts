import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { ButtonInteraction } from 'discord.js'
import { MusicActionRow } from '../../../struct/utils/MusicComponents'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Interaction from '../../../struct/base/Interaction'

export default new Interaction(
    'volumeadd',
    {
        voice: true
    },
    async (client: MusicCenter, button: ButtonInteraction<'cached'>) => {
        await button.deferReply({ ephemeral: true })

        const get = client.util.getVoiceProvider(button.member, providers)

        if(!get) {
            return button.editReply({
                embeds: [ new MusicEmbed().warn('С тобой рядом нет музыкального бота, которым ты можешь управлять!') ]
            })
        }

        const player = get.manager.players.get(button.guild.id)
        const queue = get.queue.get(button.guild.id)

        if(!player || (player && !player.paused && !player.playing) || (!queue || (queue && queue?.songs.length === 0))) {
            await button.message.delete().catch(() => {})
            return button.editReply({
                embeds: [ new MusicEmbed().warn(`Произошла ошибка. Сообщение было удалено.`) ]
            }).catch(() => {})
        }

        if(queue.volume + 10 > 100) {
            return button.editReply({
                embeds: [ new MusicEmbed().warn(`Громкость не может быть больше 100`) ]
            }).catch(() => {})
        }

        queue.volume += 10
        await player.volume(queue.volume)

        return button.followUp({
            embeds: [ new MusicEmbed().success('Вы повысили громкость на 10%') ]
        })
    }
)