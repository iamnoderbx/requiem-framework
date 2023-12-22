import Object from "@rbxts/object-utils";
import { Geometry } from "shared/utilities/geometry/geometry";

const seed = 6576

export class TerrainCell extends Geometry {
    private model : Model = new Instance("Model")
    
    constructor(private x : number, private z : number, private size : number) {
        super()
    }

    public unload() {
        this.model.Destroy()
    }

    public render() {
        const subdivision = this.size / 2

        const gridX = this.size / subdivision
        const gridZ = this.size / subdivision

        // Create a map which will store all subdivision information
        const subdivisions : Map<number, Map<number, Vector3>> = new Map()

        // Create our subdivisions x, z grid and store
        for(let x = 0; x <= gridX; x++) {
            subdivisions.set(x, new Map())

            for(let z = 0; z <= gridZ; z++) {
                const noiseX = (x + (this.x * gridX)) / 7
                const noiseZ = (z + (this.z * gridZ)) / 7

                const y = this.noise.fractal(noiseX, noiseZ, 4, 3, 0.35, 10, seed) * 10

                // Create a subdivision corner
                const vector = new Vector3(x * subdivision, y * subdivision, z * subdivision)
                subdivisions.get(x)!.set(z, vector)

                //print(vector)
            }
        }

        const wedge = new Instance("WedgePart")
        wedge.Color = Color3.fromRGB(103, 121, 76)
        wedge.Material = Enum.Material.Grass
        wedge.Anchored = true

        // Generate the terrain wedges
        for(let x = 0; x <= gridX - 1; x++) {
            for(let z = 0; z <= gridZ - 1; z++) {
                const a = subdivisions.get(x)!.get(z)!
                const b = subdivisions.get(x + 1)!.get(z)!
                const c = subdivisions.get(x)!.get(z + 1)!
                const d = subdivisions.get(x + 1)!.get(z + 1)!

                const [ triangleA, triangleB ] = this.triangle.draw(a, b, c, wedge)
                const [ triangleC, triangleD ] = this.triangle.draw(b, c, d, wedge)

                triangleA.Parent = this.model
                triangleB.Parent = this.model

                triangleC.Parent = this.model
                triangleD.Parent = this.model
            }
        }

        // Pivot the model to the center of the terrain cell
        const bounding = new Instance("Part")
        bounding.Anchored = true
        bounding.Size = new Vector3(10, 10, 10)
        bounding.CFrame = new CFrame(new Vector3((gridX * subdivision) / 2, 0, (gridZ * subdivision) / 2))

        this.model.PrimaryPart = bounding

        // This is a hacky way to get the model to pivot to the center of the terrain cell
        this.model.SetPrimaryPartCFrame(new CFrame(
            new Vector3(this.x * this.size + (this.size / 2), 0, this.z * this.size + (this.size / 2))
        ))

        this.model.Parent = game.Workspace
        this.model.PrimaryPart.Destroy()
    }
}