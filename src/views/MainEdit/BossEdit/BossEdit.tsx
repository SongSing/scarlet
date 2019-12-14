import React, { ChangeEvent } from 'react';
import './BossEdit.scss';
import { BossModel, ProjectModel, SpriteModel, BossFormModel } from '../../../utils/datatypes';
import ObjectHelper from '../../../utils/ObjectHelper';
import ObjectSelect from "../../../components/ObjectSelect/ObjectSelect";
import SpriteEdit from '../SpriteEdit/SpriteEdit';
import { array_copy } from '../../../utils/utils';
import BossFormEdit from './BossFormEdit/BossFormEdit';
const { dialog } = require("electron").remote;

interface Props
{
    project: ProjectModel;
    boss: BossModel;
    onUpdate: (boss: BossModel) => any;
}

interface State
{
}

export default class BossEdit extends React.PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);

        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleFormUpdate = this.handleFormUpdate.bind(this);
        this.addForm = this.addForm.bind(this);
    }

    handleNameChange(e: ChangeEvent<HTMLInputElement>)
    {
        this.props.onUpdate({
            ...this.props.boss,
            name: e.currentTarget.value
        });
    }
    
    handleFormUpdate(form: BossFormModel, index: number)
    {
        const forms = array_copy(this.props.boss.forms);
        forms[index] = form;

        this.props.onUpdate({
            ...this.props.boss,
            forms: forms
        });
    }

    addForm()
    {
        const form: BossFormModel = {
            bulletId: -1,
            hp: 10,
            scriptId: -1,
            spriteId: -1
        };

        this.props.onUpdate({
            ...this.props.boss,
            forms: this.props.boss.forms.concat([ form ])
        });
    }

    render()
    {
        return (
            <div className="bossEdit">
                <div className="row">
                    <span className="label">Name:</span>
                    <input
                        type="text"
                        onChange={this.handleNameChange}
                        value={this.props.boss.name}
                    />
                </div>
                {this.props.boss.forms.map((form, i) =>
                {
                    return (
                        <BossFormEdit
                            bossForm={form}
                            index={i}
                            onUpdate={this.handleFormUpdate}
                            project={this.props.project}
                            key={i}
                        />
                    );
                })}
                <button onClick={this.addForm}>+ Add Form</button>
            </div>
        );
    }
}