import { BaseService, Start, Listeners, Service, Initialize } from "shared/controllers/components";
import { Requiem } from "shared/requiem";

@Service()
export class Network extends BaseService implements Start, Initialize {
    private reliable : RemoteEvent = new Instance("RemoteEvent")
    private unreliable : UnreliableRemoteEvent = new Instance("UnreliableRemoteEvent")

    constructor() {
        super()
    }

    createReliableEvent(name : string) {

    }

    createUnreliableEvent(name : string) {
        
    }
    
    initialize(): void {
        this.reliable.Parent = Requiem.services.ReplicatedStorage
        this.unreliable.Parent = Requiem.services.ReplicatedStorage
    }

    start(): void {}
}