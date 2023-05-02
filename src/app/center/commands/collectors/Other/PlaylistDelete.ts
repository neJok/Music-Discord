import { ButtonInteraction, CommandInteraction } from 'discord.js'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { TPlaylist } from '../../../../../db/schemas/Playlist'
import { MusicActionRow } from '../../../../../struct/utils/MusicComponents'
import MusicEmbed from '../../../../../struct/utils/MusicEmbed'

export default async (client: MusicCenter, button: ButtonInteraction<'cached'>, interaction: CommandInteraction<'cached'>, playlists: TPlaylist[]) => {
    const playlist = playlists.find(p => button.customId.split('.')[1] === p.code)
    if(!playlist) {
        return button.reply(
            { content: 'Я **не** нашел такой **плейлист** :(', ephemeral: true }
        )
    }

    return interaction.editReply({
        embeds: [
            new MusicEmbed()
            .default(
                'Удаление плейлиста',
                `Вы **уверены**, что хотите **удалить** плейлист "**${playlist.name}**"? Для **согласия** нажмите на ${client.config.emojis.check}, для **отказа** - ${client.config.emojis.cross}`,
                button.member
            )
        ],
        components: new MusicActionRow().choose('delete', playlist.code)
    })
}