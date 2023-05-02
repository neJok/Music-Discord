import { MusicCenter } from '@struct/clients/MusicCenter';
import { Playlist, TPlaylist } from '../schemas/Playlist';
import Track from '@customTypes/lib/Track';
import Cache from '../Cache';

export default class PlaylistManager {
    readonly cache = Cache.playlists
    public client: MusicCenter

    constructor(client: MusicCenter) {
        this.client = client
    }

    async init() {
        const playlists = await this.array()
        playlists.forEach(res => {
            this.cache.set(res.code, res)
        })
    }

    async array() {
        return Playlist.find({})
    }

    async get(userId: string) {
        const cl = this.cache.filter(p => p.userId === userId || (p.likes.includes(userId) && p.type !== 'PRIVATE'))
        if(cl.size > 0) {
            return cl.map(p => p)
        } else {
            return (await this.getMongo(userId) ?? await this.create(userId))
        }
    }

    async getOnlyUser(userId: string): Promise<TPlaylist[]> {
        const cl = this.cache.filter(p => p.userId === userId)
        if(cl.size > 0) {
            return cl.map(p => p)
        } else {
            return (await this.getOnlyUserMongo(userId) ?? await this.create(userId))
        }
    }

    async getOnlyUserMongo(userId: string) {
        return (await Playlist.find()).filter(p => p.userId === userId)
    }

    async getMongo(userId: string) {
        return (await Playlist.find()).filter(p => p.userId === userId || p.likes.includes(userId))
    }

    async checkLoveTracks(userId: string) {
        const cache = this.cache.find(p => p.userId === userId && p.name === 'Любимые треки')
        if(cache) {
            return cache
        } else {
            return (await Playlist.findOne({userId, name: 'Любимые треки'}) ?? await this.create(userId))
        }
    }

    async create(userId: string, name?: string) {
        const doc = await Playlist.create({userId})
        doc.code = this.client.util.createPlaylistCode()

        if(name) {
            doc.name = name
            doc.image = 'none'
            doc.type = 'PUBLIC'
        }

        await doc.save()
        this.cache.set(doc.code, doc)

        return doc
    }

    async delete(doc: TPlaylist) {
        await doc.remove()
        this.cache.delete(doc.code)
    }

    async save(doc: TPlaylist) {
        await doc.save().catch((err) => this.client.logger.error(err))
        this.cache.set(`${doc.code}`, doc)
    }

    pushTrack(doc: TPlaylist, track: Track) {
        doc.tracks.push(
            {
                addAt: Date.now(),
                track: track.track,
                identifier: track.info.identifier,
                isSeekable: track.info.isSeekable,
                author: track.info.author,
                length: track.info.length,
                isStream: track.info.isStream,
                position: track.info.position,
                sourceName: track.info.sourceName,
                title: track.info.title,
                uri: track.info.uri,
                thumbnail: track.info.thumbnail,
                channelUrl: track.info.channelUrl
            }
        )
        return doc
    }
}