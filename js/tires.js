{
    angular
        .module('tiresApp', ['ngResource', 'angularRangeSlider'])
        .controller('tiresCtrl', tiresCtrl)
        .factory('tiresService', tiresService)
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
            controllabilityWet: {from: 0, to: 10, min: 5, max: 10}
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
                            range = tiresCtrl.ranges[name];
                            if (!range) range = tiresCtrl.ranges[name] = {};
                            if (!range.min || range.min < value) {
                                range.min = range.from = value;
                            }
                            if (!range.max || range.max > value) {
                                range.max = range.to = value;
                            }
                        }
                    }
                }
                angular.extend(tire, {url: "i/tire.jpg"});
            }
        });

        tiresCtrl.range = {
            from: 0, to: 10
        };
    }

    function tiresService($resource) {
        return $resource("js/tires.json");
    }

}