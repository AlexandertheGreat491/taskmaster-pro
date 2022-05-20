var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".card .list-group").sortable({
connectWith: $(".card .list-group"),
scroll: false,
tolerance: "pointer",
helper: "clone",
activate: function(event){
  console.log("activate", this);
},
deactivate: function(event){
  console.log("deactivate", this);
},
over: function(event) {
  console.log("over", event.target);
},
out: function(event){
  console.log("out", event.target)
},
update: function(event) {
  //console.log($(this).children());
  // loop over the current set of children in the sortable list.
  $(this).children().each(function(){
console.log($(this));
  });
}
// jQuery's each() method will run a callback function for every item/element in the array.
// $(this) refers to the <li> element.
// sortable() turned every element with the class list-group in a sortable list
/*connectWith is a selector of other sortable elements that the items from this list should be connected to.
connectWith  linked these sortable lists with any other lists that have the same class.*/

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

$(".list-group").on("click", "p", function() {
  var text = $(this)
  .text()
  .trim();

  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text);

  $(this).replaceWith(textInput);
  // $(this)=<p> element & replaceWith replaces <p> with <textarea> element.
  // Now $(this)=<textarea> element.
  // auto foucs new element
  textInput.trigger("focus");
  });

  $(".list-group").on("blur", "text-area", function() {
// Blur event happens when an element has lost focus & this is an event listener for that situation.
// get the textarea's current value/text
var text = $(this)
.val()
.trim();
// get the parent ul's id attribute
var status = $(this)
.closest(".list-group")
/*closest() method returns the first ancestor of the selected element
Ancesotr is a parent, grandparent, great-grandparent.
This method moves up the DOM tree to retrieve the most recently used ancestor of the element. */
.attr("id")
//attr() method sets or returns attributes and values of the selected elements.
.replace("list-", "");
// get the task's position in the list of other li elements
var index = $(this)
.closest(".list-group-item")
.index();

tasks[status][index].text = text;
saveTasks();

/* tasks is an object.
tasks [status] returns an array.
tasks[status][index] returns the object at the given index in the array.
tasks[status][index].text returns the text property of the object at the given index. */

// recreate p element
var taskP = $("<p>")
.addClass("m-1")
.text(text);
// m- sets the margin & m-1 sets the margin-left or padding-left.
//1- (by default) sets the margin or padding to $spacer * .25.
// $spacer * .25 sets the margin or padding to .25rem
// replace textarea with p element
$(this).replaceWith(taskP);

  });

// due date was clicked
// specifies what to do when the label element is clicked.
$(".list-group").on("click", "span", funciton() {
  // get current text
  var date = $(this)
  .text()
  .trim();
  // crate new input element
  var dateInput = $("<input>")
  .attr("type", "text")
  // sets what can be entered into the input field.
  .addClass("form-control")
  .val(date);

  // swap out elements
  $(this)replaceWith(dateInput);

  // automatically focus on new element
  dateInput.trigger("focus");
});

// value of the date was changed
$(".list-group").on("blur", "input[type='text']",function() {
// .on(events[,selector][,data], handler)
// blur event is sent to an element when it loses focus
// An element can lose focus via keyboard commands, such as the Tab key, or by mouse clicks elsewhere on the page.

// get current text
var date = $(this)
.val()
.trim();

// get the parent ul's id attribute
var status = $(this)
// $(this) refers to the element on which the event is called, which in this case is the <input> element.
.closest(".list-group")
.attr("id")
.replace("list-", "");

// get the task's position in the list of other li elements
var index = $(this)
.closest(".list-group item")
.index();

// update task in array and re-save to localStorage
tasks[status][index].date = date;
saveTasks();

// recreate span element with bootstrap classes
var taskSpan = $("<span>")
.addClass("badge badge-primary badge-pill")
.text(date);

// replace input with span element
$(this).replaceWith(taskSpan);
// $(this) refers to the element that it belongs to,  which in this case is input
// input element is being replaced with a span element.
// <span> is an inline container

});
/*on() method attaches one or more event handlers for the selected elements
and child elements. Attaches p elements to the <ul> element that has the list-group class.
this keyword is used to refer to the actual elements.*/
// text() method will get the inner text content of the current element <p> & represented by $(this).
// trim() method removes any extra white space before or after the element targeted by text().
// $("<textarea>") tells jQuery to create new <textarea> element.
// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


