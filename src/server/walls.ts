import { Players } from "./services/players.service";

export namespace Walls {
    export let players: Players;
    export let services : object & Services;
}

Walls.services = setmetatable({}, {
    __index: (_ : object, key : unknown) => {
        return game.GetService(key as keyof Services)
    }
}) as Services

Walls.players = new Players();