import { MusicCenter } from './MusicCenter'
import { Manager } from 'lavacord'
import fetch from 'node-fetch'
import { Search } from '@customTypes/lib/Search'
import { ActionRowBuilder, ButtonBuilder, Collection, ComponentType, GuildMember, ImageSize, Message, SelectMenuBuilder, ThreadAutoArchiveDuration, User } from 'discord.js'
import { Provider } from './Provider'
import Track from '@customTypes/lib/Track'
import Queue from '@customTypes/struct/queue/Queue'
import isImage from 'is-image'
import { lavalink } from '../../config'

export default class CenterUtil {
    client: MusicCenter

    constructor(client: MusicCenter) {
        this.client = client
    }

    getCommand(name: string) {
        return this.client.commands.cache.get(name)
    }

    getButton(search: string) {
        const cache = this.client.buttons.cache
        return cache.get(search) || cache.find((b) => search.startsWith(b.name))
    }

    getMenu(search: string) {
        const cache = this.client.menus.cache
        return cache.get(search) || cache.find((m) => search.startsWith(m.name))
    }

    getModal(search: string) {
        const cache = this.client.modals.cache
        return cache.get(search) || cache.find((m) => search.startsWith(m.name))
    }

    convertVideoLength(length: any) {
        const number = Number(length)
        
        let s = Math.trunc(number/1000)
        let m = Math.trunc(s / 60)
        s = s - m * 60
        let h = Math.trunc(m / 60)
        m = m - h * 60

        if(h !== 0) {
            return `${10 > h ? `0${h}` : h}:${10 > m ? `0${m}` : m}:${10 > s ? `0${s}` : s}`
        } else {
            return `${10 > m ? `0${m}` : m}:${10 > s ? `0${s}` : s}`
        }
    }

    async getSongs(manager: Manager, search: string): Promise<Search> {
        const node = manager.idealNodes[0]
        const params = new URLSearchParams()

        if(!search.startsWith('https://')) {
            search = `ytsearch:${search}`
        }

        params.append('identifier', search)

        return fetch(`http://${node.host}:${node.port}/loadtracks?${params}`, { headers: { Authorization: node.password } })
        .then(res => res.json())
        .then(data => data)
        .catch(err => {
            this.client.logger.error(err)
            return null
        })
    }

    static async getSongs(manager: Manager, search: string): Promise<Search> {
        const node = manager.idealNodes[0]
        const params = new URLSearchParams()

        if(!search.startsWith('https://')) {
            search = `ytsearch:${search}`
        }

        params.append('identifier', search)

        return fetch(`http://${lavalink.host.ip}:${lavalink.host.port}/loadtracks?${params}`, { headers: { Authorization: lavalink.password } })
        .then(res => res.json())
        .then(data => data)
        .catch(err => {
            return null
        })
    }

    getAvatar(member: GuildMember | User, size?: ImageSize) {
        return member.displayAvatarURL({size: (size || 4096), extension: 'png', forceStatic: false})
    }

    static getAvatar(member: GuildMember | User, size?: ImageSize) {
        return member.displayAvatarURL({size: (size || 4096), extension: 'png', forceStatic: false})
    }

    toCode(text: any, code: string = '') {
        return `\`\`\`${code}\n${text}\n\`\`\``
    }

    static toCode(text: any, code: string = '') {
        return `\`\`\`${code}\n${text}\n\`\`\``
    }

    disableComponents(message: Message, deleted: boolean = false) {
        if(!message.deletable && !message.editable) return

        let components: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder> [] = []

        message.components.map((row, r) => {
            components.push(new ActionRowBuilder(row.data))
            row.components.map((int, i) => {
                switch(int.type) {
                    case ComponentType.Button:
                        return components[r].addComponents( new ButtonBuilder(int.data).setDisabled(true) )
                    case ComponentType.StringSelect:
                        return components[r].addComponents( new SelectMenuBuilder(int.data).setDisabled(true) )
                }
            })
        })

        return message.edit({
            components
        }).then(() => {
            if(deleted) {
                setTimeout(async () => {
                    if(!message.deletable && !message.editable) return
                    await message.delete().catch(() => {})
                }, 60_000)
            }
        })
    }

    progressVideoBar(time: number, duration: number, size: number = 10) {
        const progress = Math.round(size * (time / duration))
        const emojis = this.client.config.emojis.progess

        return (
            (progress === 0 ? emojis.start : emojis.move.start)
            + (progress > 1 ? (emojis.move.full.repeat(progress) + (size-2-progress > 0 ? emojis.full.repeat(size-2-progress) : '')) : emojis.full.repeat(size-2))
            + (progress === size ? emojis.move.end : emojis.end)
        )
    }

    getVoiceProvider(member: GuildMember, providers: Collection<string, Provider>) {
        return providers.find((v, k) => {
            const bot = member.guild.members.cache.get(k)
            if(bot) {
                if(bot.voice?.channelId && member.voice?.channelId && member.voice?.channelId === bot.voice?.channelId) {
                    return providers.get(bot.id)
                }
            }
        })
    }

    shuffle(songs: Track[], now: boolean = false) {
        const get = songs[0]

        for (let i = songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)) as number
            [songs[i], songs[j]] = [songs[j], songs[i]]
        }

        if(now) {
            songs.splice(songs.indexOf(get), 1)
            songs.unshift(get)
        }

        return songs
    }

    resolveLastTracks(queue: Queue, skiping: Track | undefined) {
        if(!skiping) return

        queue.lasts[skiping!.track] = skiping!
        if(Object.keys(queue.lasts).length > 5) {
            delete queue.lasts[Object.keys(queue.lasts)[0]]
        }
    }

    createPlaylistCode() {
        const one = `${Math.random().toString(34).slice(5, 10)}`
        const two = `${Math.random().toString(34).slice(5, 10)}`
        const three = `${Math.random().toString(34).slice(5, 10)}`
        const four = `${Math.random().toString(34).slice(5, 10)}`
        return `${one}-${two}-${three}-${four}`
    }

    isImage(url: string) {
        const allow = [
            'png', 'jpg', 'webp'
        ]

        const end = url.split('.')[url.split('.').length-1]
        if(!end || !allow.includes(end)) return false
        else {
            return isImage(url)
        }
    }
}