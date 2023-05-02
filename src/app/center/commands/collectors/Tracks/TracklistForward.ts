import { ButtonInteraction, CommandInteraction } from 'discord.js'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { TPlaylist } from '../../../../../db/schemas/Playlist'
import { MusicActionRow } from '../../../../../struct/utils/MusicComponents'
import MusicEmbed from '../../../../../struct/utils/MusicEmbed'
import TrakcsPage from '../../../../../struct/utils/TrakcsPage'

export default async (client: MusicCenter, button: ButtonInteraction<'cached'>, interaction: CommandInteraction<'cached'>, playlists: TPlaylist[]) => {
    const playlist = playlists.find(p => button.customId.split('.')[1] === p.code)
    if(!playlist) {
        return button.reply(
            { content: 'Я **не** нашел такой **плейлист** :(', ephemeral: true }
        )
    }

    const getPage = TrakcsPage.getPage(button.message.embeds[0].data, true)

    return interaction.editReply({
        embeds: [
            new MusicEmbed()
            .playlistTracks(client, playlist, getPage)
        ],
        components: new MusicActionRow().componentsPage(playlist, getPage)
    })
}