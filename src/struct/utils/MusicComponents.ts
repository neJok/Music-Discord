import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Guild, StringSelectMenuBuilder } from 'discord.js'
import { TPlaylist } from '../..//db/schemas/Playlist'
import { emojis } from '../../config'
import { Player } from 'lavacord'
import Queue from '@customTypes/struct/queue/Queue'

export class MusicActionRow {
    lasts(queue: Queue, id: string) {
        return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
            .setCustomId(`lasts.${id}`)
            .setDisabled(!Boolean(Object.keys(queue.lasts).length > 0))
            .setPlaceholder(!Boolean(Object.keys(queue.lasts).length > 0) ? 'Предыдущие треки не найдены' : 'Возврат к предыдущим трекам')
            .setOptions(
                Object.keys(queue.lasts).length > 0 ? 
                Object.values(queue.lasts).map((t) => {
                    return { label: t.info.title, description: t.info.author, value: t.info.uri }
                })
                : [{ label: 'я еблан', value: 'eblan'}]
            )
        )
    }

    bass(queue: Queue, id: string) {
        return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
            .setCustomId(`bass.${id}`)
            .setPlaceholder('Уровень басса не задан...')
            .setOptions(
                [{label: 'Сбросить', value: 'clear'}, {label: 'Низкий', value: 'low'}, {label: 'Средний', value: 'medium'}, {label: 'Высокий', value: 'high'}].map(v => {
                    return {
                        ...v, description: 'Нажмите, чтобы преминить этот эффект',
                        default: (
                            queue.filters.bassHigh && v.value === 'high' ? true
                            : queue.filters.bassMedium && v.value === 'medium' ? true
                            : queue.filters.bassLow && v.value === 'low' ? true
                            : Boolean(v.value === 'clear' && !queue.filters.bassHigh && !queue.filters.bassMedium && !queue.filters.bassLow)
                        )
                    }
                })
            )
        )
    }

    playerOne(player: Player, queue: Queue, id: string) {
        return new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`shuffle.${id}`).setEmoji(emojis.player.shuffle),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`back.${id}`).setEmoji(emojis.player.back).setDisabled(!Boolean(Object.keys(queue.lasts).length > 0)),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId((player.paused ? 'resume' : 'pause') + `.${id}`).setEmoji(player.paused ? emojis.player.resume : emojis.player.pause),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`forward.${id}`).setEmoji(emojis.player.forward),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId((queue.loop ? 'repeatDisabled' : queue.loopQueue ? 'repeatTrack' : 'repeatQueue') + `.${id}`).setEmoji(queue.loop ? emojis.player.repeatTrack : queue.loopQueue ? emojis.player.repeatQueue : emojis.player.repeatDisabled)
        )
    }

    playerTwo(player: Player, queue: Queue, id: string) {
        return new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`seek.${id}`).setEmoji(emojis.player.seek),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`volume.${id}`).setEmoji(emojis.player.volume),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`disconnect.${id}`).setEmoji(emojis.player.disconnect),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`lyric.${id}`).setEmoji(emojis.player.lyric),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`heart.${id}`).setEmoji(emojis.player.heart)
        )
    }

    player(player: Player, queue: Queue, id: string) {
        return [
            this.lasts(queue, id),
            this.bass(queue, id),
            this.playerOne(player, queue, id),
            this.playerTwo(player, queue, id)
        ]
    }

    manageSeek(queue: Queue) {
        return [
            new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('backseek').setEmoji(emojis.manageSeek.back).setLabel('Назад на 10с'),
                new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('setseek').setEmoji(emojis.manageSeek.set).setLabel('Установить тайминг'),
                new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('forwardseek').setEmoji(emojis.manageSeek.forward).setLabel('Вперед на 10с')
            ),
            new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setStyle(ButtonStyle.Danger).setCustomId('startseek').setEmoji(emojis.manageSeek.start).setLabel('Вернуться в начало трека'),
            )
        ]
    }

    manageVolume(queue: Queue) {
        return [
            new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('volumedel').setEmoji(emojis.manageVolume.min).setLabel('Уменьшить на 10%'),
                new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('volumeadd').setEmoji(emojis.manageVolume.max).setLabel('Увеличить на 10%'),
            ),
            new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId('volumeset').setEmoji(emojis.manageVolume.set).setLabel('Установить громкость'),
            )
        ]
    }

    playlists(playlists: TPlaylist[], guild: Guild, create: boolean = false, heart: string | undefined = undefined) {
        const row1 = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
            .setCustomId(heart ? `addplaylists[]${heart}` : 'playlists')
            .setPlaceholder('Выберите плейлист')
            .setOptions(
                playlists.map(p => {
                    const member = guild.members.cache.get(p.userId)
                    return {
                        label: `${p.name}`,
                        description: p.name === 'Любимые треки' ? (create ? 'Это Ваш личный плейлист!' : `Это любимые треки ${member?.user ? member.user.tag : p.userId}`) : `Автор: ${member?.user ? member.user.tag : p.userId}`,
                        value: `${p.code}`,
                        emoji: p.type === 'PRIVATE' ? emojis.lock : emojis.unlock
                    }
                })
            )
        )
        const row2 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder().setCustomId('create').setLabel('Создать новый плейлист').setStyle(ButtonStyle.Primary)
        )
        return create ? [row1, row2] : [row1]
    }

    leaveManagePlaylist(playlist: TPlaylist) {
        return [
            new ActionRowBuilder<ButtonBuilder>()
            .addComponents(new ButtonBuilder().setCustomId(`info.${playlist.code}`).setStyle(ButtonStyle.Primary).setLabel('Вернуть назад'))
        ]
    }

    leavePlaylistMainMenu() {
        return [
            new ActionRowBuilder<ButtonBuilder>()
            .addComponents(new ButtonBuilder().setCustomId(`leavetochoose`).setStyle(ButtonStyle.Primary).setLabel('Вернуть назад'))
        ]
    }

    managePlaylist(playlist: TPlaylist, love: string | undefined = undefined) {
        if(love && playlist.userId !== love) {
            return [
                new ActionRowBuilder<ButtonBuilder>()
                .addComponents(new ButtonBuilder().setCustomId(`infotracks.${playlist.code}`).setStyle(ButtonStyle.Secondary).setLabel('Информация о треках'))
                .addComponents(new ButtonBuilder().setCustomId(`play.${playlist.code}`).setStyle(ButtonStyle.Secondary).setLabel('Воспроизвести')),
                new ActionRowBuilder<ButtonBuilder>()
                .addComponents(new ButtonBuilder().setCustomId('leavetochoose').setStyle(ButtonStyle.Primary).setLabel('Вернуться назад'))
                .addComponents(new ButtonBuilder().setCustomId(`loveplaylist.${playlist.code}`).setStyle(ButtonStyle.Secondary).setLabel(playlist.likes.includes(love) ? 'Убрать из своего спика плейлистов' : 'Добавить в свой список плейлистов'))
            ]
        }

        const row1 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(new ButtonBuilder().setCustomId(`setName.${playlist.code}`).setStyle(ButtonStyle.Secondary).setLabel('Установить название'))
        .addComponents(new ButtonBuilder().setCustomId(`setImage.${playlist.code}`).setStyle(ButtonStyle.Secondary).setLabel('Установить обложку'))
        
        const row2 = new ActionRowBuilder<ButtonBuilder>()

        if(playlist.name !== 'Любимые треки') {
            row2.addComponents(new ButtonBuilder().setCustomId(`edittype.${playlist.code}`).setStyle(playlist.type==='PRIVATE'?ButtonStyle.Danger:ButtonStyle.Success).setLabel(playlist.type==='PRIVATE'?'Сделать публичным?':'Сделать приватным?'))
        }

        row2.addComponents(new ButtonBuilder().setCustomId(`infotracks.${playlist.code}`).setStyle(ButtonStyle.Secondary).setLabel('Информация о треках'))
        .addComponents(new ButtonBuilder().setCustomId(`play.${playlist.code}`).setStyle(ButtonStyle.Secondary).setLabel('Воспроизвести'))

        const row3 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(new ButtonBuilder().setCustomId('leavetochoose').setStyle(ButtonStyle.Primary).setLabel('Вернуться назад'))

        if(playlist.name !== 'Любимые треки') {
            row3.addComponents(new ButtonBuilder().setCustomId(`delete.${playlist.code}`).setStyle(ButtonStyle.Danger).setLabel('Удалить плейлист'))
        }

        return playlist.name === 'Любимые треки' ? [row2, row3] : [row1, row2, row3]
    }

    componentsPage(data: TPlaylist, page: number, menu: boolean = true) {
        const tracks = data.tracks.sort((a, b) => b.addAt - a.addAt)
        
        const row1 = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
            .setCustomId(`trackdelete.${data.code}`)
            .setPlaceholder('Выберите трек, который хотите удалить...')
        )
        for (
            let i = page*10;
            (i < data.tracks.length && i < 10*(page+1));
            i++
        ) {
            const track = tracks[i]
            row1.components[0].addOptions({label: `${track.title}`, description: `${track.author}`, value: `${track.uri}`})
        }

        const row2 = new ActionRowBuilder<ButtonBuilder>()
        if(menu) row2.addComponents(new ButtonBuilder().setCustomId(`info.${data.code}`).setStyle(ButtonStyle.Primary).setLabel('Вернуться назад'))
        row2.addComponents(new ButtonBuilder().setCustomId(`trackback.${data.code}.${page}`).setStyle(ButtonStyle.Secondary).setLabel('Назад'))
        .addComponents(new ButtonBuilder().setCustomId(`trackforward.${data.code}.${page}`).setStyle(ButtonStyle.Secondary).setLabel('Вперед'))

        const maxpage = this.getMaxPage(Number(data.tracks.length), 10)

        if(page+1 >= maxpage || maxpage === 1) {
            row2.components[menu ? 2 : 1].setDisabled(true)
        } else {
            row2.components[menu ? 2 : 1].setDisabled(false)
        }

        if(0 >= page) {
            row2.components[menu ? 1 : 0].setDisabled(true)
        } else {
            row2.components[menu ? 1 : 0].setDisabled(false)
        }

        return menu ? row1.components[0]?.options[0] ? [row1, row2] : [row2] : [row2]
    }

    componentsPlaylistPage(length: number, page: number) {
        const row2 = new ActionRowBuilder<ButtonBuilder>()
        row2.addComponents(new ButtonBuilder().setCustomId(`playlistback.${page}`).setStyle(ButtonStyle.Secondary).setLabel('Назад'))
        .addComponents(new ButtonBuilder().setCustomId(`playlistforward.${page}`).setStyle(ButtonStyle.Secondary).setLabel('Вперед'))

        const maxpage = this.getMaxPage(length, 10)

        if(page+1 >= maxpage || maxpage === 1) {
            row2.components[1].setDisabled(true)
        } else {
            row2.components[1].setDisabled(false)
        }

        if(0 >= page) {
            row2.components[0].setDisabled(true)
        } else {
            row2.components[0].setDisabled(false)
        }

        return [row2]
    }

    private getMaxPage(length: number, count: number = 10) {
        return Math.ceil(length/count) === 0 ? 1 : Math.ceil(length/count)
    }

    choose(start?: string, end?: string) {
        return [
            new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setCustomId(`${start}access${end?`.${end}`:''}`).setStyle(ButtonStyle.Secondary).setEmoji(emojis.check),
                new ButtonBuilder().setCustomId(`${start}cancel${end?`.${end}`:''}`).setStyle(ButtonStyle.Secondary).setEmoji(emojis.cross)
            )
        ]
    }
}