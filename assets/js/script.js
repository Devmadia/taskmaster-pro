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

  // check due date
  auditTask(taskLi);

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
    
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// auditTasks starts here
var auditTask = function(taskEl) {
  // get date from task element
  var date = $(taskEl).find("span").text().trim();

  // convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);

  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");    // adds a red tint to the task background for events overdue
  }

  // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } 
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");       // adds a yellow tint to the task background
  }
  console.log(taskEl)
};

// event and callback function for edits
$(".list-group").on("click", "p", function() {
  var text = $(this).text().trim(); // grabs the inner text content of the current element represented by $(this)
  // $("textarea") tells jQuery to find all existing <textarea> elements
  var textInput = $("<textarea>")   // allows us to create a dynamic element: <textarea>
  $(this).replaceWith(textInput)    // swap out the existing <p> element with the new <textarea>
  textInput.trigger("focus")        // automatically highlight the input box
  .addClass("form-control")
  .val(text);
});

// blur event will trigger as soon as the user interacts with anything other than the <textarea> element
$(".list-group").on("blur", "textarea", function() {
  // get the textarea's current value/text
  var text = $(this)
  .val()
  .trim();
  
  // get the parent ul's id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")                       // .replace() chained to attr(), which is returning the ID; it'll be "list-" followed by category
  .replace("list-", "");            // JavaScript operator to find and replace text in a string

  // get the task's position in the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();

  // tasks[status] returns an array, e.g. "toDo"
  // task[status][index] returns the obj at a given index in array
  
  tasks[status][index].text = text; // tasks[status][index].text returns the text property of the object at the given index.
  saveTasks();

  // recreate p element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
});

// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this).text().trim();

  // create new input element
  var dateInput = $("<input>")
  // creating an <input> element and using jQuery's attr() method to set it as type="text"
  .attr("type", "text")                 // With two arguments, it sets an attribute (e.g., attr("type", "text")).
  .addClass("form-control")
  .val(date);

  // switch the elements
  $(this).replaceWith(dateInput);

  // automatically bring up the calendar
  dateInput.trigger("focus");

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // when calendar is closed, force a "change" event on the `dateInput`
      $(this).trigger("change");
    }
  });

 
});

// value of due date was changed
$(".list-group").on("change", "input[type='text']", function() {
  // get current text
  var date = $(this).val();

  // get the parent ul's id attribute
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this).closest(".list-group-item").index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);

  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});

// sortable widget feature start 
// jQuery selector to final all list-group elements then call a new jQuery UI method on them
$(".card .list-group").sortable({      // sortable() turned every element with the class list-group into a sortable list
  connectWith: $(".card .list-group"),  // connectWith property linked the sortable lists with any other list that have the same class
  scroll: false,
  tolerance: "pointer",
  helper: "clone",                     // tells jQuery to create a copy of the dragged element and move the copy instead of the original
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  },
  update: function(event) {            // updated to jQuery this by wrapping it in $() to use with future jQuery methods
    var tempArr = [];                  // combines console logging values into an object and pushes them into an array
    // loop over current set of children in sortable list
    $(this).children().each(function() {  //  use additional jQuery methods to strip out the task's description and due date
      var text = $(this)
        .find("p")
        .text()
        .trim();
    
      var date = $(this)
        .find("span")
        .text()
        .trim();
    
      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });
    // trim down list's ID to match object property
    var arrName = $(this)
    .attr("id")
    .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
    console.log(tempArr);
  }
});

// drag tasks to delete
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    console.log("drop");
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

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
    createTask(taskText, taskDate, "toDo"); // passing in the task's description, due date, and type hardcoded as "toDo"

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

// datepicker
$("#modalDueDate").datepicker({             // calendar appears when date field is clicked
  minDate: 1                                // prevents users from selecting due dates that have passed
});             

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

// timers
setInterval(function() {
  $(".card .list-group-item").each(function (el) {
    auditTask(el);
  });
  // code to execute
}, (1000 * 60) * 30);

