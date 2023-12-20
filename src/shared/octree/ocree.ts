import Object from "@rbxts/object-utils"

/**
 * The Node type represents a node in the octree.
 * Each node has a position, an object of type T, and optionally a region.
 * 
 * @typedef Node
 * @property {Vector3} Position - The position of the node in the octree.
 * @property {T} Object - The object that the node contains.
 * @property {Region<T>} [Region] - The region that the node belongs to. This property is optional.
 */
type Node<T> = {
    Position: Vector3,
    Object: T,
    Region?: Region<T>
}

/**
 * The Region type represents a region in the octree.
 * Each region has a center, a size, a radius, a level, and an array of sub-regions.
 * It may also have a parent region and an array of nodes.
 * 
 * @typedef Region
 * @property {Vector3} Center - The center of the region in the octree.
 * @property {number} Size - The size of the region.
 * @property {number} Radius - The radius of the region.
 * @property {Region<T>[]} Regions - The sub-regions of the region.
 * @property {Region<T>} [Parent] - The parent region of the region. This property is optional.
 * @property {number} Level - The level of the region in the octree.
 * @property {Node<T>[]} [Nodes] - The nodes in the region. This property is optional.
 */
type Region<T> = {
    Center: Vector3,
    Size: number,
    Radius: number,
    Regions: Region<T>[],
    Parent?: Region<T>,
    Level: number,
    Nodes?: Node<T>[],
}

/**
 * The maximum number of sub-regions that a region can have in the octree.
 * This is a constant value and is set to 4.
 * 
 * @constant MAX_SUB_REGIONS
 * @type {number}
 */
const MAX_SUB_REGIONS = 4

/**
 * The default size of the top region in the octree.
 * This is a constant value and is set to 512.
 * 
 * @constant DEFAULT_TOP_REGION_SIZE
 * @type {number}
 */
const DEFAULT_TOP_REGION_SIZE = 512

/**
 * The 'IsPointInBox' function checks if a given point is within a box.
 * The box is defined by its center and size.
 * 
 * @function IsPointInBox
 * @param {Vector3} point - The point to check.
 * @param {Vector3} boxCenter - The center of the box.
 * @param {number} boxSize - The size of the box.
 * @returns {boolean} True if the point is within the box, false otherwise.
 * @author NodeSupport, Sleitnick
 */
function IsPointInBox(point: Vector3, boxCenter: Vector3, boxSize: number): boolean {
    // Calculate half of the box size.
    const half = boxSize / 2
    // Check if the point's X, Y, and Z coordinates are within the box.
    return point.X >= boxCenter.X - half
        && point.X <= boxCenter.X + half
        && point.Y >= boxCenter.Y - half
        && point.Y <= boxCenter.Y + half
        && point.Z >= boxCenter.Z - half
        && point.Z <= boxCenter.Z + half
}

/**
 * The 'RoundTo' function rounds a given number to the nearest multiple of another number.
 * 
 * @function RoundTo
 * @param {number} x - The number to round.
 * @param {number} mult - The number to which 'x' should be rounded to the nearest multiple of.
 * @returns {number} The rounded number.
 * @author NodeSupport, Sleitnick
 */
function RoundTo(x: number, mult: number): number {
    // Divide 'x' by 'mult', round the result, and then multiply by 'mult'.
    // This rounds 'x' to the nearest multiple of 'mult'.
    return math.round(x / mult) * mult
}

/**
 * The 'SwapRemove' function removes an element from a table at a given index.
 * It does this by swapping the element with the last element in the table and then removing the last element.
 * This function modifies the original table.
 * 
 * @function SwapRemove
 * @param {Record<number, unknown>} tbl - The table from which to remove an element.
 * @param {number} index - The index at which to remove an element.
 * @returns {void}
 * @author NodeSupport, Sleitnick
 */
function SwapRemove<T>(tbl: Record<number, unknown>, index: number): void {
    // Get the size of the table.
    const n = (tbl as []).size()
    // Swap the element at the given index with the last element in the table.
    tbl[index] = tbl[n]
    // Remove the last element from the table.
    tbl[n] = undefined
}

