var tasks = {};

var createTask = function (taskText, taskDate, taskList) {
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

  // check due date
  audtiTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
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
  $.each(tasks, function (list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

var auditTask = function (taskEl) {

  // to ensure element is getting to the function
  // console.log(taskEl);
  // get date from task element

  var date = $(taskEl).find("span").text().trim();

  // date variable created from taskEl to make a new Moment object
  // ensure that it worked

  //console.log(date);

  // convert to moment object at 5:00pm

  var time = moment(date, "L").set("hour", 17);

  // moment(date, "L") configures the Moment object for the user's local time.
  // this should print out an object for the value value of the date variable, but at 5:00pm of that date.
  // .set("hour", 17) method changes the time to 5pm instead of 12am. 17=5pm, 24-hour time.
  //console.log(time);

  // remove old classes from element

  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date

  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
//moment().isAfter(time) is a query method that means true or false checks on the date can be performed to get more information.
// .isAfter() checks is that the moment() value comes later than the value of the time variable.

// apply new class if task is near/over due date
if (moment().isAfter(time)) {
  $(taskEl).addClass("list-group-item-danger");
}
else if (Math.abs(moment().diff(time, "days")) <= 2) {
  $(taskEl).addClass("list-group-item-warning");
}
};
// .diff() compares two times
// .abs() JavaScript Math object returns the absolute value of a number as long as it's greater than or equal to 2 days.
// enable draggable/sortable feature on list-group elements.

$(".card .list-group").sortable({
  // enable dragging across lists
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function (event, ui) {
    console.log(ui);
  },
  deactivate: function (event, ui) {
    console.log(ui);
  },
  over: function (event) {
    console.log(event);
  },
  out: function (event) {
    console.log(event);
  },
  update: function () {
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this)
      .children()
      .each(function () {
        // save values in temp array
        tempArr.push({
          text: $(this)
            .find("p")
            .text()
            .trim(),
          date: $(this)
            .find("span")
            .text()
            .trim()
        });
      });

    // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  },
  stop: function (event) {
    $(this).removeClass("dropover");
  }
});

// trash icon can be dropped onto
// droppable creates targets for draggable elements.
$("#trash").droppable({
  accept: ".card .list-group-item",
  // Controls which draggable elements are accepted by the droppable.
  tolerance: "touch",
  // Specifies which mode to use for testing whether a draggable is hovering over a droppable.
  // "touch" value used when the draggable overlaps the droppable any amount.
  drop: function (event, ui) {
    // Triggered when an accepted draggable is dropped on the droppable.
    //console.log("drop");
    ui.draggable.remove();
    // remove dragged element from the dom.
    // remove() method removes the element entirely from the DOM.
  },
  over: function (event, ui) {
    console.log(ui);
  },
  out: function (event, ui) {
    console.log(ui);
  }
});

// jQuery's each() method will run a callback function for every item/element in the array.
// $(this) refers to the <li> element.
// sortable() turned every element with the class list-group in a sortable list
/*connectWith is a selector of other sortable elements that the items from this list should be connected to.
connectWith  linked these sortable lists with any other lists that have the same class.*/

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").trigger("focus");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// Selects a date from a popup or inline calendar.
// Targets the second <label> element with the "Due Date" text.
$("modalDueDate").datepicker({
  minDate: 1
});
// The minDate option is the minimum selectable date and the 1 value sets that to be one day from today.
// The minimum date is now one day from today.
// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
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
// task text was clicked
// This event listener is for the <textarea> element.
$(".list-group").on("click", "p", function () {
  // get current text p element
  var text = $(this)
    .text()
    .trim();
  // replace p element with a new textarea
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);

  $(this).replaceWith(textInput);
  // $(this)=<p> element & replaceWith replaces <p> with <textarea> element.
  // Now $(this)=<textarea> element.
  // auto foucs new element
  textInput.trigger("focus");
});
// editable field was un-focused
$(".list-group").on("blur", "text-area", function () {
  // Blur event happens when an element has lost focus & this is an event listener for that situation.
  // get the textarea's current value/text
  var text = $(this).val();

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
  // update task in array and re-save to localstroage.
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
// This event listener is for the <input> element.
$(".list-group").on("click", "span", function () {
  // get current text
  var date = $(this).text().trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  $(this).replaceWith(dateInput);
  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1
  })
  // created datepicker functionality every time a user clicks on the due date for a task.
  // datepicker needed to be in this event listener so that the datepicker would run everytime a clicks on the due date.
  // Also the datepicker is here because of the fact that the <input> element was created in js not in html.
  // automatically bring up the calendar
  dateInput.trigger("focus");
});

// value of the date was changed
// due date change even handler

$(".list-group").on("blur", "input[type='text']", function () {
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
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


