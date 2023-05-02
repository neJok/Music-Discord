import { ButtonInteraction, CommandInteraction } from 'discord.js'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { MusicActionRow } from '../../../../../struct/utils/MusicComponents'
import { TPlaylist } from '../../../../../db/schemas/Playlist'
import MusicEmbed from '../../../../../struct/utils/MusicEmbed'

export default async (client: MusicCenter, button: ButtonInteraction<'cached'>, interaction: CommandInteraction<'cached'>, playlists: TPlaylist[]) => {
    const playlist = playlists.find(p => button.customId.split('.')[1] === p.code)
    if(!playlist) {
        return button.reply(
            { content: 'Я **не** нашел такой **плейлист** :(', ephemeral: true }
        )
    }

    if(!playlist.likes.includes(button.user.id)) {
        const checkPlaylists = await client.db.playlist.get(button.user.id)
        if(checkPlaylists.length >= client.config.maxPlaylists) {
            return button.reply(
                { content: 'Вы **не** можете иметь больше **15** плейлистов', ephemeral: true }
            )
        }

        playlist.likes.push(button.user.id)
        await client.db.playlist.save(playlist)

        return interaction.editReply({
            embeds: [
                new MusicEmbed()
                .default(
                    'Добавление в понравившиеся',
                    `Вы **добавили** плейлист "**${playlist.name}**" в **понравившиеся** плейлисты`,
                    button.member
                )
            ],
            components: new MusicActionRow().leavePlaylistMainMenu()
        })
    } else {
        playlist.likes.splice(playlist.likes.indexOf(button.user.id), 1)
        await client.db.playlist.save(playlist)

        return interaction.editReply({
            embeds: [
                new MusicEmbed()
                .default(
                    'Удаление из понравившихся',
                    `Вы **удалили** плейлист "**${playlist.name}**" из **понравившихся** плейлистов`,
                    button.member
                )
            ],
            components: new MusicActionRow().leavePlaylistMainMenu()
        })
    }
}
