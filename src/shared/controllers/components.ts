import Maid from "@rbxts/maid";
import Object from "@rbxts/object-utils";

export interface Start {
    start(): void
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

        const classWithConstructor = extendedClass as unknown as {constructor : (newObject : C, ...args : unknown[]) => void}
        const oldConstructor = classWithConstructor.constructor

        classWithConstructor.constructor = (newObject : C, ...args : unknown[]) => {
            const constructorWithListeners = newObject as C & { listeners: Record<string, (...args : unknown[]) => void> }
            if (constructorWithListeners.listeners) {
                Object.entries(constructorWithListeners.listeners).forEach(([key, value]) => {
                    const connection = (object as unknown as Record<string, RBXScriptSignal>)[key]
                    connection.Connect((...args : unknown[]) => {
                        constructorWithListeners.listeners[key](newObject, ...args)
                    })
                })
            }

            oldConstructor(newObject, ...args)
        }

        return classWithConstructor as unknown as C
    };
}

export function EntityComponent<T extends object>(parent : Instance | void) {
    // You can add logic here for the decorator
    return <C extends new (...args: any[]) => {}>(constructor: C) => {
        return class extends constructor {
            instance = {} as T
        }
    };
}

export class BaseComponent<T = object> {
    // Class content here
    protected instance = {} as T

    getInstance() {
        return this.instance
    }

    getEvents() {
        print(this)
    }
}

export class BaseService extends BaseComponent {

}

export class BaseEntityComponent<T> extends BaseComponent<T> {
    protected maid = new Maid()
}

type AddPrefixToProperties<T> = {
    [K in keyof T as `on${Capitalize<string & K>}`]: T[K]
};

export type Listeners<T> = Partial<AddPrefixToProperties<T>>