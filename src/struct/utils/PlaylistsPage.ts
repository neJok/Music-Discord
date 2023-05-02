import { EmbedBuilder, Guild } from 'discord.js'
import Paginator from './Paginator'
import { IPlaylist } from '../../db/schemas/Playlist'
import { emojis } from '../../config'

export default class PlaylistsPage extends Paginator {
    readonly count: number = 10
    wastebasket = true

    static generateEmbed(guild: Guild, embed: EmbedBuilder, playlist: IPlaylist[], page: number) {
        const playlists = playlist.sort((a, b) => b.likes.length - a.likes.length)

        for (
            let i = page*10;
            (i < playlists.length && i < 10*(page+1));
            i++
        ) {
            const member = guild.members.cache.get(playlists[i].userId)
            embed.addFields(
                { name: `${i+1}) ${playlists[i].name} - ${playlists[i].likes.length} ${emojis.player.heart}`, value: `> Автор: **${member?.user?.tag || playlists[i].userId}**`}
            )
        }

        if((embed?.data?.fields || []).length === 0) {
            embed.setDescription('Пусто')
        }

        embed.setThumbnail(guild.iconURL({size: 4096, extension: 'png', forceStatic: false}))
        .setTitle('Топ плейлистов по лайкам')
        .setFooter({ text: `Страница ${page+1}/${this.getAllPages(playlists, 10)}` })

        return embed
    }
}