import { DataComponent, BaseDataComponent, Initialize } from "shared/controllers/components";
import { Requiem } from "shared/requiem";
import { Occludable } from "./Occludable";
import { OcclusionDebugger } from "../OcclusionDebugger";

export type OccludeeType = {
    instance : Instance,
    id: "Occludee",
}

// A map of occluders and their render state.
export const RenderedOccludees = new Map<Occludee, boolean>()

@DataComponent(Requiem.events.get("OccludeeAdded"))
export class Occludee extends Occludable<OccludeeType> implements Initialize {
    // A debugger for the occludee, this is used to draw the occludee
    private debugger : OcclusionDebugger = new OcclusionDebugger()
    public bounds : {min: Vector2; max: Vector2} = {min : new Vector2(), max: new Vector2()}
    
    public isObjectOccluded: boolean = false;

    constructor() {
        super()
    }

    public initialize(): void {
        // Use our debugger in the work environment, may recode this later
        // to have some sort of toggle, but not necessary at the moment.
        this.debugger.render()

        // Allocate 24 lines for the occludee, this is the maximum amount of that should be able
        // to be drawn for a single occludee, one line for each edge.
        this.debugger.allocateDebugLines(24)

        // Allocate 4 lines for the occludee to draw a debug square if needed.
        this.debugger.allocateDebugLines(4)

        // Draw all of our geometry and store it in a cache.
        this.drawGeometry()
    }

    public updated() {
        // Ensure our occluder has faces.
        if(!this.faces) return error("The occludee does not have faces.")

        const [ boundingBox, visibleFaces ] = this.getVisibleFaceBounding()
        if(!boundingBox || visibleFaces.size() === 0) return

        this.bounds = boundingBox

        // Free the debugging lines
        this.debugger.freeDebugLines()

        // Draw debuggers
        //this.debugger.drawDebugSquare(boundingBox, Color3.fromRGB(0, 0, 255))
    }

    public updateOcclusionState(isObjectOccluded : boolean) {
        this.isObjectOccluded = isObjectOccluded
        this.data.instance.Parent = isObjectOccluded ? undefined : game.Workspace
    }

    // The occludee needs to be un-rendered from the screen.
    public unrender() {
        //print("Un-render this occludee!")
        this.updateOcclusionState(false)
    }

    // The occludee needs to be rendered to the screen.
    public render() {
        // Draw all of our geometry and store it in a cache.
        this.drawGeometry()
        RenderedOccludees.set(this, true)

        this.updateOcclusionState(false)

        //print("Render occludee")
    }
}