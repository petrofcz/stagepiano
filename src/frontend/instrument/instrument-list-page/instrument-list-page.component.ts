import {Component, OnInit,} from '@angular/core';
import {Observable} from 'rxjs';
import {Select, Store} from '@ngxs/store';
import {VSTState} from '../../../shared/vst/state/vst.state';
import {Instrument} from '../../../shared/vst/model/instrument';

@Component({
	selector: 'app-instrument-list',
	templateUrl: './instrument-list-page.component.html',
	styleUrls: ['./instrument-list-page.component.scss'],
})
export class InstrumentListPageComponent implements OnInit {

	@Select(VSTState.getInstruments)
	instruments$: Observable<Instrument[]>;

	constructor(protected store: Store) {
	}

	ngOnInit() {
	}

}
