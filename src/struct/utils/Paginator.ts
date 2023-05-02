import { ActionRowBuilder, ButtonBuilder, ButtonStyle, APIEmbed, APIEmbedFooter } from 'discord.js'

export default abstract class Paginator {
    wastebasket: boolean = false

    getPage(embed: APIEmbed, type: boolean) {
        const page = (embed.footer as APIEmbedFooter).text.split('/')[0].split(' ')[(embed.footer as APIEmbedFooter).text.split('/')[0].split(' ').length-1]
        return (type ? Number(page) : Number(page)-1) || 0
    }

    static getPage(embed: APIEmbed, type: boolean) {
        const page = (embed.footer as APIEmbedFooter).text.split('/')[0].split(' ')[(embed.footer as APIEmbedFooter).text.split('/')[0].split(' ').length-1]
        return (type ? Number(page) : Number(page)-1) || 0
    }

    getAllPages(array: Array<object>, count: number) {
        return Math.ceil(array.length/count) === 0 ? 1 : Math.ceil(array.length/count)
    }

    static getAllPages(array: Array<object>, count: number) {
        return Math.ceil(array.length/count) === 0 ? 1 : Math.ceil(array.length/count)
    }

    getMaxPage(embed: APIEmbed) {
        return Number((embed.footer as APIEmbedFooter).text.split('/')[1])
    }

    components(
        embed: APIEmbed,
        page: number = 1
    ) {
        const components = new ActionRowBuilder<ButtonBuilder>()

        components.addComponents(new ButtonBuilder().setCustomId('arrowLeft').setStyle(ButtonStyle.Secondary).setLabel('Назад'))
        components.addComponents(new ButtonBuilder().setCustomId('arrowRight').setStyle(ButtonStyle.Secondary).setLabel('Вперёд'))

        if(this.wastebasket) {
            components.addComponents(new ButtonBuilder().setCustomId('wastebasket').setStyle(ButtonStyle.Danger).setLabel('Удалить'))
        }
        
        const maxpage = this.getMaxPage(embed)

        if(page >= maxpage || maxpage == 1) {
            components.components[
                components.components.findIndex((button: ButtonBuilder) => button.data.label === 'Вперёд')
            ].setDisabled(true)
        } else {
            components.components[
                components.components.findIndex((button) => button.data.label === 'Вперёд')
            ].setDisabled(false)
        }

        if(1 >= page) {
            components.components[
                components.components.findIndex((button) => button.data.label === 'Назад')
            ].setDisabled(true)
        } else {
            components.components[
                components.components.findIndex((button) => button.data.label === 'Назад')
            ].setDisabled(false)
        }

        return components
    }
}