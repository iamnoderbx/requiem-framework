//!native
import { Requiem } from "shared/requiem";
import CellRaycastTask from "./threads/cell.thread";
import { Parallel } from "shared/parallel";
import { Occluder, RenderedOccluders } from "./classes/Occluder";
import { Occludee, RenderedOccludees } from "./classes/Occludee";
import reflection from "shared/controllers/reflection";

export const OCCLUSION_CELL_WIDTH_AMOUNT = 7;
export const OCCLUSION_CELL_HEIGHT_AMOUNT = 7;

export class CameraCell {
    public x : number
    public y : number

    constructor(x : number, y : number) {
        this.x = x
        this.y = y
    }

    public setCell(x : number, y : number) {
        this.x = x
        this.y = y
    }
}

export class Cells {
    private camera : Camera
    private cells : CameraCell[] = []

    private occluders : Occluder[] = []
    private occludees : Occludee[] = []

    private previousCameraLocation : CFrame = new CFrame()

    // A task used for raycasting on multiple different cores
    // the amount of cores is relative to the amount of cells
    private raycastTask : Parallel
    
    private occlusionInstances : Instance[] = []
    private screenSize : Vector2 = new Vector2()

    constructor() {
        // Get the current camera and assign it accordingly
        this.camera = game.Workspace.CurrentCamera as Camera

        // Initalize our viewport cells
        this.onViewportSizeChanged()

        // When our viewport changes we want to redraw all of the camera cells.
        this.camera.GetPropertyChangedSignal("ViewportSize").Connect(() => 
            this.onViewportSizeChanged())

        // Create a new thread pool for executing raycast operations from a
        // given camera cell
        this.raycastTask = new Requiem.Threading()
            .setExecutionTask(CellRaycastTask).setMaximumCores(this.cells.size())

        // Whenever an occluder is added to the scene
        reflection.onComponentEvent.Connect((data : {id: string}, component : Occluder) => {
            if(data.id !== "Occluder") return
            this.occluders.push(component)
        })

        // Whenever an occludee is added to the scene
        reflection.onComponentEvent.Connect((data : {id: string, instance: Instance}, component : Occludee) => {
            if(data.id !== "Occludee") return
            if(this.occlusionInstances.includes(data.instance)) return

            this.occlusionInstances.push(data.instance)
            this.occludees.push(component)
        })
    }

    private updateViewportCells(width : number, height : number) {
        const cellWidth = width / OCCLUSION_CELL_WIDTH_AMOUNT;
        const cellHeight = height / OCCLUSION_CELL_HEIGHT_AMOUNT;

        this.cells = []

        for(let x = 0; x < OCCLUSION_CELL_WIDTH_AMOUNT; x++) {
            for(let y = 0; y < OCCLUSION_CELL_HEIGHT_AMOUNT; y++) {
                const cell = new CameraCell(x * cellWidth, y * cellHeight)
                this.cells.push(cell)
            }
        }

        this.screenSize = new Vector2(width, height)
    }

    private onViewportSizeChanged() {
        const viewportSize = this.camera.ViewportSize;

        const viewportWidth = viewportSize.X;
        const viewportHeight = viewportSize.Y;

        this.updateViewportCells(viewportWidth, viewportHeight)
    }

    public update() {
        if(this.occluders.size() === 0) return
        if(this.occludees.size() === 0) return
        
        // Time complexity is O(1), previously was O(n^2) due to the use of
        // a nested search
        const cameraDistance = this.camera.CFrame.Position.sub(this.previousCameraLocation.Position).Magnitude
        if(cameraDistance < 1) return

        this.occluders.forEach((occluder) => task.spawn(() => {
            occluder.newUpdated(this.screenSize)
        }));

        this.occludees.forEach((occludee) => task.spawn(() => {
            const isOccludeeOnScreen = occludee.isOnScreen()
            const wasOccludeeOnScreen = RenderedOccludees.get(occludee)

            // If the occludee was on the screen and is no longer on the screen
            // then we need to unrender it.
            if(wasOccludeeOnScreen && !isOccludeeOnScreen) {
                occludee.unrender()
            }

            // If the occludee wasn't on the screen and is now on the screen
            // then we need to render it.
            if(!wasOccludeeOnScreen && isOccludeeOnScreen) {
                occludee.render()
            }

            // Update the occludees state
            RenderedOccludees.set(occludee, isOccludeeOnScreen)
            if(isOccludeeOnScreen) occludee.updated()
        }))

        // Update the previous camera location
        this.previousCameraLocation = this.camera.CFrame
    }
}