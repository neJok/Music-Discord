import { CommandInteraction, TextChannel } from 'discord.js'
import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Command from '../../../struct/base/Command'

export default new Command(
    'skip',
    {
        voice: true,
        data: {
            name: 'skip',
            description: 'Пропустить трек'
        }
    },
    async (client: MusicCenter, interaction: CommandInteraction<'cached'>) => {
        await interaction.deferReply({ fetchReply: true })

        const get = client.util.getVoiceProvider(interaction.member, providers)

        if(!get) {
            return interaction.editReply({
                embeds: [ new MusicEmbed().warn('С тобой рядом нет музыкального бота, которым ты можешь управлять!') ]
            })
        }

        const player = get.manager.players.get(interaction.guild.id)
        const queue = get.queue.get(interaction.guild.id)

        if(!player || (player && !player.paused && !player.playing) || (!queue || (queue && queue?.songs.length === 0))) {
            return interaction.editReply({
                embeds: [ new MusicEmbed().warn('Сейчас ничего не играет') ]
            })
        }

        const skiping = queue.songs.shift()
        if(queue.songs[0]) {
            client.util.resolveLastTracks(queue, skiping)
            queue.songs[0].info.start = Date.now()
            await player.play(queue.songs[0].track)
        } else {
            await get.manager.leave(interaction.guild.id)
            const text = interaction.guild.channels.cache.get(queue.text) as TextChannel
            get.queue.delete(interaction.guild.id)
            if(text) {
                await text.send({
                    embeds: [ new MusicEmbed().leave(`В очереди ${get.user!.tag} больше не осталось треков...`) ]
                }).catch(() => {})
            }
        }

        return interaction.editReply({
            embeds: [ new MusicEmbed().success(`Вы пропустили проигрываемый трек`) ]
        })
    }
)