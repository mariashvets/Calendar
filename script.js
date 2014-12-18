var config = {
    firstDayMonday: true
}

var defaultDate = {
    month: new Date().getMonth(),
    year: new Date().getFullYear()
}

var weekday = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
var months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];


var events = JSON.parse(localStorage.getItem('events')) || {};

window.onload = function() {
    renderCurrentCalendarPage(defaultDate);
    addListeners();
}

function renderCurrentCalendarPage(currentDate) {
    document.getElementById("month").textContent = months[currentDate.month];
    document.getElementById("year").textContent = currentDate.year;

    var blocks = document.getElementsByClassName("block-date");
    removeElements(blocks);
    var daysAmount = daysInMonth(currentDate.month, currentDate.year);

    var firstMonthDayDate = new Date(currentDate.year, currentDate.month, 1);
    var firstMonthDayNumber = firstMonthDayDate.getDay();

    var firstWeekDayDate = new Date(firstMonthDayDate.valueOf());
    firstWeekDayDate.setDate(firstMonthDayDate.getDate() - firstMonthDayNumber + (config.firstDayMonday ? 1 : 0));
    var i = 0;
    var date = firstWeekDayDate;
    var firstSundayRendered = false;
    while (true) {
        renderDay(date, currentDate.month, currentDate.year,firstSundayRendered);
        if (date.getDay() === (config.firstDayMonday ? 0 : 6)) {
            if (!isInsideMonth(date, currentDate.month) || date.getDate() === daysAmount) {
                break;
            }
        }
        if(date.getDay() === (config.firstDayMonday ? 0 : 1) && isInsideMonth(date, currentDate.month)){
            firstSundayRendered = true;
        }
        date.setDate(date.getDate() + 1);
        i++;
    }
}

function renderDay(date, currentMonth, currentYear, firstSundayRendered) {
    var fullDate = currentYear + "." + date.getMonth() + "." + date.getDate();

    var className = "block-date";
    if (date.toDateString() === (new Date()).toDateString()) {
        className += " today";
    }

    var day_block_el = createElement("div", className);
    day_block_el.setAttribute("date", fullDate);
    day_block_el.addEventListener("click", openPopup);
    if (!isInsideMonth(date, currentMonth)) {
        day_block_el.className += " outer";
    }
    var day_el = createElement("div", "day");
    if(!firstSundayRendered){
        var week_day_el = createElement("span", "week-day", weekday[date.getDay()] + ", ");
    }
    else {
        week_day_el = createElement("span", "week-day");
    }
    var date_el = createElement("span", "date", date.getDate());
    day_el.appendChild(week_day_el).appendChild(date_el);
    day_block_el.appendChild(day_el);

    renderEvents(fullDate, day_block_el);
    document.getElementById("calendar").appendChild(day_block_el);
}

function renderEvents(date, el) {
    for (var eventDate in events) {
        if (eventDate === date) {
            for (var j = 0; j < events[eventDate].length; j++) {
                renderEvent(events[eventDate][j], el);
            }
        }
    }
}

function renderEvent(event, el) {
    el.className += " filled";
    var task = createElement("div", "task");
    var title = createElement("h4", "title", event.title);
    title.setAttribute("date", el.getAttribute("date"));
    // TODO: Add function for editing event.
//    title.addEventListener("click", openPopup);
    var participants = createElement("ul", "participants");
    for (var i = 0; i < event.participants.length; i++) {
        var content = event.participants[i] + ", ";
        if (i === event.participants.length - 1) {
            content = event.participants[i];
        }
        var participant = createElement("li", null, content);
        participants.appendChild(participant);
    }
    task.appendChild(title);
    task.appendChild(participants);
    el.appendChild(task);
}


function daysInMonth(month, year) {
    return (new Date(year, month + 1, 0).getDate());
}

function isInsideMonth(date, currentMonth) {
    return  date.getMonth() === currentMonth;
}

function addListeners() {
    document.getElementById("next").addEventListener("click", chooseNextMonth);
    document.getElementById("prev").addEventListener("click", choosePrevMonth);
    document.getElementById("show-today").addEventListener("click", showToday);
    document.getElementById("popup-form").addEventListener("submit", saveEventData);
    document.getElementById("close").addEventListener("click", closePopup);
}

function chooseNextMonth() {
    if (defaultDate.month !== 11) {
        defaultDate.month = defaultDate.month + 1;
    }
    else {
        defaultDate.month = 0;
        defaultDate.year = defaultDate.year + 1;
    }
    closePopup();
    renderCurrentCalendarPage(defaultDate);
}

function choosePrevMonth() {
    if (defaultDate.month !== 0) {
        defaultDate.month = defaultDate.month - 1;
    }
    else {
        defaultDate.month = 11;
        defaultDate.year = defaultDate.year - 1;
    }
    closePopup();
    renderCurrentCalendarPage(defaultDate);
}

function showToday() {
    var today = new Date();
    defaultDate = {month: today.getMonth(), year: today.getFullYear()};
    closePopup();
    renderCurrentCalendarPage(defaultDate);
}

function openPopup(e) {
    var coords = e.target.getBoundingClientRect();
    var currentBlockWidth = e.target.offsetWidth;
    var arrowSize = 12;
    var left = coords.left + currentBlockWidth + arrowSize + window.scrollX;
    var top = coords.top - arrowSize + window.scrollY;

    closePopup();

    e.target.className += ' active';
    document.getElementById("popup-form").reset();
    var cssString = "top:" + top + "px; left:" + left + "px; display:block;";
    document.getElementById("popup").style.cssText = cssString;
    document.getElementById("popup").setAttribute("date", e.target.getAttribute("date"));
    document.getElementById("popup").currentDay = e.target;
    e.stopPropagation();
}

function closePopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "none";
    if (popup.currentDay != undefined) {
        popup.currentDay.className = popup.currentDay.className.replace("active", "");
    }
}

function saveEventData(e) {
    var name = document.getElementById("event-name").value;
    var date = document.getElementById("date").value;
    var participants = document.getElementById("participants").value;
    var description = document.getElementById("description").value;
    // TODO: Figure out how the date field of the pop-up form should affect the result date.
    var dateOfCalendarDay = document.getElementById("popup").getAttribute("date");
    if (name !== "" || participants !== "" || date !== "" || description !== "") {
        var newEvent = {"title": name, "description": description, "date": dateOfCalendarDay, "participants": participants.split(" ")};
        addEvent(newEvent);
        var currentEl = document.getElementById("popup").currentDay;
        renderEvent(newEvent, currentEl);
    }
    document.getElementById("popup").style.display = "none";
    e.preventDefault();
}

function addEvent(event) {
    events[event.date] = events[event] || [];
    events[event.date].push(event);
    localStorage.setItem('events', JSON.stringify(events));
}

function createElement(el, className, content) {
    var element = document.createElement(el);
    if (className) {
        element.className = className;
    }
    if (content) {
        element.textContent = content;
    }
    return element;
}

function removeElements(elements) {
    while (elements.length > 0) {
        for (var k = 0; k < elements.length; k++) {
            document.getElementById("calendar").removeChild(elements[k]);
        }
    }
}
