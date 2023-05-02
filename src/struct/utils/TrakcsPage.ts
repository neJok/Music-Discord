import { MusicCenter } from '../clients/MusicCenter'
import { EmbedBuilder } from 'discord.js'
import Paginator from './Paginator'
import { IPlaylist } from '../../db/schemas/Playlist'

export default class TrakcsPage extends Paginator {
    readonly count: number = 10
    wastebasket = true
    playlist: IPlaylist
    client: MusicCenter

    constructor(client: MusicCenter, playlist: IPlaylist) {
        super()
        this.client = client
        this.playlist = playlist
    }

    static text(client: MusicCenter, playlist: IPlaylist, page: number) {
        const tracks = playlist.tracks.sort((a, b) => b.addAt - a.addAt)

        let text: string = ''
        for (
            let i = page*10;
            (i < playlist.tracks.length && i < 10*(page+1));
            i++
        ) {
            text += `**${i+1})** [${tracks[i].title}](${tracks[i].uri}) [\`${client.util.convertVideoLength(tracks[i].length)}\`]` + '\n'
        }

        return text === '' ? 'Вам ещё **не** понравился **ни** один трек 🥲' : text
    }
}