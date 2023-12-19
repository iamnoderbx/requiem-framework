import { Requiem } from "server/requiem";
import { BaseService, EventHandler, Listeners, Service, Start } from "shared/controllers/components";

interface PlayerServiceListeners {
    PlayerAdded(player : Player): void
}

@Service(Requiem.services.Players)
export class Players extends BaseService 
    implements Start, Listeners<PlayerServiceListeners> {
    
    // Create a new event in which can be hooked to via components.
    public event = Requiem.events.register('OnPlayerAdded')

    constructor() {
        super()
    }

    public start() {}
    public get() { }

    /**
     * The 'onPlayerAdded' method of the PlayersService class.
     * It fires an event when a player is added, which then creates all component entities correlating to the player.
     * 
     * This method is decorated with the 'EventHandler' decorator, which means it's 
     * called when a certain event occurs.
     * 
     * @method onPlayerAdded
     * @param {Player} player - The player that was added.
     * @author NodeSupport
     */
    @EventHandler
    public onPlayerAdded(player : Player) {
        // Fire the event with the player as the argument, this will then
        // create all component entities correlating to the player.
        this.event.Fire(player)
    }
}