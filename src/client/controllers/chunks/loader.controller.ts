import { Controller, Initialize, Start } from "shared/controllers/components";
import BufferReader from "shared/utilities/buffer/BufferReader";
import BufferWriter from "shared/utilities/buffer/BufferWriter";

export type SpatialChunkData = {

}

export type ChunkPlaceMap = {

}

@Controller()
export class Chunks implements Start, Initialize {
    public initialize(): void {
        const buffer = new BufferWriter()
        buffer.writeInt16(51)
        buffer.writeDataType(new CFrame(1241.1412, 5125, 15125.314))
        buffer.writeDataType(new Vector3(1524, 213.2, 1.512))

        const parse = new BufferReader(buffer)

        print(parse.readInt16())
        print(parse.readDataType(CFrame))
        print(parse.readDataType(Vector3))
    }

    public start(): void {

    }
}