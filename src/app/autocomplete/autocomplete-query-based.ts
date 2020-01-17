import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, filter } from 'rxjs/operators';

@Component({
  selector: 'autocomplete-query-based',
  templateUrl: 'autocomplete-query-based.html',
  styleUrls: ['autocomplete-query-based.css'],
})
export class AutoCompleteQueryBased implements OnInit {
  myControl = new FormControl();
  hiddenCtrl = new FormControl();

  fieldList: SuggestionDetails = { Name: 'Field', Value: ['Name', 'Age', 'First Name'], Valid: ['string'] };
  operatorList: SuggestionDetails = { Name: 'Operator', Value: ['=', '!=', '>'], Valid: ['string'] };
  valueList: SuggestionDetails = { Name: 'Value', Value: ['Biswa', 'Techno', 'Saviour', 'TechnoSaviour', 'Biswa Kalyan Das'], Valid: ['string'] };
  expressionList: SuggestionDetails = { Name: 'Expression', Value: ['And', 'Or'], Valid: ['string'] };

  field: string[] = this.fieldList.Value;
  operator: string[] = this.operatorList.Value;
  value: string[] = this.valueList.Value;
  expression: string[] = this.expressionList.Value;


  // Do not change variables
  filteredOptions: Observable<string[]>;
  searchList: SelectedOption[] = [];

  selectionList: SelectionDict[] = [{ Name: 'Field', Value: this.field, NextSelection: 'Operator' },
  { Name: 'Operator', Value: this.operator, NextSelection: 'Value' },
  { Name: 'Value', Value: this.value, NextSelection: 'Expression' },
  { Name: 'Expression', Value: this.expression, NextSelection: 'Field' }];

  sequence = { 'field': 'operator', 'operator': 'value', 'value': 'expression', 'expression': 'field' };
  defaultSelection: string = 'Field';
  currentEvent: string;

  ngOnInit() {
    this.fieldList

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    }

  _filter(value: string): string[] {
    let optionListToBePopulated: string[] = this.getOptionList();
    var searchText = this.getSearchText(value);
    return optionListToBePopulated.filter(option => option.toLowerCase().indexOf(searchText.toLowerCase().trim()) != -1);
  }

  getSearchText(value: string): string {
    var oldText = this.searchList.map(s => s.Value).join(' ');

    // Handle backspace
    var previousListName = this.searchList.length != 0 ? this.searchList[this.searchList.length - 1].PopulatedFrom : '';
    var prevList = this.selectionList.find(s => s.Name.toLowerCase() === previousListName.toLowerCase());;
    if ((prevList ? prevList.Value.indexOf(value) === -1 : false) && oldText.trim().length > value.trim().length)
      this.searchList.pop();

    return value.trim().replace(oldText, '');
  }

  getOptionList(): string[] {
    if (this.searchList == null || this.searchList == undefined || this.searchList.length === 0) {
      this.currentEvent = this.defaultSelection;
      return this.field;
    }

    let lastElement: SelectedOption = <SelectedOption>this.searchList.slice(-1).pop();
    var currentList = this.selectionList.find(s => s.Name.toLowerCase() === lastElement.Next.toLowerCase());
    this.currentEvent = currentList ? currentList.Name : this.defaultSelection;
    return currentList ? currentList.Value : this.field;
  }

  displayFn(value: string): string {
    if (!!value)
      this.searchList.push(new SelectedOption(value, this.currentEvent, this.getNextEvent(this.currentEvent)));
    return this.searchList.length > 0 ? this.searchList.map(s => s.Value).join(' ') : '';
  }

  getNextEvent(currentEvent: string): string {
    var currentList = this.selectionList.find(s => s.Name.toLowerCase() === currentEvent.toLowerCase());
    return currentList ? currentList.NextSelection : this.defaultSelection;
  }
}

export class SelectedOption {
  public Value: string;
  public PopulatedFrom: string;
  public Next: string;

  constructor(value: string, populatedFrom: string, next: string) {
    this.Value = value;
    this.PopulatedFrom = populatedFrom;
    this.Next = next;
  }
}

// Server response
export class SuggestionDetails {
  public Name: string;
  public Valid: string[];
  public Value: string[];
}

export class SelectionDict {
  public Name: string;
  public Value: string[];
  public NextSelection: string;
}
