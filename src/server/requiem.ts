import reflection from "shared/controllers/reflection";

export namespace Requiem {
    let paths = new Map<string, Instance>()

    export let services : object & Services;
    export let resolve: <T> () => T

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
        added<T>(instance : Instance) {
            return new Promise<T>((resolve) => {
                const event = reflection.onComponentEvent
                if(!event) return error("Event 'OnComponentAdded' does not exist!")

                const connection = event.Event.Connect((passedInstance : Instance, component : T) => {
                    if(passedInstance === instance) {
                        connection.Disconnect()
                        resolve(component)
                    }
                })
            })
        }
    }

    export let path = (path : Instance) => {
        paths.set(path.GetFullName(), path)
    }

    const startModulesWithTag = () => {
        reflection.getClassesWithMetaTag("start").forEach((classObject) => {
            //const constructor = classObject as unknown as {new(...args : unknown[]) : {}}
            //const object = new constructor()

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
        
        startModulesWithTag()
    }
}

Requiem.services = setmetatable({}, {
    __index: (_ : object, key : unknown) => {
        return game.GetService(key as keyof Services)
    }
}) as Services
