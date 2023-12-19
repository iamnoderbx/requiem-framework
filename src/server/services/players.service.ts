import { Requiem } from "server/requiem";
import { BaseService, EventHandler, Listeners, Service, Start } from "shared/controllers/components";

interface ServiceListeners {
    PlayerAdded(player : Player): void
}

@Service(Requiem.services.Players)
export class Players extends BaseService 
    implements Start, Listeners<ServiceListeners> {

    public start() {}
    public get() { }

    @EventHandler
    public onPlayerAdded(player : Player) {
        print(player)
    }
}