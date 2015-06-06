{
    angular
        .module('tiresApp', ['ngResource'])
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

        tiresService.get(function (data) {
            tiresCtrl.tires = data.Sheet1;
            for (var i = 0; i < tiresCtrl.tires.length; i++) {
                angular.extend(tiresCtrl.tires[i], {url: "i/tire.jpg"});
            }
        });

        this.range = {
            from: 0, to: 10
        }
    }

    function tiresService($resource) {
        return $resource("js/tires.json");
    }

}