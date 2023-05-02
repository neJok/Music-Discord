import { CommandInteraction, SelectMenuInteraction } from 'discord.js'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { TPlaylist } from '../../../../../db/schemas/Playlist'
import { MusicActionRow } from '../../../../../struct/utils/MusicComponents'
import MusicEmbed from '../../../../../struct/utils/MusicEmbed'

export default async (client: MusicCenter, menu: SelectMenuInteraction<'cached'>, interaction: CommandInteraction<'cached'>, playlists: TPlaylist[]) => {
    const find = playlists.find(p => menu.customId.split('.')[1] === p.code)
    if(!find) {
        return menu.reply(
            { content: 'Я **не** нашел такой **плейлист** :(', ephemeral: true }
        )
    }

    const trackIndex = find.tracks.findIndex(t => t.uri === menu.values[0])
    if(0 > trackIndex || !find.tracks[trackIndex]) {
        return menu.reply(
            { content: 'Я **не** нашел такой **трек** в плейлисте :(', ephemeral: true }
        )
    }

    const track = find.tracks[trackIndex]

    find.tracks.splice(trackIndex, 1)
    await client.db.playlist.save(find)

    return interaction.editReply({
        embeds: [
            new MusicEmbed()
            .default('Удаление трека', `Вы **удалили** трек [${track.title}](${track.uri}) из плейлиста "**${find.name}**"`, menu.member)
        ],
        components: new MusicActionRow().leaveManagePlaylist(find)
    })
}