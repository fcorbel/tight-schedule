"use strict";

var dayHover = false;
var taskHover = false;
var taskDialogOpened = false;
var hourSelected = 0;
var minuteSelected = 0;
var durationSelected = 0;
var mouseDown = false;

function getOffset(el) {
  var _x = 0;
  var _y = 0;
  while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
      _x += el.offsetLeft - el.scrollLeft;
      _y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
  }
  return { top: _y, left: _x };
};

function getIndicatorPosition(hourLi, pointerPos) {
  var hourSize = parseInt(hourLi, 10) + 1;
  var hour_ = Math.floor(pointerPos / hourSize);
  var minutePixels = pointerPos - hour_ * hourSize;
  var intervalPixels = 5 * hourSize / 60;
  var min_ = Math.floor(minutePixels / intervalPixels) * 5;
  var pos_ = (hour_ * hourSize) + ((min_ / 5) * intervalPixels);

  return { position: pos_, hour: hour_, min: min_ };
}

function createTask(text, startH, startM, duration, hourLenth, type) {
  var queryString = "li[data-hour='" + startH + "']";
  var hourElement = document.querySelectorAll(queryString)[0];
  var delBtn = document.createElement("div");
  delBtn.setAttribute("class", "delTask");
  delBtn.innerHTML = "X";
  delBtn.onclick = function(e) {
    e.stopPropagation();
    this.parentNode.parentNode.removeChild(this.parentNode);
    taskHover = false;
  };
  var taskHtml = document.createElement("div");
  taskHtml.onmouseover = function() {
    taskHover = true;
  };
  taskHtml.onmouseout = function() {
    taskHover = false;
  };
  taskHtml.setAttribute("class", "task " + type);
  taskHtml.setAttribute("data-start", startM);
  taskHtml.setAttribute("data-duration", duration);
  taskHtml.setAttribute("data-start-time", startH + "h" + startM);
  var endTimeH = Math.floor((parseInt(startM, 10) + parseInt(duration, 10)) / 60) + parseInt(startH, 10);
  var endTimeM = (parseInt(startM, 10) + parseInt(duration, 10)) - ((endTimeH - startH) * 60);
  taskHtml.setAttribute("data-end-time", endTimeH + "h" + endTimeM);
  taskHtml.innerHTML = text;
  taskHtml.appendChild(delBtn);
  adjustTaskSize(taskHtml, hourLenth);
  hourElement.appendChild(taskHtml);
}

function adjustTaskSize(elem, hourLenth) {
    //set height of the task
    var duration = elem.getAttribute("data-duration");
    //to correct the border size
    var borders = Math.floor(duration / 60);
    var taskSize = (duration * hourLenth) / 60 + borders;
    taskSize += "px";
    elem.style.height = taskSize;
    elem.style.lineHeight = taskSize;
    //set start of the task
    var startMin = elem.getAttribute("data-start");
    var taskStart = (startMin * hourLenth) / 60;
    taskStart += "px";
    elem.style.top = taskStart;
}

function setDialDefault(text, startH, startM, duration) {
  document.getElementById("description").value = text;
  document.getElementById("hour").value = startH;
  document.getElementById("minute").value = startM;
  document.getElementById("duration").value = duration;
}

