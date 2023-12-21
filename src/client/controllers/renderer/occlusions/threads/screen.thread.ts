//!native

import { CameraCell } from "../Camera"
import { Occluder } from "../classes/Occluder"

/**
 * 
 * Deprecated due to performance issues.
 * This method is being replaced by poly checks in occluders.
 * 
 */
namespace OnScreenTask {
    let camera : Camera = game.Workspace.CurrentCamera as Camera
    let workspace : Workspace = game.Workspace as Workspace

    export function thread(step : number, cores: number, ...args : [CFrame[]]) {
        if(!camera) return
        
        const corners = args[0]

        const [ viewportPoint, isOnScreen ] = camera.WorldToViewportPoint(corners[step].Position);
        if(isOnScreen) return true;
    }
}

export default OnScreenTask