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


