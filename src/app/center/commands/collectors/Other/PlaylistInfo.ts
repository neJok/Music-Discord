import { CommandInteraction, SelectMenuInteraction } from 'discord.js'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { TPlaylist } from '../../../../../db/schemas/Playlist'
import { MusicActionRow } from '../../../../../struct/utils/MusicComponents'
import MusicEmbed from '../../../../../struct/utils/MusicEmbed'

export default async (client: MusicCenter, menu: SelectMenuInteraction<'cached'>, interaction: CommandInteraction<'cached'>, playlists: TPlaylist[]) => {
    const find = playlists.find(p => menu.values[0] === p.code)
    if(!find) {
        return menu.reply(
            { content: 'Я **не** нашел такой **плейлист** :(', ephemeral: true }
        )
    }

    if(find.type === 'PRIVATE' && menu.user.id !== find.userId) {
        return menu.reply(
            { content: 'Вы **не** можете смотреть **приватные** плейлисты', ephemeral: true }
        )
    }

    return interaction.editReply({
        embeds: [
            new MusicEmbed()
            .playlistInfo(menu.guild, find)
        ],
        components: new MusicActionRow().managePlaylist(find, interaction.member.id)
    })
}