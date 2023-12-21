//!native
import { BaseDataComponent } from "shared/controllers/components";
import { Parallel } from "shared/parallel";
import { Requiem } from "shared/requiem";
import VisibleFaceTask from "../threads/faces.thread";

export class Occludable<T> extends BaseDataComponent<T & {instance: Instance}> {
    // The world location of the occluder
    protected location : CFrame = new CFrame()

    // The size of the occluder, will draw corners of the
    // hitbox
    protected size : Vector3 = new Vector3()

    // The faces of the occluder, these are the faces of the "hitbox" (can be rectangular or square)
    protected faces : { corners: CFrame[], normal: Vector3, edges: CFrame[][], center: Vector3}[] | undefined = []
    protected corners : CFrame[] | undefined = []

    // A list of corner positions, we cache these values while checking if
    // the occlude is on the screen
    protected cornerPositions : Map<CFrame, Vector3> = new Map();

    private getVisibleFaceThread : Parallel = new Requiem.Threading()
        .setExecutionTask(VisibleFaceTask).setMaximumCores(10);

    public drawGeometry() {
        const isOccluderModel = this.data.instance.IsA("Model")
        
        // Ensure that our occulder is a model or a base part.
        if(isOccluderModel) {
            // Our occluder is a model, we need to get the pivot point of the model
            // so that we can determine the location of the occluder.
            const model = this.data.instance as Model

            // This is a relatively expensive operation, hence the cache in initalization
            // May add support for moving occluders at a later point.
            const [ location, size ] = model.GetBoundingBox()

            // Update
            this.location = location
            this.size = size
        } else {
            // Our occluder is a base part, we can just use the CFrame of the base part
            // to determine the location of the occluder.
            const basePart = this.data.instance as BasePart

            // Update
            this.location = basePart.CFrame
            this.size = basePart.Size
        }

        // Get the eight corners of the occluder.
        this.corners = this.getCorners()
        this.faces = this.getFaces()
    }

    public countPointsOnScreen() {
        // Get the camera
        const camera = game.Workspace.CurrentCamera as Camera
        if(!this.corners) return

        let count = 0;

        for(let i = 0; i < this.corners.size(); i++) {
            const corner = this.corners[i]

            const [ viewportPoint, isOnScreen ] = camera.WorldToViewportPoint(corner.Position);
            if(isOnScreen) count++;
        }

        return count;
    }

    public isOnScreen() {
        // Ensure that the location of the occluder exists.
        // This should be the case, due to the initalization phase.
        if(!this.location) return error("The occluder does not have a location.")

        // We need to check each corner of the occluder to see if it is on the screen.
        // if any of the corners are on the screen, then the occluder is on the screen.
        const corners = this.getCorners();
        if(!corners) return error("The occluder does not have corners.")

        // Clear the corner positions
        this.cornerPositions = new Map()

        // Get the camera
        const camera = game.Workspace.CurrentCamera as Camera

        // Check each corner to see if it is on the screen
        for (let i = 0; i < corners.size(); i++) {
            const [ viewportPoint, isOnScreen ] = camera.WorldToViewportPoint(corners[i].Position);
            this.cornerPositions.set(corners[i], viewportPoint);

            if(isOnScreen) return true;
        }

        // None of the corners are on the screen
        return false;
    }

