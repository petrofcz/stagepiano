import {Component, OnInit,} from '@angular/core';
import {Observable} from 'rxjs';
import {Select, Store} from '@ngxs/store';
import {VSTState} from '../../../shared/vst/state/vst.state';
import {Effect} from '../../../shared/vst/model/effect';

@Component({
	selector: 'app-effect-list',
	templateUrl: './effect-list-page.component.html',
	styleUrls: ['./effect-list-page.component.scss'],
})
export class EffectListPageComponent implements OnInit {

	@Select(VSTState.getEffects)
	effects$: Observable<Effect[]>;

	constructor(protected store: Store) {
	}

	ngOnInit() {
	}

}
