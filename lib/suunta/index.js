import { Suunta as SuuntaCore } from "suunta-core";
import { litRenderer } from "suunta-lit-renderer";

export class Suunta extends SuuntaCore {
    /**
     * @param {import("suunta-core/dist/suunta").SuuntaInitOptions} options
     */
    constructor(options) {
        options.renderer = litRenderer;
        super(options);
    }
}

export * from "suunta-core";
