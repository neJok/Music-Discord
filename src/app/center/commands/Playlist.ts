import { ApplicationCommandOptionType, ButtonInteraction, CommandInteraction, SelectMenuInteraction } from 'discord.js'
import { MusicActionRow } from '../../../struct/utils/MusicComponents'
import { MusicCenter } from '@struct/clients/MusicCenter'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Command from '../../../struct/base/Command'
import Collector from '../../../struct/utils/Collector'

export default new Command(
    'playlist',
    {
        data: {
            name: 'playlist',
            description: 'Просмотр своих плейлистов',
            options: [
                {
                    name: 'пользователь',
                    description: 'Или другого участника',
                    type: ApplicationCommandOptionType.User
                }
            ]
        }
    },
    async (client: MusicCenter, interaction: CommandInteraction<'cached'>) => {
        await interaction.deferReply({ fetchReply: true })

        let member = interaction.options.getMember('пользователь') ?? interaction.member
        if(member.user.bot) member = interaction.member

        await client.db.playlist.checkLoveTracks(member.id)
        
        const get = await client.db.playlist.get(member.id)

        await interaction.editReply({
            embeds: [
                new MusicEmbed()
                .default(
                    'Плейлисты',
                    'Какой **плейлист** Вы хотите **посмотреть**?',
                    interaction.member,
                    member
                )
            ],
            components: new MusicActionRow().playlists(get, interaction.guild, interaction.user.id === member.id)
        })

        new Collector(
            client,
            (await interaction.fetchReply()),
            async (int: ButtonInteraction<'cached'> | SelectMenuInteraction<'cached'>) => {
                if(int.user.id !== interaction.user.id) return

                const playlistsCheck = await client.db.playlist.get(member.id)
                
                if(int.isStringSelectMenu()) {
                    switch(int.customId) {
                        case 'playlists':
                            return (await import('./collectors/Other/PlaylistInfo')).default(client, int, interaction, playlistsCheck)
                        default:
                            if(int.customId.split('').includes('.')) {
                                switch(int.customId.split('.')[0]) {
                                    case 'trackdelete':
                                        return (await import('./collectors/Tracks/TrackDelete')).default(client, int, interaction, playlistsCheck)
                                }
                            }
                    }
                } else if(int.isButton()) {
                    switch(int.customId) {
                        case 'leavetochoose':
                            return interaction.editReply({
                                embeds: [
                                    new MusicEmbed()
                                    .default(
                                        'Плейлисты',
                                        'Какой **плейлист** Вы хотите **посмотреть**?',
                                        interaction.member,
                                        member
                                    )
                                ],
                                components: new MusicActionRow().playlists(playlistsCheck, interaction.guild, interaction.user.id === member.id)
                            })
                        case 'create':
                            return (await import('./collectors/Other/PlaylistCreate')).default(client, int, interaction)
                        default:
                            if(int.customId.split('').includes('.')) {
                                switch(int.customId.split('.')[0]) {
                                    case 'play':
                                        return (await import('./collectors/Other/PlaylistPlay')).default(client, int, interaction, playlistsCheck)
                                    case 'infotracks':
                                        return (await import('./collectors/Tracks/PlaylistTracks')).default(client, int, interaction, playlistsCheck)
                                    case 'deletecancel':
                                    case 'info':
                                        return (await import('./collectors/Other/PlaylistInfoButton')).default(client, int, interaction, playlistsCheck)
                                    case 'trackback':
                                        return (await import('./collectors/Tracks/TracklistBack')).default(client, int, interaction, playlistsCheck)
                                    case 'trackforward':
                                        return (await import('./collectors/Tracks/TracklistForward')).default(client, int, interaction, playlistsCheck)
                                    case 'edittype':
                                        return (await import('./collectors/Edits/PlaylistType')).default(client, int, interaction, playlistsCheck)
                                    case 'setImage':
                                        return (await import('./collectors/Edits/PlaylistImage')).default(client, int, interaction, playlistsCheck)
                                    case 'setName':
                                        return (await import('./collectors/Edits/PlaylistName')).default(client, int, interaction, playlistsCheck)
                                    case 'delete':
                                        return (await import('./collectors/Other/PlaylistDelete')).default(client, int, interaction, playlistsCheck)
                                    case 'deleteaccess':
                                        return (await import('./collectors/Other/PlaylistDeleteAccess')).default(client, int, interaction, playlistsCheck)
                                    case 'loveplaylist':
                                        return (await import('./collectors/Other/AddLikesPlaylists')).default(client, int, interaction, playlistsCheck)
                                }
                            }
                    }
                }
            }
        )
    }
)