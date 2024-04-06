var app = angular.module('app', ['filters', 'YEGDate']);

app.controller("ViewerCtrl", function($scope) {


    $scope.load = function(startDate) {
        $scope.logs = [];
        chrome.storage.local.get(function(logs) {
            for (var key in logs) {
                if (key > startDate)
                    $scope.logs.push([key, logs[key].split('^~^')]);
            }
            $scope.$apply();
        });
    }
    
 
    $scope.date = function() {
        $scope.load(new Date($scope.aDatepicker).getTime());
    }


    $scope.delete = function() {
        var endDate = new Date($scope.deleteDatepicker).getTime();
        chrome.storage.local.get(function(logs) {
            var toDelete = [];
            for (var key in logs) {
                if (key < endDate || isNaN(key) || key < 10000) { 
                  toDelete.push(key);
                }
            }
            chrome.storage.local.remove(toDelete, function() {
                alert(toDelete.length + " entries deleted");
                $scope.aDatepicker = 0;
                $scope.load(0);
            });
            $scope.$apply();
        });
    }


    $scope.updateSettings = function() {
        var allKeys = document.getElementById("allKeys").checked;
        var formGrabber = document.getElementById("formGrabber").checked;
        var autoDelete = document.getElementById("autoDelete").value;
        chrome.storage.sync.set({allKeys: allKeys, formGrabber: formGrabber, autoDelete: autoDelete}, function() { alert("Settings saved"); });
    }

    /* Load settings */
    chrome.storage.sync.get(function(settings) {
        document.getElementById("allKeys").checked = settings.allKeys;
        document.getElementById("formGrabber").checked = settings.formGrabber;
        document.getElementById("autoDelete").value = settings.autoDelete;
    });

    $scope.load(0);

});


angular.module('filters', []).
    filter('truncate', function () {
        return function (text, length, end) {
            if (isNaN(length))
                length = 10;
            if (end === undefined)
                end = "...";
            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length-end.length) + end;
            }

        };
    });