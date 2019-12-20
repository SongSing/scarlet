import * as fs from "fs";
import * as vm from "vm";
import ObjectHelper from "./ObjectHelper";
import { ProjectModel, ScriptModel } from "./datatypes";
import { PointLike } from "./point";

export interface StageScriptData
{
    size: PointLike;
    age: number;
};

export interface PlayerScriptData
{
    position: PointLike;
};

export interface ScriptMethodCollection
{
    update: (context: ScriptContext) => ScriptResult;
};

export interface ScriptContext
{
    stage: StageScriptData;
    delta: number;
    entity: ScriptEntityData;
};

export interface ScriptEntityData
{
    age: number;
    spawnPosition: PointLike;
    position: PointLike;
    index: number;
};

export interface ScriptResult
{
    position?: PointLike;
    fire?: boolean;
    alive?: boolean;
};

// engine //

export default class ScriptEngine
{
    private static scriptMap: Map<number, vm.Script> = new Map();
    private static resultCache: Map<string, any> = new Map();
    private static contextCache: Map<number, vm.Context> = new Map();

    public static updateCache(project: ProjectModel)
    {
        this.contextCache.clear();
        this.resultCache.clear();
        const scripts = ObjectHelper.getObjectsWithType<ScriptModel>("script", project);
        scripts.forEach(script => this.fetchScriptFor(script, project));
    }

    private static fetchScriptFor(scriptObject: ScriptModel, project: ProjectModel): boolean
    {
        let code: string;

        try
        {
            code = fs.readFileSync(scriptObject.path, "utf8");
            const script = new vm.Script(code);
            this.scriptMap.set(scriptObject.id, script);
            const context = vm.createContext();
            script.runInContext(context);
            this.contextCache.set(scriptObject.id, context);
        }
        catch (e)
        {
            console.error(e);
            return false;
        }

        return true;
    }

    public static parseScript(scriptId: number, project: ProjectModel): ScriptMethodCollection
    {
        if (scriptId === -1)
        {
            throw new Error("tried to parse script for scriptless object ");
        }
        if (!this.contextCache.has(scriptId))
        {
            throw new Error("fetch script first");
        }
        
        return this.contextCache.get(scriptId) as ScriptMethodCollection;
    }
}