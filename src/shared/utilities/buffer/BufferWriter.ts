import DataTypeBuffer from "./DataTypeBuffer";

const MAX_SIZE = 1073741824

type DataTypes = CFrame | Vector3 | Vector2

/**
 * The BufferWriter class.
 * It provides methods for writing data to a buffer and manipulating the buffer.
 * 
 * @example 
 * const bufferWriter = new BufferWriter(100);  // Create a new BufferWriter with a buffer of size 100.
 * bufferWriter.setCursor(10);  // Set the cursor position to 10.
 * const size = bufferWriter.getSize();  // Get the current size of the data.
 * const buffer = bufferWriter.getBuffer();  // Get the buffer.
 * bufferWriter.resetCursor();  // Reset the cursor position to 0.
 * 
 * @class BufferWriter
 * @author NodeSupport, Sleitnick
 */
export default class BufferWriter {
    /**
     * The buffer that the BufferWriter is writing to.
     * @type {buffer}
     * @private
     */
    private buffer : buffer

    /**
     * The current position of the cursor in the buffer.
     * The cursor position determines where the next write operation will start.
     * It is initially set to 0.
     * @type {number}
     * @private
     */
    private cursor : number = 0

    /**
     * The constructor of the BufferWriter class.
     * It creates a new BufferWriter with a buffer of a specified size.
     * The size is clamped between 0 and the maximum buffer size.
     * 
     * @example
     * const bufferWriter = new BufferWriter(100);  // This will create a new BufferWriter with a buffer of size 100.
     * 
     * @constructor
     * @param {number} size - The initial size of the buffer. This must be an integer between 0 and the maximum buffer size. If not specified, the buffer size is 0.
     * @author NodeSupport, Sleitnick
     */
    constructor(private size : number = 0) {
        this.buffer = buffer.create(math.clamp(this.size, 0, MAX_SIZE))
    }
    
    /**
     * The '_resizeUpTo' method of the BufferWriter class.
     * It resizes the buffer up to the desired size. If the desired size is greater than the maximum size,
     * an error is thrown. If the desired size is less than the current buffer length, no action is taken.
     * If the desired size is not a power of two, the new size is set to the next power of two.
     * 
     * @method _resizeUpTo
     * @param {number} desiredSize - The desired size to resize the buffer to.
     * @throws {Error} If the desired size is greater than the maximum size.
     * @author NodeSupport, Sleitnick
     */
    private _resizeUpTo(desiredSize : number) {
        // Check if the desired size is greater than the maximum size allowed.
        // If so, throw an error.
        if(desiredSize > MAX_SIZE) {
            error(`cannot resize buffer to ${desiredSize} bytes (max size: ${MAX_SIZE} bytes)`, 3)
        }

        // Set the size of the buffer to the maximum of the current size and the desired size.
        this.size = math.max(this.size, desiredSize)

        // If the desired size is less than the current buffer length, no resizing is needed.
        // So, return from the function.
        if(desiredSize < buffer.len(this.buffer)) {
            return
        }

        // Initialize the new size to the desired size.
        let newSize = desiredSize

        // Check if the desired size is a power of two.
        // If not, set the new size to the next power of two.
        const powerOfTwo = math.log(desiredSize, 2)
        if(math.floor(powerOfTwo) !== powerOfTwo) {
            newSize = 2 ** (math.floor(powerOfTwo) + 1)
        }

        // Store the current buffer in oldBuffer.
        const oldBuffer = this.buffer

        // Create a new buffer with the new size.
        const newBuffer = buffer.create(newSize)

        // Copy the contents of the old buffer to the new buffer.
        buffer.copy(newBuffer, 0, oldBuffer, 0)

        // Set the buffer to the new buffer.
        this.buffer = newBuffer   
    }

