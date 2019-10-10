import {Component, OnInit, ChangeDetectionStrategy, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {Select, Store} from '@ngxs/store';
import {LayoutState} from '../../../shared/layout/state/layout.state';
import {Layout} from '../../../shared/layout/model/layout';
import {map} from 'rxjs/operators';
import { v1 as uuid } from 'uuid';
import {SaveLayoutAction} from '../../../shared/layout/state/layout.actions';
import {Navigate} from '@ngxs/router-plugin';

@Component({
	selector: 'app-edit-layout',
	templateUrl: './edit-layout-page.component.html',
	styleUrls: ['./edit-layout-page.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditLayoutPageComponent implements OnInit, OnDestroy {

	form: FormGroup;
	stateSub?: Subscription;

	constructor(fb: FormBuilder, protected route: ActivatedRoute, protected store: Store) {
		this.form = fb.group({
			'name': ['', Validators.required],
			'biduleFile': ['', Validators.required],
			'id': ['', Validators.required]
		});
	}

	ngOnInit() {
		this.route.params.subscribe(params => {
			if (this.stateSub) {
				this.stateSub.unsubscribe();
			}
			if ('id' in params) {
				this.stateSub = this.store.select(LayoutState.getById).pipe(
					map(fn => fn(params['id']))
				).subscribe(layout => {
					this.form.setValue(layout);
				});
			} else {
				this.form.reset();
				this.form.patchValue({
					id: uuid()
				});
			}
		});
	}

	ngOnDestroy(): void {
		if (this.stateSub) {
			this.stateSub.unsubscribe();
		}
	}

	onSubmit() {
		this.store.dispatch(
			new SaveLayoutAction(this.form.value)
		).subscribe(() => { this.store.dispatch(new Navigate(['/layouts'])); });
	}
}
