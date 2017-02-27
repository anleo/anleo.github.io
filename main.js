angular.module('taskCalculator', ['dragularModule'])
  .controller('taskCalculatorController', function ($scope, dragularService) {
    var taskModel = function () {
      return {
        title: null,
        points: null,
        spent: 0,
        status: null
      };
    };

    $scope.tasks = [];
    $scope.formLoaded = true;
    $scope.tempTasks = [];

    // DnD
    function initDnDService(tasksElement) {
      dragularService(tasksElement, {
        scope: $scope,
        boundingBox: tasksElement,
        containersModel: $scope.tasks,
        lockY: true,
        revertOnSpill: true,
        tempModel: $scope.tasks
      });
    }

    function initDnD() {
      var tasksElement = $($('.tasks-wrapper')[0]);
      initDnDService(tasksElement);

      $scope.$on('dragulardragend', function ($event) {
        $event.stopPropagation();
        if ($event) {
          setTimeout(saveTasks(), 1)
        }
      });
    }

    function initLoadTasks() {
      var localTasks = localStorage.getItem('tasks');
      if (localTasks) {
        $scope.tasks = JSON.parse(localTasks);
      }
    }

    function init() {
      initLoadTasks();
      initDnD();
    }

    init();

    var initTask = function () {
      $scope.task = new taskModel();
    };

    $scope.editMode = false;
    $scope.username = null;
    $scope.localUsername = function () {
      return localStorage.getItem('username');
    };

    $scope.resetCalculator = function () {
      localStorage.removeItem('username');
      localStorage.removeItem('tasks');
      $scope.tasks = [];
    };

    $scope.doneTask = function (task) {
      if (task.status && task.status === 'done') {
        task.status = null;
      } else {
        task.status = 'done';
      }
      setTimeout(saveTasks(), 1);
    };

    $scope.inProgress = function (task) {
      if (task.status && task.status === 'in progress') {
        task.status = null;
      } else {
        task.status = 'in progress';
      }
      setTimeout(saveTasks(), 1);
    };

    $scope.postponed = function (task) {
      if (task.status && task.status === 'postponed') {
        task.status = null;
      } else {
        task.status = 'postponed';
      }
      setTimeout(saveTasks(), 1);
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
    };

    $scope.approxTime = function () {
      result = 0;
      $scope.tasks.map(function (task) {
        result += task.calculatedTime ? +task.calculatedTime : 0;
      });
      return result.toFixed(2);
    };

    $scope.spentTime = function () {
      result = 0;
      $scope.tasks.map(function (task) {
        result += task.spent ? +task.spent : 0;
      });
      return result.toFixed(2);
    };

    $scope.task = new taskModel();
    $scope.lastEdited = null;

    $scope.edit = function (task) {
      $("html, body").animate({scrollTop: $('#taskForm').offset().top}, "ease");

      $scope.editMode = true;
      $scope.task = task;
      $('input#title').focus();
    };

    $scope.callLast = function () {
      $scope.edit($scope.lastEdited);
    };

    $scope.add = function (task) {
      if (task.title) {
        task.points = !!parseInt(task.points) ? parseInt(task.points) : 0;
        var newTasks = angular.copy($scope.tasks);
        newTasks.push(task);
        $scope.tasks = newTasks;
        updateTasks();
      }
    };

    $scope.update = function (task) {
      if (task && task.title) {
        task.points = !!parseInt(task.points) ? parseInt(task.points) : 0;
        updateTasks();
      }
    };

    $scope.remove = function (task) {
      var index = $scope.tasks.indexOf(task);
      if (index > -1) {
        $scope.tasks.splice(index, 1);
      }
      updateTasks();
    };

    $scope.cancel = function () {
      initTask();
      $scope.editMode = false;
    };

    $scope.saveTask = function (task) {
      $scope.lastEdited = task;
      if ($scope.editMode) {
        $scope.update(task);
      } else {
        $scope.add(task);
      }
    };

    function saveTasks() {
      localStorage.setItem('tasks', JSON.stringify($scope.tasks));
      setTimeout(function () {
        var tasksElement = $($('.tasks-wrapper')[0]);
        setTimeout(initDnDService(tasksElement), 1);
      }, 1);
    }

    function updateTasks() {
      initTask();
      saveTasks();
      $('input#title').focus();
      $scope.editMode = false;
    }

    // fibonacci increment
    $scope.increment = false;
    var pointsList = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

    $scope.$watch('task.points', function (points) {
      var _points = pointsValidationFibonacciFloor(points);
      $scope.task.points = _points;
    });

    function pointsValidationFibonacciFloor(points) {
      var points = !!parseInt(points) ? parseInt(points) : 0;
      for (var i = 0; i < pointsList.length; i++) {
        if (points >= pointsList[pointsList.length - 1]) {
          points = pointsList[pointsList.length - 1];
        } else if ($scope.increment && points > pointsList[i] && points <= pointsList[i + 1]) {
          points = pointsList[i + 1];
        } else if (!$scope.increment && points >= pointsList[i] && points < pointsList[i + 1]) {
          points = pointsList[i];
        }
      }

      return points;
    }

    function checkPointsRange(points) {
      return points >= pointsList[pointsList.length - 1] ? pointsList[pointsList.length - 1] : (points <= 0 ? 0 : points);
    }

    function checkPointsValue(task) {
      if (typeof task.points === 'string') {
        task.points = checkPointsRange(!!parseInt(task.points) ? parseInt(task.points) : 0);
      } else {
        task.points = checkPointsRange(task.points);
      }
    }

    $scope.keyLogger = function (options) {
      // enter
      if (options && options.keyCode === 13) {
        $scope.saveTask($scope.task);
      }

      // arrow up
      if (options.keyCode === 38) {
        if (options.points) {
          $scope.increment = true;
        } else if ($scope.lastEdited && !options.points) {
          $scope.callLast();
        }
      }

      // arrow down
      if (options.keyCode === 40) {
        $scope.increment = false;
      }

      // escape
      if (options.keyCode === 27) {
        $scope.cancel();
      }

      if (options.points) {
        checkPointsValue($scope.task);
      }
    };
  })
;