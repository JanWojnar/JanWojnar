import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Ingredient} from "../../shared/ingredient.model";
import {ShoppingListService} from "../shopping-list.service";
import {FormGroup, NgForm} from "@angular/forms";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {

  @ViewChild('f') editForm!: NgForm;

  startedEditingSub!: Subscription;
  endOfEditSub!: Subscription;
  editMode: boolean = false;
  selectedIngredient!: Ingredient;
  indexOfEditingItem!: number;

  constructor(private shoppingListService: ShoppingListService) {
  }

  ngOnInit(): void {
    this.startedEditingSub = this.shoppingListService.startedEditing
      .subscribe((data: {i: number,ingredient: Ingredient}) => {
        this.editMode=true;
        this.indexOfEditingItem=data.i;
        this.selectedIngredient=data.ingredient;
        this.editForm.setValue({
          name: this.selectedIngredient.name,
          amount: this.selectedIngredient.amount
        })
      });
    this.endOfEditSub = this.shoppingListService.buttonClicked
      .subscribe(()=> {
        this.editMode=false;
      });
  }


  ngOnDestroy(): void {
    this.startedEditingSub.unsubscribe();
  }


  onAddClick(form: NgForm){
    const value = form.value;
    const newIngredient = new Ingredient(value.name, value.amount);
    if(!this.editMode){
      this.shoppingListService.addIngredient(newIngredient);
    } else {
      this.shoppingListService.editIngredient(newIngredient, this.indexOfEditingItem);
      this.editMode=false;
    }
    this.shoppingListService.buttonClicked.next()
    form.reset();
  }

  onClearClick(){
    this.editMode=false;
    this.editForm.reset();
    this.shoppingListService.buttonClicked.next()
  }

  onDeleteClick(){
    this.shoppingListService.removeIngredient(this.indexOfEditingItem)
    this.editMode=false;
    this.shoppingListService.buttonClicked.next()
  }

}