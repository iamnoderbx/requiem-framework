import Maid from "@rbxts/maid";
import Object from "@rbxts/object-utils";
import reflection from "./reflection";

export interface Start {
    start(): void
}

export interface Initialize {
    initialize(): void
}

export function ResolveClassDependencies<T extends object>(object : T) {
    const constructor = object as T & {dependencies: Record<string, unknown>}
    const services = reflection.getClassesWithMetaTag("service")

    if(constructor.dependencies) {
        Object.entries(constructor.dependencies).forEach(([key, value]) => {
            services.forEach((service) => {
                const name = reflection.getClassMetaTag(service, "name")
                if(name === key) {
                    const constructorAsRecord = constructor as unknown as Record<string, unknown>
                    constructorAsRecord[key] = service
                }
            })
        })
    }
}

export function ResolveClassListeners<C extends object>(object : C, instance : Instance) {
    const classWithConstructor = object as unknown as {
        constructor : (newObject : C, ...args : unknown[]) => void
    }
    
    const oldConstructor = classWithConstructor.constructor

    classWithConstructor.constructor = (newObject : C, ...args : unknown[]) => {
        const connections : RBXScriptConnection[] = []

        const constructorWithListeners = newObject as C & { maid?: Maid, listeners: Record<string, (...args : unknown[]) => void> }
        if (constructorWithListeners.listeners) {
            Object.entries(constructorWithListeners.listeners).forEach(([key, value]) => {
                const connection = (instance as unknown as Record<string, RBXScriptSignal>)[key]
                connections.push(connection.Connect((...args : unknown[]) => {
                    constructorWithListeners.listeners[key](newObject, ...args)
                }))
            })
        }

        oldConstructor(newObject, ...args)

        if(constructorWithListeners.maid) connections.forEach((connection) => {
            constructorWithListeners.maid?.GiveTask(connection)
        })
    }

    return classWithConstructor
}

export function EventHandler(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<() => void>) {
    const objectWithListeners = target as unknown & { listeners: Record<string, (...args : unknown[]) => void> }
    const removedPrefix = propertyKey.sub(3)

    objectWithListeners.listeners = {}
    objectWithListeners.listeners[removedPrefix] = descriptor.value!

    return descriptor
}

export function Service(object : Instance | void) {
    // You can add logic here for the decorator
    return <C extends new (...args: any[]) => {}>(constructor: C) => {
        const extendedClass = class extends constructor {
            instance = object
        } as C

        const classWithConstructor = extendedClass as unknown as {
            constructor : (newObject : C, ...args : unknown[]) => void
            start? : () => void,
            initialize? : () => void
        }
        
        const oldConstructor = classWithConstructor.constructor
        classWithConstructor.constructor = (newObject : C & {start? : () => void, initialize?: () => void}, ...args : unknown[]) => {
            reflection.addMetaTagToClass(newObject, "service", true)
            reflection.addMetaTagToClass(newObject, "name", string.lower(tostring(constructor)))

            if(newObject.initialize) reflection.addMetaTagToClass(newObject, "initialize", newObject.start)
            if(newObject.start) reflection.addMetaTagToClass(newObject, "start", newObject.start)
            oldConstructor(newObject, ...args)
        }

        ResolveClassListeners(classWithConstructor, object as Instance)
        
        const service = new extendedClass()
        return service as unknown as C
    };
}

export function Controller(object : Instance | void) {
    return Service(object)
}

export function DataComponent<T extends object>(event : BindableEvent | undefined) {
    return <C extends new (...args: any[]) => {}>(constructor: C) => {
        const extendedClass = class extends constructor {
            data = {} as T; 
            initialize?(this: object): void
        }

        event?.Event.Connect((...args : unknown[]) => {
            const passedInstance = args[0] as Instance
            ResolveClassListeners(extendedClass, passedInstance)
            
            const newClass = new extendedClass(passedInstance)
            newClass.data = passedInstance as unknown as T

            ResolveClassDependencies(newClass)

            if(newClass.initialize !== undefined) {
                newClass.initialize()
            }

            reflection.onComponentAdded<T>(passedInstance, newClass)
        })

        return extendedClass
    };
}

export function EntityComponent<T extends object>(event : BindableEvent | undefined) {
    // You can add logic here for the decorator
    return <C extends new (...args: any[]) => {}>(constructor: C) => {
        const extendedClass = class extends constructor {
            instance = {} as T;
            initialize?(this: object): void
        }

        event?.Event.Connect((...args : unknown[]) => {
            const passedInstance = args[0] as Instance
            ResolveClassListeners(extendedClass, passedInstance)
            
            const newClass = new extendedClass(passedInstance)
            newClass.instance = passedInstance as unknown as T

            reflection.onComponentAdded<T>(passedInstance, newClass)
            ResolveClassDependencies(newClass)

            if(newClass.initialize !== undefined) {
                newClass.initialize()
            }
        })

        return extendedClass
    };
}

export class BaseComponent<T = object> {}

export class BaseInstanceComponent<T = object> extends BaseComponent{
    // Class content here
    protected instance = {} as T

    getInstance() {
        return this.instance
    }
}

export class BaseObjectComponent<T = object> extends BaseComponent {
    public data = {} as T

    getData() {
        return this.data
    }
}

export class BaseService extends BaseInstanceComponent {}
export class BaseController extends BaseInstanceComponent {}

export class BaseDataComponent<T> extends BaseObjectComponent<T> {
    protected maid = new Maid()
}

export class BaseEntityComponent<T> extends BaseInstanceComponent<T> {
    protected maid = new Maid()
}

type AddPrefixToProperties<T> = {
    [K in keyof T as `on${Capitalize<string & K>}`]: T[K]
};

export type Listeners<T> = Partial<AddPrefixToProperties<T>>