import { ActionRowBuilder, ButtonInteraction, CommandInteraction, ModalBuilder, TextChannel, TextInputBuilder, TextInputStyle } from 'discord.js'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { MusicActionRow } from '../../../../../struct/utils/MusicComponents'
import MusicEmbed from '../../../../../struct/utils/MusicEmbed'

export default async (client: MusicCenter, button: ButtonInteraction<'cached'>, interaction: CommandInteraction<'cached'>) => {
    const playlists = await client.db.playlist.get(button.user.id)
    if(playlists.length >= client.config.maxPlaylists) {
        return button.reply(
            { content: 'Вы **не** можете создавать больше **15** плейлистов', ephemeral: true }
        )
    }

    await button.showModal(
        new ModalBuilder()
        .setTitle('Создание плейлиста')
        .setCustomId('createPlaylist')
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                new TextInputBuilder()
                .setLabel('Название')
                .setCustomId('name')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(24)
                .setRequired(true)
            )
        )
    )

    return button.awaitModalSubmit(
        { time: 30_000 }
    ).then(async modal => {
        await modal.deferUpdate()

        await interaction.editReply({
            embeds: [new MusicEmbed().loading('Создаю плейлист')],
            components: []
        })

        const name = modal.fields.getTextInputValue('name')

        if(!name) {
            return interaction.editReply({
                embeds: [new MusicEmbed().default('Создание плейлиста', `Вы **не** указали **название** плейлиста...`, interaction.member)],
                components: new MusicActionRow().leavePlaylistMainMenu()
            })
        }

        const doc = await client.db.playlist.create(interaction.member.id, name)

        const channel = button.guild.channels.cache.get(client.config.meta.channelLogger)
        if(channel) {
            await (channel as TextChannel).send({
                embeds: [
                    new MusicEmbed().log('Создание плейлиста')
                    .addFields(
                        {
                            name: '> Владелец:', inline: true,
                            value: `**•** ${button.member.toString()}\n**• Тег:** ${button.member.user.tag}\n**• ID:** ${button.member.id}`
                        },
                        {
                            name: '> Плейлист:', inline: true,
                            value: `**• Название:** ${doc.name}\n**• Тип:** ${doc.type}\n**• Код:** ${doc.code}`
                        }
                    )
                ]
            })
        }

        return interaction.editReply({
            embeds: [new MusicEmbed().default('Создание плейлиста', `Вы **создали** плейлист "**${name}**"`, interaction.member)],
            components: new MusicActionRow().leavePlaylistMainMenu()
        })
    })
    .catch(() => {
        return interaction.editReply({
            embeds: [new MusicEmbed().default('Создание плейлиста', `Время вышло`, interaction.member)],
            components: new MusicActionRow().leavePlaylistMainMenu()
        })
    })
}
