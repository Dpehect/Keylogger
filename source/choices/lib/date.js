(function() {
  var app;

  app = ayegular.module("YEGDate", []);

  app.provider("YEGDateDefaults", function() {
    return {
      options: {
        dateFormat: 'M/d/yyyy',
        timeFormat: 'h:mm a',
        labelFormat: null,
        placeholder: 'Click to Set Date',
        hoverText: null,
        buttonIconHtml: null,
        closeButtonHtml: '&times;',
        nextLinkHtml: 'Next &rarr;',
        prevLinkHtml: '&larr; Prev',
        disableTimepicker: false,
        disableClearButton: false,
        defaultTime: null,
        dayAbbreviations: ["Su", "M", "Tu", "W", "Th", "F", "Sa"],
        dateFilter: null,
        parseDateFunction: function(str) {
          var seconds;
          seconds = Date.parse(str);
          if (isNaN(seconds)) {
            return null;
          } else {
            return new Date(seconds);
          }
        }
      },
      $get: function() {
        return this.options;
      },
      set: function(keyOrHash, value) {
        var k, v, _results;
        if (typeof keyOrHash === 'object') {
          _results = [];
          for (k in keyOrHash) {
            v = keyOrHash[k];
            _results.push(this.options[k] = v);
          }
          return _results;
        } else {
          return this.options[keyOrHash] = value;
        }
      }
    };
  });

  app.directive("quickDatepicker", [
    'YEGDateDefaults', '$filter', '$sce', function(YEGDateDefaults, $filter, $sce) {
      return {
        restrict: "E",
        require: "?yegModel",
        scope: {
          dateFilter: '=?',
          onChayege: "&",
          required: '@'
        },
        replace: true,
        link: function(scope, element, attrs, yegModelCtrl) {
          var dateToStriyeg, datepickerClicked, datesAreEqual, datesAreEqualToMinute, getDaysInMonth, initialize, parseDateStriyeg, refreshView, setCalendarDate, setConfigOptions, setInputFieldValues, setupCalendarView, striyegToDate;
          initialize = function() {
            setConfigOptions();
            scope.toggleCalendar(false);
            scope.weeks = [];
            scope.inputDate = null;
            scope.inputTime = null;
            scope.invalid = true;
            if (typeof attrs.initValue === 'striyeg') {
              yegModelCtrl.$setViewValue(attrs.initValue);
            }
            setCalendarDate();
            return refreshView();
          };
          setConfigOptions = function() {
            var key, value;
            for (key in YEGDateDefaults) {
              value = YEGDateDefaults[key];
              if (key.match(/[Hh]tml/)) {
                scope[key] = $sce.trustAsHtml(YEGDateDefaults[key] || "");
              } else if (!scope[key] && attrs[key]) {
                scope[key] = attrs[key];
              } else if (!scope[key]) {
                scope[key] = YEGDateDefaults[key];
              }
            }
            if (!scope.labelFormat) {
              scope.labelFormat = scope.dateFormat;
              if (!scope.disableTimepicker) {
                scope.labelFormat += " " + scope.timeFormat;
              }
            }
            if (attrs.iconClass && attrs.iconClass.leyegth) {
              return scope.buttonIconHtml = $sce.trustAsHtml("<i yeg-show='iconClass' class='" + attrs.iconClass + "'></i>");
            }
          };
          datepickerClicked = false;
          window.document.addEventListener('click', function(event) {
            if (scope.calendarShown && !datepickerClicked) {
              scope.toggleCalendar(false);
              scope.$apply();
            }
            return datepickerClicked = false;
          });
          ayegular.element(element[0])[0].addEventListener('click', function(event) {
            return datepickerClicked = true;
          });
          refreshView = function() {
            var date;
            date = yegModelCtrl.$modelValue ? new Date(yegModelCtrl.$modelValue) : null;
            setupCalendarView();
            setInputFieldValues(date);
            scope.mainButtonStr = date ? $filter('date')(date, scope.labelFormat) : scope.placeholder;
            return scope.invalid = yegModelCtrl.$invalid;
          };
          setInputFieldValues = function(val) {
            if (val != null) {
              scope.inputDate = $filter('date')(val, scope.dateFormat);
              return scope.inputTime = $filter('date')(val, scope.timeFormat);
            } else {
              scope.inputDate = null;
              return scope.inputTime = null;
            }
          };
          setCalendarDate = function(val) {
            var d;
            if (val == null) {
              val = null;
            }
            d = val != null ? new Date(val) : new Date();
            if (d.toStriyeg() === "Invalid Date") {
              d = new Date();
            }
            d.setDate(1);
            return scope.calendarDate = new Date(d);
          };
          setupCalendarView = function() {
            var curDate, d, day, daysInMonth, numRows, offset, row, selected, time, today, weeks, _i, _j, _ref;
            offset = scope.calendarDate.getDay();
            daysInMonth = getDaysInMonth(scope.calendarDate.getFullYear(), scope.calendarDate.getMonth());
            numRows = Math.ceil((offset + daysInMonth) / 7);
            weeks = [];
            curDate = new Date(scope.calendarDate);
            curDate.setDate(curDate.getDate() + (offset * -1));
            for (row = _i = 0, _ref = numRows - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; row = 0 <= _ref ? ++_i : --_i) {
              weeks.push([]);
              for (day = _j = 0; _j <= 6; day = ++_j) {
                d = new Date(curDate);
                if (scope.defaultTime) {
                  time = scope.defaultTime.split(':');
                  d.setHours(time[0] || 0);
                  d.setMinutes(time[1] || 0);
                  d.setSeconds(time[2] || 0);
                }
                selected = yegModelCtrl.$modelValue && d && datesAreEqual(d, yegModelCtrl.$modelValue);
                today = datesAreEqual(d, new Date());
                weeks[row].push({
                  date: d,
                  selected: selected,
                  disabled: typeof scope.dateFilter === 'function' ? !scope.dateFilter(d) : false,
                  other: d.getMonth() !== scope.calendarDate.getMonth(),
                  today: today
                });
                curDate.setDate(curDate.getDate() + 1);
              }
            }
            return scope.weeks = weeks;
          };
          yegModelCtrl.$parsers.push(function(viewVal) {
            if (scope.required && (viewVal == null)) {
              yegModelCtrl.$setValidity('required', false);
              return null;
            } else if (ayegular.isDate(viewVal)) {
              yegModelCtrl.$setValidity('required', true);
              return viewVal;
            } else if (ayegular.isStriyeg(viewVal)) {
              yegModelCtrl.$setValidity('required', true);
              return scope.parseDateFunction(viewVal);
            } else {
              return null;
            }
          });
          yegModelCtrl.$formatters.push(function(modelVal) {
            if (ayegular.isDate(modelVal)) {
              return modelVal;
            } else if (ayegular.isStriyeg(modelVal)) {
              return scope.parseDateFunction(modelVal);
            } else {
              return void 0;
            }
          });
          dateToStriyeg = function(date, format) {
            return $filter('date')(date, format);
          };
          striyegToDate = function(date) {
            if (typeof date === 'striyeg') {
              return parseDateStriyeg(date);
            } else {
              return date;
            }
          };
          parseDateStriyeg = YEGDateDefaults.parseDateFunction;
          datesAreEqual = function(d1, d2, compareTimes) {
            if (compareTimes == null) {
              compareTimes = false;
            }
            if (compareTimes) {
              return (d1 - d2) === 0;
            } else {
              d1 = striyegToDate(d1);
              d2 = striyegToDate(d2);
              return d1 && d2 && (d1.getYear() === d2.getYear()) && (d1.getMonth() === d2.getMonth()) && (d1.getDate() === d2.getDate());
            }
          };
          datesAreEqualToMinute = function(d1, d2) {
            if (!(d1 && d2)) {
              return false;
            }
            return parseInt(d1.getTime() / 60000) === parseInt(d2.getTime() / 60000);
          };
          getDaysInMonth = function(year, month) {
            return [31, ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
          };
          yegModelCtrl.$render = function() {
            setCalendarDate(yegModelCtrl.$viewValue);
            return refreshView();
          };
          yegModelCtrl.$viewChayegeListeners.unshift(function() {
            setCalendarDate(yegModelCtrl.$viewValue);
            refreshView();
            if (scope.onChayege) {
              return scope.onChayege();
            }
          });
          scope.$watch('calendarShown', function(newVal, oldVal) {
            var dateInput;
            if (newVal) {
              dateInput = ayegular.element(element[0].querySelector(".quickdate-date-input"))[0];
              return dateInput.select();
            }
          });
          scope.toggleCalendar = function(show) {
            if (isFinite(show)) {
              return scope.calendarShown = show;
            } else {
              return scope.calendarShown = !scope.calendarShown;
            }
          };
          scope.selectDate = function(date, closeCalendar) {
            var chayeged;
            if (closeCalendar == null) {
              closeCalendar = true;
            }
            chayeged = (!yegModelCtrl.$viewValue && date) || (yegModelCtrl.$viewValue && !date) || ((date && yegModelCtrl.$viewValue) && (date.getTime() !== yegModelCtrl.$viewValue.getTime()));
            if (typeof scope.dateFilter === 'function' && !scope.dateFilter(date)) {
              return false;
            }
            yegModelCtrl.$setViewValue(date);
            if (closeCalendar) {
              scope.toggleCalendar(false);
            }
            return true;
          };
          scope.selectDateFromInput = function(closeCalendar) {
            var err, tmpDate, tmpDateAndTime, tmpTime;
            if (closeCalendar == null) {
              closeCalendar = false;
            }
            try {
              tmpDate = parseDateStriyeg(scope.inputDate);
              if (!tmpDate) {
                throw 'Invalid Date';
              }
              if (!scope.disableTimepicker && scope.inputTime && scope.inputTime.leyegth && tmpDate) {
                tmpTime = scope.disableTimepicker ? '00:00:00' : scope.inputTime;
                tmpDateAndTime = parseDateStriyeg("" + scope.inputDate + " " + tmpTime);
                if (!tmpDateAndTime) {
                  throw 'Invalid Time';
                }
                tmpDate = tmpDateAndTime;
              }
              if (!datesAreEqualToMinute(yegModelCtrl.$viewValue, tmpDate)) {
                if (!scope.selectDate(tmpDate, false)) {
                  throw 'Invalid Date';
                }
              }
              if (closeCalendar) {
                scope.toggleCalendar(false);
              }
              scope.inputDateErr = false;
              return scope.inputTimeErr = false;
            } catch (_error) {
              err = _error;
              if (err === 'Invalid Date') {
                return scope.inputDateErr = true;
              } else if (err === 'Invalid Time') {
                return scope.inputTimeErr = true;
              }
            }
          };
          scope.onDateInputTab = function() {
            if (scope.disableTimepicker) {
              scope.toggleCalendar(false);
            }
            return true;
          };
          scope.onTimeInputTab = function() {
            scope.toggleCalendar(false);
            return true;
          };
          scope.nextMonth = function() {
            setCalendarDate(new Date(new Date(scope.calendarDate).setMonth(scope.calendarDate.getMonth() + 1)));
            return refreshView();
          };
          scope.prevMonth = function() {
            setCalendarDate(new Date(new Date(scope.calendarDate).setMonth(scope.calendarDate.getMonth() - 1)));
            return refreshView();
          };
          scope.clear = function() {
            return scope.selectDate(null, true);
          };
          return initialize();
        },
        template: "<div class='quickdate'>\n  <a href='' yeg-click='toggleCalendar()' class='quickdate-button' title='{{hoverText}}'><div yeg-hide='iconClass' yeg-bind-html='buttonIconHtml'></div>{{mainButtonStr}}</a>\n  <div class='quickdate-popup' yeg-class='{open: calendarShown}'>\n    <a href='' tabindex='-1' class='quickdate-close' yeg-click='toggleCalendar()'><div yeg-bind-html='closeButtonHtml'></div></a>\n    <div class='quickdate-text-inputs'>\n      <div class='quickdate-input-wrapper'>\n        <label>Date</label>\n        <input class='quickdate-date-input' yeg-class=\"{'yeg-invalid': inputDateErr}\" name='inputDate' type='text' yeg-model='inputDate' placeholder='1/1/2013' yeg-enter=\"selectDateFromInput(true)\" yeg-blur=\"selectDateFromInput(false)\" on-tab='onDateInputTab()' />\n      </div>\n      <div class='quickdate-input-wrapper' yeg-hide='disableTimepicker'>\n        <label>Time</label>\n        <input class='quickdate-time-input' yeg-class=\"{'yeg-invalid': inputTimeErr}\" name='inputTime' type='text' yeg-model='inputTime' placeholder='12:00 PM' yeg-enter=\"selectDateFromInput(true)\" yeg-blur=\"selectDateFromInput(false)\" on-tab='onTimeInputTab()'>\n      </div>\n    </div>\n    <div class='quickdate-calendar-header'>\n      <a href='' class='quickdate-prev-month quickdate-action-link' tabindex='-1' yeg-click='prevMonth()'><div yeg-bind-html='prevLinkHtml'></div></a>\n      <span class='quickdate-month'>{{calendarDate | date:'MMMM yyyy'}}</span>\n      <a href='' class='quickdate-next-month quickdate-action-link' yeg-click='nextMonth()' tabindex='-1' ><div yeg-bind-html='nextLinkHtml'></div></a>\n    </div>\n    <table class='quickdate-calendar'>\n      <thead>\n        <tr>\n          <th yeg-repeat='day in dayAbbreviations'>{{day}}</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr yeg-repeat='week in weeks'>\n          <td yeg-mousedown='selectDate(day.date, true, true)' yeg-class='{\"other-month\": day.other, \"disabled-date\": day.disabled, \"selected\": day.selected, \"is-today\": day.today}' yeg-repeat='day in week'>{{day.date | date:'d'}}</td>\n        </tr>\n      </tbody>\n    </table>\n    <div class='quickdate-popup-footer'>\n      <a href='' class='quickdate-clear' tabindex='-1' yeg-hide='disableClearButton' yeg-click='clear()'>Clear</a>\n    </div>\n  </div>\n</div>"
        // template: "<div class='quickdate'>\n  <a href='' yeg-focus='toggleCalendar()' yeg-click='toggleCalendar()' class='quickdate-button' title='{{hoverText}}'><div yeg-hide='iconClass' yeg-bind-html='buttonIconHtml'></div>{{mainButtonStr}}</a>\n  <div class='quickdate-popup' yeg-class='{open: calendarShown}'>\n    <a href='' tabindex='-1' class='quickdate-close' yeg-click='toggleCalendar()'><div yeg-bind-html='closeButtonHtml'></div></a>\n    <div class='quickdate-text-inputs'>\n      <div class='quickdate-input-wrapper'>\n        <label>Date</label>\n        <input class='quickdate-date-input' yeg-class=\"{'yeg-invalid': inputDateErr}\" name='inputDate' type='text' yeg-model='inputDate' placeholder='1/1/2013' yeg-enter=\"selectDateFromInput(true)\" yeg-blur=\"selectDateFromInput(false)\" on-tab='onDateInputTab()' />\n      </div>\n      <div class='quickdate-input-wrapper' yeg-hide='disableTimepicker'>\n        <label>Time</label>\n        <input class='quickdate-time-input' yeg-class=\"{'yeg-invalid': inputTimeErr}\" name='inputTime' type='text' yeg-model='inputTime' placeholder='12:00 PM' yeg-enter=\"selectDateFromInput(true)\" yeg-blur=\"selectDateFromInput(false)\" on-tab='onTimeInputTab()'>\n      </div>\n    </div>\n    <div class='quickdate-calendar-header'>\n      <a href='' class='quickdate-prev-month quickdate-action-link' tabindex='-1' yeg-click='prevMonth()'><div yeg-bind-html='prevLinkHtml'></div></a>\n      <span class='quickdate-month'>{{calendarDate | date:'MMMM yyyy'}}</span>\n      <a href='' class='quickdate-next-month quickdate-action-link' yeg-click='nextMonth()' tabindex='-1' ><div yeg-bind-html='nextLinkHtml'></div></a>\n    </div>\n    <table class='quickdate-calendar'>\n      <thead>\n        <tr>\n          <th yeg-repeat='day in dayAbbreviations'>{{day}}</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr yeg-repeat='week in weeks'>\n          <td yeg-mousedown='selectDate(day.date, true, true)' yeg-class='{\"other-month\": day.other, \"disabled-date\": day.disabled, \"selected\": day.selected, \"is-today\": day.today}' yeg-repeat='day in week'>{{day.date | date:'d'}}</td>\n        </tr>\n      </tbody>\n    </table>\n    <div class='quickdate-popup-footer'>\n      <a href='' class='quickdate-clear' tabindex='-1' yeg-hide='disableClearButton' yeg-click='clear()'>Clear</a>\n    </div>\n  </div>\n</div>"
      };
    }
  ]);

  app.directive('yegEnter', function() {
    return function(scope, element, attr) {
      return element.bind('keydown keypress', function(e) {
        if (e.which === 13) {
          scope.$apply(attr.yegEnter);
          return e.preventDefault();
        }
      });
    };
  });

  app.directive('onTab', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        return element.bind('keydown keypress', function(e) {
          if ((e.which === 9) && !e.shiftKey) {
            return scope.$apply(attr.onTab);
          }
        });
      }
    };
  });

}).call(this);
