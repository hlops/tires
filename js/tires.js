{
    angular
        .module('tiresApp', ['ngResource'])
        .controller('tiresCtrl', tiresCtrl)
        .factory('tiresService', tiresService)
    ;


    function tiresCtrl(tiresService) {
        this.width = 1;
        this.height = 2;
        this.caliber = 3;

        this.allWidth = [
            {id: 1, label: "aaa"},
            {id: 2, label: "b"},
            {id: 3, label: "c"}
        ];
        this.allHeight = [
            {id: 1, label: "aaa"},
            {id: 2, label: "b"},
            {id: 3, label: "c"}
        ];
        this.allCaliber = [
            {id: 1, label: "aaa"},
            {id: 2, label: "b"},
            {id: 3, label: "c"}
        ];

        this.tires = [
            {}
        ];
    }

    function tiresService($resource) {
        return {};
    }

}