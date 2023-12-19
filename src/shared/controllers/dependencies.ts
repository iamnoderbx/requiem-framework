export function Dependency<T>(target : object, propertyKey : string) {
    // You can add logic here for the decorator
    const constructor = target as Record<string, unknown>;
    constructor[propertyKey] = propertyKey
}