import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Select, Store} from '@ngxs/store';
import {VSTState} from '../../../shared/vst/state/vst.state';
import {Effect} from '../../../shared/vst/model/effect';
import {MatDialog} from '@angular/material/dialog';
import {AvailabilityComponent} from '../../vst/availability/availability.component';

@Component({
	selector: 'app-effect-list',
	templateUrl: './effect-list-page.component.html',
	styleUrls: ['./effect-list-page.component.scss'],
})
export class EffectListPageComponent implements OnInit {

	@Select(VSTState.getEffects)
	effects$: Observable<Effect[]>;

	constructor(protected store: Store, public dialog: MatDialog) {
	}

	public openAvailability(vstId: string) {
		const dialogRef = this.dialog.open(AvailabilityComponent, {
			width: '600px'
		});
		dialogRef.componentInstance.vstId = vstId;
	}

	ngOnInit() {
	}

}
