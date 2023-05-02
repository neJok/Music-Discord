import { Collection, RequestManager } from "discord.js"
import { readdir } from 'fs'
import IInteraction from "@customTypes/struct/base/Interaction"

export default class InteractionHandler {
    path: string = `${__dirname}/../../app/center/`
    cache: Collection<string, IInteraction> = new Collection()

    constructor(dir: string) {
        this.path += dir
    }
        
    load() {
        readdir(this.path, (err, files) => {
            if(err) return

            files.filter(f => f.endsWith('.ts') || f.endsWith('.js')).forEach(async file => {
                const btn = (await import(`${this.path}/${file}`)).default as IInteraction
                if(!btn.options?.disabled) this.cache.set(btn.name, btn)
            })
        })
    }
}