import { Requiem } from "shared/requiem";
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
    CharacterAdded(): void  // CharacterAdded Event
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

// We specifically wish to listen for the internal player added event
// so we can create a component for the player. Note the first parameter passed
// from the event is our instance object we are attaching to.
@EntityComponent(Requiem.events.get('OnPlayerAdded'))
export class PlayerComponent extends BaseEntityComponent<Player> 
    implements Listeners<PlayerListeners> {
    
    // Inject our dependency for the player controller
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
    }
    
    /**
     * The 'initialize' method of the PlayerComponent class.
     * This code will execute prior to pushing any promises outside of this class.
     * 
     * @method initialize
     * @author NodeSupport
     */
    public initialize() {
        print("A new player component has been initalized!", this.instance.Name)
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