/**
 * The 'CountNodesInRegion' function counts the number of nodes in a given region.
 * If the region has nodes, it returns the number of nodes.
 * If the region does not have nodes, it recursively counts the nodes in the sub-regions.
 * 
 * @function CountNodesInRegion
 * @param {Region<T>} region - The region in which to count the nodes.
 * @returns {number} The number of nodes in the region.
 * @author NodeSupport, Sleitnick
 */
function CountNodesInRegion<T>(region: Region<T>): number {
    // Initialize a counter for the number of nodes.
    let n = 0
    // If the region has nodes...
    if (region.Nodes) {
        // Return the number of nodes in the region.
        return (region.Nodes as []).size()
    } else {
        // If the region does not have nodes, iterate over the sub-regions.
        for (const subRegion of region.Regions) {
            // Recursively count the nodes in the sub-region and add to the counter.
            n += CountNodesInRegion(subRegion)
        }
    }
    // Return the total number of nodes in the region and its sub-regions.
    return n
}

/**
 * The 'GetTopRegion' function gets the top region of the octree at a given position.
 * If the region does not exist and the 'create' parameter is true, it creates a new region.
 * 
 * @function GetTopRegion
 * @param {Octree<T>} octree - The octree from which to get the top region.
 * @param {Vector3} position - The position at which to get the top region.
 * @param {boolean} create - Whether to create a new region if it does not exist.
 * @returns {Region<T>} The top region at the given position.
 * @author NodeSupport, Sleitnick
 */
function GetTopRegion<T>(octree: Octree<T>, position: Vector3, create: boolean): Region<T> {
    // Calculate the origin of the region by rounding the position to the nearest multiple of the octree size.
    const size = octree.Size
    const origin = new Vector3(RoundTo(position.X, size), RoundTo(position.Y, size), RoundTo(position.Z, size))
    
    // Try to get the region at the origin.
    let region = octree.Regions.get(origin)
    
    // If the region does not exist and 'create' is true...
    if (!region && create) {
        // Create a new region.
        region = {
            Regions: [],
            Level: 1,
            Size: size,
            Radius: math.sqrt(size * size + size * size + size * size),
            Center: origin,
        }
        // Freeze the region to prevent modifications.
        table.freeze(region)
        // Add the new region to the octree.
        octree.Regions.set(origin, region)
    }

    // Return the region.
    return region as Region<T>
}

/**
 * The 'GetRegionsInRadius' function gets all the regions in the octree that are within a given radius of a given position.
 * 
 * @function GetRegionsInRadius
 * @param {Octree<T>} octree - The octree from which to get the regions.
 * @param {Vector3} position - The position from which to measure the radius.
 * @param {number} radius - The radius within which to get the regions.
 * @returns {Region<T>[]} An array of the regions within the given radius of the given position.
 * @author NodeSupport, Sleitnick
 */
