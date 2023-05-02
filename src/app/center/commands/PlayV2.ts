import { ActionRowBuilder, ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, SelectMenuBuilder, TextChannel } from 'discord.js'
import { Provider, providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { defaultFilters } from '../../FilterChoose'
import { Player } from 'lavacord'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Command from '../../../struct/base/Command'

export default new Command(
    'play',
    {
        voice: true,
        data: {
            name: 'play',
            description: 'Запустить песню',
            options: [
                {
                    name: 'песня',
                    description: 'Напишите название песни, которую хочешь послушать',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                }, {
                    name: 'приоритет',
                    description: 'Изменить приоритет найденого трека',
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        { name: 'сейчас', value: 'now' },
                        { name: 'очередь', value: 'queue' }
                    ]
                },
                {
                    name: 'перемешать',
                    description: 'Перемешать треки после добавления трека',
                    type: ApplicationCommandOptionType.Boolean
                }
            ]
        }
    },
    async (client: MusicCenter, interaction: CommandInteraction<'cached'>) => {
        await interaction.deferReply()

        const { getInfo } = require('ytdl-getinfo')

        const track = interaction.options.get('песня', true).value as string
        const startTrackType = interaction.options.get('приоритет')?.value || 'queue'
        const shuffleQueueType = interaction.options.get('перемешать')?.value || false

        let get: Provider | undefined = client.util.getVoiceProvider(interaction.member, providers)

        if(!get) {
            for ( let i = 0; providers.size > i; i++ ) {
                const bot = interaction.guild.members.cache.get(providers.map(p => p.user!.id)[i])
                if(bot) {
                    if(!bot.voice?.channelId) {
                        if(!get) get = providers.get(bot.id)
                    }
                }
            }
        }

        if(!get) {
            return interaction.editReply({
                embeds: [ new MusicEmbed().warn('Сейчас нет свободных ботов') ]
            })
        }


        const spotify = new RegExp('^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?(?:[^.]+\.)?([^:\/\n\?\=]+)').test(track)

        let res = await client.util.getSongs(get.manager, track)

        if((!res || res?.loadType === 'LOAD_FAILED') && spotify) {
            const resolveUrl = track.split('/')
            if(resolveUrl[2] === 'open.spotify.com' && resolveUrl[3] === 'track') {
                const node = get.spotify.getNode(get.manager.idealNodes[0].id)
                if(node) {
                    await get.spotify.requestToken()
                    const data = (await node.load(track).catch(() => {}))
                    if(data && data?.tracks?.length > 0) res = await client.util.getSongs(get.manager, `${data.tracks[0].info.author} - ${data.tracks[0].info.title}`)
                }
            }
        }

        if(!res || !res?.tracks || !res.tracks[0] || res?.loadType === 'LOAD_FAILED') {
            return interaction.editReply({
                embeds: [ new MusicEmbed().warn('Трек по Вашему запросу не найден') ]
            })
        }

        if(!['PLAYLIST_LOADED', 'SEARCH_RESULT', 'TRACK_LOADED'].includes(res.loadType)) {
            return interaction.editReply({
                embeds: [ new MusicEmbed().warn('Мы не смогли это включить. Может на видео есть возрастное ограничение или этот сервис не поддерживается?') ]
            })
        }

        await interaction.editReply({
            embeds: [
                new MusicEmbed().loading('Ищем песню и включаем её...')
            ]
        })

        let queue = get.queue.get(interaction.guildId)

        if(res.loadType === 'PLAYLIST_LOADED') {
            const find = res.tracks.find((t) => t.info.isStream)
            if(find) {
                return interaction.editReply({
                    embeds: [ new MusicEmbed().warn('В плейлисте есть видео стрим') ]
                })
            }

            if(!queue) {
                queue = get.queue.set(interaction.guildId, {filters: defaultFilters, pause: 0, volume: 100, lasts: {}, loop: false, loopQueue: false, text: interaction.channel!.id, songs: []}).get(interaction.guildId)
            }

            const info = await getInfo(res.tracks[0].info.uri).catch(() => {})
            
            if(startTrackType === 'queue') {
                for ( let i = 0; res.tracks.length > i; i++ ) {
                    res.tracks[i].info.member = interaction.member

                    if(info && info?.items && info?.items[0]) {
                        res.tracks[i].info.thumbnail = info?.items[0]?.thumbnails[info.items[0].thumbnails.length-1]?.url || undefined
                        res.tracks[i].info.channelUrl = info?.items[0].channel_url
                    }

                    queue!.songs.push(res.tracks[i])
                }
            } else {
                for ( let i = res.tracks.length-1; i >= 0; i-- ) {
                    res.tracks[i].info.member = interaction.member

                    if(info && info?.items && info?.items[0]) {
                        res.tracks[i].info.thumbnail = info?.items[0]?.thumbnails[info.items[0].thumbnails.length-1]?.url || undefined
                        res.tracks[i].info.channelUrl = info?.items[0].channel_url
                    }

                    queue!.songs.unshift(res.tracks[i])
                }
            }
        } else {
            if(res.tracks[0].info.isStream) {
                return interaction.editReply({
                    embeds: [ new MusicEmbed().warn('Вы не можете включить стрим') ]
                })
            }
        }

        let player = get.manager.players.get(interaction.guildId) as Player
        if(!player || (player && !player.state.connected)) {
            player = await get.manager.join({
                guild: interaction.guildId,
                channel: interaction.member.voice?.channelId as string,
                node: get.manager.idealNodes[0].id
            }, {
                selfdeaf: true
            })

            player.on('start', async (data) => {
                await (await import('./playerEvents/start')).default(data, client, get!, interaction.guild)
            })

            player.on('end', async (data) => {
                await (await import('./playerEvents/end')).default(data, client, get!, interaction.guild)
            })
        }

        if(res.loadType !== 'PLAYLIST_LOADED') {
            const info = await getInfo(res.tracks[0].info.uri).catch(() => {})

            if(info && info?.items && info?.items[0]) {
                res.tracks[0].info.thumbnail = info?.items[0]?.thumbnails[info.items[0].thumbnails.length-1]?.url || undefined
                res.tracks[0].info.channelUrl = info?.items[0].channel_url
            }
        }

        if(['SEARCH_RESULT', 'TRACK_LOADED'].includes(res.loadType)) {
            res.tracks[0].info.member = interaction.member

            if(!queue) {
                res.tracks[0].info.start = Date.now()
                queue = get.queue.set(interaction.guildId, {filters: defaultFilters, pause: 0, volume: 100, lasts: {}, loop: false, loopQueue: false, text: interaction.channel!.id, songs: [res.tracks[0]]}).get(interaction.guildId)
            } else {
                if(startTrackType === 'queue') queue!.songs.push(res.tracks[0])
                else queue!.songs.unshift(res.tracks[0])
            }
            
            if ((!player.playing && !player.paused && !get.queue.size) || !player.playing && !player.paused || startTrackType === 'now' || shuffleQueueType) {
                if(shuffleQueueType) {
                    queue!.songs = client.util.shuffle(queue!.songs, startTrackType === 'now')
                    await player.play(queue!.songs[0].track, {volume: 100})
                } else {
                    await player.play(res.tracks[0].track, {volume: 100})
                }
            }

            return interaction.editReply({
                embeds: [ new MusicEmbed().playTrack(res.tracks[0].info.title) ]
            })
        } else {
            if ((!player.playing && !player.paused && !get.queue.size) || !player.playing && !player.paused || startTrackType === 'now' || shuffleQueueType) {
                queue!.songs[0].info.start = Date.now()
                if(shuffleQueueType) {
                    queue!.songs = client.util.shuffle(queue!.songs, startTrackType === 'now')
                    await player.play(queue!.songs[0].track, {volume: 100})
                } else {
                    await player.play(res.tracks[0].track, {volume: 100})
                }
            }
            
            return interaction.editReply({
                embeds: [
                    new MusicEmbed().playPlaylist(res.playlistInfo.name!)
                ]
            })
        }
    },
    async (client: MusicCenter, interaction: AutocompleteInteraction) => {
        const focusedValue = interaction.options.getFocused()

        if(focusedValue === '') {
            return interaction.respond([])
        }

        const choices = (await client.util.getSongs(providers.first()!.manager, focusedValue)).tracks

        return interaction.respond(
			choices.map((choice) => {
                const name = `${choice.info.author} - ${choice.info.title}`.length > 80 ? `${choice.info.author} - ${choice.info.title}`.substring(0, 77) + '...' : `${choice.info.author} - ${choice.info.title}`
                return {
                    name, value: choice.info.uri
                }
            })
		)
    }
)