    /**
     * The 'writeInt8' method of the BufferWriter class.
     * It writes an 8-bit integer to the buffer at the current cursor position.
     * The cursor is then moved forward by 1 byte.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * bufferWriter.writeInt8(127);  // This will write the number 127 to the buffer.
     * 
     * @method writeInt8
     * @param {number} int8 - The 8-bit integer to write to the buffer.
     * @author NodeSupport, Sleitnick
     */
    public writeInt8(int8 : number) {
        // Resize the buffer up to the current cursor position plus 1.
        // This ensures that there is enough space in the buffer to write the 8-bit integer.
        this._resizeUpTo(this.cursor + 1)

        // Write the 8-bit integer to the buffer at the current cursor position.
        buffer.writei8(this.buffer, this.cursor, int8)

        // Move the cursor forward by 1 byte.
        this.cursor += 1
    }

    /**
     * The 'writeUInt8' method of the BufferWriter class.
     * It writes an 8-bit unsigned integer to the buffer at the current cursor position.
     * The cursor is then moved forward by 1 byte.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * bufferWriter.writeUInt8(255);  // This will write the number 255 to the buffer.
     * 
     * @method writeUInt8
     * @param {number} uint8 - The 8-bit unsigned integer to write to the buffer.
     * @author NodeSupport, Sleitnick
     */
    public writeUInt8(uint8 : number) {
        // Resize the buffer up to the current cursor position plus 1.
        // This ensures that there is enough space in the buffer to write the 8-bit unsigned integer.
        this._resizeUpTo(this.cursor + 1)

        // Write the 8-bit unsigned integer to the buffer at the current cursor position.
        buffer.writeu8(this.buffer, this.cursor, uint8)

        // Move the cursor forward by 1 byte.
        this.cursor += 1
    }

    /**
     * The 'writeInt16' method of the BufferWriter class.
     * It writes a 16-bit integer to the buffer at the current cursor position.
     * The cursor is then moved forward by 2 bytes.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * bufferWriter.writeInt16(32767);  // This will write the number 32767 to the buffer.
     * 
     * @method writeInt16
     * @param {number} int16 - The 16-bit integer to write to the buffer.
     * @author NodeSupport, Sleitnick
     */
    public writeInt16(int16 : number) {
        // Resize the buffer up to the current cursor position plus 2.
        // This ensures that there is enough space in the buffer to write the 16-bit integer.
        this._resizeUpTo(this.cursor + 2)

        // Write the 16-bit integer to the buffer at the current cursor position.
        buffer.writei16(this.buffer, this.cursor, int16)

        // Move the cursor forward by 2 bytes.
        this.cursor += 2
    }

    /**
     * The 'writeUInt16' method of the BufferWriter class.
     * It writes a 16-bit unsigned integer to the buffer at the current cursor position.
     * The cursor is then moved forward by 2 bytes.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * bufferWriter.writeUInt16(65535);  // This will write the number 65535 to the buffer.
     * 
     * @method writeUInt16
     * @param {number} uint16 - The 16-bit unsigned integer to write to the buffer.
     * @author NodeSupport, Sleitnick
     */
    public writeUInt16(uint16 : number) {
        // Resize the buffer up to the current cursor position plus 2.
        // This ensures that there is enough space in the buffer to write the 16-bit unsigned integer.
        this._resizeUpTo(this.cursor + 2)

        // Write the 16-bit unsigned integer to the buffer at the current cursor position.
        buffer.writeu16(this.buffer, this.cursor, uint16)

        // Move the cursor forward by 2 bytes.
        this.cursor += 2
    }

    /**
     * The 'writeInt32' method of the BufferWriter class.
     * It writes a 32-bit integer to the buffer at the current cursor position.
     * The cursor is then moved forward by 4 bytes.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * bufferWriter.writeInt32(2147483647);  // This will write the number 2147483647 to the buffer.
     * 
     * @method writeInt32
     * @param {number} int32 - The 32-bit integer to write to the buffer.
     * @author NodeSupport, Sleitnick
     */
    public writeInt32(int32 : number) {
        // Resize the buffer up to the current cursor position plus 4.
        // This ensures that there is enough space in the buffer to write the 32-bit integer.
        this._resizeUpTo(this.cursor + 4)

        // Write the 32-bit integer to the buffer at the current cursor position.
        buffer.writei32(this.buffer, this.cursor, int32)

        // Move the cursor forward by 4 bytes.
        this.cursor += 4
    }

