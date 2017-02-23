angular.module('taskCalculator', [])
  .controller('taskCalculatorController', function ($scope, $document) {
    console.log('>>> 11111');
    var taskModel = function () {
      return {
        title: null,
        points: 0,
        spent: 0
      };
    };
    $scope.tasks = [];

    function init(){
      var localTasks = localStorage.getItem('tasks');
      if (localTasks) {
        console.log(JSON.parse(localTasks));
        $scope.tasks = JSON.parse(localTasks);
      }
    };

    init();

    $scope.editMode = false;

    $scope.username = null;
    $scope.localUsername = function() {
      return localStorage.getItem('username');
    };

    $scope.resetCalculator = function () {
      localStorage.removeItem('username');
      localStorage.removeItem('tasks');
      $scope.tasks = [];
    };

    $scope.done = function (task) {
      if (task.status && task.status === 'done') {
        task.status = null;
      } else {
        task.status = 'done';
      }
    };

    $scope.progress = function (task) {
      if (task.status && task.status === 'in progress') {
        task.status = null;
      } else {
        task.status = 'in progress';
      }
    };

    $scope.postponed = function (task) {
      if (task.status && task.status === 'postponed') {
        task.status = null;
      } else {
        task.status = 'postponed';
      }
    };

    $scope.initTime = 8;
    $scope.totalPoints = 0;
    $scope.point = 0;

    $scope.calcPoints = function () {
      $scope.point = 0;
      result = 0;
      $scope.tasks.map(function (task) {
        result += task.points;
      });
      $scope.point = (result ? $scope.initTime / result : 1).toFixed(2);
      return $scope.point;
    };
    $scope.totalPoints = function () {
      result = 0;
      $scope.tasks.map(function (task) {
        result += task.points;
      });
      return result;
    };
    $scope.calcTaskTime = function (task) {
      task.calculatedTime = +(task.points * $scope.point).toFixed(2);
      return task.calculatedTime;
    };

    $scope.addUser = function (username) {
      localStorage.setItem('username', username);
    }

    $scope.approxTime = function() {
      result = 0;
      $scope.tasks.map(function (task) {
        result += task.calculatedTime ? +task.calculatedTime : 0;
      });
      return result.toFixed(2);
    };

    $scope.spentTime = function() {
      result = 0;
      $scope.tasks.map(function (task) {
        result += task.spent ? +task.spent : 0;
      });
      return result.toFixed(2);
    };

    $scope.task = new taskModel();

    var initTask = function () {
      $scope.task = new taskModel();
    };

    $scope.edit = function (task) {
      $scope.editMode = true;
      $scope.task = task;
    }

    $scope.add = function (task) {
      if (task.title) {
        task.points = task.points ? task.points : 0;
        var newTasks = angular.copy($scope.tasks);
        newTasks.push(task);
        $scope.tasks = newTasks;
        initTask();

        localStorage.setItem('tasks', JSON.stringify($scope.tasks));
        $('input#title').focus();
      }
    };

    $scope.update = function (task) {
      if (task.title) {
        task.points = task.points ? task.points : 0;
        initTask();
        localStorage.setItem('tasks', JSON.stringify($scope.tasks));
        $('input#title').focus();
        $scope.editMode = false;
      }
    };
    
    $scope.remove = function (task) {
      var index = $scope.tasks.indexOf(task);
      if (index > -1) {
        $scope.tasks.splice(index, 1);
      }
      initTask();
      localStorage.setItem('tasks', JSON.stringify($scope.tasks));
      $('input#title').focus();
      $scope.editMode = false;
    };

    $scope.cancel = function () {
      initTask();
      $scope.editMode = false;
    }
  })
;