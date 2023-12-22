import { Requiem } from "shared/requiem";
import { TerrainCell } from "./classes/TerrainCell";

const TERRAIN_CELL_SIZE = 2048;

export class Terrain {
    // Access to the Workspace service
    private Workspace = Requiem.services.Workspace

    // Access to the RunService service
    private RunService = Requiem.services.RunService

    // Variable to store the previous location of the character
    private previousCharacterLocation : CFrame

    // Variable to store the connection to the RenderStepped event
    private render : RBXScriptConnection

    // Variable to store the current camera
    private camera : Camera

    // Map to store the terrain cells, with their coordinates as the key
    private terrain: Map<Vector2, TerrainCell> = new Map()

    // Object to store the x and y coordinates of the current cell
    private cell : { x: number, y: number} = { x: 0, y: 0 };

    constructor() {
        // Set the camera to the current camera in the workspace
        this.camera = this.Workspace.CurrentCamera as Camera

        // Initialize the previous character location to a new CFrame
        this.previousCharacterLocation = new CFrame()

        // Connect the onTerrainRender method to the RenderStepped event
        // This will call onTerrainRender every time a frame is rendered
        this.render = this.RunService.RenderStepped.Connect(() => this.onTerrainRender())

        // Generate a region of terrain cells around the origin (0, 0)
        this.generateTerrainCellRegion(0, 0)
    }

    // Define a method to generate a region of terrain cells around a given x and y coordinate
    private generateTerrainCellRegion(x : number, y : number) {
        // Loop over a 5x5 grid centered around the x coordinate
        for (let i = x - 2; i <= x + 2; i++) {
            // Loop over a 5x5 grid centered around the y coordinate
            for (let j = y - 2; j <= y + 2; j++) {
                // Spawn a new terrain cell at the current coordinates
                this.spawnTerrainCell(i, j)
            }
        }
    }

    // Define a method to get a terrain cell at a given x and y coordinate
    private getTerrainCell(x: number, y: number) {
        // Return the terrain cell from the terrain map with the coordinates as the key
        return this.terrain.get(new Vector2(x, y))
    }

    // Define a method to spawn a new terrain cell at a given x and y coordinate
    private spawnTerrainCell(x: number, y: number) {
        // Create a new TerrainCell object at the given coordinates with a specified size
        const cell = new TerrainCell(x, y, TERRAIN_CELL_SIZE)
        
        // Render the newly created terrain cell
        cell.render()

        // Add the new terrain cell to the terrain map with the coordinates as the key
        this.terrain.set(new Vector2(x, y), cell)
    }

    private onCameraCellChanged(x : number, z : number) {
        const cells : Vector2[] = []

        // Loop over a 5x5 grid centered around the x coordinate
        for(let i = x - 2; i < x + 2; i++) {
            // Loop over a 5x5 grid centered around the y coordinate of the cell
            for(let j = this.cell.y - 1; j < this.cell.y + 2; j++) {
                // If there is no terrain cell at the current coordinates, spawn a new one
                if(!this.getTerrainCell(i, j)) {
                    this.spawnTerrainCell(i, j)
                }

                // Add the current coordinates to the cells array
                cells.push(new Vector2(i, j))
            }
        }

        // Loop over each cell in the terrain
        for(const cell of this.terrain) {
            // If the current cell is not included in the cells array
            if(!cells.includes(cell[0])) {
                // Despawn the cell
                // Get the terrain associated with the current cell
                const terrain = this.terrain.get(cell[0])

                // If the terrain exists
                if(terrain) {
                    // Unload the terrain
                    terrain.unload()
                    // Remove the cell from the terrain map
                    this.terrain.delete(cell[0])
                }
            }
        }
    }

    private onTerrainRender() {
        // Get the client
        const client = Requiem.getClient()
        // If the client does not exist, return
        if(!client) return

        // Get the character of the client
        const character = client.Character
        // If the character does not exist, return
        if(!character) return
        // If the camera does not exist, return
        if(!this.camera) return

        // If the character does not have a PrimaryPart, return
        if(!character.PrimaryPart) return

        // If the previous character location is not set, set it to the current location and return
        if(!this.previousCharacterLocation) {
            this.previousCharacterLocation = character.PrimaryPart.CFrame
            return
        }

        // Get the root part of the character
        const root = character.PrimaryPart

        // Calculate the distance the character has moved
        const distance = root.Position.sub(this.previousCharacterLocation.Position).Magnitude
        // If the distance is less than 20, return
        if(distance < 20) return

        // Calculate the x and y coordinates of the cell the character is currently in
        const x = math.floor(root.CFrame.Position.X / TERRAIN_CELL_SIZE)
        const y = math.floor(root.CFrame.Position.Z / TERRAIN_CELL_SIZE)

        // If the character is still in the same cell, return
        if(x === this.cell.x && y === this.cell.y) return

        // Update the cell coordinates
        this.cell.x = x
        this.cell.y = y

        // Call the onCameraCellChanged method with the new cell coordinates
        this.onCameraCellChanged(x, y)
        // Update the previous character location
        this.previousCharacterLocation = root.CFrame
    }
}