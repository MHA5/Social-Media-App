import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusCreatComponent } from './status-creat.component';

describe('StatusCreatComponent', () => {
  let component: StatusCreatComponent;
  let fixture: ComponentFixture<StatusCreatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusCreatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusCreatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
