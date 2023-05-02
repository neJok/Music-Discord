import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { ButtonInteraction, ButtonStyle, CommandInteraction } from 'discord.js'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Command from '../../../struct/base/Command'
import Collector from '../../../struct/utils/Collector'
import FilterChoose from '../../FilterChoose'

export default new Command(
    'filter',
    {
        voice: true,
        data: {
            name: 'filter',
            description: 'Наложить фильтр на музыку'
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

        const data = new MusicEmbed().filter(get, queue)
        const message = await interaction.editReply(data)

        new Collector(
            client,
            message,
            async (i: ButtonInteraction<'cached'>): Promise<any> => {
                if(i.user.id !== interaction.user.id) {
                    return i.deferUpdate().catch(() => {})
                }
    
                await i.deferUpdate().catch(() => {})

                const filter = FilterChoose.find(f => f.value === i.customId)
                if(!filter) {
                    return i.reply({content: 'Данный фильтр не найден', ephemeral: true})
                }

                const player = get.manager.players.get(interaction.guild.id)
                const queue = get.queue.get(interaction.guild.id)
        
                if(!player || (player && !player.paused && !player.playing) || (!queue || (queue && queue?.songs.length === 0))) {
                    return interaction.editReply({
                        embeds: [ new MusicEmbed().warn('Сейчас ничего не играет') ]
                    })
                }        

                if(i.component.style === ButtonStyle.Danger) {
                    filter.start(interaction.guild, player, queue)
                    const data = new MusicEmbed().filter(get, queue)
                    return interaction.editReply(data)
                } else {
                    filter.end(interaction.guild, player, queue)
                    const data = new MusicEmbed().filter(get, queue)
                    return interaction.editReply(data)
                }
            }
        )
    }
)