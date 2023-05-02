import { ButtonInteraction, CommandInteraction } from 'discord.js'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { TPlaylist } from '../../../../../db/schemas/Playlist'
import { providers } from '../../../../../struct/clients/Provider'
import MusicEmbed from '../../../../../struct/utils/MusicEmbed'
import { defaultFilters } from '../../../../FilterChoose'

export default async (client: MusicCenter, button: ButtonInteraction<'cached'>, interaction: CommandInteraction<'cached'>, playlists: TPlaylist[]) => {
    const playlist = playlists.find(p => button.customId.split('.')[1] === p.code)
    if(!playlist) {
        return button.reply(
            { content: 'Я **не** нашел такой **плейлист** :(', ephemeral: true }
        )
    }

    if(playlist.tracks.length === 0) {
        return button.reply(
            { content: 'Вы **не** можете включить **пустой** плейлист', ephemeral: true }
        )
    }

    let get = client.util.getVoiceProvider(interaction.member, providers)
    if(get) {
        return button.reply(
            { content: 'Воспроизводить **плейлисты** можно только в **случае**, когда в **голосвом** канале **нет** провайдера', ephemeral: true }
        )
    }

    for ( let i = 0; providers.size > i; i++ ) {
        const bot = interaction.guild.members.cache.get(providers.map(p => p.user!.id)[i])
        if(bot) {
            if(!bot.voice?.channelId) {
                if(!get) get = providers.get(bot.id)
            }
        }
    }

    if(!get) {
        return button.reply(
            { content: 'Все боты **сейчас** заняты', ephemeral: true }
        )
    }

    await button.deferReply()

    await interaction.deleteReply()

    await button.editReply({
        embeds: [
            new MusicEmbed().loading('Запускаю плеер...')
        ]
    })

    const queue = get.queue.set(interaction.guildId, {filters: defaultFilters, pause: 0, volume: 100, lasts: {}, loop: false, loopQueue: false, text: interaction.channel!.id, songs: []}).get(interaction.guildId)!
    const tracks = playlist.tracks

    for ( let i = 0; tracks.length > i; i++ ) {
        const track = {track: tracks[i].track, info: {...tracks[i], member: interaction.member, start: Date.now()}}
        queue.songs.push(track)
    }

    const player = await get.manager.join({
        guild: interaction.guildId,
        channel: interaction.member.voice?.channelId as string,
        node: get.manager.idealNodes[0].id
    }, {
        selfdeaf: true
    })

    player.on('start', async (data) => {
        await (await import('../../playerEvents/start')).default(data, client, get!, interaction.guild)
    })

    player.on('end', async (data) => {
        await (await import('../../playerEvents/end')).default(data, client, get!, interaction.guild)
    })

    if ((!player.playing && !player.paused && !get.queue.size) || !player.playing && !player.paused) {
        queue.songs[0].info.start = Date.now()
        await player.play(queue.songs[0].track, {volume: queue.volume})
    }

    return button.editReply({
        embeds: [ new MusicEmbed().playPlaylist(`${playlist.name}`) ]
    })
}