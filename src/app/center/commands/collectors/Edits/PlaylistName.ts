import { ActionRowBuilder, ButtonInteraction, CommandInteraction, ModalBuilder, TextChannel, TextInputBuilder, TextInputStyle } from 'discord.js'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { TPlaylist } from '../../../../../db/schemas/Playlist'
import { MusicActionRow } from '../../../../../struct/utils/MusicComponents'
import MusicEmbed from '../../../../../struct/utils/MusicEmbed'

export default async (client: MusicCenter, button: ButtonInteraction<'cached'>, interaction: CommandInteraction<'cached'>, playlists: TPlaylist[]) => {
    const playlist = playlists.find(p => button.customId.split('.')[1] === p.code)
    if(!playlist) {
        return button.reply(
            { content: 'Я **не** нашел такой **плейлист** :(', ephemeral: true }
        )
    }

    await button.showModal(
        new ModalBuilder()
        .setCustomId('modalsetname')
        .setTitle('Изменить название')
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                new TextInputBuilder()
                .setCustomId('name')
                .setLabel('Название')
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
            embeds: [new MusicEmbed().loading('Изменяю название...')],
            components: []
        })

        const name = modal.fields.getTextInputValue('name')

        if(!name) {
            return interaction.editReply({
                embeds: [new MusicEmbed().default('Изменение названия', `Вы **не** указали новое **название** плейлиста`, interaction.member)],
                components: new MusicActionRow().leaveManagePlaylist(playlist)
            })
        }

        const oldName = playlist.name

        const channel = button.guild.channels.cache.get(client.config.meta.channelLogger)
        if(channel) {
            await (channel as TextChannel).send({
                embeds: [
                    new MusicEmbed().log('Изменение названия')
                    .addFields(
                        {
                            name: '> Владелец:', inline: true,
                            value: `**•** ${button.member.toString()}\n**• Тег:** ${button.member.user.tag}\n**• ID:** ${button.member.id}`
                        },
                        {
                            name: '> Плейлист:', inline: true,
                            value: `**• Название:** ${oldName}\n**• Тип:** ${playlist.type}\n**• Нравится:** ${playlist.likes.length}`
                        },
                        {
                            name: '> Название:', value: client.util.toCode(name, 'fix')
                        }
                    )
                ]
            })
        }

        playlist.name = name
        await client.db.playlist.save(playlist)

        return interaction.editReply({
            embeds: [new MusicEmbed().default('Изменение названия', `Вы **изменили название** плейлиста "**${oldName}**" на  "**${name}**"`, interaction.member)],
            components: new MusicActionRow().leaveManagePlaylist(playlist)
        })
    })
    .catch((reason) => {
        if(reason?.message === 'Interaction has already been acknowledged.') return

        return interaction.editReply({
            embeds: [new MusicEmbed().default('Изменение названия', `Время вышло`, interaction.member)],
            components: new MusicActionRow().leaveManagePlaylist(playlist)
        })
    })
}