    /**
     * The 'writeUInt32' method of the BufferWriter class.
     * It writes a 32-bit unsigned integer to the buffer at the current cursor position.
     * The cursor is then moved forward by 4 bytes.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * bufferWriter.writeUInt32(4294967295);  // This will write the number 4294967295 to the buffer.
     * 
     * @method writeUInt32
     * @param {number} uint32 - The 32-bit unsigned integer to write to the buffer.
     * @author NodeSupport, Sleitnick
     */
    public writeUInt32(uint32 : number) {
        // Resize the buffer up to the current cursor position plus 4.
        // This ensures that there is enough space in the buffer to write the 32-bit unsigned integer.
        this._resizeUpTo(this.cursor + 4)

        // Write the 32-bit unsigned integer to the buffer at the current cursor position.
        buffer.writeu32(this.buffer, this.cursor, uint32)

        // Move the cursor forward by 4 bytes.
        this.cursor += 4
    }

    /**
     * The 'writeFloat32' method of the BufferWriter class.
     * It writes a 32-bit floating point number to the buffer at the current cursor position.
     * The cursor is then moved forward by 4 bytes.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * bufferWriter.writeFloat32(3.14159);  // This will write the number 3.14159 to the buffer.
     * 
     * @method writeFloat32
     * @param {number} f32 - The 32-bit floating point number to write to the buffer.
     * @author NodeSupport, Sleitnick
     */
    public writeFloat32(f32 : number) {
        // Resize the buffer up to the current cursor position plus 4.
        // This ensures that there is enough space in the buffer to write the 32-bit floating point number.
        this._resizeUpTo(this.cursor + 4)

        // Write the 32-bit floating point number to the buffer at the current cursor position.
        buffer.writef32(this.buffer, this.cursor, f32)

        // Move the cursor forward by 4 bytes.
        this.cursor += 4
    }

    /**
     * The 'writeFloat64' method of the BufferWriter class.
     * It writes a 64-bit floating point number to the buffer at the current cursor position.
     * The cursor is then moved forward by 8 bytes.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * bufferWriter.writeFloat64(3.141592653589793);  // This will write the number 3.141592653589793 to the buffer.
     * 
     * @method writeFloat64
     * @param {number} f64 - The 64-bit floating point number to write to the buffer.
     * @author NodeSupport, Sleitnick
     */
    public writeFloat64(f64 : number) {
        // Resize the buffer up to the current cursor position plus 8.
        // This ensures that there is enough space in the buffer to write the 64-bit floating point number.
        this._resizeUpTo(this.cursor + 8)

        // Write the 64-bit floating point number to the buffer at the current cursor position.
        buffer.writef64(this.buffer, this.cursor, f64)

        // Move the cursor forward by 8 bytes.
        this.cursor += 8
    }

    /**
     * The 'writeBool' method of the BufferWriter class.
     * It writes a boolean value to the buffer at the current cursor position as an 8-bit unsigned integer.
     * The cursor is then moved forward by 1 byte.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * bufferWriter.writeBool(true);  // This will write the boolean value 'true' to the buffer as '1'.
     * 
     * @method writeBool
     * @param {boolean} bool - The boolean value to write to the buffer.
     * @author NodeSupport, Sleitnick
     */
    public writeBool(bool : boolean) {
        // Write the boolean value to the buffer as an 8-bit unsigned integer.
        // 'true' is written as '1', and 'false' is written as '0'.
        this.writeUInt8(bool ? 1 : 0)
    }

