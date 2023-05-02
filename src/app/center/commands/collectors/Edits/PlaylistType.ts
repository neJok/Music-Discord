import { ButtonInteraction, CommandInteraction, TextChannel } from 'discord.js'
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

    let state: boolean

    if(playlist.type === 'PRIVATE') {
        playlist.type = 'PUBLIC'
        state = true
    } else {
        playlist.type = 'PRIVATE'
        state = false
    }

    const channel = button.guild.channels.cache.get(client.config.meta.channelLogger)
    if(channel) {
        await (channel as TextChannel).send({
            embeds: [
                new MusicEmbed().log('Изменение типа')
                .addFields(
                    {
                        name: '> Владелец:', inline: true,
                        value: `**•** ${button.member.toString()}\n**• Тег:** ${button.member.user.tag}\n**• ID:** ${button.member.id}`
                    },
                    {
                        name: '> Плейлист:', inline: true,
                        value: `**• Название:** ${playlist.name}\n**• Тип:** ${playlist.type}\n**• Треков:** ${playlist.tracks.length}`
                    },
                    {
                        name: '> Тип:', value: client.util.toCode(state?'PUBLIC':'PRIVATE', 'fix')
                    }
                )
            ]
        })
    }

    await client.db.playlist.save(playlist)

    return interaction.editReply({
        embeds: [
            new MusicEmbed()
            .default(
                'Управление плейлистом',
                `Вы **изменили** тип плейлиста на **${state?'публичный':'приватный'}**`,
                button.member
            )
        ],
        components: new MusicActionRow().leaveManagePlaylist(playlist)
    })
}