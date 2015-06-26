{
    angular
        .module('tiresApp', ['ngResource', 'ui.bootstrap', 'ui-rangeSlider'])
        .controller('carsCtrl', carsCtrl)
        .controller('tiresCtrl', tiresCtrl)
        .filter('carFilter', carFilter)
        .filter("tireFilter", tireFilter)
        .factory('carsService', carsService)
        .factory('tiresService', tiresService)
        .factory('tireStorage', tireStorage)
        .directive('tireRangeSlider', tireRangeSlider)
    ;

    function carsCtrl($scope, carsService, tireStorage) {
        var carsCtrl = this;
        this.data = {};
        carsService.get(function (data) {
            carsCtrl.data.cars = data.cars;
            var i, arr, from, to;
            var separator = /[\s\,]+/;
            angular.forEach(carsCtrl.data.cars, function (car) {
                arr = [car.b.split(separator), car.m.split(separator), car.s.split(separator)];
                parseInt(car.f)
                from = parseInt(car.f);
                to = parseInt(car.t);
                if (!isNaN(from) && !isNaN(to) && !from <= to) {
                    for (i = from; i <= to; i++) arr.push(i);
                }
                car.text = angular.lowercase(arr.join("|"));
            });
        });

        this.selectCar = function (car, viewKind, model) {
            if (viewKind == 'b') {
                model.carSearch = car.b;
            } else if (viewKind == 'm') {
                model.carSearch = car.b + " " + car.m;
            } else {
                //model.carSearch = car.b + " " + car.m + " " + car.s + " (" + car.f + "-" + car.t + ")";
                var arr = car.o1.split(/[\/ R]+/);
                model.width = parseInt(arr[0]);
                model.height = parseInt(arr[1]);
                model.caliber = parseInt(arr[2]);
                model.selectedCar = car.id;
            }
        }
    }

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
                tiresCtrl.tires[i] = angular.extend({"url": "i/tire.jpg"}, tire);
            }
        });

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

    function carFilter() {
        return function (arr, searchText) {
            var result = items = [], brandsCount = 0;
            var brands = {}, models = {};
            if (arr && arr.length) {
                for (var i = 0; i < arr.length; i++) {
                    if (isCarFit(arr[i], searchText)) {
                        items.push(arr[i]);
                        if (!brands[arr[i].b]) {
                            brandsCount++;
                        }
                        brands[arr[i].b] = arr[i];
                        if (brandsCount <= 1) {
                            models[arr[i].m] = arr[i];
                        }
                    }
                }
            }

            if (brandsCount > 1) {
                result = values(brands).sort(function (a, b) {
                    return alphabeticalSort(a.b, b.b);
                });
                result.viewKind = "b";
            } else {
                var v = values(models);
                if (v.length > 1) {
                    result = v.sort(function (a, b) {
                        return alphabeticalSort(a.m, b.m);
                    });
                    result.viewKind = "m";
                }
            }
            return result;
        }
    }

    function isCarFit(car, searchText) {
        if (searchText) {
            var i, arr = angular.lowercase(searchText).split(/[\s\-()]+/);
            for (i = 0; i < arr.length; i++) {
                if (car.text.indexOf(arr[i]) < 0) return false;
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

    function carsService($resource) {
        return $resource("js/cars.json");
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

    // === utilities ===
    function values(map) {
        var arr = [];
        angular.forEach(map, function (value, key) {
            arr.push(value)
        });
        return arr;
    }

    function alphabeticalSort(a, b) {
        var A = a.toUpperCase();
        var B = b.toUpperCase();
        if (A < B) {
            return -1;
        } else if (A > B) {
            return 1;
        } else {
            return 0;
        }
    }

}