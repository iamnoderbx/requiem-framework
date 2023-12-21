import { Requiem } from "shared/requiem"

export class OcclusionDebugger {
    private interface : ScreenGui | undefined

    // Mapping of a line as well as whether or not the line is
    // actively being used
    private lines : Map<Frame, boolean> = new Map()

    render() {
        const gui = new Instance("ScreenGui")
        gui.Name = "OcclusionDebugger"
        gui.Parent = Requiem.services.Players.LocalPlayer!.WaitForChild("PlayerGui") as PlayerGui

        const frame = new Instance("Frame")
        frame.Size = new UDim2(1, 0, 1, 0)
        frame.Position = new UDim2(0.5, 0, 0.5, 0)
        frame.AnchorPoint = new Vector2(0.5, 0.5)
        frame.Parent = gui
        frame.BackgroundTransparency = 1;

        this.interface = gui
    }

    drawDebugLine(startScreen : Vector2, finishScreen : Vector2, color : Color3 = new Color3(0, 1, 0)) {
        const line = this.getFreeDebugLine()
        if(!line) return

        const xLength = startScreen.X - finishScreen.X
        const yLength = startScreen.Y - finishScreen.Y
        const mag = new Vector2(startScreen.X, startScreen.Y).sub(new Vector2(finishScreen.X, finishScreen.Y))

        const centerPosition = new Vector2(finishScreen.X, finishScreen.Y).add(new Vector2(startScreen.X, startScreen.Y)).div(2)
        line.Rotation = math.atan2(yLength, xLength) * 180 / math.pi
        line.Position = new UDim2(0, centerPosition.X, 0, centerPosition.Y)
        line.Size = new UDim2(0, mag.Magnitude, 0, 1)

        line.BackgroundColor3 = color
        line.Visible = true;
    }

    drawDebugSquare(boundings: {min: Vector2, max: Vector2}, color : Color3 = new Color3(1, 0, 0)) {
        // Create a square using debug lines
        const min = boundings.min
        const max = boundings.max

        // Create the corners of the square
        const topLeft = new Vector2(min.X, min.Y);
        const topRight = new Vector2(max.X, min.Y);
        const bottomLeft = new Vector2(min.X, max.Y);
        const bottomRight = new Vector2(max.X, max.Y);

        // Draw the lines
        const topLine = this.drawDebugLine(topLeft, topRight, color);
        const bottomLine = this.drawDebugLine(bottomLeft, bottomRight, color);
        const leftLine = this.drawDebugLine(topLeft, bottomLeft, color);
        const rightLine = this.drawDebugLine(topRight, bottomRight, color);
    }

    drawDebugSquare3D(faces: {corners: CFrame[]; normal: Vector3; edges: CFrame[][]; center: Vector3}[], color : Color3 = new Color3(0, 1, 0)) {
        const camera = game.Workspace.CurrentCamera as Camera

        faces.forEach((face) => {
            face.edges.forEach((edge) => {
                const [ start, finish ] = edge

                const [ startScreen, startIsOnScreen ] = camera.WorldToScreenPoint(start.Position)
                const [ finishScreen, finishIsOnScreen ] = camera.WorldToScreenPoint(finish.Position)

                if(startIsOnScreen && finishIsOnScreen) {
                    this.drawDebugLine(new Vector2(startScreen.X, startScreen.Y), new Vector2(finishScreen.X, finishScreen.Y), color)
                }
            })
        })
    }

    getFreeDebugLine() {
        for(const [line, used] of pairs(this.lines)) {
            if(!used) {
                this.lines.set(line, true)
                return line
            }
        }
    }

    freeDebugLines() {
        this.lines.forEach((used, line) => {
            this.lines.set(line, false)

            line.Size = new UDim2(0, 0, 0, 0)
            line.Visible = false
        })
    }

    allocateDebugLines(count : number) {
        for(let i = 0; i < count; i++) {
            const line = new Instance("Frame")
            line.Size = new UDim2(0, 0, 0, 0)
            line.BackgroundColor3 = new Color3(0, 1, 0)
            line.Visible = false
            
            line.BorderSizePixel = 0
            line.AnchorPoint = new Vector2(0.5, 0.5)

            line.Parent = this.interface?.WaitForChild("Frame") as Frame
            
            this.lines.set(line, false)
        }
    }

    clear() {
        const holder = this.interface?.FindFirstChild("Frame")
        holder?.GetChildren().forEach((child) => {
            child.Destroy()
        })
    }

    addPoint(position : Vector2) {
        const point = new Instance("Frame")
        point.Size = new UDim2(0, 10, 0, 10)
        point.Position = new UDim2(0, position.X, 0, position.Y)
        point.BackgroundColor3 = new Color3(1, 0, 0)
        point.Parent = this.interface?.WaitForChild("Frame") as Frame
    }

    addWorldPoint(position : Vector3) {
        const part = new Instance("Part")
        part.Size = new Vector3(2, 2, 2)
        part.Position = position
        part.Anchored = true
        part.CanCollide = false
        part.Transparency = 0
        part.Color = new Color3(1, 0, 0)
        part.Parent = game.Workspace
    }
}