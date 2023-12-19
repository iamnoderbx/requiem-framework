export function Dependency<T>(target : object, propertyKey : string) {
    // You can add logic here for the decorator
    const constructor = target as T & {dependencies: Record<string, unknown>}
    constructor.dependencies = constructor.dependencies || {}
    constructor.dependencies[propertyKey] = true
}