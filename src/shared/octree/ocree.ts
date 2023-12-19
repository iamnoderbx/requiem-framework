import Object from "@rbxts/object-utils"

type Node<T> = {
    Position: Vector3,
    Object: T,
    Region?: Region<T>
}

type Region<T> = {
	Center: Vector3,
	Size: number,
	Radius: number,
	Regions: Region<T>[],
	Parent?: Region<T>,
	Level: number,
	Nodes?: Node<T>[],
}

const MAX_SUB_REGIONS = 4
const DEFAULT_TOP_REGION_SIZE = 512

function IsPointInBox(point: Vector3, boxCenter: Vector3, boxSize: number): boolean {
    const half = boxSize / 2
    return point.X >= boxCenter.X - half
        && point.X <= boxCenter.X + half
        && point.Y >= boxCenter.Y - half
        && point.Y <= boxCenter.Y + half
        && point.Z >= boxCenter.Z - half
        && point.Z <= boxCenter.Z + half
}

function RoundTo(x: number, mult: number): number {
    return math.round(x / mult) * mult
}

function SwapRemove<T>(tbl: Record<number, unknown>, index: number): void {
    const n = (tbl as []).size()
    tbl[index] = tbl[n]
    tbl[n] = undefined
}

function CountNodesInRegion<T>(region: Region<T>): number {
    let n = 0
    if (region.Nodes) {
        return (region.Nodes as []).size()
    } else {
        for (const subRegion of region.Regions) {
            n += CountNodesInRegion(subRegion)
        }
    }
    return n
}

function GetTopRegion<T>(octree: Octree<T>, position: Vector3, create: boolean): Region<T> {
    const size = octree.Size
    const origin = new Vector3(RoundTo(position.X, size), RoundTo(position.Y, size), RoundTo(position.Z, size))
    let region = octree.Regions.get(origin)
    if (!region && create) {
        region = {
            Regions: [],
            Level: 1,
            Size: size,
            Radius: math.sqrt(size * size + size * size + size * size),
            Center: origin,
        }
        table.freeze(region)
        octree.Regions.set(origin, region)
    }

    return region as Region<T>
}

function GetRegionsInRadius<T>(octree: Octree<T>, position: Vector3, radius: number): Region<T>[] {
    const regionsFound : Region<T>[] = []

    let totalScanLoopCount = 0;
    
    const ScanRegions = (regions: Region<T>[]): void => {
        // Find regions that have overlapping radius values
        for (const region of regions) {
            totalScanLoopCount++;
            const distance = (position.sub(region.Center)).Magnitude
            if (distance < (radius + region.Radius)) {
                if (region.Nodes) {
                    regionsFound.push(region)
                } else {
                    ScanRegions(region.Regions)
                }
            }
        }
    }

    const startRegions = new Map<Region<T>, boolean>()
    const size = octree.Size
    const maxOffset = math.ceil(radius / size)
    
    if (radius < octree.Size) {
        // Find all surrounding regions in a 3x3 cube:
        for (let i = 0; i < 27; i++) {
            // Get surrounding regions:
            const x = i % 3 - 1
            const y = math.floor(i / 9) - 1
            const z = math.floor(i / 3) % 3 - 1
            const offset = new Vector3(x * radius, y * radius, z * radius)
            const startRegion = GetTopRegion(octree, position.add(offset), false)

            if (startRegion && !startRegions.has(startRegion)) {
                startRegions.set(startRegion, true)
                ScanRegions(startRegion.Regions)
            }

        }
    } else if (maxOffset <= 3) {
        // Find all surrounding regions:
        for (let x = -maxOffset; x <= maxOffset; x++) {
            for (let y = -maxOffset; y <= maxOffset; y++) {
                for (let z = -maxOffset; z <= maxOffset; z++) {
                    const offset = new Vector3(x * size, y * size, z * size)
                    const startRegion = GetTopRegion(octree, position.add(offset), false)

                    if (startRegion && !startRegions.has(startRegion)) {
                        startRegions.set(startRegion, true)
                        ScanRegions(startRegion.Regions)
                    }
                }
            }
        }
    } else {
        // If radius is larger than the surrounding regions will detect, then
        // we need to use a different algorithm to pickup the regions. Ideally,
        // we won't be querying with huge radius values, but this is here in
        // cases where that happens. Just scan all top-level regions and check
        // the distance.
        for (const region of Object.values(octree.Regions)) {
            const distance = (position.sub(region.Center)).Magnitude
            if (distance < (radius + region.Radius)) {
                ScanRegions(region.Regions)
            }
        }
    }

    print(totalScanLoopCount)

    return regionsFound
}


export class Octree<T> {
    public Size: number = DEFAULT_TOP_REGION_SIZE
    public Regions = new Map<Vector3, Region<T>>()

    constructor(size : number = DEFAULT_TOP_REGION_SIZE) {
        if(size) this.Size = size
    }

    public ClearAllNodes(): void {
        this.Regions.clear()
    }

    public GetAllNodes(): Node<T>[] {
        const all: Node<T>[] = []
        const GetNodes = (regions: Region<T>[]): void => {
            // Find regions that have overlapping radius values
            for (const region of regions) {
                const nodes = region.Nodes
                if (nodes) {
                    //table.move(nodes, 1, nodes.size(), all.size() + 1, all)
                    for (const node of nodes) {
                        all.push(node)
                    }
                } else {
                    GetNodes(region.Regions)
                }
            }
        }
        GetNodes(Object.values(this.Regions))
        return all
    }

