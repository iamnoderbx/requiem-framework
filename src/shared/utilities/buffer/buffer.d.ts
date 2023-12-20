interface buffer {}

declare namespace buffer {
    /**
     * `buffer.create()` Create a buffer object with a specific size.
     *
     * Creates a buffer of the requested size with all bytes initialized to 0. Size limit is 1 GB, or 1,073,741,824 bytes. 
     * Keep in mind that larger buffers might fail to allocate if device is running low on memory.
     * 
     * @example
     * const buffer = buffer.create(16)
     *
     * @param size - The size of the buffer
     * @returns A new buffer object.
     * 
     * @see https://create.roblox.com/docs/reference/engine/libraries/buffer#create
     */
    export function create(size : number) : buffer

    /**
     * `buffer.fromstring()` Create a buffer object with a specific size.
     *
     * Creates a buffer initialized to the contents of the string. The size of the buffer equals the length of the string.
     * 
     * @example
     * const buffer = buffer.fromstring(<string>)
     *
     * @param string - The string to convert to a buffer
     * @returns A new buffer object.
     * 
     * @see https://create.roblox.com/docs/reference/engine/libraries/buffer#fromstring
     */
    export function fromstring(string : string) : buffer

    export function tostring(buffer : buffer) : string

    export function len(buffer : buffer) : number

    export function readi8(buffer : buffer, offset : number) : number

    export function readu8(buffer : buffer, offset : number) : number

    export function readi16(buffer : buffer, offset : number) : number

    export function readu16(buffer : buffer, offset : number) : number

    export function readi32(buffer : buffer, offset : number) : number

    export function readu32(buffer : buffer, offset : number) : number

    export function readf32(buffer : buffer, offset : number) : number

    export function readf64(buffer : buffer, offset : number) : number

    export function writei8(buffer : buffer, offset : number, value : number) : void

    export function writeu8(buffer : buffer, offset : number, value : number) : void

    export function writei16(buffer : buffer, offset : number, value : number) : void

    export function writeu16(buffer : buffer, offset : number, value : number) : void

    export function writei32(buffer : buffer, offset : number, value : number) : void

    export function writeu32(buffer : buffer, offset : number, value : number) : void

    export function writef32(buffer : buffer, offset : number, value : number) : void

    export function writef64(buffer : buffer, offset : number, value : number) : void

    export function readstring(buffer : buffer, offset : number, count : number) : string

    export function writestring(buffer : buffer, offset : number, value : string, count?: number) : void

    export function copy(target : buffer, targetOffset : number, source : buffer, sourceOffset? : number, count? : number) : void

    export function fill(buffer : buffer, offset : number, value : number, count : number) : void
}