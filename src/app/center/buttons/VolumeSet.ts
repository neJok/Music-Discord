import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { ActionRowBuilder, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Interaction from '../../../struct/base/Interaction'

export default new Interaction(
    'volumeset',
    {
        voice: true
    },
    async (client: MusicCenter, button: ButtonInteraction<'cached'>) => {
        const get = client.util.getVoiceProvider(button.member, providers)

        if(!get) {
            return button.reply({
                embeds: [ new MusicEmbed().warn('С тобой рядом нет музыкального бота, которым ты можешь управлять!') ],
                ephemeral: true
            })
        }

        const player = get.manager.players.get(button.guild.id)
        const queue = get.queue.get(button.guild.id)

        if(!player || (player && !player.paused && !player.playing) || (!queue || (queue && queue?.songs.length === 0))) {
            await button.message.delete().catch(() => {})
            return button.reply({
                embeds: [ new MusicEmbed().warn(`Произошла ошибка. Сообщение было удалено.`) ],
                ephemeral: true
            }).catch(() => {})
        }

        return button.showModal(
            new ModalBuilder()
            .setCustomId('volumemodal')
            .setTitle('Установить громкость')
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>()
                .addComponents(
                    new TextInputBuilder()
                    .setCustomId('volume')
                    .setLabel('Громкость')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('50')
                    .setMaxLength(3)
                    .setMinLength(1)
                    .setRequired(true)
                )
            )
        )
    }
)