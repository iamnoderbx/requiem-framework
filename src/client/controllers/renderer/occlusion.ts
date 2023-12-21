import { Requiem } from "shared/requiem"
import { OccluderType } from "./occlusions/classes/Occluder"
import { Cells } from "./occlusions/Camera"
import { OccludeeType } from "./occlusions/classes/Occludee"

export class Occlusion {
    private render : RBXScriptConnection

    private onOccluderAdded = Requiem.events.register("OccluderAdded")
    private onOccludeeAdded = Requiem.events.register("OccludeeAdded")

    private cameraChunks = new Cells()

    constructor() {
        const RunService = Requiem.services.RunService
        const CollectionService = Requiem.services.CollectionService

        CollectionService.GetInstanceAddedSignal("Occluder").Connect((instance) => {
            const occluder : OccluderType = { instance, collisions: 0, id: "Occluder" }
            this.onOccluderAdded.Fire(occluder)
        });

        CollectionService.GetInstanceAddedSignal("Occludee").Connect((instance) => {
            const occludee : OccludeeType = { instance, id: "Occludee" }
            this.onOccludeeAdded.Fire(occludee)
        });

        CollectionService.GetTagged("Occluder").forEach((instance) => {
            const occluder : OccluderType = { instance, collisions: 0, id: "Occluder" }
            this.onOccluderAdded.Fire(occluder)
        })

        CollectionService.GetTagged("Occludee").forEach((instance) => {
            const occludee : OccludeeType = { instance, id: "Occludee" }
            this.onOccludeeAdded.Fire(occludee)
        })

        this.render = RunService.RenderStepped.Connect(() => this.onOcclusionRender())
    }

    private onOcclusionRender() {
        // Benchmark
        const start = tick()

        this.cameraChunks.update()

        // Benchmark
        print("Occlusion render took", tick() - start, "s")
    }
}