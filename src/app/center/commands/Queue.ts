import { ButtonInteraction, CommandInteraction, Collector as DJSCollecor } from 'discord.js'
import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import QueueManager from '../../../struct/utils/QueuePage'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Collector from '../../../struct/utils/Collector'
import Command from '../../../struct/base/Command'

export default new Command(
    'queue',
    {
        voice: true,
        data: {
            name: 'queue',
            description: 'Посмотреть список песен'
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

        const manager = new QueueManager(client, get.user!, queue.songs)
        const embed = manager.embed(0)

        await interaction.editReply({
            embeds: [embed],
            components: [manager.components(embed.data, 1)]
        })

        new Collector(
            client,
            (await interaction.fetchReply()),
            async (i: ButtonInteraction, collector: DJSCollecor<any, any>): Promise<any> => {
                if(i.user.id !== interaction.user.id) {
                    return i.deferUpdate().catch(() => {})
                }
    
                await i.deferUpdate().catch(() => {})
    
                switch(i.customId) {
                    case 'wastebasket':
                        if(i.message.deletable) await i.message.delete().catch(() => {})
                        collector.stop()
                        return
                    case 'arrowLeft':
                        const lpage = manager.getPage(i.message.embeds[0].data, false)
                        const lembed = manager.embed(lpage-1)
                        const lcomponents = manager.components(lembed.data, lpage)
    
                        return i.message.edit({
                            embeds: [lembed],
                            components: [lcomponents]
                        })
                    case 'arrowRight':
                        const rpage = manager.getPage(i.message.embeds[0].data, true)
                        const rembed = manager.embed(rpage)
                        const rcomponents = manager.components(rembed.data, rpage+1)
    
                        return i.message.edit({
                            embeds: [rembed],
                            components: [rcomponents]
                        })
                }
            }
        )
    }
)