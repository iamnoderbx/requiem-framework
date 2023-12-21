import { Controller, Initialize, Start } from "shared/controllers/components";
import { Occlusion } from "./occlusion";

@Controller()
export class Rendering implements Start, Initialize {
    private occlusions = new Occlusion()
    
    public initialize(): void {
        
    }

    public start(): void {

    }
}