function GetRegionsInRadius<T>(octree: Octree<T>, position: Vector3, radius: number): Region<T>[] {
    // Initialize an array to store the regions found within the given radius.
    const regionsFound : Region<T>[] = []

    // Initialize a counter to keep track of the total number of loops in the ScanRegions function.
    let totalScanLoopCount = 0;

    // Define a function to scan a list of regions.
    const ScanRegions = (regions: Region<T>[]): void => {
        // Iterate over each region in the list.
        for (const region of regions) {
            // Increment the loop counter.
            totalScanLoopCount++;
            // Calculate the distance from the position to the center of the region.
            const distance = (position.sub(region.Center)).Magnitude
            // If the distance is less than the sum of the radius and the region's radius...
            if (distance < (radius + region.Radius)) {
                // If the region has nodes...
                if (region.Nodes) {
                    // Add the region to the list of regions found.
                    regionsFound.push(region)
                } else {
                    // If the region does not have nodes, recursively scan the sub-regions.
                    ScanRegions(region.Regions)
                }
            }
        }
    }

    // Initialize a map to store the starting regions.
    const startRegions = new Map<Region<T>, boolean>()

    // Get the size of the octree.
    const size = octree.Size

    // Calculate the maximum offset by dividing the radius by the size of the octree and rounding up.
    const maxOffset = math.ceil(radius / size)

    // If the radius is less than the size of the octree...
    if (radius < octree.Size) {
        // Iterate over a 3x3x3 cube.
        for (let i = 0; i < 27; i++) {
            // Calculate the x, y, and z coordinates of the current cell in the cube.
            const x = i % 3 - 1
            const y = math.floor(i / 9) - 1
            const z = math.floor(i / 3) % 3 - 1

            // Calculate the offset from the position to the current cell.
            const offset = new Vector3(x * radius, y * radius, z * radius)

            // Get the top region at the offset position.
            const startRegion = GetTopRegion(octree, position.add(offset), false)

            // If the start region exists and is not already in the map of start regions...
            if (startRegion && !startRegions.has(startRegion)) {
                // Add the start region to the map.
                startRegions.set(startRegion, true)

                // Scan the regions within the start region.
                ScanRegions(startRegion.Regions)
            }
        }
    } else if (maxOffset <= 3) {
        // Iterate over a cube surrounding the position, with a side length of 2 * maxOffset + 1.
        for (let x = -maxOffset; x <= maxOffset; x++) {
            for (let y = -maxOffset; y <= maxOffset; y++) {
                for (let z = -maxOffset; z <= maxOffset; z++) {
                    // Calculate the offset from the position to the current cell in the cube.
                    const offset = new Vector3(x * size, y * size, z * size)
                    // Get the top region at the offset position.
                    const startRegion = GetTopRegion(octree, position.add(offset), false)

                    // If the start region exists and is not already in the map of start regions...
                    if (startRegion && !startRegions.has(startRegion)) {
                        // Add the start region to the map.
                        startRegions.set(startRegion, true)
                        // Scan the regions within the start region.
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
            // Calculate the distance from the position to the center of the region.
            const distance = (position.sub(region.Center)).Magnitude
            // If the distance is less than the sum of the radius and the region's radius...
            if (distance < (radius + region.Radius)) {
                // Scan the regions within the current region.
                ScanRegions(region.Regions)
            }
        }
    }

    return regionsFound
}


export class Octree<T> {
    // The Size property represents the size of the top region in the octree.
    // It is initialized with the default top region size.
    public Size: number = DEFAULT_TOP_REGION_SIZE

    // The Regions property is a map that stores all the regions in the octree.
    // Each region is mapped to a Vector3 key, which represents the region's position.
    public Regions = new Map<Vector3, Region<T>>()

    /**
     * The constructor of the Octree class.
     * It creates a new Octree with a given size. If no size is provided, it uses a default size.
     * 
     * @constructor
     * @param {number} [size=DEFAULT_TOP_REGION_SIZE] - The size of the octree. If not provided, DEFAULT_TOP_REGION_SIZE is used.
     * @author NodeSupport, Sleitnick
     * 
     * @example
     * const size = 100;
     * const octree = new Octree(size);  // This will create a new Octree with the specified size.
     * console.log(octree);  // This will log the newly created Octree.
     */
    constructor(size : number = DEFAULT_TOP_REGION_SIZE) {
        // If a size is provided, set the Size property of the Octree to the provided size.
        if(size) this.Size = size
    }

    /**
     * The 'ClearAllNodes' method of the Octree class.
     * It removes all nodes from the octree by clearing all regions.
     * 
     * @method ClearAllNodes
     * @returns {void}
     * @author NodeSupport, Sleitnick
     * 
     * @example
     * const octree = new Octree();
     * // Add some nodes to the octree...
     * octree.ClearAllNodes();  // This will remove all nodes from the octree.
     */
    public ClearAllNodes(): void {
        // Clear all regions in the octree, effectively removing all nodes.
        this.Regions.clear()
    }

    /**
     * The 'GetAllNodes' method of the Octree class.
     * It returns an array of all nodes in the octree.
     * 
     * @method GetAllNodes
     * @returns {Node<T>[]} An array of all nodes in the octree.
     * @author NodeSupport, Sleitnick
     * 
     * @example
     * const octree = new Octree();
     * // Add some nodes to the octree...
     * const allNodes = octree.GetAllNodes();  // This will return an array of all nodes in the octree.
     * console.log(allNodes);  // This will log the array of all nodes.
     */
    public GetAllNodes(): Node<T>[] {
        // Define an array to store all nodes.
        const all: Node<T>[] = []

        // Define a recursive function to get all nodes in the given regions.
        const GetNodes = (regions: Region<T>[]): void => {
            // Iterate over each region.
            for (const region of regions) {
                // Get the nodes in the region.
                const nodes = region.Nodes
                // If the region has nodes...
                if (nodes) {
                    // Iterate over each node in the region.
                    for (const node of nodes) {
                        // Add the node to the array of all nodes.
                        all.push(node)
                    }
                } else {
                    // If the region doesn't have nodes, recursively call the function with the region's sub-regions.
                    GetNodes(region.Regions)
                }
            }
        }

        // Call the GetNodes function with the octree's regions.
        GetNodes(Object.values(this.Regions))

        // Return the array of all nodes.
        return all
    }

    /**
     * The 'ForEachNode' method of the Octree class.
     * It returns an iterable function that iterates over each node in the octree.
     * 
     * @method ForEachNode
     * @returns {IterableFunction<Node<T>>} An iterable function that iterates over each node in the octree.
     * @author NodeSupport, Sleitnick
     * 
     * @example
     * const octree = new Octree();
     * // Add some nodes to the octree...
     * for (const node of octree.ForEachNode()) {
     *     console.log(node);  // This will log each node in the octree.
     * }
     */
    public ForEachNode(): IterableFunction<Node<T>> {
        // Define a recursive function to get all nodes in the given regions.
        const GetNodes = (regions: Region<T>[]): void => {
            // Iterate over each region.
            for (const region of regions) {
                // Get the nodes in the region.
                const nodes = region.Nodes
                // If the region has nodes...
                if (nodes) {
                    // Iterate over each node in the region.
                    for (const node of nodes) {
                        // Yield the node to the coroutine.
                        coroutine.yield(node)
                    }
                } else {
                    // If the region doesn't have nodes, recursively call the function with the region's sub-regions.
                    GetNodes(region.Regions)
                }
            }
        }

        // Return a coroutine that wraps the GetNodes function, and call it with the octree's regions.
        // This will return an iterable function that iterates over each node in the octree.
        return coroutine.wrap(() => GetNodes(Object.values(this.Regions))) as IterableFunction<Node<T>>
    }

    /**
     * The 'FindFirstNode' method of the Octree class.
     * It finds the first node in the octree that contains a given object.
     * 
     * @method FindFirstNode
     * @param {T} object - The object to be found.
     * @returns {Node<T> | undefined} The first node that contains the object, or undefined if no such node is found.
     * @author NodeSupport, Sleitnick
     * 
     * @example
     * const octree = new Octree();
     * // Add some nodes to the octree...
     * const object = { name: 'MyObject' };
     * const node = octree.FindFirstNode(object);  // This will find the first node that contains the specified object.
     * console.log(node);  // This will log the found node, or undefined if no such node is found.
     */
    public FindFirstNode(object: T): Node<T> | undefined {
        // Iterate over each node in the octree.
        for (const node of this.ForEachNode()) {
            // If the node's object is the same as the specified object...
            if (node.Object === object) {
                // Return the node.
                return node
            }
        }
        // If no node was found that contains the specified object, return undefined.
        return undefined
    }

    /**
     * The 'CountNodes' method of the Octree class.
     * It counts the total number of nodes in the octree.
     * 
     * @method CountNodes
     * @returns {number} The total number of nodes in the octree.
     * @author NodeSupport, Sleitnick
     * 
     * @example
     * const octree = new Octree();
     * // Add some nodes to the octree...
     * const totalNodes = octree.CountNodes();  // This will return the total number of nodes in the octree.
     * print(totalNodes);  // This will log the total number of nodes.
     */
    public CountNodes(): number {
        return this.GetAllNodes().size()
    }

    /**
     * The 'CreateNode' method of the Octree class.
     * It creates a new node at a given position with a given object and adds it to the appropriate region.
     * 
     * @method CreateNode
     * @param {Vector3} position - The position of the new node.
     * @param {T} object - The object to be stored in the new node.
     * @returns {Node<T>} The newly created node.
     * @throws {Error} If the region does not contain a nodes array.
     * @author NodeSupport, Sleitnick
     * 
     * @example
     * const octree = new Octree();
     * const position = new Vector3(0, 0, 0);
     * const object = { name: 'MyObject' };
     * const node = octree.CreateNode(position, object);
     */
    public CreateNode(position: Vector3, object: T): Node<T> {
        // Get the region that contains the specified position.
        const region = this._getRegion(MAX_SUB_REGIONS, position)

        // Create a new node with the specified position and object.
        const node: Node<T> = {
            Position: position,
            Object: object,
        }

        // If the region already has nodes, add the new node to the region's list of nodes.
        if (region.Nodes) {
            region.Nodes.push(node)
        } else {
            // If the region doesn't have any nodes yet, throw an error.
            error("region does not contain nodes array")
        }

        // Return the newly created node.
        return node
    }

    /**
     * The 'RemoveNode' method of the Octree class.
     * It removes a given node from its region.
     * 
     * @method RemoveNode
     * @param {Node<T>} node - The node to be removed.
     * @returns {void}
     * @author NodeSupport, Sleitnick
     * 
     * @example
     * const octree = new Octree();
     * // Add some nodes to the octree...
     * const node = octree.SearchRadius(new Vector3(0, 0, 0), 10)[0];  // Get the first node within a radius of 10 units from the origin.
     * octree.RemoveNode(node);  // This will remove the node from its region.
     */
    public RemoveNode(node: Node<T>): void {
        // If the node doesn't have a region, there's nothing to do.
        if (!node.Region) {
            return
        }

        // Get the list of nodes in the node's region.
        const nodes = node.Region.Nodes

        // If the region has nodes...
        if (nodes) {
            // Find the index of the node in the list of nodes.
            const index = nodes.indexOf(node)

            // If the node is in the list of nodes...
            if (index !== -1) {
                // Remove the node from the list of nodes, and move the last node in the list to the vacated spot.
                SwapRemove(nodes, index)
            }
        }
        // If the region has nodes and the number of nodes is zero...
        if (nodes && nodes.size() === 0) {
            // Remove regions without any nodes:

            // Get the node's region.
            let region : Region<T> | undefined = node.Region

            // If the node doesn't have a region, there's nothing to do.
            if(!region) return

            // While the region exists...
            while (region) {
                // If the region doesn't exist, there's nothing to do.
                if(!region) return

                // Get the region's parent.
                const parent : Region<T> | undefined = region.Parent

                // If the region has a parent...
                if (parent) {
                    // Count the number of nodes in the region.
                    const numNodes = CountNodesInRegion(region)

                    // If the number of nodes in the region is zero...
                    if (numNodes === 0) {
                        // Find the index of the region in the parent's list of regions.
                        const regionIndex = parent.Regions.indexOf(region)

                        // If the region is in the parent's list of regions...
                        if (regionIndex) {
                            // Remove the region from the parent's list of regions, and move the last region in the list to the vacated spot.
                            SwapRemove(parent.Regions, regionIndex)
                        }
                    }
                }

                // Move up to the parent region.
                region = parent
            }
        }

        // Remove the node's region.
        node.Region = undefined
    }
    
    /**
     * The 'ChangeNodePosition' method of the Octree class.
     * It changes the position of a given node and updates the node's region accordingly.
     * 
     * @method ChangeNodePosition
     * @param {Node<T>} node - The node whose position is to be changed.
     * @param {Vector3} position - The new position of the node.
     * @returns {void}
     * @author NodeSupport, Sleitnick
     * 
     * @example
     * const octree = new Octree();
     * // Add some nodes to the octree...
     * const node = octree.SearchRadius(new Vector3(0, 0, 0), 10)[0];  // Get the first node within a radius of 10 units from the origin.
     * const newPosition = new Vector3(10, 10, 10);
     * octree.ChangeNodePosition(node, newPosition);  // This will change the position of the node to (10, 10, 10) and update the node's region accordingly.
     */
    public ChangeNodePosition(node: Node<T>, position: Vector3): void {
        // Set the node's position to the new position.
        node.Position = position

        // Get the region that contains the new position.
        const newRegion = this._getRegion(MAX_SUB_REGIONS, position)

        // If the node is already in the correct region, there's nothing more to do.
        if (newRegion === node.Region) {
            return
        }

        // If the new region already has nodes, add the node to the new region's list of nodes.
        if (newRegion.Nodes) {
            newRegion.Nodes.push(node)
        } else {
            // If the new region doesn't have any nodes yet, create a new list of nodes for the new region and add the node to it.
            newRegion.Nodes = [node]
        }

        // Remove the node from its old region.
        this.RemoveNode(node)

        // Update the node's region to the new region.
        node.Region = newRegion
    }

    /**
     * The 'SearchRadius' method of the Octree class.
     * It returns an array of all nodes within a specified radius of a given position.
     * 
     * @method SearchRadius
     * @param {Vector3} position - The position from which to measure the radius.
     * @param {number} radius - The radius within which to find nodes.
     * @returns {Node<T>[]} An array of all nodes within the specified radius of the given position.
     * @author NodeSupport, Sleitnick
     * 
     * @example
     * const octree = new Octree();
     * // Add some nodes to the octree...
     * const position = new Vector3(0, 0, 0);
     * const radius = 10;
     * const nodesInRadius = octree.SearchRadius(position, radius);
     * print(nodesInRadius);  // This will log an array of all nodes within the specified radius of the given position.
     */
    public SearchRadius(position: Vector3, radius: number): Node<T>[] {
        // Initialize an empty array to store the nodes within the specified radius.
        const nodes: Node<T>[] = []

        // Get all regions within the specified radius of the given position.
        const regions = GetRegionsInRadius(this, position, radius)

        // Iterate over each region.
        for (const region of regions) {
            // If the region has nodes...
            if (region.Nodes !== undefined) {
                // Iterate over each node in the region.
                for (const node of region.Nodes) {
                    // If the node is within the specified radius of the given position...
                    if ((node.Position.sub(position)).Magnitude < radius) {
                        // Add the node to the array of nodes.
                        nodes.push(node)
                    }
                }
            }
        }

        // Return the array of nodes within the specified radius.
        return nodes
    }

    /**
     * The 'ForEachInRadius' method of the Octree class.
     * It returns an iterable function that iterates over all nodes within a specified radius of a given position.
     * 
     * @method ForEachInRadius
     * @param {Vector3} position - The position from which to measure the radius.
     * @param {number} radius - The radius within which to find nodes.
     * @returns {IterableFunction<Node<T>>} An iterable function that iterates over all nodes within the specified radius of the given position.
     * @author NodeSupport, Sleitnick
     * 
     * @example
     * const octree = new Octree();
     * // Add some nodes to the octree...
     * const position = new Vector3(0, 0, 0);
     * const radius = 10;
     * const nodesInRadius = octree.ForEachInRadius(position, radius);
     * for (const node of nodesInRadius) {
     *     print(node);
     * }
     */
    public ForEachInRadius(position: Vector3, radius: number): IterableFunction<Node<T>> {
        // Get all regions within the specified radius of the given position.
        const regions = GetRegionsInRadius(this, position, radius)

        // Return an iterable function that iterates over all nodes within the specified radius of the given position.
        return coroutine.wrap(() => {
            // Iterate over each region.
            for (const region of regions) {
                // If the region has nodes...
                if (region.Nodes !== undefined) {
                    // Iterate over each node in the region.
                    for (const node of region.Nodes) {
                        // If the node is within the specified radius of the given position...
                        if ((node.Position.sub(position)).Magnitude < radius) {
                            // Yield the node.
                            coroutine.yield(node)
                        }
                    }
                }
            }
        }) as IterableFunction<Node<T>>  // Cast the result to IterableFunction<Node<T>>.
    }

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
