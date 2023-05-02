import { Collection } from 'discord.js'
import { TPlaylist } from './schemas/Playlist'

class Cache {
    readonly playlists: Collection<string, TPlaylist> = new Collection()
}

export default new Cache()