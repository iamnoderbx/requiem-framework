type UnknownArgumentType<T> = (result : T) => unknown

// A custom event in which allows you to pass tables while
// keeping their unique meta data properties.
export class MetadataEvent<T> {
    private connections : UnknownArgumentType<unknown>[] = []

    public Fire(...args : T[]) {
        this.connections.forEach((connection) => {
            connection(...args as unknown as [unknown])
        })
    }

    public Connect(callback : (...args : any[]) => void) {
        this.connections.push(callback as unknown as UnknownArgumentType<unknown>)

        return {
            Disconnect : () => {
                this.connections = this.connections.filter((connection) => connection !== callback)
            }
        }
    }
}