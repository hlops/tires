{
    angular
        .module('tiresApp', ['ngResource', 'ui.bootstrap', 'ui-rangeSlider'])
        .controller('tiresCtrl', tiresCtrl)
        .filter("tireFilter", tireFilter)
        .factory('tiresService', tiresService)
        .factory('tireStorage', tireStorage)
        .directive('tireRangeSlider', tireRangeSlider)
    ;


    function tiresCtrl($scope, tiresService, tireStorage) {
        var tiresCtrl = this;

        this.data = {
            allWidth: [], allHeight: [], allCaliber: []
        };

        var i;
        for (i = 155; i <= 315; i += 10) {
            this.data.allWidth.push({id: i, label: "" + i});
        }

        for (i = 25; i <= 85; i += 5) {
            this.data.allHeight.push({id: i, label: "" + i});
        }

        for (i = 12; i <= 26; i++) {
            this.data.allCaliber.push({id: i, label: "" + i});
        }
        this.model = tireStorage.load("model", {
            height: 55, width: 185, caliber: 15
        });

        $scope.$watch(angular.bind(this, function () {
            //noinspection JSPotentiallyInvalidUsageOfThis
            return this.model;
        }), function (newValue, oldValue) {
            if (newValue != oldValue) {
                tireStorage.save('model', newValue);
            }
        }, true);

        tiresCtrl.ranges = {
            filterNames: {}
        };
        tiresService.get(function (data) {
            var name, value, range, tire;
            tiresCtrl.tires = data.Sheet1;
            for (var i = 0; i < tiresCtrl.tires.length; i++) {
                tire = tiresCtrl.tires[i];
                for (name in tire) {
                    if (tire.hasOwnProperty(name)) {
                        value = tire[name];
                        if (tire.hasOwnProperty(name) && !isNaN(value)) {
                            tiresCtrl.ranges.filterNames[name] = true;
                            range = tiresCtrl.ranges[name];
                            if (!range) range = tiresCtrl.ranges[name] = {};
                            if (!range.min || range.min > value) {
                                range.min = range.from = parseInt(value);
                            }
                            if (!range.max || range.max < value) {
                                range.max = range.to = parseInt(value);
                            }
                        }
                    }
                }
                angular.extend(tire, {url: "i/tire.jpg"});
            }
        });

        // remove
        tiresCtrl.range = {
            from: 0, to: 10
        };
    }

    function isFilterFit(item, ranges) {
        for (var name in ranges.filterNames) {
            if (ranges.filterNames.hasOwnProperty(name)) {
                var range = ranges[name];
                if (range.min != range.from || range.max != range.to) {
                    var value = parseInt(item[name]);
                    if (!(value >= range.from && value <= range.to)) return false;
                }
            }
        }
        return true;
    }

    function tireFilter() {
        return function (arr, ranges) {
            var items = [];
            if (arr && arr.length) {
                for (var i = 0; i < arr.length; i++) {
                    if (isFilterFit(arr[i], ranges)) {
                        items.push(arr[i]);
                    }
                }
            }
            return items;
        }
    }

    function tiresService($resource) {
        return $resource("js/tires.json");
    }

    function tireStorage() {
        return {
            save: function (name, model) {
                localStorage[name] = angular.toJson(model);
            },
            load: function (name, defaultModel) {
                if (!defaultModel) defaultModel = {};
                return angular.extend(defaultModel, angular.fromJson(localStorage[name]));
            }
        };
    }

    function tireRangeSlider() {
        return {
            restrict: 'E',
            scope: {
                range: '='
            },
            template: '<div range-slider min="range.min" max="range.max" model-min="range.from" model-max="range.to" attach-handle-values="true"></div>'
        }
    }

}