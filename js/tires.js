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
        .config(['$locationProvider', function ($locationProvider) {
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });
        }])
    ;

    function carsCtrl(carsService, $location) {
        var carsCtrl = this;

        this.data = {};
        carsService.get(function (data) {
            carsCtrl.data.cars = data.cars;
            var i, arr, from, to;
            var separator = /[\s\,]+/;
            angular.forEach(carsCtrl.data.cars, function (car) {
                arr = [car.b.split(separator), car.m.split(separator), car.s.split(separator)];
                parseInt(car.f);
                from = parseInt(car.f);
                to = parseInt(car.t);
                if (!isNaN(from) && !isNaN(to) && !from <= to) {
                    for (i = from; i <= to; i++) arr.push(i);
                }
                car.text = angular.lowercase(arr.join("|"));
            });
        });

        this.selectCar = function (car, viewKind, model, scale) {
            if (model.query) {
                // save search history
                $location.search(angular.extend({}, model));
            }
            model = {};
            if (viewKind == 'brand') {
                model.brand = car.b;
                $location.search(model);
            } else if (viewKind == 'model') {
                model.brand = car.b;
                model.model = car.m;
                $location.search(model);
            } else {
                var oem = [car.o1];
                for (var i = 2; i < 8; i++) {
                    if (car["o" + i]) oem.push(car["o" + i]);
                }
                model.id = car.id;
                this.selectByOem(car.o1, model, scale, 0);
            }
            return model;
        };

        this.selectByOem = function (oem, model, scale, index) {
            var arr = oem.split(/[\/ R]+/);
            scale.width = parseInt(arr[0]);
            scale.height = parseInt(arr[1]);
            scale.caliber = parseInt(arr[2]);
            model.oem = index;
            $location.search(model);
        };
    }

    function tiresCtrl(tiresService, tireStorage, $location, $scope) {
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
        this.scale = tireStorage.load("scale", {
            height: 55, width: 185, caliber: 15
        });
        this.model = {};

        $scope.$watch(angular.bind(this, function () {
            //noinspection JSPotentiallyInvalidUsageOfThis
            return this.scale;
        }), function (newValue, oldValue) {
            if (newValue != oldValue) {
                tireStorage.save('scale', newValue);
            }
        }, true);

        $scope.$on('$locationChangeSuccess', function () {
            tiresCtrl.model = $location.search();
        });

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
        return function (arr, model) {
            var result = items = [], brandsCount = 0;
            var brands = {}, models = {};
            if (arr && arr.length) {
                for (var i = 0; i < arr.length; i++) {
                    if (isCarFit(arr[i], model)) {
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
                result.viewKind = "brand";
            } else {
                var v = values(models);
                if (v.length > 1) {
                    result = v.sort(function (a, b) {
                        return alphabeticalSort(a.m, b.m);
                    });
                    result.viewKind = "model";
                }
            }
            return result;
        }
    }

    function isCarFit(car, model) {
        if (model.query) {
            var i, arr = angular.lowercase(model.query).split(/[\s\-()]+/);
            for (i = 0; i < arr.length; i++) {
                if (car.text.indexOf(arr[i]) < 0) return false;
            }
        } else {
            if (model.brand && car.b != model.brand ||
                model.model && car.m != model.model ||
                model.id && car.id != model.id) return false;
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
        angular.forEach(map, function (value) {
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