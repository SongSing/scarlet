import React, { ChangeEvent } from 'react';
import './StageComposer.scss';
import { StageModel, ProjectModel, SpriteModel, StageEnemyData } from '../../../../utils/datatypes';
import ObjectHelper from '../../../../utils/ObjectHelper';
import ObjectSelect from "../../../../components/ObjectSelect/ObjectSelect";
import EnemyList from './EnemyList/EnemyList';
import PropertyEdit from './PropertyEdit/PropertyEdit';
import StageRenderer from "./StageRenderer/StageRenderer";
import { array_copy, obj_copy } from '../../../../utils/utils';
import ScriptEngine from '../../../../utils/ScriptEngine';
import StageTimeline from './StageTimeline/StageTimeline';
const { dialog } = require("electron").remote;

interface Props
{
    project: ProjectModel;
    stage: StageModel;
    onUpdate: (stage: StageModel) => any;
    onBack: () => any;
}

interface State
{
    timeSeconds: number;
    selectedEnemyIndex: number;
    selectedNewEnemyId: number;
    playing: boolean;
    refreshRenderer: boolean;
}

export default class StageComposer extends React.PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);
        
        this.state = {
            timeSeconds: 0,
            selectedEnemyIndex: -1,
            selectedNewEnemyId: -1,
            playing: false,
            refreshRenderer: false
        };

        this.handleBack = this.handleBack.bind(this);
        this.handleLengthChange = this.handleLengthChange.bind(this);
        this.handleWidthChange = this.handleWidthChange.bind(this);
        this.handleHeightChange = this.handleHeightChange.bind(this);
        this.handleSpawnXChange = this.handleSpawnXChange.bind(this);
        this.handleSpawnYChange = this.handleSpawnYChange.bind(this);
        this.handleBackgroundChange = this.handleBackgroundChange.bind(this);
        this.handlePlayerChange = this.handlePlayerChange.bind(this);
        this.handleBossChange = this.handleBossChange.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);
        this.handleAddEnemy = this.handleAddEnemy.bind(this);
        this.handleSelectEnemy = this.handleSelectEnemy.bind(this);
        this.handleDeselectEnemy = this.handleDeselectEnemy.bind(this);
        this.handleSelectNewEnemy = this.handleSelectNewEnemy.bind(this);
        this.handleAddEnemy = this.handleAddEnemy.bind(this);
        this.handleUpdateEnemy = this.handleUpdateEnemy.bind(this);
        this.refreshScripts = this.refreshScripts.bind(this);
        this.handlePlayPause = this.handlePlayPause.bind(this);
        this.animate = this.animate.bind(this);
    }

    animate()
    {
        if (this.state.playing)
        {
            this.setState((state) =>
            {
                let newTime = state.timeSeconds + 1/60;
                if (newTime >= this.props.stage.lengthSeconds)
                {
                    newTime = this.props.stage.lengthSeconds - 1/60;
                }

                return {
                    ...state,
                    timeSeconds: newTime
                };
            });
        }
        requestAnimationFrame(this.animate);
    }

    refreshScripts()
    {
        ScriptEngine.updateCache(this.props.project);
        this.setState((state) =>
        {
            return {
                ...state,
                refreshRenderer: !state.refreshRenderer
            };
        });
    }

    componentDidMount()
    {
        this.refreshScripts();
        this.animate();
    }

    componentDidUpdate(prevProps: Props, prevState: State)
    {
        const currentEnemies = this.props.stage.enemies;
        const prevEnemies = prevProps.stage.enemies;

        if (currentEnemies.length !== prevEnemies.length)
        {
            this.refreshScripts();
        }
        else
        {
            for (let i = 0; i < currentEnemies.length; i++)
            {
                const currObj = ObjectHelper.getObjectWithId(currentEnemies[i].id, this.props.project);
                const prevObj = ObjectHelper.getObjectWithId(prevEnemies[i].id, this.props.project);

                if (!currObj || !prevObj)
                {
                    throw "somertthing bad happen,,,";
                }
                else if (currObj.type !== prevObj.type)
                {
                    this.refreshScripts();
                    return;
                }
            }
        }
    }

    handleBack()
    {
        this.props.onBack();
    }

    handleLengthChange(e: ChangeEvent<HTMLInputElement>)
    {
        let val = parseFloat(e.currentTarget.value);
        if (isNaN(val))
        {
            val = this.props.stage.lengthSeconds;
        }

        this.props.onUpdate({
            ...this.props.stage,
            lengthSeconds: val
        });
    }

    handleWidthChange(e: ChangeEvent<HTMLInputElement>)
    {
        let val = parseInt(e.currentTarget.value);
        if (isNaN(val))
        {
            val = this.props.stage.size.x;
        }

        this.props.onUpdate({
            ...this.props.stage,
            size: {
                ...this.props.stage.size,
                x: val
            }
        });
    }

    handleHeightChange(e: ChangeEvent<HTMLInputElement>)
    {
        let val = parseInt(e.currentTarget.value);
        if (isNaN(val))
        {
            val = this.props.stage.size.y;
        }

        this.props.onUpdate({
            ...this.props.stage,
            size: {
                ...this.props.stage.size,
                y: val
            }
        });
    }

    handleSpawnXChange(e: ChangeEvent<HTMLInputElement>)
    {
        let val = parseInt(e.currentTarget.value);
        if (isNaN(val))
        {
            val = this.props.stage.size.y;
        }

        this.props.onUpdate({
            ...this.props.stage,
            playerSpawnPosition: {
                ...this.props.stage.playerSpawnPosition,
                x: val
            }
        });
    }

    handleSpawnYChange(e: ChangeEvent<HTMLInputElement>)
    {
        let val = parseInt(e.currentTarget.value);
        if (isNaN(val))
        {
            val = this.props.stage.size.y;
        }

        this.props.onUpdate({
            ...this.props.stage,
            playerSpawnPosition: {
                ...this.props.stage.playerSpawnPosition,
                y: val
            }
        });
    }

    handleBackgroundChange(backgroundId: number)
    {
        this.props.onUpdate({
            ...this.props.stage,
            backgroundId: backgroundId
        });
    }

    handlePlayerChange(playerId: number)
    {
        this.props.onUpdate({
            ...this.props.stage,
            playerId: playerId
        });
    }

    handleBossChange(bossId: number)
    {
        this.props.onUpdate({
            ...this.props.stage,
            bossId: bossId
        });
    }

    handleTimeChange(time: number)
    {
        this.setState((state) =>
        {
            return {
                ...state,
                timeSeconds: time
            };
        });
    }

    handleAddEnemy()
    {
        if (this.state.selectedNewEnemyId >= 0)
        {
            this.props.onUpdate({
                ...this.props.stage,
                enemies: this.props.stage.enemies.concat([{
                    id: this.state.selectedNewEnemyId,
                    instanceName: "New Enemy " + this.props.stage.enemies.length.toString(),
                    lifetime: -1,
                    position: {
                        x: 0,
                        y: 0
                    },
                    spawnAmount: 1,
                    spawnRate: 0,
                    spawnTime: this.state.timeSeconds
                }])
            });
        }
    }

    handleSelectEnemy(index: number)
    {
        this.setState((state) =>
        {
            return {
                ...state,
                selectedEnemyIndex: index
            };
        });
    }

    handleDeselectEnemy()
    {
        this.setState((state) =>
        {
            return {
                ...state,
                selectedEnemyIndex: -1
            };
        });
    }

    handleSelectNewEnemy(newEnemyId: number)
    {
        this.setState((state) =>
        {
            return {
                ...state,
                selectedNewEnemyId: newEnemyId
            };
        });
    }

    handleUpdateEnemy(enemy: StageEnemyData, index: number)
    {
        const enemies = array_copy(this.props.stage.enemies);
        enemies[index] = enemy;

        this.props.onUpdate({
            ...this.props.stage,
            enemies: enemies
        });
    }

    handlePlayPause()
    {
        this.setState((state) =>
        {
            return {
                ...state,
                playing: !state.playing
            };
        });
    }

    render()
    {
        return (
            <div className="stageComposer">
                {/* header */}
                <div className="row header">
                    <button onClick={this.handleBack}>&lt; Back</button>
                    <h1>{this.props.stage.name}</h1>
                    <button
                        className="refreshScripts"
                        onClick={this.refreshScripts}
                    >
                        Refresh Scripts
                    </button>
                </div>
                {/* edit stuff */}
                <div className="row edit">
                    {/* left col */}
                    <div className="col stageInfo">
                        <div className="row">
                            <span className="label">Size:</span>
                            <input
                                type="number"
                                onChange={this.handleWidthChange}
                                value={this.props.stage.size.x.toString()}
                            />
                            <span>x</span>
                            <input
                                type="number"
                                onChange={this.handleHeightChange}
                                value={this.props.stage.size.y.toString()}
                            />
                        </div>
                        <div className="row">
                            <span className="label">Length:</span>
                            <input
                                type="number"
                                onChange={this.handleLengthChange}
                                value={this.props.stage.lengthSeconds.toString()}
                            />
                            <span>seconds</span>
                        </div>
                        <div className="row">
                            <span className="label">Background:</span>
                            <ObjectSelect
                                currentObjectId={this.props.stage.backgroundId}
                                objectType="background"
                                onChange={this.handleBackgroundChange}
                                project={this.props.project}
                            />
                        </div>
                        <div className="row">
                            <span className="label">Player:</span>
                            <ObjectSelect
                                currentObjectId={this.props.stage.playerId}
                                objectType="player"
                                onChange={this.handlePlayerChange}
                                project={this.props.project}
                            />
                        </div>
                        <div className="row">
                            <span className="label">Spawn Pos:</span>
                            <input
                                type="number"
                                onChange={this.handleSpawnXChange}
                                value={this.props.stage.playerSpawnPosition.x.toString()}
                            />
                            <span>x</span>
                            <input
                                type="number"
                                onChange={this.handleSpawnYChange}
                                value={this.props.stage.playerSpawnPosition.y.toString()}
                            />
                        </div>
                        <div className="row">
                            <span className="label">Boss:</span>
                            <ObjectSelect
                                currentObjectId={this.props.stage.bossId}
                                objectType="boss"
                                onChange={this.handleBossChange}
                                project={this.props.project}
                            />
                        </div>
                        <div className="row">
                            <span>Enemies:</span>
                            <ObjectSelect
                                currentObjectId={this.state.selectedNewEnemyId}
                                objectType="enemy"
                                onChange={this.handleSelectNewEnemy}
                                project={this.props.project}
                            />
                            <button
                                className="addEnemy"
                                onClick={this.handleAddEnemy}
                            >
                                + Add
                            </button>
                        </div>
                        <EnemyList
                            onSelectEnemy={this.handleSelectEnemy}
                            project={this.props.project}
                            stage={this.props.stage}
                        />
                    </div>
                    {/* stage */}
                    <div className="stagePreview">
                        <StageRenderer
                            project={this.props.project}
                            stage={this.props.stage}
                            time={this.state.timeSeconds}
                            refresh={this.state.refreshRenderer}
                            selectedEnemyIndex={this.state.selectedEnemyIndex}
                        />
                    </div>
                    {/* properties */}
                    <PropertyEdit
                        enemyIndex={this.state.selectedEnemyIndex}
                        onUpdate={this.handleUpdateEnemy}
                        project={this.props.project}
                        stage={this.props.stage}
                        onDeselectEnemy={this.handleDeselectEnemy}
                    />
                </div>
                {/* timeline */}
                <StageTimeline
                    handleTimeChange={this.handleTimeChange}
                    project={this.props.project}
                    stage={this.props.stage}
                    time={this.state.timeSeconds}
                    selectedEnemyIndex={this.state.selectedEnemyIndex}
                />
                <button
                    className="play"
                    onClick={this.handlePlayPause}
                >
                    {this.state.playing ? "Pause" : "Play"}
                </button>
            </div>
        );
    }
}
