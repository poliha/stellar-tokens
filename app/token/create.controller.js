var stellarAD = angular.module('stellarAD');

stellarAD.controller('createController', function($scope, $state, $http, $rootScope, Token) {

  $scope.tokenData = {};
  $scope.statusMsg = false;
  $scope.processing = false;

  $scope.init = function() {

  };

  $scope.createToken = function() {
    $scope.processing = true;
    $scope.tokenData.assetType = 1;
    window.scrollTo(0, 0);
    $scope.statusMsg = {};

    Token.createAsset($scope.tokenData)
    .then(function(resp) {

      console.log(resp);
      $scope.processing = false;
      
      $scope.statusMsg.type = 'alert-success';
      if (resp.content) {
        $scope.statusMsg.content = resp.content.message;
        $scope.$apply();
      } else{
        $scope.statusMsg.content = resp.data.content.message;
      }


    })
    .catch(function(resp) {
      console.log(resp);
      $scope.processing = false;
      
      $scope.statusMsg.type = 'alert-danger';
      if (resp.content) {
        $scope.statusMsg.content = resp.content.message;
        $scope.$apply();
      } else{
        $scope.statusMsg.content = resp.data.content.message;
      }

    });
  };


  $scope.isDEX = function(type) {
    if (type) {
      return true;
    } else{
      return false;
    }
  };

  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };




});