    protected getVisibleFaceBounding(useCenterForCorners : boolean = false) {
        if(!this.faces) return error("The occludable does not have faces.")
        
        // const [ boundingBox, visibleFaces ] = this.getVisibleFaceThread.queue(this.faces, useCenterForCorners) as [
        //     { min: Vector2; max: Vector2 },
        //     { corners: CFrame[]; normal: Vector3; edges: CFrame[][]; center: Vector3}[]
        // ]

        const camera = game.Workspace.CurrentCamera as Camera

        const screenPoints : Vector2[] = []

        // Get the faces that the camera can visibly see or are looking at by using
        // the face normals. During this filter, we also get all corners of the occluder, it's
        // more efficient to do this here than to do it later.
        const visibleFaces = this.faces.filter(face => {
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

        return $tuple(boundingBox, visibleFaces)
    }

    public getCorners() {
        // Ensure that the location and the size of the occluder exists.
        // This should be the case, due to the initalization phase.
        if(!this.location || !this.size) return error("The occluder does not have a location or a size.")

        // Half of the size in each dimension
        const halfSizeX = this.size.X / 2
        const halfSizeY = this.size.Y / 2
        const halfSizeZ = this.size.Z / 2

        // Get the corners of the occluder, these are the corners of the "hitbox" (can be rectangular or square)
        // spherical occlusions are not supported, they will be converted to a rectangular occlusion.
        const corners = [
            this.location.mul(new CFrame(-halfSizeX, -halfSizeY, -halfSizeZ)), // bottom front left
            this.location.mul(new CFrame(-halfSizeX, -halfSizeY, halfSizeZ)),  // bottom front right
            this.location.mul(new CFrame(-halfSizeX, halfSizeY, -halfSizeZ)),  // top front left
            this.location.mul(new CFrame(-halfSizeX, halfSizeY, halfSizeZ)),   // top front right
            this.location.mul(new CFrame(halfSizeX, -halfSizeY, -halfSizeZ)),  // bottom back left
            this.location.mul(new CFrame(halfSizeX, -halfSizeY, halfSizeZ)),   // bottom back right
            this.location.mul(new CFrame(halfSizeX, halfSizeY, -halfSizeZ)),   // top back left
            this.location.mul(new CFrame(halfSizeX, halfSizeY, halfSizeZ))     // top back right
        ]

        return corners
    }

    public getFaces() {
        const corners = this.getCorners()
        if(!corners || !this.location) return error("The occluder does not have corners or a location.")

        const faces = [
            { 
                corners: [corners[0], corners[1], corners[3], corners[2]],
                center: corners[0].Position.add(corners[2].Position).add(corners[1].Position).add(corners[3].Position).div(4),
                normal: this.location.LookVector.mul(-1),
                edges: [[corners[0], corners[1]], [corners[1], corners[3]], [corners[3], corners[2]], [corners[2], corners[0]]]
            }, // front face
            { 
                corners: [corners[4], corners[5], corners[7], corners[6]], 
                center: corners[4].Position.add(corners[6].Position).add(corners[5].Position).add(corners[7].Position).div(4),
                normal: this.location.LookVector,
                edges: [[corners[4], corners[5]], [corners[5], corners[7]], [corners[7], corners[6]], [corners[6], corners[4]]]
            }, // back face
            { 
                corners: [corners[0], corners[1], corners[5], corners[4]],
                center: corners[0].Position.add(corners[4].Position).add(corners[1].Position).add(corners[5].Position).div(4),
                normal: this.location.UpVector.mul(-1),
                edges: [[corners[0], corners[1]], [corners[1], corners[5]], [corners[5], corners[4]], [corners[4], corners[0]]]
            }, // bottom face
            { 
                corners: [corners[2], corners[3], corners[7], corners[6]],
                center: corners[2].Position.add(corners[6].Position).add(corners[3].Position).add(corners[7].Position).div(4),
                normal: this.location.UpVector,
                edges: [[corners[2], corners[3]], [corners[3], corners[7]], [corners[7], corners[6]], [corners[6], corners[2]]]
            }, // top face
            { 
                corners: [corners[0], corners[2], corners[6], corners[4]],
                center: corners[0].Position.add(corners[4].Position).add(corners[2].Position).add(corners[6].Position).div(4),
                normal: this.location.RightVector.mul(-1),
                edges: [[corners[0], corners[2]], [corners[2], corners[6]], [corners[6], corners[4]], [corners[4], corners[0]]]
            }, // left face
            { 
                corners: [corners[1], corners[3], corners[7], corners[5]],
                center: corners[1].Position.add(corners[5].Position).add(corners[3].Position).add(corners[7].Position).div(4),
                normal: this.location.RightVector,
                edges: [[corners[1], corners[3]], [corners[3], corners[7]], [corners[7], corners[5]], [corners[5], corners[1]]]
            } // right face
        ]

        return faces
    }
};