    public ForEachNode(): IterableFunction<Node<T>> {
        const GetNodes = (regions: Region<T>[]): void => {
            // Find regions that have overlapping radius values
            for (const region of regions) {
                const nodes = region.Nodes
                if (nodes) {
                    //table.move(nodes, 1, nodes.size(), all.size() + 1, all)
                    for (const node of nodes) {
                        coroutine.yield(node)
                    }
                } else {
                    GetNodes(region.Regions)
                }
            }
        }
        return coroutine.wrap(() => GetNodes(Object.values(this.Regions))) as IterableFunction<Node<T>>
    }

    public FindFirstNode(object: T): Node<T> | undefined {
        for (const node of this.ForEachNode()) {
            if (node.Object === object) {
                return node
            }
        }
        return undefined
    }

    public CountNodes(): number {
        return this.GetAllNodes().size()
    }

    public CreateNode(position: Vector3, object: T): Node<T> {
        const region = this._getRegion(MAX_SUB_REGIONS, position)
        const node: Node<T> = {
            Position: position,
            Object: object,
        }
        if (region.Nodes) {
            region.Nodes.push(node)
        } else {
            error("region does not contain nodes array")
        }
        return node
    }

    public RemoveNode(node: Node<T>): void {
        if (!node.Region) {
            return
        }
        const nodes = node.Region.Nodes
        if (nodes) {
            const index = nodes.indexOf(node)
            if (index !== -1) {
                SwapRemove(nodes, index)
            }
        }
        if (nodes && nodes.size() === 0) {
            // Remove regions without any nodes:
            let region : Region<T> | undefined = node.Region
            if(!region) return

            while (region) {
                if(!region) return

                const parent : Region<T> | undefined = region.Parent
                if (parent) {
                    const numNodes = CountNodesInRegion(region)
                    if (numNodes === 0) {
                        const regionIndex = parent.Regions.indexOf(region)
                        if (regionIndex) {
                            SwapRemove(parent.Regions, regionIndex)
                        }
                    }
                }
                region = parent
            }
        }
        node.Region = undefined
    }
    
    public ChangeNodePosition(node: Node<T>, position: Vector3): void {
        node.Position = position
        const newRegion = this._getRegion(MAX_SUB_REGIONS, position)
        if (newRegion === node.Region) {
            return
        }
        if (newRegion.Nodes) {
            newRegion.Nodes.push(node)
        } else {
            newRegion.Nodes = [node]
        }
        this.RemoveNode(node)
        node.Region = newRegion
    }

    // This loops 34 times total for a 10x10 grid of nodes
    public SearchRadius(position: Vector3, radius: number): Node<T>[] {
        const nodes: Node<T>[] = []
        const regions = GetRegionsInRadius(this, position, radius)

        for (const region of regions) {
            if (region.Nodes !== undefined) {
                for (const node of region.Nodes) {
                    if ((node.Position.sub(position)).Magnitude < radius) {
                        nodes.push(node)
                    }
                }
            }
        }
        
        return nodes
    }

    public ForEachInRadius(position: Vector3, radius: number): IterableFunction<Node<T>> {
        const regions = GetRegionsInRadius(this, position, radius)
        return coroutine.wrap(() => {
            for (const region of regions) {
                if (region.Nodes !== undefined) {
                    for (const node of region.Nodes) {
                        if ((node.Position.sub(position)).Magnitude < radius) {
                            coroutine.yield(node)
                        }
                    }
                }
            }
        }) as IterableFunction<Node<T>>
    }

    // public GetNearest(position: Vector3, radius: number, maxNodes?: number): Node<T>[] {
    //     const nodes = this.SearchRadius(position, radius)
    //     nodes.sort((n0, n1) => {
    //         const d0 = (n0.Position.sub(position)).Magnitude
    //         const d1 = (n1.Position.sub(position)).Magnitude
    //         return d0 < d1 ? -1 : 1
    //     })
    //     if (maxNodes !== undefined && nodes.size() > maxNodes) {
    //         return nodes.slice(1, maxNodes)
    //     }
    //     return nodes
    // }

    public _getRegion(maxLevel: number, position: Vector3): Region<T> {
        const GetRegion = (regionParent: Region<T> | undefined, regions: Region<T>[], level: number): Region<T> => {
            let region: Region<T> | undefined = undefined
            // Find region that contains the position:
            for (const r of regions) {
                if (IsPointInBox(position, r.Center, r.Size)) {
                    region = r
                    break
                }
            }
            if (!region) {
                // Create new region:
                const size = this.Size / (2 ** (level - 1))
                const origin = regionParent
                    ? regionParent.Center
                    : new Vector3(RoundTo(position.X, size), RoundTo(position.Y, size), RoundTo(position.Z, size))
                let center = origin
                if (regionParent) {
                    // Offset position to fit the subregion within the parent region:
                    center = center.add(new Vector3(
                        position.X > origin.X ? size / 2 : -size / 2,
                        position.Y > origin.Y ? size / 2 : -size / 2,
                        position.Z > origin.Z ? size / 2 : -size / 2
                    ))
                }
                const newRegion: Region<T> = {
                    Regions: [],
                    Level: level,
                    Size: size,
                    // Radius represents the spherical radius that contains the entirety of the cube region
                    Radius: math.sqrt(size * size + size * size + size * size),
                    Center: center,
                    Parent: regionParent,
                    Nodes: level === MAX_SUB_REGIONS ? [] : undefined,
                }
                table.freeze(newRegion)
                regions.push(newRegion)
                region = newRegion
            }
            if (level === maxLevel) {
                // We've made it to the bottom-tier region
                return region
            } else {
                // Find the sub-region:
                return GetRegion(region, region.Regions, level + 1)
            }
        }
        const startRegion = GetTopRegion(this, position, true)
        return GetRegion(startRegion, startRegion.Regions, 2)
    }
}
