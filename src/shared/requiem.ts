import reflection from "shared/controllers/reflection";
import { Parallel } from "./parallel";

export namespace Requiem {
    let paths = new Map<string, Instance>()

    export let services : object & Services;
    export let resolve: <T> () => T

    export let folder : requiem = game.GetService("ReplicatedStorage").WaitForChild("requiem") as requiem
    export let Threading = Parallel

    export let events = new class {
        private map = new Map<string, BindableEvent>()

        public get(id : string) {
            if(!this.map.has(id)) {
                this.register(id)
            }

            return this.map.get(id)
        }

        register(id : string) {
            if(this.map.has(id)) {
                return this.map.get(id) as BindableEvent
            }

            const event = new Instance("BindableEvent")
            this.map.set(id, event)

            return event
        }
    }
    
    export let components = new class {
        added<T>(instance? : unknown) {
            return new Promise<T>((resolve) => {
                const event = reflection.onComponentEvent
                if(!event) return error("Event 'OnComponentAdded' does not exist!")

                const connection = event.Connect((passedInstance : unknown, component : T) => {
                    if(!instance) {
                        connection.Disconnect()
                        resolve(component)
                        return
                    }

                    if(passedInstance === instance) {
                        connection.Disconnect()
                        resolve(component)
                    }
                })
            })
        }

        // addedWithID<T>(tag : string) {
        //     return new Promise<T>((resolve) => {
        //         const event = reflection.onComponentEvent
        //         if(!event) return error("Event 'OnComponentAdded' does not exist!")

        //         event.Connect((instance : {id: string}, component : T) => {
        //             if(!instance) return
                    
        //             if(instance.id === tag) {
        //                 resolve(component)
        //             }
        //         })
        //     })
        // }
    }

    export let path = (path : Instance) => {
        paths.set(path.GetFullName(), path)
    }

    const initializeModulesWithTag = () => {
        reflection.getClassesWithMetaTag("initialize").forEach((classObject) => {
            const objectWithInitialize = classObject as unknown as {initialize: (this: typeof classObject) => {}}
            objectWithInitialize.initialize()
        })
    }

    const startModulesWithTag = () => {
        reflection.getClassesWithMetaTag("start").forEach((classObject) => {
            const objectWithStart = classObject as unknown as {start: (this: typeof classObject) => {}}
            objectWithStart.start()
        })
    }

    export let ignite = () => {
        paths.forEach((value, key) => {
            value.GetDescendants().forEach((descendant) => {
                if(descendant.IsA("ModuleScript")) {
                    require(descendant)
                }
            })
        })
        
        initializeModulesWithTag()
        startModulesWithTag()
    }
}

Requiem.services = setmetatable({}, {
    __index: (_ : object, key : unknown) => {
        return game.GetService(key as keyof Services)
    }
}) as Services
