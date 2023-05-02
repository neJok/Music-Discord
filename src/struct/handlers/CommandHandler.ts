import { Collection } from "discord.js"
import { readdir } from 'fs'
import ICommand from "@customTypes/struct/base/Command"

export default class CommandHandler {
    readonly path: string = `${__dirname}/../../app/center/commands`
    cache: Collection<string, ICommand> = new Collection()
        
    load() {
        readdir(this.path, (err, files) => {
            if(err) return

            files.filter(f => f.endsWith('.ts') || f.endsWith('.js')).forEach(async file => {
                const cmd = (await import(`${this.path}/${file}`)).default as ICommand
                if(!cmd.options?.disabled) this.cache.set(cmd.name, cmd)
            })
        })
    }
}