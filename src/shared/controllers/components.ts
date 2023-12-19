import Maid from "@rbxts/maid";

export function EventHandler(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<() => void>) {
    return descriptor
}

export function Service() {
    // You can add logic here for the decorator
    return <C extends new (...args: any[]) => {}>(constructor: C) => {
        return class extends constructor {}
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

export class BaseComponent<T> {
    // Class content here
    protected instance = {} as T

    getInstance() {
        return this.instance
    }
}

export class BaseEntityComponent<T> extends BaseComponent<T> {
    protected maid = new Maid()
}

type AddPrefixToProperties<T> = {
    [K in keyof T as `on${Capitalize<string & K>}`]: T[K]
};

export type Listeners<T> = Partial<AddPrefixToProperties<T>>