import Track from '@customTypes/lib/Track'
import Queue from '@customTypes/struct/queue/Queue'
import { EmbedBuilder } from '@discordjs/builders'
import CenterUtil from '../clients/CenterUtil'
import { Provider } from '@struct/clients/Provider'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Guild, GuildMember } from 'discord.js'
import { Player } from 'lavacord'
import FilterChoose from '../../app/FilterChoose'
import { emojis, mainColor } from '../../config'
import { IPlaylist } from '../../db/schemas/Playlist'
import TrakcsPage from './TrakcsPage'
import { MusicCenter } from '@struct/clients/MusicCenter'

export default class MusicEmbed extends EmbedBuilder {
    constructor() {
        super({color: mainColor})
    }

    warn(name: string) {
        return this.setAuthor(
            {
                name,
                iconURL: 'https://cdn.discordapp.com/emojis/1038652861455810700.png?size=4096'
            }
        )
    }

    leave(name: string) {
        return this.setAuthor(
            {
                name,
                iconURL: 'https://cdn.discordapp.com/emojis/1038653204965109800.png?size=4096'
            }
        )
    }

    loading(name: string) {
        return this.setAuthor(
            {
                name,
                iconURL: 'https://cdn.discordapp.com/emojis/1038329654387429406.gif?size=4096'
            }
        )
    }

    success(name: string) {
        return this.setAuthor(
            {
                name,
                iconURL: 'https://cdn.discordapp.com/emojis/1038654862956695602.png?size=4096'
            }
        )
    }

    playTrack(name: string) {
        return this.setAuthor(
            {
                name: `Трек "${name}" был успешно добавлен в очередь!`,
                iconURL: 'https://cdn.discordapp.com/emojis/1038654862956695602.png?size=4096'
            }
        )
    }

    playPlaylist(name: string) {
        return this.setAuthor(
            {
                name: `Плейлист "${name}" был успешно добавлен в очередь!`,
                iconURL: 'https://cdn.discordapp.com/emojis/1038654862956695602.png?size=4096'
            }
        )
    }

    default(title: string, description: string, author: GuildMember, member?: GuildMember) {
        return this
        .setTitle(`${title} — ${member ? member.user.tag : author.user.tag}`)
        .setDescription(`${author.toString()}, ${description}`)
        .setThumbnail(CenterUtil.getAvatar(member || author))
    }

    async playerSong(get: Provider, player: Player, track: Track, util: CenterUtil) {
        const PauseDate = get.queue.get(track.info.member.guild.id)?.pause === 0 ? Date.now() : get.queue.get(track.info.member.guild.id)!.pause

        return this.setAuthor(
            {
                name: track.info.author,
                url: track.info.channelUrl
            }
        )
        .setThumbnail(track.info.thumbnail ? track.info.thumbnail : null)
        .setTitle(track.info.title)
        .setURL(track.info.uri)
        .addFields(
            {
                name: `> Запрос от ${track.info.member.user.username}`, inline: true,
                value: `${player.paused ? emojis.player.pause : emojis.player.resume} ${util.progressVideoBar(Date.now()-(track.info.start || Date.now())-(Date.now()-PauseDate), track.info.length)} \`${util.convertVideoLength(Date.now()-(track.info.start || Date.now())-(Date.now()-PauseDate))} / ${util.convertVideoLength(track.info.length)}\``
            }
        )
        .setFooter(
            {
                iconURL: util.getAvatar(get.user!),
                text: (
                    `Твой бот: ${get.user!.tag}`
                )
            }
        )
    }

    playSong(get: Provider, track: Track, util: CenterUtil) {
        const queue = get.queue.get(track.info.member.guild.id)
        let lengthQueue: number = 0
        if(queue && queue.songs.length > 1) {
            lengthQueue = queue.songs.map(s => s.info.length).reduce((one, two) => one + two, lengthQueue)
        } else {
            lengthQueue = track.info.length
        }

        return this.setAuthor(
            {
                name: track.info.member.user.tag,
                iconURL: util.getAvatar(track.info.member)
            }
        )
        .setTitle(track.info.title)
        .setURL(track.info.uri)
        .setDescription(`От *${track.info.author}*`)
        .setThumbnail(track.info.thumbnail ? track.info.thumbnail : null)
        .addFields(
            {
                name: 'Длительность трека', inline: true,
                value: `\`${util.convertVideoLength(track.info.length)}\``
            },
            {
                name: 'Длительность очереди', inline: true,
                value: `\`${util.convertVideoLength(lengthQueue)}\``
            }
        )
        .setFooter(
            {
                iconURL: util.getAvatar(get.user!),
                text: (
                    `Твой бот: ${get.user!.tag}` + '\n'
                    + `${queue?.songs[1] ? `Сейчас играет: ${queue.songs[0].info.title}` : ''}`
                )
            }
        )
    }

