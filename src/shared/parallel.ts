const RunService = game.GetService("RunService")
const ReplicatedStorage = game.GetService("ReplicatedStorage")
const RequiemFolder = ReplicatedStorage.WaitForChild("requiem") as requiem

const Players = game.GetService("Players")

// const executor = new Requiem.Threading()
//     .setExecutionTask(PerformanceTask).setMaximumCores(10);
//
// executor.execute().then((res) => {
//     print("Finished?")
// })



// namespace PerformanceTask {
//     export function thread(step : number, cores: number, ...args : unknown[]) {
//         let a = 5
//         let b = 3

//         for (let i = 0; i < 1e6; i++) {
//             a = b
//             b = a
//         };

//         return 3
//     }
// }

// export default PerformanceTask

export class Parallel {
    private task : object | undefined
    private isClient : boolean = RunService.IsClient()

    private indexQueue : number = 0
    private pool : Array<Actor> = []

    private folder : Instance | undefined

    setExecutionTask(task: object) {
        this.task = task
        return this
    }

    setMaximumCores(count : number) {
        const baseActor = RequiemFolder.Actor;
        const folder = new Instance("Folder")

        let container : Instance | undefined

        const objectWithDefault = this.task as unknown as {
            thread: () => unknown
        }

        if(this.isClient) {
            const client = Players.LocalPlayer
            container = client.WaitForChild("PlayerScripts")

            container = container.FindFirstChild("Actors") || new Instance("Folder")
            container.Parent = client.FindFirstChild("PlayerScripts")
            container.Name = "Actors"
        }

        const environment = getfenv(objectWithDefault.thread as unknown as number)
        const module = environment.script.Clone()
        
        folder.Parent = container
        folder.Name = `task/${module.Name}`

        this.folder = folder
        module.Parent = folder

        for(let i = 0; i < count; i++) {
            const actor = baseActor.Clone()
            actor.Parent = folder
            actor.Name = `actor/${i}`

            const container: LocalScript = actor.WaitForChild("Core") as LocalScript
            container.Enabled = true;
            container.Disabled = false;

            this.pool.push(actor)
        }

        RunService.RenderStepped.Wait()

        return this
    }

    execute(...args : unknown[]) {
        const res : Array<defined> = [];
        const goal_size = this.pool.size();

        let completed = 0;
        let step = 0;

        let __resolve : (response : unknown) => void

        const invoke = () => {
            this.indexQueue++;
            if(!this.folder) return

            if(this.indexQueue > this.folder.GetChildren().size() - 1) {
                this.indexQueue = 1;
            };

            const actor : Actor = this.folder.GetChildren()[this.indexQueue] as Actor
            actor.SendMessage("ignite", step, goal_size, ...args)

            step ++;

            let event = actor.FindFirstChildWhichIsA("BindableEvent")
            const response = event?.Event.Wait()
            if(response) res.push(response)
            
            completed ++;
            
            if(completed === goal_size) {
                return __resolve(res)
            }
        }

        return new Promise((resolve, reject) => {
            __resolve = resolve

            for (let i = 0; i < goal_size; i++) {
                task.spawn(invoke)
            }
        })
    }
}