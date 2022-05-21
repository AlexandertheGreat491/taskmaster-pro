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
  auditTask(taskLi);

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
  // get date from task element
  var date = $(taskEl)
    .find("span")
    .text()
    .trim();

  // convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);
  // moment(date, "L") configures the Moment object to have the date be in month numeral, day of month, year format.
  // this should print out an object for the value value of the date variable, but at 5:00pm of that date.
  // .set("hour", 17) method changes the time to 5pm instead of 12am. 17=5pm, 24-hour time.

  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};
//moment().isAfter(time) is a query method that means true or false checks on the date can be performed to get more information.
// .isAfter() checks is that the moment() value comes later than the value of the time variable.
// .diff() compares two times
// .abs() JavaScript Math object returns the absolute value of a number as long as it's greater than or equal to 2 days.


// enable draggable/sortable feature on list-group elements
$(".card .list-group").sortable({
  // enable dragging across lists
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function (event, ui) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function (event, ui) {
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },
  over: function (event) {
    $(event.target).addClass("dropover-active");
  },
  out: function (event) {
    $(event.target).removeClass("dropover-active");
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
    // remove() method removes the dragged element from the dom.
    ui.draggable.remove();
    $(".bottom-trash").removeClass("bottom-trash-active");
  },
  over: function (event, ui) {
    console.log(ui);
    $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function (event, ui) {
    $(".bottom-trash").removeClass("bottom-trash-active");
  }
});
// jQuery's each() method will run a callback function for every item/element in the array.
// $(this) refers to the <li> element.
// sortable() turned every element with the class list-group in a sortable list
/*connectWith is a selector of other sortable elements that the items from this list should be connected to.
connectWith  linked these sortable lists with any other lists that have the same class.*/

// convert text field into a jquery date picker
$("#modalDueDate").datepicker({
  // force user to select a future date
  minDate: 1
});
// Selects a date from a popup or inline calendar.
// Targets the second <label> element with the "Due Date" text.
// The minDate option is the minimum selectable date and the 1 value sets that to be one day from today.
// The minimum date is now one day from today.

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-save").click(function () {
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
$(".list-group").on("click", "p", function () {
  // get current text of p element
  var text = $(this)
    .text()
    .trim();

  // replace p element with a new textarea
  var textInput = $("<textarea>").addClass("form-control").val(text);
  $(this).replaceWith(textInput);

  // auto focus new element
  textInput.trigger("focus");
});

// editable field was un-focused
$(".list-group").on("blur", "textarea", function () {
  // get current value of textarea
  var text = $(this).val();

  // get status type and position in the list
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].text = text;
  saveTasks();

  // recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace textarea with new content
  $(this).replaceWith(taskP);
});

// due date was clicked
$(".list-group").on("click", "span", function () {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  $(this).replaceWith(dateInput);

  // enable jquery ui date picker
  dateInput.datepicker({
    minDate: 1,
    onClose: function () {
      // when calendar is closed, force a "change" event
      $(this).trigger("change");
    }
  });
// created datepicker functionality every time a user clicks on the due date for a task.
  // datepicker needed to be in this event listener so that the datepicker would run everytime a clicks on the due date.
  // Also the datepicker is here because of the fact that the <input> element was created in js not in html.
  // automatically bring up the calendar
  dateInput.trigger("focus");
});

// value of due date was changed
// due date change event handler
$(".list-group").on("change", "input[type='text']", function () {
  var date = $(this).val();

  // get status type and position in the list
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span and insert in place of input element
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  $(this).replaceWith(taskSpan);
  auditTask($(taskSpan).closest(".list-group-item"));
  // $(this) refers to the element that it belongs to,  which in this case is input
  // input element is being replaced with a span element.
  // <span> is an inline container
});

/*on() method attaches one or more event handlers for the selected elements
and child elements. Attaches p elements to the <ul> element that has the list-group class.
this keyword is used to refer to the actual elements.*/
// text() method will get the inner text content of the current element <p> & represented by $(this).
// trim() method removes any extra white space before or after the element targeted by text().
// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  console.log(tasks);
  saveTasks();
});

// load tasks for the first time
loadTasks();

// audit task due dates every 30 minutes
setInterval(function () {
  $(".card .list-group-item").each(function () {
    auditTask($(this));
  });
}, 1800000);

// jQuery selector passes each element it finds using the selector into the callback function.
// That element is expressed in the el argument of the function.
// In this interval a loop occurs over every task on the page with a class of list-group-item.
// Then the auditTask() function is executed to check the due date for each one.
