import {Component, OnInit,} from '@angular/core';
import {Observable} from 'rxjs';
import {Select, Store} from '@ngxs/store';
import {VSTState} from '../../../shared/vst/state/vst.state';
import {Instrument} from '../../../shared/vst/model/instrument';
import {MatDialog} from '@angular/material/dialog';
import {AvailabilityComponent} from '../../vst/availability/availability.component';

@Component({
	selector: 'app-instrument-list',
	templateUrl: './instrument-list-page.component.html',
	styleUrls: ['./instrument-list-page.component.scss'],
})
export class InstrumentListPageComponent implements OnInit {

	@Select(VSTState.getInstruments)
	instruments$: Observable<Instrument[]>;

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
