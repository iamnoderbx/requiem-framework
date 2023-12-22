import BufferWriter from "shared/utilities/buffer/BufferWriter";
import { Requiem } from "../shared/requiem";
import BufferReader from "shared/utilities/buffer/BufferReader";

Requiem.path(script.Parent as Instance);
Requiem.ignite()

/**
 * 
 * Debugging a level, ignore.
 *  
 */

const replicatedStorage = game.GetService("ReplicatedStorage");
const existing = replicatedStorage.WaitForChild("streamables") as Folder

const REGION_SIZE = 2048
const REGION_GRID = 4

const LEVEL_SIZE = REGION_GRID * REGION_SIZE

const level : Chunks.Level = {
    center: new Vector2(0, 0),
    regions: []
}

const collectionService = game.GetService("CollectionService");
collectionService.GetTagged("Streamable").forEach((instance) => {
    const id : number | undefined = tonumber(instance.GetAttribute("id"));
    if(id === undefined || !existing) return

    if(!instance.IsDescendantOf(game.Workspace)) return
    if(!instance.IsA("Model")) return

    const location = instance.GetPivot()
    const scale = instance.GetScale()
    
    const doesAssetExist = existing.FindFirstChild(tostring(id))

    if(!doesAssetExist) {
        const clone = instance.Clone()
        clone.Parent = existing
        clone.Name = tostring(id)
    }

    // We need to find what region this asset belongs to
    // within the level

    const x = math.floor(location.X / REGION_SIZE)
    const y = math.floor(location.Z / REGION_SIZE)

    const region = level.regions.find((region) => {
        return region.position.X === x && region.position.Y === y
    })

    if(!region) {
        const region : Chunks.Region = {
            id: level.regions.size(),
            position: new Vector2(x, y),
            instances: []
        }

        level.regions.push(region)
    }

    const regionInstance = level.regions.find((region) => {
        return region.position.X === x && region.position.Y === y
    })

    if(!regionInstance) return

    const streamable : Chunks.Streamable = {
        id: id,
        location: location,
        scale: scale
    }

    regionInstance.instances.push(streamable)
})

// This is how we will compile our data into a buffer
const buffer = new BufferWriter()
buffer.writeDataType(level.center)
buffer.writeUInt16(level.regions.size())

level.regions.forEach((region) => {
    buffer.writeDataType(region.position)
    buffer.writeUInt16(region.instances.size())

    region.instances.forEach((instance) => {
        buffer.writeUInt16(instance.id)
        buffer.writeDataType(instance.location)
        buffer.writeUInt8(instance.scale)
    })
})

// This is how we will decode our buffer
const reader = new BufferReader(buffer)

const center = reader.readDataType(Vector2)
const regionCount = reader.readUInt16()

// Now we need to loop through each region in the buffer

const regions : Chunks.Region[] = []

for(let i = 0; i < regionCount; i++) {
    const region : Chunks.Region = {
        id: i,
        position: reader.readDataType(Vector2),
        instances: []
    }

    const instanceCount = reader.readUInt16()

    for(let j = 0; j < instanceCount; j++) {
        const streamable : Chunks.Streamable = {
            id: reader.readUInt16(),
            location: reader.readDataType(CFrame),
            scale: reader.readUInt8()
        }

        region.instances.push(streamable)
    }

    regions.push(region)
}

let decodedLevel : Chunks.Level = {
    center: center,
    regions: regions
}

print(decodedLevel)