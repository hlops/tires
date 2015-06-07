{
    angular
        .module('tiresApp', ['ngResource', 'ui.bootstrap', 'ui-rangeSlider'])
        .controller('tiresCtrl', tiresCtrl)
        .filter("tireFilter", tireFilter)
        .factory('tiresService', tiresService)
        .directive('tireRangeSlider', tireRangeSlider)
    ;


    function tiresCtrl(tiresService) {
        var tiresCtrl = this;

        this.width = 1;
        this.height = 5;
        this.caliber = 9;

        this.allWidth = [
            {id: 1, label: "1"},
            {id: 2, label: "2"},
            {id: 3, label: "3"}
        ];
        this.allHeight = [
            {id: 4, label: "4"},
            {id: 5, label: "5"},
            {id: 6, label: "6"}
        ];
        this.allCaliber = [
            {id: 7, label: "7"},
            {id: 8, label: "8"},
            {id: 9, label: "9"}
        ];

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

    function tireRangeSlider() {
        return {
            restrict: 'E',
            scope: {
                range: '='
            },
            template: '<div range-slider min="range.min" max="range.max" model-min="range.from" model-max="range.to"></div>'
        }
    }

}