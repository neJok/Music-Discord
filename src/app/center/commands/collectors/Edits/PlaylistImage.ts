import { AttachmentBuilder, ButtonInteraction, CommandInteraction, MessageCollector, TextChannel } from 'discord.js'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { TPlaylist } from '../../../../../db/schemas/Playlist'
import { MusicActionRow } from '../../../../../struct/utils/MusicComponents'
import MusicEmbed from '../../../../../struct/utils/MusicEmbed'
import { createCanvas, loadImage } from 'canvas'

export default async (client: MusicCenter, button: ButtonInteraction<'cached'>, interaction: CommandInteraction<'cached'>, playlists: TPlaylist[]) => {
    const playlist = playlists.find(p => button.customId.split('.')[1] === p.code)
    if(!playlist) {
        return button.reply(
            { content: 'Я **не** нашел такой **плейлист** :(', ephemeral: true }
        )
    }

    const collector = new MessageCollector(
        interaction.channel!,
        {
            time: 30_000,
            filter: (m) => m.author.id === interaction.member.id,
            max: 1
        }
    )

    await interaction.editReply({
        embeds: [
            new MusicEmbed()
            .default(
                'Управление плейлистом',
                `Отправьте **в** чат **изображение** или **ссылку** на изображение`,
                button.member
            ).setFooter({text: 'У Вас есть 30 секунд'})
        ],
        components: []
    })

    collector.on('collect', async (message): Promise<any> => {
        let status: Buffer | undefined = undefined

        if(!message.content) {
            const firstAtt = message.attachments.first()
            if(!firstAtt) {
                if(message.deletable) await message.delete().catch(() => {})
                return interaction.editReply({
                    embeds: [
                        new MusicEmbed()
                        .default(
                            'Управление плейлистом',
                            `Вы **ничего** не отправили`,
                            button.member
                        )
                    ],
                    components: new MusicActionRow().leaveManagePlaylist(playlist)
                })
            }

            const canvas = createCanvas(512, 512)
            const ctx = canvas.getContext('2d')

            try {
                const load = await loadImage(firstAtt.url)
                ctx.drawImage(load, 0, 0, 512, 512)
    
                status = canvas.toBuffer()    
            } catch {
                if(message.deletable) await message.delete().catch(() => {})
                return interaction.editReply({
                    embeds: [
                        new MusicEmbed()
                        .default(
                            'Управление плейлистом',
                            `Ошибка при **загрузке** изображения`,
                            button.member
                        )
                    ],
                    components: new MusicActionRow().leaveManagePlaylist(playlist)
                })
            }
        }
        
        if(!message.attachments.first()) {
            const url = client.util.isImage(message.content)
            if(!url) {
                if(message.deletable) await message.delete().catch(() => {})
                return interaction.editReply({
                    embeds: [
                        new MusicEmbed()
                        .default(
                            'Управление плейлистом',
                            `Непонятная **ссылка** на изображение`,
                            button.member
                        )
                    ],
                    components: new MusicActionRow().leaveManagePlaylist(playlist)
                })
            }

            const canvas = createCanvas(512, 512)
            const ctx = canvas.getContext('2d')

            try {
                const load = await loadImage(message.content)
                ctx.drawImage(load, 0, 0, 512, 512)
    
                status = canvas.toBuffer()    
            } catch {
                if(message.deletable) await message.delete().catch(() => {})
                return interaction.editReply({
                    embeds: [
                        new MusicEmbed()
                        .default(
                            'Управление плейлистом',
                            `Ошибка при **загрузке** изображения`,
                            button.member
                        )
                    ],
                    components: new MusicActionRow().leaveManagePlaylist(playlist)
                })
            }
        }

        if(message.deletable) await message.delete().catch(() => {})

        if(!status) {
            return interaction.editReply({
                embeds: [
                    new MusicEmbed()
                    .default(
                        'Управление плейлистом',
                        `Вы **ничего** не отправили`,
                        button.member
                    )
                ],
                components: new MusicActionRow().leaveManagePlaylist(playlist)
            })
        } else {
            const channel = button.guild.channels.cache.get(client.config.meta.channelLogger)
            if(!channel) {
                return interaction.editReply({
                    embeds: [
                        new MusicEmbed()
                        .default(
                            'Управление плейлистом',
                            `Извините, но **разрабы** плохие люди`,
                            button.member
                        )
                    ],
                    components: new MusicActionRow().leaveManagePlaylist(playlist)
                })
            }

            const attachment = new AttachmentBuilder(status, {name: 'albumImage.png'})

            await (channel as TextChannel).send({
                embeds: [
                    new MusicEmbed()
                    .log(
                        'Изменение обложки'
                    )
                    .setThumbnail(playlist.image)
                    .addFields(
                        {
                            name: '> Владелец:', inline: true,
                            value: `**•** ${button.member.toString()}\n**• Тег:** ${button.member.user.tag}\n**• ID:** ${button.member.id}`
                        },
                        {
                            name: '> Плейлист:', inline: true,
                            value: `**• Название:** ${playlist.name}\n**• Тип:** ${playlist.type}\n**• Нравится:** ${playlist.likes.length}`
                        }
                    ).setImage('attachment://albumImage.png')
                ],
                files: [attachment]
            }).then(async (msg) => {
                const firstAttUrl = (msg.attachments.first()?.url || msg.embeds[0].image?.url)
                if(!firstAttUrl) {
                    return interaction.editReply({
                        embeds: [
                            new MusicEmbed()
                            .default(
                                'Управление плейлистом',
                                `Извините, но **разрабы** плохие люди`,
                                button.member
                            )
                        ],
                        components: new MusicActionRow().leaveManagePlaylist(playlist)
                    })
                }

                playlist.image = firstAttUrl 

                await client.db.playlist.save(playlist)

                return interaction.editReply({
                    embeds: [
                        new MusicEmbed()
                        .default(
                            'Управление плейлистом',
                            `Вы **изменили** обложку **плейлиста** на это [изобржение](${firstAttUrl})`,
                            button.member
                        )
                    ],
                    components: new MusicActionRow().leaveManagePlaylist(playlist)
                })
            })
        }
    })
}