    nowPlaying(member: GuildMember, player: Player, track: Track, util: CenterUtil) {
        return this.setAuthor(
            {
                name: member.user.tag,
                iconURL: util.getAvatar(member)
            }
        ).setTitle(
            `Сейчас играет трек: ${track.info.title}`
        ).setURL(track.info.uri)
        .setThumbnail(track.info.thumbnail ? track.info.thumbnail : null)
        .setDescription(`${player.paused ? '⏸️' : '▶️'} ${util.progressVideoBar(Date.now()-(track.info.start || 0), track.info.length)} \`[${util.convertVideoLength(Date.now()-(track.info.start || 0))}/${util.convertVideoLength(track.info.length)}]\` 🔊`)
        .setFooter(
            {
                text: `Заказал: ${track.info.member.user.tag}`,
                iconURL: util.getAvatar(track.info.member)
            }
        )
    }

    lyrics(title: string, lyric: string) {
        const lyrics = lyric.length > 4000 ? lyric.slice(0, 4000) + '...' : lyric
        return this.setTitle(title)
        .setDescription(
            lyrics.split('').filter(str => !['*', '_', '`'].includes(str)).join('')
        )
    }

    filter(provider: Provider, queue: Queue) {
        const row1 = new ActionRowBuilder<ButtonBuilder>()
        const row2 = new ActionRowBuilder<ButtonBuilder>()
        
        FilterChoose.map((filter, i) => {
            if(i+1 > FilterChoose.length/2) {
                row2.addComponents(
                    new ButtonBuilder().setCustomId(filter.value).setLabel(filter.name).setStyle(Boolean(eval(`queue.filters.${filter.check}`)) ? ButtonStyle.Success : ButtonStyle.Danger)
                )
            } else {
                row1.addComponents(
                    new ButtonBuilder().setCustomId(filter.value).setLabel(filter.name).setStyle(Boolean(eval(`queue.filters.${filter.check}`)) ? ButtonStyle.Success : ButtonStyle.Danger)
                )
            }
        })

        return {
            embeds: [
                this.setTitle(`Фильтры — ${provider.user!.username}`)
                .addFields(
                    ...FilterChoose.map((filter) => {
                        return {
                            name: filter.name,
                            value: (
                                Boolean(eval(`queue.filters.${filter.check}`)) ? 'Включен' : 'Выключен' 
                            ),
                            inline: true
                        }
                    })
                )
            ],
            components: [row1, row2]
        }
    }

    manageSeek(provider: Provider, queue: Queue, util: CenterUtil) {
        return this.setAuthor(
            {
                name: provider.user!.username,
                iconURL: util.getAvatar(provider.user!)
            }
        ).setTitle('Панель управления позицией')
        .addFields(
            {
                name: '> Текущая позиция:',
                value: `${util.convertVideoLength(Date.now()-(queue.songs[0]!.info.start || 0))}`,
                inline: true
            },
            {
                name: '> Длительность трека:',
                value: `${util.convertVideoLength(queue.songs[0]!.info.length)}`,
                inline: true
            }
        )
    }

    manageVolume(provider: Provider, queue: Queue, util: CenterUtil) {
        return this.setAuthor(
            {
                name: provider.user!.username,
                iconURL: util.getAvatar(provider.user!)
            }
        ).setTitle('Панель управления громкости')
        .addFields(
            {
                name: '> Громкость:',
                value: `**${queue.volume}**%`
            }
        )
    }

    playlistInfo(guild: Guild, playlist: IPlaylist) {
        const member = guild.members.cache.get(playlist.userId)
        const embed = this.setTitle(`Плейлист — ${playlist.name}`)
        .setThumbnail(
            playlist.image === 'default' ? 'https://media.discordapp.net/attachments/1041656204927189023/1046027043839692800/2022-11-26_18-37-32.png'
            : playlist.image === 'none' ? 'https://media.discordapp.net/attachments/1041656204927189023/1047807915072946186/2022-12-01_16-34-13.png'
            : playlist.image
        )
        .addFields(
            { name: '> Автор', value: CenterUtil.toCode(member?.user ? member.user.tag : playlist.userId), inline: true },
            { name: '> Треков', value: CenterUtil.toCode(playlist.tracks.length), inline: true },
        )

        if(playlist.type !== 'PRIVATE') {
            embed.addFields(
                { name: '> Нравится', value: CenterUtil.toCode(playlist.likes.length), inline: true}
            )
        }

        return embed
    }

    playlistTracks(client: MusicCenter, playlist: IPlaylist, i: number = 0) {
        return this.setTitle(`Плейлист — ${playlist.name}`)
        .setThumbnail(
            playlist.image === 'default' ? 'https://media.discordapp.net/attachments/1041656204927189023/1046027043839692800/2022-11-26_18-37-32.png'
            : playlist.image === 'none' ? 'https://media.discordapp.net/attachments/1041656204927189023/1047807915072946186/2022-12-01_16-34-13.png'
            : playlist.image
        ).setDescription(TrakcsPage.text(client, playlist, i))
        .setFooter(
            { text: `Страница ${i+1}/${TrakcsPage.getAllPages(playlist.tracks, 10)}` }
        )
    }

    log(actionTitle: string) {
        return this.setAuthor({name: 'Логи плейлистов'})
        .setTitle(actionTitle)
        .setTimestamp()
    }
}