    /**
     * The 'writeString' method of the BufferWriter class.
     * It writes a string to the buffer at the current cursor position, preceded by its length as a 32-bit unsigned integer.
     * The cursor is then moved forward by the length of the string plus 4 bytes.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * bufferWriter.writeString("Hello, world!");  // This will write the string "Hello, world!" to the buffer, preceded by its length.
     * 
     * @method writeString
     * @param {string} str - The string to write to the buffer.
     * @param {number} [length] - The maximum length of the string to write. If this is less than the length of the string, the string will be truncated.
     * @author NodeSupport, Sleitnick
     */
    public writeString(str : string, length? : number) {
        // Determine the length of the string to write. If a maximum length is provided, use the smaller of the two.
        const len = length ? math.min(str.size(), length) : str.size()

        // Calculate the size of the data to write to the buffer. This is the length of the string plus 4 bytes for the length of the string.
        const size = len + 4

        // Resize the buffer up to the current cursor position plus the size of the data to write.
        // This ensures that there is enough space in the buffer to write the string and its length.
        this._resizeUpTo(this.cursor + size)

        // Write the length of the string to the buffer as a 32-bit unsigned integer.
        buffer.writeu32(this.buffer, this.cursor, len)

        // Write the string to the buffer at the current cursor position plus 4 bytes.
        buffer.writestring(this.buffer, this.cursor + 4, str, length)

        // Move the cursor forward by the size of the data written.
        this.cursor += size
    }

    /**
     * The 'writeStringRaw' method of the BufferWriter class.
     * It writes a string to the buffer at the current cursor position without preceding it with its length.
     * The cursor is then moved forward by the length of the string.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * bufferWriter.writeStringRaw("Hello, world!");  // This will write the string "Hello, world!" to the buffer.
     * 
     * @method writeStringRaw
     * @param {string} str - The string to write to the buffer.
     * @param {number} [length] - The maximum length of the string to write. If this is less than the length of the string, the string will be truncated.
     * @author NodeSupport, Sleitnick
     */
    public writeStringRaw(str : string, length? : number) {
        // Determine the length of the string to write. If a maximum length is provided, use the smaller of the two.
        const len = length ? math.min(str.size(), length) : str.size()

        // Resize the buffer up to the current cursor position plus the length of the string.
        // This ensures that there is enough space in the buffer to write the string.
        this._resizeUpTo(this.cursor + len)

        // Write the string to the buffer at the current cursor position.
        buffer.writestring(this.buffer, this.cursor, str, length)

        // Move the cursor forward by the length of the string.
        this.cursor += len
    }

    /**
     * The 'writeDataType' method of the BufferWriter class.
     * It writes a value of a specific data type to the buffer at the current cursor position.
     * The data type is determined by the type of the value.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * bufferWriter.writeDataType(123);  // This will write the number 123 to the buffer.
     * bufferWriter.writeDataType("Hello, world!");  // This will write the string "Hello, world!" to the buffer.
     * 
     * @method writeDataType
     * @param {T} value - The value to write to the buffer. The type of the value determines the data type to write.
     * @throws {Error} If the data type of the value is not supported.
     * @author NodeSupport, Sleitnick
     */
    public writeDataType<T extends DataTypes>(value : T) {
        // Determine the data type of the value.
        const t = typeOf(value)

        // Get the read/write methods for the data type.
        const readWrite = DataTypeBuffer.ReadWrite[t]

        // If the data type is not supported, throw an error.
        if(!readWrite) {
            error(`unsupported data type "${t}"`, 2)
        }

        // Write the value to the buffer using the write method for the data type.
        readWrite.write(this, value)
    }

