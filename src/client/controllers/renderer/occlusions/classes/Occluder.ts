//!native

import { BaseDataComponent, DataComponent, Initialize } from "shared/controllers/components"
import { Requiem } from "shared/requiem"
import { CameraCell } from "../Camera"
import { OcclusionDebugger } from "../OcclusionDebugger"
import { Parallel } from "shared/parallel"
import OnScreenTask from "../threads/screen.thread"
import { Occludable } from "./Occludable"
import { Occludee, OccludeeType, RenderedOccludees } from "./Occludee"

export type OccluderType = {
    instance: Instance,
    collisions: number,

    id: "Occluder",
}

// A map of occluders and their render state.
export const RenderedOccluders = new Map<Occluder, boolean>()

// A thread pool for occlusion splitting, this is used to split the occlusion
// in to chunks so that we can determine collisions in parallel.
export const SplitThreadPool = new Requiem.Threading()

@DataComponent(Requiem.events.get("OccluderAdded"))
export class Occluder extends Occludable<OccluderType> implements Initialize {
    // A debugger for the occluder, this is used to draw the occluder
    private debugger : OcclusionDebugger = new OcclusionDebugger()

    private occludees : Occludee[] = []

    // Occluder constructor, called prior to the initalization phase.
    constructor() {
        super()
    }

    // An occluder has been added to the game.
    public initialize() {
        // Use our debugger in the work environment, may recode this later
        // to have some sort of toggle, but not necessary at the moment.
        this.debugger.render()

        // Allocate 24 lines for the occluder, this is the maximum amount of that should be able
        // to be drawn for a single occluder, one line for each edge.
        this.debugger.allocateDebugLines(24)

        // Allocate 4 lines for the occluder to draw a debug square if needed.
        this.debugger.allocateDebugLines(4)

        // Draw all of our geometry and store it in a cache.
        this.drawGeometry()
    }

    public newUpdated(screenSize : Vector2) {
        // Ensure our occluder has faces.
        if(!this.faces) return error("The occluder does not have faces.")

        const [ boundingBox, visibleFaces ] = this.getClampedBoundingBox()
        if(!boundingBox || !visibleFaces || visibleFaces.size() === 0) return this.unrender()

        RenderedOccludees.forEach((rendered, occludee) => {
            // Bounds {min: Vector2, max: Vector2}
            const bounds = occludee.bounds;
    
            // Create the corners of the bounds
            const topLeft = new Vector2(bounds.min.X, bounds.min.Y);
            const topRight = new Vector2(bounds.max.X, bounds.min.Y);
            const bottomLeft = new Vector2(bounds.min.X, bounds.max.Y);
            const bottomRight = new Vector2(bounds.max.X, bounds.max.Y);
    
            // Check if all corners are within the bounding box of the occluder
            const corners = [topLeft, topRight, bottomLeft, bottomRight];
            const allCornersInside = corners.every(corner =>
                corner.X >= boundingBox.min.X && corner.X <= boundingBox.max.X &&
                corner.Y >= boundingBox.min.Y && corner.Y <= boundingBox.max.Y
            );
    
            // If not all corners are within the bounding box of the occluder, then
            // make the occludee unrendered.
            if(allCornersInside !== occludee.isObjectOccluded) {
                occludee.updateOcclusionState(allCornersInside)

                if(!allCornersInside && this.occludees.includes(occludee)) {
                    this.occludees = this.occludees.filter(item => item !== occludee);
                } else if(allCornersInside && !this.occludees.includes(occludee)) {
                    this.occludees.push(occludee);
                }
            }
        });

        this.debugger.freeDebugLines()
        this.debugger.drawDebugSquare(boundingBox)
    }

    public updated(screenSize : Vector2) {
        // Ensure our occluder has faces.
        if(!this.faces) return error("The occluder does not have faces.")

        const [ boundingBox, visibleFaces ] = this.getVisibleFaceBounding(true)
        if(!boundingBox || visibleFaces.size() === 0) return this.unrender()

        // Get the distance between min and max
        const distance = boundingBox.max.sub(boundingBox.min).Magnitude / 2
        if(distance > screenSize.X && distance > screenSize.Y) return this.unrender()

        RenderedOccludees.forEach((rendered, occludee) => {
            // Bounds {min: Vector2, max: Vector2}
            const bounds = occludee.bounds;
    
            // Create the corners of the bounds
            const topLeft = new Vector2(bounds.min.X, bounds.min.Y);
            const topRight = new Vector2(bounds.max.X, bounds.min.Y);
            const bottomLeft = new Vector2(bounds.min.X, bounds.max.Y);
            const bottomRight = new Vector2(bounds.max.X, bounds.max.Y);
    
            // Check if all corners are within the bounding box of the occluder
            const corners = [topLeft, topRight, bottomLeft, bottomRight];
            const allCornersInside = corners.every(corner =>
                corner.X >= boundingBox.min.X && corner.X <= boundingBox.max.X &&
                corner.Y >= boundingBox.min.Y && corner.Y <= boundingBox.max.Y
            );
    
            // If not all corners are within the bounding box of the occluder, then
            // make the occludee unrendered.
            if(allCornersInside !== occludee.isObjectOccluded) {
                occludee.updateOcclusionState(allCornersInside)

                if(!allCornersInside && this.occludees.includes(occludee)) {
                    this.occludees = this.occludees.filter(item => item !== occludee);
                } else if(allCornersInside && !this.occludees.includes(occludee)) {
                    this.occludees.push(occludee);
                }
            }
        });

        this.debugger.freeDebugLines()
        this.debugger.drawDebugSquare(boundingBox)
        
        // this.debugger.drawDebugSquare3D(this.faces)
    }

    // The occluder needs to be un-rendered from the screen.
    public unrender() {
        if(!RenderedOccluders.get(this)) return
        RenderedOccluders.set(this, false)

        if(this.occludees.size() === 0) return

        this.occludees.forEach((occludee) => {
            occludee.updateOcclusionState(false)
        })

        this.occludees = []
    }

    // The occluder needs to be rendered to the screen.
    public render(collisions : CameraCell[]) {
        // Update our occluders render state to be true.
        RenderedOccluders.set(this, true)
        
        // Ensure our occluder has faces.
        //if(!this.faces) return error("The occluder does not have faces.")

        //print("Rendering Occluder!")
    }
}