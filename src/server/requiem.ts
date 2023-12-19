import { Players } from "./services/players.service";

export namespace Requiem {
    export let players: Players;
    export let services : object & Services;
}

Requiem.services = setmetatable({}, {
    __index: (_ : object, key : unknown) => {
        return game.GetService(key as keyof Services)
    }
}) as Services

Requiem.players = new Players();