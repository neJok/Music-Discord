import { ButtonInteraction, CommandInteraction } from 'discord.js'
import { MusicActionRow } from '../../../struct/utils/MusicComponents'
import { MusicCenter } from '@struct/clients/MusicCenter'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Command from '../../../struct/base/Command'
import Collector from '../../../struct/utils/Collector'
import PlaylistsPage from '../../../struct/utils/PlaylistsPage'

export default new Command(
    'top',
    {
        data: {
            name: 'top',
            description: 'Просмотреть топ плейлистов по лайкам'
        }
    },
    async (client: MusicCenter, interaction: CommandInteraction<'cached'>) => {
        await interaction.deferReply({ fetchReply: true })
        
        const array = (await client.db.playlist.array()).filter(p => p.type === 'PUBLIC')

        await interaction.editReply({
            embeds: [
                PlaylistsPage.generateEmbed(
                    interaction.guild,
                    new MusicEmbed(),
                    array,
                    0
                )
            ],
            components: new MusicActionRow().componentsPlaylistPage(array.length, 0)
        })

        new Collector(
            client,
            (await interaction.fetchReply()),
            async (button: ButtonInteraction<'cached'>) => {
                if(button.user.id !== interaction.user.id) return

                if(button.customId.startsWith('playlistback')) {
                    return interaction.editReply({
                        embeds: [
                            PlaylistsPage.generateEmbed(
                                interaction.guild,
                                new MusicEmbed(),
                                array,
                                PlaylistsPage.getPage(button.message.embeds[0].data, false)-1
                            )
                        ],
                        components: new MusicActionRow().componentsPlaylistPage(array.length, PlaylistsPage.getPage(button.message.embeds[0].data, false)-1)
                    })
                } else {
                    return interaction.editReply({
                        embeds: [
                            PlaylistsPage.generateEmbed(
                                interaction.guild,
                                new MusicEmbed(),
                                array,
                                PlaylistsPage.getPage(button.message.embeds[0].data, true)
                            )
                        ],
                        components: new MusicActionRow().componentsPlaylistPage(array.length, PlaylistsPage.getPage(button.message.embeds[0].data, true))
                    })
                }
            }
        )
    }
)