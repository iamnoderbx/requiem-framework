//!native

import { CameraCell } from "../Camera"
import { Occluder } from "../classes/Occluder"

/**
 * 
 * Deprecated due to performance issues.
 * This method is being replaced by poly checks in occluders.
 * 
 */
namespace CellRaycastTask {
    let camera : Camera = game.Workspace.CurrentCamera as Camera
    let workspace : Workspace = game.Workspace as Workspace

    export function thread(step : number, cores: number, ...args : [CameraCell[], Occluder[]]) {
        if(!camera) return

        const occluders = args[1]
        const cell = args[0][step]
        const unitRay = camera.ViewportPointToRay(cell.x, cell.y)

        const results = workspace.Raycast(unitRay.Origin, unitRay.Direction.mul(1000))
        if(!results || !results?.Instance) return

        // Convert the occluders array to a Map for faster lookup.
        const occludersMap = new Map(occluders.map(occluder => [occluder.data.instance, occluder]))

        const occluder = occludersMap.get(results.Instance)
        return occluder ? occluder.data.instance : undefined
    }
}

export default CellRaycastTask