window.onload = function() {
  //check all tasks to set there lenth
  var anHour = document.getElementById("day").getElementsByTagName("li")[0];
  var hourLenth = window.getComputedStyle(anHour, null).getPropertyValue("height").slice(0, -2);
  //Create some default tasks
//  createTask("Do the laundry", 1, 0, 60, hourLenth, "workCol");
//  createTask("Feed the cat", 2, 30, 10, hourLenth, "workCol");
//  createTask("Do some exercice", 2, 40, 60, hourLenth, "healthCol");
//  createTask("Some programming", 4, 0, 60, hourLenth, "hobbyCol");
//  createTask("Read news on the internet", 5, 0, 30, hourLenth, "freeCol");

  var tasks = document.getElementsByClassName("task");
  for (var i=0; i<tasks.length; i++) {
    adjustTaskSize(tasks[i], hourLenth);
  }

  //Init interface buttons
  //TITLE
  var titleEl = document.getElementById("calTitle");
  titleEl.onclick = function() {
    //show edit and done button
    var editEl = document.getElementById("titleModif");
    var textBx = editEl.getElementsByTagName("input")[0];
    textBx.value = titleEl.innerHTML;
    editEl.style.display = "block";
    this.style.display = "none";
  };
  var changeTitleBtn = document.getElementById("changeTitle");
  changeTitleBtn.onclick = function() {
    var titleEl = document.getElementById("calTitle");
    var editEl = document.getElementById("titleModif");
    var textBx = editEl.getElementsByTagName("input")[0];
    titleEl.innerHTML = textBx.value;
    editEl.style.display = "none";
    titleEl.style.display = "block";
  };

  //TASKS
  //Setup tasks already in the document
  var delTaskBtns = document.getElementsByClassName("delTask");
  for (var i=0; i<delTaskBtns.length; i++) {
    delTaskBtns[i].onclick = function(e) {
      e.stopPropagation();
      this.parentNode.parentNode.removeChild(this.parentNode);
      taskHover = false;
    }
  }
  var tasks = document.getElementsByClassName("task");
  for (var i=0; i<tasks.length; i++) {
    tasks[i].onmouseover = function() {
      taskHover = true;
    };
    tasks[i].onmouseout = function() {
      taskHover = false;
    };
  }
  /*var hours = document.getElementById("day").getElementsByTagName("li");
  for (var i=0; i<hours.length; i++) {
    hours[i].onclick = function(e) {
      e.stopPropagation();
      alert("hour");
      var overlay = document.getElementById("overlay");
      overlay.style.visibility = "visible";
      setDialDefault("your task", hourSelected, minuteSelected, durationSelected);
    };
  }*/

  var day = document.getElementById("day");
  var indicatorLine = document.getElementById("indicatorLine")
  if (!indicatorLine) {
    var indicatorLine = document.createElement("div");
    indicatorLine.id = "indicatorLine";
    indicatorLine.setAttribute("data-time", "0:00");
    indicatorLine.setAttribute("data-timeEnd", "0:00");
    day.appendChild(indicatorLine);
  }
  day.onmouseover = function() {
    dayHover = true;
  };
  day.onmouseout = function() {
    dayHover = false;
  };
  window.onmousemove = function(e) {
    if (dayHover && !mouseDown) {
      var yPos = e.pageY;
      var yDay = getOffset(day).top;
      var currentPos = yPos - yDay;
      var results = getIndicatorPosition(hourLenth, currentPos);
      indicatorLine.style.top = results.position + "px";
      indicatorLine.setAttribute("data-time", results.hour + ":" + results.min);
      hourSelected = results.hour;
      minuteSelected = results.min;
    } else if (dayHover && mouseDown) {
      //It's a mouse drag
      var yPos = e.pageY;
      var yDay = getOffset(day).top;
      var currentPos = yPos - yDay;
      var results = getIndicatorPosition(hourLenth, currentPos);
      var startPos = parseInt(indicatorLine.style.top.slice(0, -2), 10);
      var endPos = results.position - startPos;
      if (endPos<0) {
        endPos = 0;
      }
      indicatorLine.style.height = endPos + "px";
      indicatorLine.setAttribute("data-timeEnd", results.hour + ":" + results.min);
      durationSelected = (results.hour * 60 + results.min) - (hourSelected * 60 + minuteSelected);
      if (durationSelected<0) {
        durationSelected = 0;
      }
    }
  };
  document.onmousedown = function() {
    mouseDown = true;
  };
  document.onmouseup = function() {
    mouseDown = false;
    if (dayHover && !taskHover && !taskDialogOpened) {
      //show new task dialogue
      var overlay = document.getElementById("overlay");
      overlay.style.visibility = "visible";
      taskDialogOpened = true;
      setDialDefault("your task", hourSelected, minuteSelected, durationSelected);
      document.getElementById("addNewTask").focus();
      
    }
    //reset end of indicator line
    indicatorLine.style.height = "1px";
    durationSelected = 0;
  };

  //CREATE TASK DIALOGUE
  var showDialBtn = document.getElementById("showDialBtn");
  showDialBtn.onclick = function() {
    var overlay = document.getElementById("overlay");
    overlay.style.visibility = "visible";
    taskDialogOpened = true;
    setDialDefault("your task", 0, 0, 60);
  };
  var taskTypeSel = document.getElementById("taskType");
  if (!taskTypeSel.value) {
    var colorList = document.getElementById("colorPalette").getElementsByTagName("li");
    for (var i=0; i<colorList.length; i++) {
      var name = colorList[i].getElementsByTagName("span")[0].innerHTML;
      var classNames = colorList[i].getElementsByTagName("div")[0].className;
      var value = classNames.split(" ")[1];
      var typeOption = document.createElement("option");
      typeOption.setAttribute("value", value);
      typeOption.innerHTML = name;
      taskTypeSel.appendChild(typeOption);
    }
  }
  var hideDialBtn = document.getElementById("cancel");
  hideDialBtn.onclick = function() {
    var overlay = document.getElementById("overlay");
    overlay.style.visibility = "hidden";
    taskDialogOpened = false;
  };
  var addBtn = document.getElementById("addNewTask");
  addBtn.onclick = function() {
    var text = document.getElementById("description").value;
    var startH = document.getElementById("hour").value;
    var startM = document.getElementById("minute").value;
    var duration = document.getElementById("duration").value;
    var type = document.getElementById("taskType").value;
    if (duration > 0 && text != "") {
      createTask(text, startH, startM, duration, hourLenth, type);
      var overlay = document.getElementById("overlay");
      overlay.style.visibility = "hidden";
      taskDialogOpened = false;
    } else {
      alert("New task unvalid");
    }
  };
}


