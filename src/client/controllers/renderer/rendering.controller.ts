import { Controller, Initialize, Start } from "shared/controllers/components";
import { Occlusion } from "./occlusions/occlusion";
import { Game } from "./chunks/game";
import { Terrain } from "./terrain/terrain";

@Controller()
export class Rendering implements Start, Initialize {
    private occlusions = new Occlusion()
    private game = new Game()
    private terrain = new Terrain()
    
    public initialize(): void {
        
    }

    public start(): void {

    }
}