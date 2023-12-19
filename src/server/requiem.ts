import { Players } from "./services/players.service";

export namespace Requiem {
    export let services : object & Services;
    
    export let resolve: <T> () => T
}

Requiem.services = setmetatable({}, {
    __index: (_ : object, key : unknown) => {
        return game.GetService(key as keyof Services)
    }
}) as Services
