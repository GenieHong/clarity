/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import {Component, Input, Output, EventEmitter} from "@angular/core";
import { Selection, SelectionType } from "./providers/selection";
import { RowActionService } from "./providers/row-action-service";
import {GlobalExpandableRows} from "./providers/global-expandable-rows";
import {RowExpand} from "./providers/row-expand";
import {LoadingListener} from "../loading/loading-listener";


let nbRow: number = 0;

@Component({
    selector: "clr-dg-row",
    template: `
        <clr-dg-row-master class="datagrid-row-flex">
            <clr-dg-cell *ngIf="selection.selectionType === SELECTION_TYPE.Multi" 
                class="datagrid-select datagrid-fixed-column">
                <clr-checkbox [ngModel]="selected" (ngModelChange)="toggle($event)"></clr-checkbox>
            </clr-dg-cell>
            <clr-dg-cell *ngIf="selection.selectionType === SELECTION_TYPE.Single" 
                class="datagrid-select datagrid-fixed-column">
                <div class="radio">
                    <input type="radio" [id]="id"  [name]="selection.id + '-radio'" [value]="item" 
                        [(ngModel)]="selection.currentSingle">    
                    <label for="{{id}}"></label>
                </div>
            </clr-dg-cell>
            <clr-dg-cell *ngIf="rowActionService.hasActionableRow" 
                class="datagrid-row-actions datagrid-fixed-column">
                <ng-content select="clr-dg-action-overflow"></ng-content>
            </clr-dg-cell>
            <clr-dg-cell *ngIf="globalExpandable.hasExpandableRow" 
                class="datagrid-expandable-caret datagrid-fixed-column">
                <ng-container *ngIf="expand.expandable">
                    <button (click)="toggleExpand()" *ngIf="!expand.loading">
                        <clr-icon shape="caret" [dir]="expand.expanded?'down':'right'"></clr-icon>
                    </button>
                    <div class="spinner spinner-sm" *ngIf="expand.loading"></div>
                </ng-container>
            </clr-dg-cell>
            <ng-content  *ngIf="!expand.replace || !expand.expanded || expand.loading"></ng-content>
            
            <ng-template *ngIf="expand.replace && expand.expanded && !expand.loading" 
                [ngTemplateOutlet]="detail"></ng-template>
        </clr-dg-row-master>
        
        <ng-template *ngIf="!expand.replace && expand.expanded && !expand.loading"
            [ngTemplateOutlet]="detail"></ng-template>
        
        <!-- 
            We need the "project into template" hack because we need this in 2 different places
            depending on whether the details replace the row or not.
        -->
        <ng-template #detail>
            <ng-content select="clr-dg-row-detail"></ng-content>
        </ng-template>
    `,
    host: {
        "[class.datagrid-row]": "true",
        "[class.datagrid-selected]": "selected"
    },
    providers: [RowExpand, {provide: LoadingListener, useExisting: RowExpand}]
})
export class DatagridRow {
    public id: string;

    /* reference to the enum so that template can access */
    public SELECTION_TYPE = SelectionType;

    /**
     * Model of the row, to use for selection
     */
    @Input("clrDgItem") item: any;

    constructor(public selection: Selection, public rowActionService: RowActionService,
                public globalExpandable: GlobalExpandableRows, public expand: RowExpand) {
        this.id = "clr-dg-row" + (nbRow++);
    }

    private _selected = false;
    /**
     * Indicates if the row is selected
     */
    public get selected() {
        if (this.selection.selectionType === SelectionType.None) {
            return this._selected;
        } else {
            return this.selection.isSelected(this.item);
        }
    }

    @Input("clrDgSelected")
    public set selected(value: boolean) {
        if (this.selection.selectionType === SelectionType.None) {
            this._selected = value;
        } else {
            this.selection.setSelected(this.item, value);
        }
    }

    @Output("clrDgSelectedChange") selectedChanged = new EventEmitter<boolean>(false);

    public toggle(selected = !this.selected) {
        if (selected !== this.selected) {
            this.selected = selected;
            this.selectedChanged.emit(selected);
        }
    }

    public get expanded() {
        return this.expand.expanded;
    }
    @Input("clrDgExpanded") public set expanded(value: boolean) {
        this.expand.expanded = value;
    }
    @Output("clrDgExpandedChange") expandedChange = new EventEmitter<boolean>(false);

    public toggleExpand() {
        if (this.expand.expandable) {
            this.expanded = !this.expanded;
            this.expandedChange.emit(this.expanded);
        }
    }
}