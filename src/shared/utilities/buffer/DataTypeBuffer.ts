import BufferReader from "./BufferReader"
import BufferWriter from "./BufferWriter"

type ReadWritePair = {
    write : <T>(writer: BufferWriter, value: T) => void,
    read : (writer: BufferReader) => unknown
}

const DataTypeBuffer = {
    ReadWrite : {} as { [key: string]: ReadWritePair },
    DataTypesToString: {
        [CFrame as any]: "CFrame",
        [Vector3 as any]: "Vector3",
        [Vector2 as any]: "Vector2",
    }
}

DataTypeBuffer.ReadWrite.CFrame = {
    write : <T>(writer : BufferWriter, cframe : T) => {
        const cf = cframe as T & CFrame

        DataTypeBuffer.ReadWrite.Vector3.write(writer, cf.Position)
        DataTypeBuffer.ReadWrite.Vector3.write(writer, cf.XVector)
        DataTypeBuffer.ReadWrite.Vector3.write(writer, cf.YVector)
        DataTypeBuffer.ReadWrite.Vector3.write(writer, cf.ZVector)
    },
    
    read : (reader : BufferReader) : CFrame => {
        const position = DataTypeBuffer.ReadWrite.Vector3.read(reader) as Vector3
        const xVector = DataTypeBuffer.ReadWrite.Vector3.read(reader) as Vector3
        const yVector = DataTypeBuffer.ReadWrite.Vector3.read(reader) as Vector3
        const zVector = DataTypeBuffer.ReadWrite.Vector3.read(reader) as Vector3

        return CFrame.fromMatrix(position, xVector, yVector, zVector)
    }
}

DataTypeBuffer.ReadWrite.Vector3 = {
    write : <T>(writer : BufferWriter, v3 : T) => {
        const vector3 = v3 as T & Vector3
        writer.writeFloat32(vector3.X)
        writer.writeFloat32(vector3.Y)
        writer.writeFloat32(vector3.Z)
    },

    read : (reader : BufferReader) : Vector3 => {
        const x = reader.readFloat32()
        const y = reader.readFloat32()
        const z = reader.readFloat32()
        return new Vector3(x, y, z)
    }
}

DataTypeBuffer.ReadWrite.Vector2 = {
    write : <T>(writer : BufferWriter, v3 : T) => {
        const vector2 = v3 as T & Vector2
        writer.writeFloat32(vector2.X)
        writer.writeFloat32(vector2.Y)
    },

    read : (reader : BufferReader) : Vector2 => {
        const x = reader.readFloat32()
        const y = reader.readFloat32()
        return new Vector2(x, y)
    }
}

export default DataTypeBuffer