import { Requiem } from "server/requiem";
import { Players } from "server/services/players.service";
import { EntityComponent, BaseEntityComponent, Listeners, EventHandler } from "shared/controllers/components";
import { Dependency } from "shared/controllers/dependencies";

/**
 * The PlayerListeners interface defines a list of helper methods in which
 * can be by an EventHandler decorator, which will hook these methods to a player.
 * 
 * These methods will also be added to the Components maid!
 * 
 * @interface PlayerListeners
 * @author NodeSupport
 */

interface PlayerListeners {
    CharacterAdded(): void
}

/**
 * The PlayerComponent class represents a component of a player entity.
 * It extends the BaseEntityComponent class, and has an 'instance' property of type Player.
 * The 'players' property is injected with an instance of the Players class by the Dependency decorator.
 * 
 * @class PlayerComponent
 * @extends {BaseEntityComponent<Player>}
 * @author NodeSupport
 */

// We specifically wish to listen for this entity under a parent of Players
@EntityComponent(Requiem.services.Players)
export class PlayerComponent extends BaseEntityComponent<Player> 
    implements Listeners<PlayerListeners> {
    
    @Dependency
    private players!: Players

    /**
     * Constructor for the Player class. Automatically created as well
     * upon component being made, will inject instance via transformer.
     * 
     * @constructor
     * @author NodeSupport
     */
    constructor() {
        super()

        // Debug ensuring this is working!
        print("Created a new player entity component")
    }
    
    /**
     * The 'initialize' method of the PlayerComponent class.
     * It prints the result of calling the 'get' method of the 'players' property.
     * 
     * @method initialize
     * @author NodeSupport
     */
    public initialize() {
        print(this.players.get())
    }

    /**
     * The 'onCharacterAdded' method of the Player class.
     * Note that this is the CharacterAdded event of the Player class, all EventHandlers
     * should be appended by the prefix "on"
     * 
     * This method is decorated with the 'EventHandler' decorator, which means it's 
     * called when a certain event occurs.
     * 
     * 
     * @method onCharacterAdded
     * @author NodeSupport
     */
    @EventHandler
    public onCharacterAdded() {
        print(this.instance.Name + " has spawned in!")
    }
}