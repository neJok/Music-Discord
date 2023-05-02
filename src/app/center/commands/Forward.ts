import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js'
import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Command from '../../../struct/base/Command'

export default new Command(
    'forward',
    {
        voice: true,
        data: {
            name: 'forward',
            description: 'Перемотать трек вперед',
            options: [
                {
                    name: 'время',
                    description: 'Время в секундах',
                    type: ApplicationCommandOptionType.Number,
                    required: true
                }
            ]
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

        const num = Math.round((interaction.options.get('время', true)?.value as number))
        const length = Math.round(Date.now() - (queue.songs[0].info.start || 0))

        if((num+length) > queue.songs[0].info.length) {
            return interaction.editReply({
                embeds: [ new MusicEmbed().warn('Неверно указано время') ]
            })
        }

        await player.seek(length+(num*1000))
        
        return interaction.editReply({
            embeds: [ new MusicEmbed().success(`Вы перемотали трек на ${num} секунд вперед`) ]
        })
    }
)