    /**
     * The 'shrink' method of the BufferWriter class.
     * It resizes the buffer to match the current size of the data written to it.
     * If the current size of the data is the same as the size of the buffer, the method does nothing.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * // Write some data to the buffer...
     * bufferWriter.shrink();  // This will resize the buffer to match the current size of the data.
     * 
     * @method shrink
     * @author NodeSupport, Sleitnick
     */
    public shrink() {
        // If the current size of the data is the same as the size of the buffer, do nothing.
        if(this.size === buffer.len(this.buffer)) {
            return
        }

        // Create a new buffer with a size equal to the current size of the data.
        const newBuffer = buffer.create(this.size)

        // Copy the data from the old buffer to the new buffer.
        buffer.copy(newBuffer, 0, this.buffer, 0, this.size)

        // Replace the old buffer with the new buffer.
        this.buffer = newBuffer
    }

    /**
     * The 'getSize' method of the BufferWriter class.
     * It returns the current size of the data written to the buffer.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * // Write some data to the buffer...
     * const size = bufferWriter.getSize();  // This will return the current size of the data.
     * 
     * @method getSize
     * @returns {number} The current size of the data written to the buffer.
     * @author NodeSupport, Sleitnick
     */
    public getSize() {
        return this.size
    }

    /**
     * The 'getCapacity' method of the BufferWriter class.
     * It returns the current capacity of the buffer, which is the maximum amount of data that can be written to it without resizing.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * const capacity = bufferWriter.getCapacity();  // This will return the current capacity of the buffer.
     * 
     * @method getCapacity
     * @returns {number} The current capacity of the buffer.
     * @author NodeSupport, Sleitnick
     */
    public getCapacity() {
        return buffer.len(this.buffer)
    }

    /**
     * The 'setCursor' method of the BufferWriter class.
     * It sets the position of the cursor in the buffer.
     * The cursor position determines where the next write operation will start.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * bufferWriter.setCursor(10);  // This will set the cursor position to 10.
     * 
     * @method setCursor
     * @param {number} position - The new cursor position. This must be an integer between 0 and the current size of the data.
     * @throws {Error} If the position is not an integer or is out of range.
     * @author NodeSupport, Sleitnick
     */
    public setCursor(position : number) {
        // Round the position down to the nearest integer.
        position = math.floor(position)

        // If the position is not an integer or is out of range, throw an error.
        if(position < 0 || position > this.size) {
            error(`cursor position {position} out of range [0, {this.size}]`, 3)
        }

        // Set the cursor position.
        this.cursor = position
    }

    /**
     * The 'getCursor' method of the BufferWriter class.
     * It returns the current position of the cursor in the buffer.
     * The cursor position determines where the next write operation will start.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * const cursorPosition = bufferWriter.getCursor();  // This will return the current cursor position.
     * 
     * @method getCursor
     * @returns {number} The current cursor position.
     * @author NodeSupport, Sleitnick
     */
    public getCursor() {
        return this.cursor
    }

    /**
     * The 'resetCursor' method of the BufferWriter class.
     * It resets the position of the cursor in the buffer to 0.
     * The cursor position determines where the next write operation will start.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * bufferWriter.resetCursor();  // This will reset the cursor position to 0.
     * 
     * @method resetCursor
     * @author NodeSupport, Sleitnick
     */
    public resetCursor() {
        this.cursor = 0
    }

    /**
     * The 'getBuffer' method of the BufferWriter class.
     * It returns the buffer that the BufferWriter is writing to.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * const buffer = bufferWriter.getBuffer();  // This will return the buffer that the BufferWriter is writing to.
     * 
     * @method getBuffer
     * @returns {Buffer} The buffer that the BufferWriter is writing to.
     * @author NodeSupport, Sleitnick
     */
    public getBuffer() {
        return this.buffer
    }

    /**
     * The 'toString' method of the BufferWriter class.
     * It converts the buffer to a string and returns it.
     * 
     * @example
     * const bufferWriter = new BufferWriter();
     * // Write some data to the buffer...
     * const str = bufferWriter.toString();  // This will convert the buffer to a string and return it.
     * 
     * @method toString
     * @returns {string} The buffer converted to a string.
     * @author NodeSupport, Sleitnick
     */
    public toString() {
        return buffer.tostring(this.buffer)
    }
}