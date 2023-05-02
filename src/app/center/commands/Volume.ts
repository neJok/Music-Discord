import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js'
import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Command from '../../../struct/base/Command'

export default new Command(
    'volume',
    {
        voice: true,
        data: {
            name: 'volume',
            description: 'Установить громкость',
            options: [
                {
                    name: 'громкость',
                    description: 'Установить громкость воспроизведения (от 0 до 100)',
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

        const volume = interaction.options.get('громкость', true)?.value as number

        if(0 > volume && volume > 100) {
            return interaction.editReply({
                embeds: [ new MusicEmbed().warn('Укажите громкость от 0 до 100') ]
            })
        }

        await player.volume(volume)
        
        return interaction.editReply({
            embeds: [ new MusicEmbed().success(`Громкость была изменена на ${volume}%`) ]
        })
    }
)