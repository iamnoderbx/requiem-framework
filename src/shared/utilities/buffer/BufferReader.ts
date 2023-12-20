// local BufferReader = {}
// BufferReader.__index = BufferReader

import BufferWriter from "./BufferWriter";
import DataTypeBuffer from "./DataTypeBuffer";

type DataTypes = CFrame | Vector3

export default class BufferReader {
    private buffer : buffer = buffer.create(0)
    private size : number = 0 
    private cursor : number = 0

    constructor(buf: string | buffer | BufferWriter) {
        if(typeOf(buf) === "string") {
            this.fromString(buf as string)
            return
        } else if(typeOf(buf) as string === "buffer") {
            this.fromBuffer(buf as buffer)
            return
        } else if(typeOf(buf) === "table") {
            this.fromBuffer((buf as BufferWriter).getBuffer())
            return
        }

        error(`expected string or buffer; got ${typeOf(buf)}`)       
    }

    private fromString(str: string) {
        this.fromBuffer(buffer.fromstring(str))
    }

    private fromBuffer(buf: buffer) {
        this.buffer = buf
        this.size = buffer.len(buf)
        this.cursor = 0
    }
    
    private _assertSize(desiredSize: number) {
        if(desiredSize > this.size) {
            error(`cursor out of bounds`, 3)
        }
    }

    public readInt8() {
        this._assertSize(this.cursor + 1)
        const n = buffer.readi8(this.buffer, this.cursor)
        this.cursor += 1
        return n
    }

    public readUInt8() {
        this._assertSize(this.cursor + 1)
        const n = buffer.readu8(this.buffer, this.cursor)
        this.cursor += 1
        return n
    }

    public readInt16() {
        this._assertSize(this.cursor + 2)
        const n = buffer.readi16(this.buffer, this.cursor)
        this.cursor += 2
        return n
    }

    public readUInt16() {
        this._assertSize(this.cursor + 2)
        const n = buffer.readu16(this.buffer, this.cursor)
        this.cursor += 2
        return n
    }

    public readInt32() {
        this._assertSize(this.cursor + 4)
        const n = buffer.readi32(this.buffer, this.cursor)
        this.cursor += 4
        return n
    }

    public readUInt32() {
        this._assertSize(this.cursor + 4)
        const n = buffer.readu32(this.buffer, this.cursor)
        this.cursor += 4
        return n
    }

    public readFloat32() {
        this._assertSize(this.cursor + 4)
        const n = buffer.readf32(this.buffer, this.cursor)
        this.cursor += 4
        return n
    }

    public readFloat64() {
        this._assertSize(this.cursor + 8)
        const n = buffer.readf64(this.buffer, this.cursor)
        this.cursor += 8
        return n
    }

    public readBool() {
        const n = this.readUInt8()
        return n === 1
    }

    public readString() {
        const strLen = this.readUInt32()
        this._assertSize(this.cursor + strLen)
        const s = buffer.readstring(this.buffer, this.cursor, strLen)
        this.cursor += strLen
        return s
    }

    public readStringRaw(length: number) {
        length = math.max(0, math.floor(length))
        this._assertSize(this.cursor + length)
        const s = buffer.readstring(this.buffer, this.cursor, length)
        this.cursor += length
        return s
    }

    public readDataType<T extends DataTypes>(dataType: new () => T): T {
        const name = DataTypeBuffer.DataTypesToString[dataType as unknown as keyof typeof DataTypeBuffer.DataTypesToString]
        if(!name) {
            error("unsupported data type", 2)
        }

        const readWrite = DataTypeBuffer.ReadWrite[name]
        return readWrite.read(this) as T
    }

    public setCursor(position: number) {
        position = math.floor(position)
        if(position < 0 || position > this.size) {
            error(`cursor position {position} out of range [0, {this.size}]`, 3)
        }

        this.cursor = position
    }

    public getCursor() {
        return this.cursor
    }

    public resetCursor() {
        this.cursor = 0
    }

    public getSize() {
        return this.size
    }

    public getBuffer() {
        return this.buffer
    }

    public toString() {
        return "BufferReader"
    }
}