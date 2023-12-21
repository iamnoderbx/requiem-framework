//!native

import { CameraCell } from "../Camera"
import { Occluder } from "../classes/Occluder"

/**
 * 
 * Deprecated due to performance issues.
 * This method is being replaced by poly checks in occluders.
 * 
 */
namespace VisibleFaceTask {
    let camera : Camera = game.Workspace.CurrentCamera as Camera
    let workspace : Workspace = game.Workspace as Workspace

    export function thread(faces : {corners: CFrame[]; normal: Vector3; edges: CFrame[][]; center: Vector3}[], useCenterForCorners: boolean) {
        const camera = game.Workspace.CurrentCamera as Camera

        const screenPoints : Vector2[] = []

        // Get the faces that the camera can visibly see or are looking at by using
        // the face normals. During this filter, we also get all corners of the occluder, it's
        // more efficient to do this here than to do it later.
        const visibleFaces = faces.filter(face => {
            const dotProduct = face.normal.Dot(camera.CFrame.RightVector)
            
            if(useCenterForCorners) {
                const [ point ] = camera.WorldToScreenPoint(face.center)
                screenPoints.push(new Vector2(point.X, point.Y))
            }

            if(dotProduct < 0.1) return false

            if(!useCenterForCorners) {
                face.corners.forEach((corner) => {
                    const [ point ] = camera.WorldToScreenPoint(corner.Position)
                    screenPoints.push(new Vector2(point.X, point.Y))
                }) 
            }

            return true
        });

        // Calculate the minimum and maximum x and y coordinates to create the bounding box
        const minX = math.min(...screenPoints.map(point => point.X));
        const minY = math.min(...screenPoints.map(point => point.Y));
        const maxX = math.max(...screenPoints.map(point => point.X));
        const maxY = math.max(...screenPoints.map(point => point.Y));

        // Create the bounding box
        const boundingBox = {
            min: new Vector2(minX, minY),
            max: new Vector2(maxX, maxY)
        };

        return [ boundingBox, visibleFaces ]
    }
}

export default VisibleFaceTask