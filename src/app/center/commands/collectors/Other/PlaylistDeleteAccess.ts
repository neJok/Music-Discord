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

    const name = playlist.name

    const channel = button.guild.channels.cache.get(client.config.meta.channelLogger)
    if(channel) {
        await (channel as TextChannel).send({
            embeds: [
                new MusicEmbed().log('Удаление плейлиста')
                .addFields(
                    {
                        name: '> Владелец:', inline: true,
                        value: `**•** ${button.member.toString()}\n**• Тег:** ${button.member.user.tag}\n**• ID:** ${button.member.id}`
                    },
                    {
                        name: '> Плейлист:', inline: true,
                        value: `**• Название:** ${name}\n**• Тип:** ${playlist.type}\n${playlist.type === 'PUBLIC' ? `**• Нравился:** ${playlist.likes.length}` : `**• Треков:** ${playlist.tracks.length}`}`
                    }
                )
            ]
        })
    }

    await client.db.playlist.delete(playlist)

    return interaction.editReply({
        embeds: [
            new MusicEmbed()
            .default(
                'Удаление плейлиста',
                `Вы удалили плейлист "**${name}**" из своего списка`,
                button.member
            )
        ],
        components: new MusicActionRow().leavePlaylistMainMenu()
    })
}