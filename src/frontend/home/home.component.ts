import {Component, OnInit} from '@angular/core';
import {Select} from '@ngxs/store';
import {KeyboardState} from '../../shared/keyboard/states/keyboard.state';
import {Observable} from 'rxjs';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	@Select(KeyboardState.knobValues) knobValues$: Observable<string[]>;

	constructor() {
	}

	ngOnInit() {
	}

}
