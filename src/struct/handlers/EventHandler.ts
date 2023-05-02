import { Client, Collection } from "discord.js"
import { readdir } from 'fs'
import IEvent from "@customTypes/struct/base/Event"
import {MusicCenter} from "../clients/MusicCenter"
import {Provider} from "@struct/clients/Provider"
import RadioClient from "@struct/clients/RadioClient"

export default class EventHandler {
    cache: Collection<string, IEvent> = new Collection()
    client: Client
    path: string

    constructor(client: MusicCenter | Provider | RadioClient, type: string) {
        this.client = client
        this.path = `${__dirname}/../../app/${type}/events`
    }
        
    load() {
        readdir(this.path, (err, files) => {
            if(err) return

            files.filter(f => f.endsWith('.ts') || f.endsWith('.js')).forEach(async file => {
                const event = (await import(`${this.path}/${file}`)).default as IEvent
                if(!event.options?.disabled) this.cache.set(event.name, event)
                this.client.on(event.name, event.run.bind(null, this.client))
            })
        })
    }
}